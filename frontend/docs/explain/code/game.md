# Giải thích code: feature `game` (Frontend)

| | |
|---|---|
| **Phía** | FE (frontend) |
| **Chế độ** | `code` |
| **Target** | `game` |
| **Ngày viết** | 2026-10-07 (cập nhật: ô tìm kiếm ở trang quản trị; game có nhiều thể loại, chọn bằng ô tick) |
| **Tài liệu đã đọc** | `frontend/src/features/game/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07), `frontend/docs/FE-ARCHITECTURE.md` (mục 3, 4, 5, 6, 9, 10) |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `game` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

| Mặt | Ở đâu | Ai dùng |
|---|---|---|
| **Xem game** | Trang `/games` (lọc chi nhánh, thể loại, tìm tên), mục "Kho game" ở trang chủ (8 game), số "Tựa game" ở hero | Khách |
| **Quản lý game** | `/admin/games` (ô tìm theo tên + bảng), `/admin/games/new`, `/admin/games/:id/edit` | Admin (chủ quán và nhân viên) |
| **Quản lý thể loại** | `/admin/game-categories` | Admin |

Ví dụ đời thường: trang `/games` giống **kệ đĩa có ba núm vặn**: chọn chi nhánh, chọn thể loại, gõ tên. Vặn núm nào thì địa chỉ trang (URL) đổi theo, nên gửi link cho bạn là bạn thấy đúng kệ đang lọc.

### Cấu trúc thư mục và luồng gọi

```
component → hook (TanStack Query) → service → http.ts → API /games, /game-categories
```

| Thư mục | Nội dung |
|---|---|
| `types/` | Kiểu dữ liệu (`Game`, `GameDetail`, `GameCategory`, `BranchOption`…), luật form (`gameFormSchema`, `gameCategoryFormSchema`) |
| `services/` | `game.service.ts` (game + danh sách chi nhánh cho form), `game-category.service.ts` |
| `hooks/` | 13 hook, mỗi hook một file (danh sách, chi tiết, đếm, thêm/sửa/xóa game và thể loại, danh sách chi nhánh) |
| `utils/` | Màu nhấn → class Tailwind, chuyển form ↔ API, gán lỗi form |
| `components/` | Công khai: `GameCard`, `GameList`, `GameFilters`. Quản trị: `GameForm` (+ `AccentColorField`, `GameBranchesField`), `GameTable`, `AdminGameSearch`, `GameCategoryForm`, `GameCategoryRow` |
| `pages/` | 4 trang quản trị. Trang công khai `/games` nằm ở `src/pages/GamesPage.tsx` (lý do bên dưới) |

---

## 📁 File: `types/game.types.ts` và `types/game.schema.ts`

### Phân tích
- **`Game`** (danh sách) và **`GameDetail`** (chi tiết, thêm `branchIds`). Thể loại là **mảng** `categories: [{ id, name }, …]` (1–5 thể loại, đã xếp theo thứ tự của thể loại), vì một game có thể vừa "Hành Động" vừa "Co-op". `branchIds: null` nghĩa là **có ở mọi chi nhánh**; mảng `[1, 3]` là chỉ những chi nhánh đó.
- **`AccentColor`** = `'orange' | 'red' | 'amber' | 'gold'`.
- **`BranchOption`** = `{ id, name, isActive }`: chi nhánh để tick trong form. Kiểu này **khai báo riêng trong `game`**, không lấy kiểu `Branch` của feature `branch` (vì không được import chéo).
- **`GamePayload`** gửi `gameCategoryIds: number[]`.
- **`gameFormSchema`**: mọi ô là chuỗi. `gameCategoryIds: string[]` (giá trị các ô tick thể loại) phải có **1–5** phần tử: thiếu → "Chọn ít nhất 1 thể loại", thừa → "Tối đa 5 thể loại", khớp luật backend. Cộng thêm 2 trường **chỉ có ở form**:
  - `allBranches: boolean`: ô "Có ở mọi chi nhánh".
  - `branchIds: string[]`: giá trị các ô tick.
  - Luật thêm: bỏ "mọi chi nhánh" mà không tick ô nào → lỗi ngay ở ô chi nhánh: *"Chọn ít nhất 1 chi nhánh, hoặc chọn 'Có ở mọi chi nhánh'"*. Khớp với việc backend từ chối `branchIds: []`.

---

## 📁 File: `services/` và `hooks/`

### Phân tích

**Service** chỉ gọi `http`: `getGames`, `getGame`, `createGame`, `updateGame`, `deleteGame`, các hàm của thể loại, và **`getBranchOptions`** (`GET /branches?limit=100&includeInactive=true`).

**Vì sao `game` tự gọi API `/branches`?** Form game cần tên các chi nhánh để tick, nhưng `game` không được import hook của `branch`. Gọi **API** thì không phải import **code**: hai feature vẫn tách nhau.

Mẹo đi kèm: query key của danh sách này là `['branches', { limit: 100, includeInactive: true }]`, **trùng** key mà trang quản trị chi nhánh đang dùng. Nhờ vậy:
- Hai nơi dùng chung một bản cache.
- Chủ quán thêm hoặc sửa chi nhánh thì `branch` làm mới `['branches']`, và form game **cũng tự thấy** chi nhánh mới.

**Hooks**

| Hook | Làm gì |
|---|---|
| `useGames(query)` | Danh sách, mặc định `limit: 100`; trang chủ truyền `limit: 8`. Có `placeholderData: keepPreviousData`: đổi bộ lọc hay từ khóa thì **giữ danh sách cũ trên màn hình** trong lúc tải danh sách mới, không nháy về khung xám |
| `useGameCount()` | Gọi `/games?limit=1`, chỉ đọc `meta.total`, ra số "Tựa game" ở hero. Không tải 100 game chỉ để đếm |
| `useGame(id, includeInactive)` | Một game kèm `branchIds` (trang sửa) |
| `useGameCategories(query)` | Thể loại cho bộ lọc, ô tick trong form và trang quản trị |
| `useCreate/Update/DeleteGame`, `useCreate/Update/DeleteGameCategory` | Ghi dữ liệu, xong thì gọi `useInvalidateGames` |
| `useInvalidateGames` | Làm mới **cả** `['games']`, `['game']` và `['game-categories']` |
| `useBranchOptions` | Danh sách chi nhánh cho form |

**Vì sao sửa thể loại cũng phải làm mới danh sách game?** Thẻ game hiện **tên thể loại**. Đổi "Đua Xe" thành "Racing" mà không làm mới thì thẻ vẫn ghi tên cũ. Ngược lại, thêm hoặc xóa game làm đổi **số game** của thể loại.

---

## 📁 File: `components/GameCard.tsx` và `GameList.tsx`

### Phân tích

**`GameCard`** (theo prototype):
- **Poster tỉ lệ 3:4.** Có `posterUrl` thì hiện ảnh (`alt`, `loading="lazy"`, kích thước cố định để trang không nhảy). **Không có ảnh** thì hiện **tên game chữ to, phát sáng**, màu theo `accentColor`: Tekken 8 đỏ, Street Fighter 6 cam, NBA 2K26 vàng…
- Màu đi qua `utils/accent.ts` (`ACCENT_TEXT_CLASS.red` → `text-neon-red`), không viết cứng mã màu trong component.
- Dưới poster: tên in hoa, **các thể loại** nối bằng dấu chấm giữa (cam, vd "Hành Động · Co-op") và số người chơi.

**`GameList`**:
- **Props:** `query` (bộ lọc), `emptyMessage` (chữ khi không có game).
- Lưới 2 → 3 → 4 cột theo bề rộng màn hình.
- Đủ 3 trạng thái: khung xám (đang tải), lỗi kèm "Thử lại", rỗng ("Không có game nào khớp bộ lọc." khi đang lọc).

---

## 📁 File: `components/GameFilters.tsx` và trang `/games`

### Phân tích
- **Nút thể loại:** "Tất cả" và từng thể loại. Bấm thì ghi `?category=<id>` lên URL; nút đang chọn có nền cam phát sáng.
- **Ô tìm tên:** gõ vào thì chữ hiện ngay, nhưng **chỉ ghi `?q=` lên URL sau khi ngừng gõ 300ms** (`useDebounce`). Không có độ trễ này thì mỗi phím gõ là một lần gọi API.
- Ghi URL bằng `replace`, nên bấm "Quay lại" trên trình duyệt không phải lùi qua từng lần gõ.

**Trang `/games` (`src/pages/GamesPage.tsx`)** ghép **hai feature**:
```tsx
const query = {
  branchId: readIdParam(searchParams.get(BRANCH_SEARCH_PARAM)),       // từ feature branch
  categoryId: readIdParam(searchParams.get(GAME_SEARCH_PARAMS.category)),
  q: searchParams.get(GAME_SEARCH_PARAMS.q)?.trim() || undefined,
}
<BranchPicker />        {/* branch: ghi ?branch= */}
<GameFilters />         {/* game: ghi ?category=, ?q= */}
<GameList query={query} />
```
`BranchPicker` (của `branch`) và `GameList` (của `game`) **không biết nhau**. Chúng gặp nhau ở URL, và trang ghép đọc URL rồi truyền xuống. Vì ghép 2 feature nên trang nằm ở `src/pages/`, không nằm trong `features/game/pages/` (FE-ARCHITECTURE mục 5, 6).

`readIdParam` bỏ qua giá trị sai: `?category=abc` coi như không lọc, thay vì gửi rác lên API.

---

## 📁 File: `components/GameForm.tsx` và hai phần con

### Mục đích
Form thêm và sửa game, dùng chung cho 2 trang.

### Phân tích

**4 nhóm ô:**
1. **Thông tin game:** tên, **`GameCategoriesField`** (các ô tick thể loại, chọn 1–5; liệt kê cả thể loại đang ẩn kèm chữ "(đang ẩn)", để sửa game cũ không mất thể loại), số người chơi, mô tả.
2. **Hình ảnh:** link poster, và **`AccentColorField`**: 4 ô màu tròn (thật ra là nút radio ẩn đi). Ô đang chọn có viền trắng; mỗi ô có chữ "Cam", "Đỏ"… cho trình đọc màn hình.
3. **`GameBranchesField`:**
   - Ô "**Có ở mọi chi nhánh**" (mặc định), ghi chú "gồm cả chi nhánh mở sau này".
   - Bỏ chọn thì hiện các ô tick từng chi nhánh (chi nhánh đang ẩn có ghi "(đang ẩn)").
   - Form dùng `useWatch` để biết ô đó đang bật hay tắt mà hiện hoặc ẩn danh sách.
4. **Hiển thị:** thứ tự, "Đang hoạt động".

**Chuyển dữ liệu (`utils/game.utils.ts`):**
- **`toGamePayload`:** form → API.
  - `gameCategoryIds: ['4', '5']` → `[4, 5]`.
  - `allBranches: true` → `branchIds: null`; ngược lại `['3','1']` → `[3, 1]`.
  - Ô trống → `null`; chuỗi số → số.
- **`toGameFormValues`:** API → form.
  - `categories` → tick sẵn đúng các ô thể loại.
  - `branchIds: null` → tick sẵn "mọi chi nhánh".
  - `[1, 4]` → bỏ tick "mọi chi nhánh" và tick sẵn chi nhánh 1, 4.

**Lỗi (`utils/game-form-errors.ts` → `applyGameErrors`):**
- `GAME_002` (trùng tên) → hiện ngay **dưới ô tên**: "Tên game đã tồn tại".
- Lỗi validate có `details` → đúng ô.
- `GAME_003` (có thể loại vừa bị người khác xóa) → hiện ngay **dưới các ô thể loại**: "Có thể loại vừa bị xóa, hãy tải lại trang và chọn lại".
- Còn lại (`GAME_006` chi nhánh vừa bị xóa…) → khung đỏ đầu form.

### 📏 Quy tắc dự án liên quan
- Component ≤ 150 dòng. `GameForm` (115 dòng) tách 2 phần con để không vượt giới hạn và để mỗi phần dễ đọc.

---

## 📁 File: trang quản trị

| Trang | Làm gì |
|---|---|
| `AdminGamesPage` | Ô **tìm theo tên** (`AdminGameSearch`, xem dưới) và `GameTable` gồm cả game đang ẩn (hàng mờ, nhãn "Đang ẩn"); nút "Thể loại", "Thêm game"; xóa có hộp xác nhận |
| `AdminGameNewPage`, `AdminGameEditPage` | `GameForm`; trang sửa dùng `useGame(id, true)` để mở được cả game đang ẩn; lưu xong về danh sách kèm thông báo |
| `AdminGameCategoriesPage` | Ô **thêm** thể loại ở đầu trang (thêm xong tự xóa trắng). Mỗi dòng (`GameCategoryRow`) hiện tên, **số game**, thứ tự, trạng thái; bấm "Sửa" thì dòng đó **thành form ngay tại chỗ** |

**Ô tìm ở trang quản trị (`AdminGameSearch`)** làm giống ô tìm ở `/games`: gõ xong 300ms mới ghi `?q=` lên URL (`/admin/games?q=tekken`), nên tải lại trang vẫn giữ từ khóa. Có nút ✕ để xóa nhanh. `AdminGamesPage` đọc `q` từ URL rồi gọi `useGames({ includeInactive: true, q })`, nên game đang ẩn cũng tìm được. Không có kết quả thì ghi "Không có game nào có tên chứa …". Việc tìm không phân biệt hoa thường và dấu là do backend (collation), giao diện không phải tự xử lý.

**Nút Xóa thể loại bị khóa khi còn game**, rê chuột vào thì có gợi ý "Còn N game, chuyển hoặc xóa game trước". Giao diện chặn trước cho dễ hiểu, backend vẫn chặn thật bằng `GAME_005`.

Thể loại đang ẩn ghi **"Đang ẩn (game chỉ có thể loại này sẽ ẩn theo)"**. Từ khi game có nhiều thể loại, game chỉ biến mất khỏi trang khách khi **mọi** thể loại của nó đều ẩn: ẩn "Co-op" thì "A Way Out" (chỉ Co-op) ẩn theo, còn "It Takes Two" (Co-op + Hành Động) vẫn hiện.

---

## 📁 File: `routes.tsx`, `index.ts` và chỗ ghép trong `app/`

- **`gameAdminRoutes`**: 4 trang quản trị, **tải lazy**, nằm trong nhánh `admin` (bọc `RequireAuth`). **Không** bọc `RequireRole owner`, vì nhân viên cũng được dùng.
- **`app/routes.tsx`**: route `/games` (lazy từ `@/pages/GamesPage`); menu header thêm "Game".
- **`app/AdminRoot.tsx`**: menu quản trị thêm "Game", "Thể loại game" (mọi admin đều thấy).
- **Trang chủ**:
  - Hero thêm `{ value: '12', label: 'Tựa game' }` từ `useGameCount`.
  - Nút "Xem game" dẫn tới `/games`.
  - Mục "Kho game" có `<GameList query={{ limit: 8 }} />` và nút "Xem tất cả game".
- **`index.ts`** export: `GameList`, `GameFilters`, `useGameCount`, `gameAdminRoutes`, `GAME_SEARCH_PARAMS`, `readIdParam`, type `Game`, `GameListQuery`.
- `error-messages.ts` có thông báo tiếng Việt cho `GAME_001` → `GAME_006`.
- `shared/components/ui/SelectField.tsx`: ô chọn dùng chung, cùng giao diện với `TextField`. Hiện **chưa nơi nào dùng** (form game đã đổi sang ô tick), giữ lại cho `menu`, `promotion`.

---

## 🔗 Liên kết

- **Được dùng bởi:** `src/pages/GamesPage.tsx`, `src/pages/HomePage.tsx`, `src/app/routes.tsx`, `src/app/AdminRoot.tsx`.
- **Gọi tới:** `shared/services/api/http.ts` → `/api/v1/games`, `/api/v1/game-categories`, `/api/v1/branches`.
- **Ghép với:** `BranchPicker`, `BRANCH_SEARCH_PARAM` (feature `branch`, chỉ ở trang ghép).
- **Dùng từ `shared`:** `Button`, `TextField`, `TextAreaField`, `CheckboxField`, `FormAlert`, `ConfirmDialog`, `SectionHeading`, `useDebounce`, `applyServerErrors`, `getErrorMessage`.
- **Tài liệu:** `frontend/src/features/game/context.md`; `FE-ARCHITECTURE.md` mục 3, 4 (luồng dữ liệu), 5 (giao tiếp qua URL), 6 (routing), 9, 10 (theme neon).

## 💡 Điểm cần nhớ (cả feature)
- **Bộ lọc nằm trên URL** (`?branch=&category=&q=`); trang ghép đọc URL rồi truyền vào `GameList`.
- **"Mọi chi nhánh"** là ô tick trong form, gửi lên thành `branchIds: null`.
- Mọi thao tác ghi làm mới cả game, chi tiết và thể loại. Danh sách chi nhánh dùng chung cache với feature `branch` nhờ trùng query key.
- Một game có **1–5 thể loại** (ô tick); thẻ ghi "Hành Động · Co-op", bảng quản trị ghi "Hành Động, Co-op".
- `GAME_002` hiện ngay dưới ô tên, `GAME_003` dưới ô thể loại; nút xóa thể loại còn game bị khóa sẵn.
- Trang quản trị game tìm được theo tên (`?q=` trên URL); đổi từ khóa không làm bảng nháy nhờ `keepPreviousData`.
- Chưa có: test tự động (`/fe-test game`), lọc theo thể loại ở bảng quản trị, upload ảnh poster (chỉ nhập link).

---

Xem phần còn lại: [Giải thích code `game` phía Backend](../../../../backend/docs/explain/code/game.md)
