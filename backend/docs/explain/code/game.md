# Giải thích code: feature `game` (Backend)

| | |
|---|---|
| **Phía** | BE (backend) |
| **Chế độ** | `code` |
| **Target** | `game` |
| **Ngày viết** | 2026-10-07 (viết lại: game có nhiều thể loại qua bảng nối `game_game_category`; seed chỉ chạy khi bảng game trống) |
| **Tài liệu đã đọc** | `backend/src/features/game/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07), `backend/docs/BE-ARCHITECTURE.md` (mục 3, 5, 8), `01-share-docs/DATABASE.md` (Feature Game, mục 3), `01-share-docs/API_SPEC.md` (mục 5, 6, 7.2–7.5); migration `change_game_category_to_many` |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `game` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

`game` quản lý **kho game của quán** gồm 3 phần:

| Phần | Bảng | Ví dụ |
|---|---|---|
| Thể loại | `game_category` | Đối Kháng, Thể Thao, Đua Xe… |
| Game | `game` | Tekken 8 (1-2P, màu đỏ) |
| Game thuộc thể loại nào | `game_game_category` (bảng nối) | It Takes Two thuộc Hành Động **và** Co-op |
| Game có ở chi nhánh nào | `branch_game` (bảng nối) | GTA V chỉ có ở chi nhánh 1 và 3 |

Đây là feature **phức tạp nhất** đến giờ: hai tài nguyên (game và thể loại) trong cùng một thư mục, **hai** quan hệ nhiều-nhiều (với thể loại và với chi nhánh), và phải hỏi feature khác (`branch`) mà không được import nó.

Ví dụ đời thường: giống **kệ đĩa game** của chuỗi cửa hàng. Mỗi đĩa dán được tối đa 5 nhãn thể loại (một đĩa có thể vừa "Hành Động" vừa "Co-op"). Mỗi đĩa có tờ ghi chú "có ở chi nhánh nào"; **đĩa không có ghi chú nào nghĩa là chi nhánh nào cũng có**.

| Method | Path | Ai gọi được |
|---|---|---|
| GET | `/api/v1/games`, `/api/v1/games/:id`, `/api/v1/game-categories` | Công khai |
| POST, PUT, DELETE | `/api/v1/games[/:id]`, `/api/v1/game-categories[/:id]` | **Admin** (chủ quán **và** nhân viên) |

Khác `branch` và `shop` (chỉ chủ quán), game do **nhân viên cũng sửa được**, vì đây là việc hằng ngày ở quầy.

### Các file

Mỗi tài nguyên có **một bộ file riêng** trong cùng thư mục (theo BE-ARCHITECTURE mục 3):

```
game.routes → game.controller → game.service → game.repository → Prisma
game-category.routes → game-category.controller → game-category.service → game-category.repository → Prisma
```

| File | Một câu |
|---|---|
| `game.dto.ts`, `game-category.dto.ts` | Luật kiểm tra dữ liệu gửi lên |
| `game.entity.ts`, `game-category.entity.ts` | Hình dạng dữ liệu trả ra, và hàm đổi từ dòng Prisma |
| `game.types.ts` | `BranchLookup` (thứ game cần hỏi chi nhánh), `GameFilter`, `BranchIdsChange` |
| `game.repository.ts`, `game-category.repository.ts` | Mọi truy vấn Prisma |
| `game.service.ts`, `game-category.service.ts` | Quy tắc nghiệp vụ, mã lỗi `GAME_001`–`006`, log |
| `*.controller.ts`, `*.routes.ts` | Nhận request, gắn quyền và kiểm tra dữ liệu |
| `index.ts` | Export thứ `app.ts` cần |

---

## 🗄️ Bốn bảng và quy ước "mọi chi nhánh"

### Phân tích
- **`game_category`**: `name` không trùng (UNIQUE), `sort_order`, `is_active`.
- **`game`**: `title` không trùng, `players`, `poster_url`, `accent_color` (enum `orange`/`red`/`amber`/`gold`), `description` (TEXT), `sort_order`, `is_active`.
- **`game_game_category`** (game ↔ thể loại, nhiều-nhiều): cặp (`game_id`, `game_category_id`) không trùng. Phía game **CASCADE** (xóa game thì gỡ thể loại của nó); phía thể loại **RESTRICT** (không xóa được thể loại khi còn game).
- **`branch_game`**: cặp (`branch_id`, `game_id`) không trùng; cả hai khóa ngoại **CASCADE**: xóa game hoặc chi nhánh thì dòng nối tự xóa.
- **Enum `AccentColor`** chỉ khai báo một lần; feature `promotion` sau này dùng lại.
- **Migration:** ban đầu 3 cái, mỗi bảng một (`create_game_category_table`, `create_game_table`, `create_branch_game_table`); khi đó game chỉ có **một** thể loại (cột `game.game_category_id`). Sau đó thêm `change_game_category_to_many` để chuyển sang nhiều thể loại (xem mục dưới). Collation sửa tay sang `utf8mb4_0900_ai_ci`, nhờ đó so sánh và tìm kiếm không phân biệt hoa thường và dấu.

### Quy ước quan trọng nhất: "không có dòng = mọi chi nhánh"

| Game | Dòng trong `branch_game` | Nghĩa |
|---|---|---|
| Tekken 8 | (không có) | Có ở **mọi** chi nhánh, kể cả chi nhánh mở năm sau |
| GTA V | (1), (3) | Chỉ ở chi nhánh 1 và 3 |

**Vì sao chọn cách này** thay vì ghi sẵn 4 dòng cho mỗi game? Khi quán mở chi nhánh thứ 5, mọi game "phổ thông" **tự có** ở đó, chủ quán không phải sửa từng game.

Cái giá phải trả: nếu GTA V chỉ có ở chi nhánh 3 mà chi nhánh 3 bị **xóa**, dòng nối cuối cùng mất theo (CASCADE), và GTA V **tự thành "mọi chi nhánh"**. Dự án chấp nhận điều này, vì quán hiếm khi xóa chi nhánh (thường chỉ ẩn), và hộp xác nhận xóa chi nhánh có báo trước.

### Chuyển từ một thể loại sang nhiều thể loại (migration viết tay)
Lúc đầu mỗi game có **một ô** `game_category_id`. Để một game thuộc nhiều thể loại, ô đó được thay bằng bảng nối `game_game_category`. Lúc chuyển, DB đã có 27 game thật, nên **thứ tự các bước rất quan trọng**:

| Bước | Prisma tự sinh | Bản viết tay (đang dùng) |
|---|---|---|
| 1 | Xóa cột `game_category_id` ❌ (mất thể loại của mọi game) | Tạo bảng `game_game_category` |
| 2 | Tạo bảng nối (trống) | **Chép** `INSERT … SELECT id, game_category_id FROM game`: mỗi game giữ thể loại cũ |
| 3 | | Thêm khóa ngoại, rồi mới xóa cột cũ |

Prisma thấy việc xóa cột còn dữ liệu nên `migrate dev` từ chối chạy; migration được viết tay rồi áp dụng bằng `prisma migrate deploy`. Sau khi chạy đã kiểm tra: 27/27 game còn đúng thể loại.

**Bài học:** đổi cấu trúc bảng đã có dữ liệu thì luôn đọc SQL Prisma sinh ra trước khi chạy.

### Seed
`seedGames()` **chỉ chạy khi bảng `game` đang trống** (DB mới hoặc vừa reset):
- Upsert 5 thể loại theo tên, rồi tạo 12 game (mỗi game 1 thể loại). Game nối với thể loại qua mã chữ (`fighting` → "Đối Kháng"), vì id thật chỉ biết sau khi tạo thể loại.
- Game mẫu không ghi dòng `branch_game` nào, tức có ở mọi chi nhánh.
- **Vì sao không upsert game theo tên mỗi lần chạy?** Bản đầu làm vậy. Khi chủ quán đã **xóa** hoặc **đổi tên** game mẫu (vd "EA FC 26" → "FC 26"), seed không thấy tên cũ nên **tạo lại** game đó. Chỉ seed khi bảng trống thì không bao giờ hồi sinh dữ liệu chủ quán đã xóa.

---

## 📁 File: `game.dto.ts`

### Mục đích
Kiểm tra dữ liệu bằng Zod trước khi vào service.

### Phân tích

**`branchIds` có 3 trạng thái**, đây là chỗ cần hiểu kỹ nhất:

| Gửi | Khi tạo (`POST`) | Khi sửa (`PUT`) |
|---|---|---|
| Không gửi | Mọi chi nhánh | **Giữ nguyên** |
| `null` | Mọi chi nhánh | Chuyển về mọi chi nhánh |
| `[1, 3]` | Chỉ chi nhánh 1 và 3 | **Thay toàn bộ** thành 1 và 3 |
| `[]` | **Bị từ chối** (`400`) | **Bị từ chối** |

`[]` bị từ chối vì nó **lẫn với "mọi chi nhánh"**: cả hai đều không có dòng nào trong bảng nối. Thông báo lỗi chỉ cách: "Chọn ít nhất 1 chi nhánh, hoặc gửi null để có ở mọi chi nhánh".

**Thể loại:** `gameCategoryIds` là mảng **1–5** id (thiếu → "Chọn ít nhất 1 thể loại", hơn 5 → "Tối đa 5 thể loại"). Khi sửa: không gửi thì giữ nguyên, gửi thì **thay toàn bộ**.

**Các luật khác:** `title` 1–150 ký tự, `players` ≤ 20, `posterUrl` là URL ≤ 500, `description` ≤ 2000, `accentColor` một trong 4 màu (mặc định `orange`). Chuỗi trống thành `null` (dùng chung `shared/utils/zod-fields`).

**Query `GET /games`:** phân trang, `q` (tìm tên), `categoryId` (game có thể loại này **trong số** các thể loại của nó), `branchId`, `includeInactive`.

### 📏 Quy tắc dự án liên quan
- Schema `PUT` **bỏ mọi giá trị mặc định**, để trường không gửi giữ nguyên (giống `branch`).

---

## 📁 File: `game.entity.ts` và `game-category.entity.ts`

### Phân tích
- **`GameListItem`** (dùng cho danh sách): đủ trường + **`categories: [{ id, name }, …]`** xếp theo `sortOrder` của thể loại; **không** có `branchIds` (để danh sách nhẹ).
- **`GAME_LIST_SELECT`** đọc thể loại qua bảng nối (`categories → gameCategory`), `toGameListItem` "làm phẳng" thành mảng `{ id, name }`. Khai báo bằng `satisfies Prisma.GameSelect` (không dùng `as const`, vì Prisma không nhận mảng `orderBy` chỉ-đọc).
- **`GameDetail`** (`GET /:id`, `POST`, `PUT`): thêm `branchIds`.
- **`toGameDetail(row)`**: Prisma trả `branches: [{ branchId: 1 }, { branchId: 3 }]`. Hàm đổi thành `branchIds: [1, 3]`, hoặc **`null` nếu mảng rỗng**. Quy ước "không có dòng = mọi chi nhánh" được dịch sang API ngay ở chỗ này.
- **`GameCategory`** có thêm **`gameCount`**, đếm bằng `_count` của Prisma (gồm cả game đang ẩn). Trang quản trị nhờ đó biết trước thể loại nào xóa được.

---

## 📁 File: `game.repository.ts`

### Mục đích
Nơi duy nhất của game dùng Prisma.

### Phân tích

**`findMany(filter)`**, ghép điều kiện:
- **Khách** chỉ thấy game `isActive` **và còn ít nhất một thể loại đang hiện** (hằng `VISIBLE`: `categories: { some: { gameCategory: { isActive: true } } }`). Ẩn "Co-op" thì "A Way Out" (chỉ Co-op) biến mất, còn "It Takes Two" (Co-op + Hành Động) **vẫn hiện**.
- `categoryId = X`: `categories: { some: { gameCategoryId: X } }`.
- Các điều kiện ghép bằng **`AND: [...]`** thay vì trộn vào một object: điều kiện "đang hiện" và điều kiện lọc thể loại cùng dùng khóa `categories`, trộn chung thì cái sau ghi đè cái trước.
- `q`: `title contains q`, không phân biệt dấu nhờ collation.
- `branchId = X`: **game không có dòng nối nào HOẶC có dòng của chi nhánh X**. Đây là bản dịch của quy ước "mọi chi nhánh" sang câu truy vấn:
  ```ts
  OR: [{ branches: { none: {} } }, { branches: { some: { branchId: X } } }]
  ```
- `findMany` và `count` chạy chung `$transaction`; thứ tự luôn kèm `id` ở cuối để phân trang ổn định.

**`create(data, gameCategoryIds, branchIds)`**: tạo game, các dòng nối thể loại và (nếu có mảng) các dòng nối chi nhánh trong **cùng một lệnh** (nested create).

**`update(id, data, gameCategoryIds, branchIds)`**: dùng **interactive transaction**:
1. Nếu có gửi `gameCategoryIds`: xóa hết thể loại cũ của game, tạo dòng mới.
2. Nếu có gửi `branchIds`: xóa hết dòng nối chi nhánh cũ, rồi (nếu là mảng) tạo dòng mới.
3. Sửa game.

Tất cả các bước thành công hoặc cùng thất bại. Không bao giờ có lúc game **mất hết thể loại**, hay "đã xóa chi nhánh cũ nhưng chưa kịp ghi chi nhánh mới" (vốn sẽ biến game thành "mọi chi nhánh" ngoài ý muốn).

**`findIdByTitle(title, exceptId)`**: tìm game cùng tên, bỏ qua chính nó khi sửa. Collation làm "tekken 8" khớp "Tekken 8".

**`countCategories(ids)`**: đếm bao nhiêu id là thể loại có thật; service so với số id gửi lên.

---

## 📁 File: `game.service.ts`

### Mục đích
Quy tắc nghiệp vụ của game.

### Phân tích
- **`create`**: kiểm tra lần lượt tên chưa trùng (`409 GAME_002`), **mọi** thể loại tồn tại (`checkCategoryIds`: bỏ id trùng, sắp tăng dần, thiếu cái nào → `404 GAME_003`), chi nhánh tồn tại (`400 GAME_006`), rồi mới tạo. Ghi log `game.created`.
- **`update`**: kiểm tra game tồn tại (kể cả game đang ẩn), rồi chỉ kiểm tra **những trường có gửi**. Log ghi tên các trường đã đổi, và có đổi chi nhánh hay không.
- **`remove`**: kiểm tra rồi xóa thật; dòng nối tự xóa theo.
- **`checkBranchIds`**: bỏ id trùng (`[2, 1, 2]` → `[1, 2]`), sắp tăng dần, rồi hỏi **`this.branches.existsAll(...)`**.

**`this.branches` là gì?** Là `BranchLookup`, một interface **game tự khai báo** trong `game.types.ts`:
```ts
export interface BranchLookup {
  existsAll(ids: number[]): Promise<boolean>;
}
```
`app.ts` truyền `BranchService` (của feature `branch`) vào constructor. `game` không import code nào của `branch`; nó chỉ biết "có ai đó trả lời được câu hỏi này". Đây là **dependency injection** (BE-ARCHITECTURE mục 5, 8). Khi viết test, ta truyền một `BranchLookup` giả là xong.

---

## 📁 File: bộ `game-category.*`

### Phân tích
- **`list`**: danh sách kèm `gameCount`; khách chỉ thấy thể loại đang hiện.
- **`create` / `update`**: tên trùng (không phân biệt dấu: "doi khang" trùng "Đối Kháng") → `409 GAME_004`.
- **`remove`**: thể loại còn game → **`409 GAME_005`** "Thể loại còn N game, hãy chuyển hoặc xóa game trước". Service đếm trước để có số N cho thông báo dễ hiểu; khóa ngoại RESTRICT trên bảng nối là lớp chặn thứ hai.
  - **Vì sao không tự gỡ thể loại khỏi game rồi xóa?** Game chỉ có đúng thể loại đó sẽ **mất hết thể loại**, thành dữ liệu lỗi. Chặn lại để chủ quán tự chuyển game sang thể loại khác trước.
- `gameCount` giờ là số dòng nối (= số game có thể loại này).
- Không có `GET /game-categories/:id`, vì giao diện không cần.

---

## 📁 File: routes, controller, `index.ts`, `app.ts`

```
GET  /games, /games/:id, /game-categories → optionalAdmin → publicCache → validate → controller
POST/PUT/DELETE (game và thể loại)        → requireAdmin → validate → controller
```
- `optionalAdmin` + `?includeInactive=true` cho trang quản trị thấy cả game và thể loại đang ẩn, trên **cùng URL** với khách. Khách gửi `includeInactive` thì bị lờ đi.
- `app.ts`:
  ```ts
  const gameController = new GameController(new GameService(new GameRepository(db), branchService));
  v1.use('/games', createGameRouter(gameController, guards));
  v1.use('/game-categories', createGameCategoryRouter(gameCategoryController, guards));
  ```
- Mã lỗi: `GAME_NOT_FOUND` (001), `GAME_TITLE_TAKEN` (002), `GAME_CATEGORY_NOT_FOUND` (003), `GAME_CATEGORY_NAME_TAKEN` (004), `GAME_CATEGORY_HAS_GAMES` (005), `GAME_BRANCH_NOT_FOUND` (006).

---

## 🧪 Ví dụ request thật (đã chạy thử)

| Gửi | Nhận |
|---|---|
| `GET /games?q=TEKKEN` | Chỉ "Tekken 8" |
| `GET /games/1` (game mẫu) | `"branchIds": null`, `"categories": [{ "id": 1, "name": "Đối Kháng" }]` |
| `POST … gameCategoryIds: []` / 6 id | `400` "Chọn ít nhất 1 thể loại" / "Tối đa 5 thể loại" |
| `POST … gameCategoryIds: [A, B, A]` (B có sortOrder nhỏ hơn) | `201`, `categories: [B, A]` |
| Ẩn A → game có A + B (không token) | `200`, vẫn hiện |
| Ẩn cả A và B → game đó | `404 GAME_001` |
| `POST /games { title: "tekken 8", … }` | `409 GAME_002` (trùng dù khác hoa thường) |
| `POST … branchIds: []` | `400 COMMON_001` "Chọn ít nhất 1 chi nhánh…" |
| `POST … branchIds: [1, 9999]` | `400 GAME_006` |
| `POST … branchIds: [2, 1, 2]` | `201`, `branchIds: [1, 2]` |
| `GET /games?branchId=3` | Có game "mọi chi nhánh", **không** có game chỉ ở 1 và 2 |
| `PUT /games/13 { isActive: false }` | `branchIds` giữ nguyên |
| `PUT /games/13 { branchIds: null }` | `branchIds: null` (về mọi chi nhánh) |
| `DELETE /game-categories/:id` còn 1 game | `409 GAME_005` "Thể loại còn 1 game…" |

---

## 🔗 Liên kết

- **Được gọi bởi:** `src/app.ts`; frontend qua `game.service.ts`, `game-category.service.ts`.
- **Gọi tới:** Prisma (`game`, `gameCategory`, `gameGameCategory`, `branchGame`); `BranchLookup` (do `branch` cung cấp qua `app.ts`); `guards` của `auth`.
- **Tài liệu:** `backend/src/features/game/context.md`; `BE-ARCHITECTURE.md` mục 3 (feature nhiều tài nguyên), 5 (giao tiếp qua interface), 8 (DI); `DATABASE.md` (Feature Game, quan hệ, RESTRICT/CASCADE); `API_SPEC.md` mục 7.2–7.5.

## 💡 Điểm cần nhớ (cả feature)
- **Không có dòng `branch_game` nào = có ở mọi chi nhánh.** API trả `branchIds: null`; `[]` bị từ chối; lọc `?branchId=` gồm cả game "mọi chi nhánh".
- Đổi chi nhánh của game làm trong **một transaction** cùng việc sửa game.
- Game có **1–5 thể loại** qua bảng nối `game_game_category`; API dùng `gameCategoryIds` (gửi) / `categories` (nhận).
- Game chỉ ẩn khi **mọi** thể loại của nó đều ẩn. Xóa thể loại còn game thì bị chặn, có kèm số lượng.
- Đổi cấu trúc bảng có dữ liệu: đọc SQL trước khi chạy, chép dữ liệu trước khi xóa cột. Seed chỉ chạy trên bảng trống.
- So trùng tên không phân biệt hoa thường và dấu, nhờ collation của DB.
- `game` hỏi `branch` qua interface `BranchLookup`, không import chéo.
- Chưa có: test tự động (`/be-test game`), event `game.deleted`.

---

Xem phần còn lại: [Giải thích code `game` phía Frontend](../../../../frontend/docs/explain/code/game.md)
