# Giải thích code: feature `menu` (Backend)

| | |
|---|---|
| **Phía** | BE (backend) |
| **Chế độ** | `code` |
| **Target** | `menu` |
| **Ngày viết** | 2026-10-07 |
| **Tài liệu đã đọc** | `backend/src/features/menu/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07, đã có cột `is_best_seller` và menu thật của quán), `backend/docs/BE-ARCHITECTURE.md` (mục 3, 4, 5, 8), `01-share-docs/DATABASE.md` (Feature Menu, mục 3), `01-share-docs/API_SPEC.md` (mục 3, 5, 6) |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `menu` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

`menu` quản lý **đồ ăn, nước uống** của quán, gồm 2 phần:

| Phần | Bảng | Ví dụ |
|---|---|---|
| Nhóm menu | `menu_category` | Nước uống, Trà, Cơm chiên, Mì, Snack, Topping thêm… (9 nhóm) |
| Món | `menu_item` | "Mì trộn best seller" 45.000đ, thuộc nhóm Mì, đang bán chạy |

Ví dụ đời thường: giống **tờ menu dán ở quầy**. Tờ menu chia thành các khối (nhóm), mỗi khối có nhiều dòng (món). Món nào hết hàng thì nhân viên gạch tạm chứ không xé khỏi tờ (`isAvailable`). Món nào không bán nữa thì che hẳn đi (`isActive`).

So với `game` (bài [game.md](game.md)), `menu` **đơn giản hơn**:
- Một món chỉ thuộc **một** nhóm (quan hệ một-nhiều bình thường), không có bảng nối.
- **Không phụ thuộc feature nào khác**: không cần hỏi `branch` như game.

Nhưng có 2 điểm riêng:
- Có endpoint **`GET /menu`** trả cả menu một lần (nhóm kèm món), để trang khách chỉ gọi **một** request.
- Mỗi món có **hai** công tắc khác nhau: "tạm hết" (`isAvailable`) và "ẩn" (`isActive`), cộng thêm cờ "bán chạy" (`isBestSeller`).

| Method | Path | Ai gọi được |
|---|---|---|
| GET | `/api/v1/menu`, `/api/v1/menu-items`, `/api/v1/menu-items/:id`, `/api/v1/menu-categories` | Công khai |
| POST, PUT, DELETE | `/api/v1/menu-items[/:id]`, `/api/v1/menu-categories[/:id]` | **Admin** (chủ quán **và** nhân viên) |

Giống game, nhân viên cũng sửa được menu, vì báo "tạm hết" là việc hằng ngày ở quầy.

### Các file

Mỗi tài nguyên có **một bộ file riêng** trong cùng thư mục (BE-ARCHITECTURE mục 3):

```
menu-item.routes → menu-item.controller → menu-item.service → menu-item.repository → Prisma
menu-category.routes → menu-category.controller → menu-category.service → menu-category.repository → Prisma
```

| File | Một câu |
|---|---|
| `menu-item.dto.ts`, `menu-category.dto.ts` | Luật kiểm tra dữ liệu gửi lên (Zod) |
| `menu-item.entity.ts`, `menu-category.entity.ts` | Hình dạng dữ liệu trả ra, và hàm đổi từ dòng Prisma |
| `menu-item.types.ts` | `MenuItemFilter`: điều kiện lọc service đưa xuống repository |
| `menu-item.repository.ts`, `menu-category.repository.ts` | Mọi truy vấn Prisma |
| `menu-item.service.ts`, `menu-category.service.ts` | Quy tắc nghiệp vụ, mã lỗi `MENU_001`–`004`, log |
| `*.controller.ts`, `*.routes.ts` | Nhận request, gắn quyền và kiểm tra dữ liệu |
| `index.ts` | Export thứ `app.ts` cần |

---

## 🗄️ Hai bảng

### Phân tích

**`menu_category`** (nhóm): `name` (≤ 50 ký tự, **không trùng**), `sort_order`, `is_active`.

**`menu_item`** (món):

| Cột | Ý nghĩa |
|---|---|
| `menu_category_id` | Món thuộc nhóm nào. Khóa ngoại **RESTRICT**: không xóa được nhóm còn món |
| `name` | ≤ 150 ký tự. **Không trùng trong cùng nhóm** (index UNIQUE `(menu_category_id, name)`) |
| `description` | ≤ 255 ký tự, có thể trống. Chứa phần trong ngoặc của tờ menu, vd "3 cây", "Việt quất / Dâu / Xoài" |
| `price_vnd` | Giá, **số nguyên đơn vị đồng** (45000 = 45.000đ). Có thêm `CHECK (price_vnd >= 0)` viết tay trong migration |
| `image_url` | Link ảnh, có thể trống |
| `is_available` | `0` = **tạm hết**: món **vẫn hiện** trên web, chỉ bị đánh dấu |
| `is_best_seller` | `1` = **bán chạy**: trang khách hiện huy hiệu "Best seller" (thêm sau, migration riêng `add_is_best_seller_to_menu_item`) |
| `sort_order`, `is_active` | Thứ tự trong nhóm; `0` = **ẩn** khỏi web |

**Vì sao tên món chỉ cấm trùng *trong cùng nhóm*?** Vì menu thật có món "Trứng" ở nhóm Topping thêm, và có thể có "Trứng" ở nhóm khác với giá khác. Trùng trong cùng một nhóm thì mới là nhập nhầm.

**Vì sao tiền là số nguyên?** Số thập phân (float) tính tiền dễ sai lẻ (0.1 + 0.2 ≠ 0.3). Lưu đồng nguyên thì cộng trừ luôn đúng; việc ghi "45K" hay "45.000đ" là chuyện của frontend.

**Index UNIQUE kiêm luôn index lọc**: index `(menu_category_id, name)` bắt đầu bằng `menu_category_id`, nên MySQL dùng nó luôn khi lọc "món của nhóm X". Không cần thêm index riêng cho khóa ngoại.

### Migration

Mỗi bảng một migration (`create_menu_category_table`, `create_menu_item_table`), sửa tay collation thành `utf8mb4_0900_ai_ci` để tìm kiếm **không phân biệt hoa thường và dấu** ("cafe sua" tìm ra "Cafe sữa").

Có một chi tiết dễ vấp: Prisma đặt tên migration theo **giờ máy**, ra tên **sớm hơn** migration viết tay của game đã chạy trước đó (`20261007195001_…`). Migration chạy theo thứ tự tên, nên tên đã được đổi tay thành `20261007200000_…`, `20261007200100_…`, `20261007210000_…` để xếp sau.

---

## 📁 File: `menu-item.dto.ts` và `menu-category.dto.ts`

### Mục đích
Kiểm tra dữ liệu **trước khi** vào controller. Sai thì trả `400 COMMON_001` kèm `details` từng ô.

### Phân tích

**Body thêm món** (`createMenuItemSchema`):
- Bắt buộc: `menuCategoryId` (số nguyên dương), `name` (1–150), `priceVnd` (số nguyên 0–100.000.000).
- Tùy chọn: `description` (≤ 255), `imageUrl` (link hợp lệ ≤ 500). Gửi `''` thì thành `null` (dự án không lưu chuỗi rỗng).
- Có mặc định: `isAvailable: true`, `isBestSeller: false`, `sortOrder: 0`, `isActive: true`.

**Body sửa món** (`updateMenuItemSchema`): cùng các trường nhưng **tất cả tùy chọn và bỏ mặc định**. Trường không gửi thì **giữ nguyên**. Nhờ vậy nút "Tạm hết" ở trang quản trị chỉ cần gửi `{ "isAvailable": false }`. Body rỗng `{}` bị từ chối ("Cần gửi ít nhất một trường").

> Vì sao phải bỏ mặc định ở PUT? Nếu giữ `isActive: default(true)`, gửi `{ "priceVnd": 50000 }` sẽ âm thầm thêm `isActive: true`, vô tình **hiện lại** món đang ẩn.

**Query danh sách** (`listMenuItemsQuerySchema`): `page`, `limit`, `sort`, `q`, `categoryId`, `isAvailable`, `includeInactive`.
- `isAvailable` và `includeInactive` chỉ nhận chữ `"true"` / `"false"`.
- Không dùng `z.coerce.boolean()` vì nó biến chuỗi `"false"` thành `true` (chuỗi khác rỗng là "truthy"). Gửi `isAvailable=abc` thì trả `400`.

### 📏 Quy tắc dự án liên quan
- Chuỗi dùng sẵn `requiredText`, `optionalText`, `optionalUrl`, `hasAnyField` từ `@/shared/utils/zod-fields`.

---

## 📁 File: `menu-item.entity.ts`

### Mục đích
Định nghĩa **hình dạng dữ liệu trả ra** và chọn đúng cột cần đọc (`MENU_ITEM_SELECT`).

### Phân tích

Có **hai dạng món**:

| Dạng | Dùng ở | Có gì |
|---|---|---|
| `MenuItem` | `/menu-items` (trang quản trị) | Đủ trường + `category: { id, name }` + `isActive`, `createdAt`, `updatedAt` |
| `MenuEntryItem` (trong `MenuSection`) | `/menu` (trang khách) | Chỉ thứ khách cần: tên, mô tả, giá, ảnh, `isAvailable`, `isBestSeller`, thứ tự |

`toMenuItem(row)` đổi tên `menuCategory` (tên quan hệ của Prisma) thành `category` cho gọn.

**Gửi lên một kiểu, trả về một kiểu**: gửi lên dùng `menuCategoryId: 4`; trả về là `category: { id: 4, name: "Nước uống" }`. Bảng quản trị hiện được tên nhóm mà không cần gọi thêm API.

---

## 📁 File: `menu-item.repository.ts`

### Mục đích
Nơi **duy nhất** của feature dùng Prisma cho món.

### Phân tích

**Hằng `VISIBLE`**: món khách được thấy:
```ts
{ isActive: true, menuCategory: { isActive: true } }
```
Tức là **món đang hiện VÀ nhóm của nó đang hiện**. Ẩn nhóm "Topping thêm" thì cả 4 món topping biến khỏi web, không phải ẩn từng món.

**`findMany(filter)`**: danh sách món có phân trang.
- Không có `includeInactive` → thêm điều kiện `VISIBLE`.
- `q` → `name contains q` (collation đã lo phần không dấu).
- `categoryId`, `isAvailable` → lọc thẳng.
- Thứ tự: không gửi `sort` thì xếp **theo thứ tự nhóm trước**, rồi thứ tự món trong nhóm (`DEFAULT_ORDER`), để bảng quản trị đọc giống tờ menu. Luôn thêm `id` cuối cùng để hai món cùng thứ tự không đổi chỗ giữa các lần tải.
- `findMany` và `count` chạy trong `$transaction` để tổng số khớp với danh sách.

**`findMenu()`**: phục vụ `GET /menu`. **Truy vấn từ phía nhóm**:
```
nhóm đang hiện VÀ còn ít nhất 1 món đang hiện
  └── kèm các món đang hiện, xếp theo sortOrder rồi id
xếp nhóm theo sortOrder rồi id
```
Điều kiện `items: { some: { isActive: true } }` bỏ những nhóm rỗng, để trang khách không có khối trống. Món **tạm hết vẫn có** trong kết quả (chỉ lọc `isActive`, không lọc `isAvailable`).

**`findIdByName(menuCategoryId, name, exceptId?)`**: có món cùng tên **trong nhóm đó** chưa. `exceptId` để khi sửa món, không tính chính nó là trùng.

**`categoryExists(id)`**: nhóm có thật không (kể cả nhóm đang ẩn, vì admin được thêm món vào nhóm đang ẩn).

### 📏 Quy tắc dự án liên quan
- Repository không ném lỗi HTTP, không chứa quy tắc nghiệp vụ. Nó chỉ trả `null` / `true` / `false`; service quyết định đó là lỗi gì.

---

## 📁 File: `menu-item.service.ts`

### Mục đích
Quy tắc nghiệp vụ của món: kiểm tra nhóm, kiểm tra trùng tên, quyết định ai thấy món ẩn, ghi log.

### Các methods

- `getMenu()`: gọi `repo.findMenu()`. Không có tham số: trang khách luôn thấy cùng một menu.
- `list(query, isAdmin)`: `includeInactive` **chỉ có hiệu lực khi `isAdmin`**. Khách tự thêm `?includeInactive=true` vào URL cũng không thấy được món ẩn.
- `get(id, includeInactive)`: không thấy → `NotFoundError` `MENU_001`.
- `create(adminId, dto)`:
  1. Nhóm không có → `404 MENU_002`.
  2. Tên đã có trong nhóm → `409 MENU_003`.
  3. Tạo, log `menu_item.created`.
- `update(adminId, id, dto)`:
  1. Lấy món hiện tại (kể cả đang ẩn).
  2. Có gửi `menuCategoryId` → kiểm tra nhóm có thật.
  3. **Đổi tên hoặc chuyển nhóm** → kiểm tra trùng tên **ở nhóm đích**, dùng giá trị mới nếu có gửi, giá trị cũ nếu không.
     Ví dụ: chuyển "Trứng" từ "Cơm chiên" sang "Topping thêm", trong khi "Topping thêm" đã có "Trứng" → `409 MENU_003`, dù tên không đổi.
  4. Sửa, log kèm danh sách trường đã đổi (không log nội dung body).
- `remove(adminId, id)`: xóa **thật**, log `menu_item.deleted`.

### 📏 Quy tắc dự án liên quan
- Kiểm tra trùng **trước** khi ghi để trả mã lỗi rõ ràng (`MENU_003`), thay vì để MySQL ném lỗi UNIQUE khó hiểu.

---

## 📁 File: bộ `menu-category.*`

Giống hệt thể loại game (`game-category.*`), chỉ đổi tên. Có 3 điểm đáng nhớ:

- **`itemCount`**: danh sách nhóm đếm sẵn số món (kể cả món ẩn) bằng `_count: { select: { items: true } }` của Prisma, trong cùng câu truy vấn.
- **Xóa nhóm còn món** → `409 MENU_004` "Nhóm còn 9 món, hãy chuyển hoặc xóa món trước". Service đếm trước để báo số lượng, thay vì để khóa ngoại RESTRICT ném lỗi chung chung.
- **Trùng tên nhóm** cũng là `MENU_003`: một mã cho cả hai kiểu trùng tên. Frontend biết lỗi thuộc form nào nên vẫn báo đúng chữ.

Không có `GET /menu-categories/:id` vì trang quản trị sửa nhóm ngay trên dòng, đã có dữ liệu từ danh sách.

---

## 📁 File: `menu-item.controller.ts` và `*.routes.ts`

### Phân tích

**Một controller cho hai đường dẫn.** `MenuItemController` có thêm method `menu` cho `GET /menu`. Đường dẫn `/menu` và `/menu-items` gắn ở hai chỗ khác nhau trong `app.ts`, nên có **hai router factory**:

| Factory | Gắn ở | Có gì |
|---|---|---|
| `createMenuItemRouter(controller, guards)` | `/menu-items` | Đủ CRUD, có guard |
| `createMenuRouter(controller)` | `/menu` | Chỉ `GET /`, `publicCache`, **không cần guard** |

**Thứ tự middleware của mỗi route** (BE-ARCHITECTURE mục 8):

```
GET công khai:  optionalAdmin → publicCache → validate(params/query) → controller
Ghi (Admin):    requireAdmin  → validate(params) → validate(body) → controller
```

- `optionalAdmin`: có token hợp lệ thì gắn `req.admin`, không có cũng **cho qua**. Nhờ vậy cùng một `GET /menu-items` vừa phục vụ khách, vừa phục vụ trang quản trị (`includeInactive`).
- `publicCache`: khách nhận `Cache-Control: public, max-age=60` (trình duyệt giữ 60 giây). Có token admin thì là `no-store`, để admin sửa xong thấy ngay.

Controller **không có logic, không `try/catch`**: Express 5 tự chuyển lỗi `async` tới `errorHandler`.

---

## 📁 Nối dây: `app.ts` và seed

**`app.ts`** tạo theo thứ tự repository → service → controller, rồi gắn route:
```ts
v1.use('/menu', createMenuRouter(menuItemController));
v1.use('/menu-items', createMenuItemRouter(menuItemController, guards));
v1.use('/menu-categories', createMenuCategoryRouter(menuCategoryController, guards));
```
`menu` không nhận service của feature nào khác (khác `GameService` phải nhận `branchService`).

**`prisma/seed.ts` → `seedMenu()`**:
- Dữ liệu là **menu thật của quán** (tờ menu "Ăn vặt phủ phê"): 9 nhóm, 58 món, nằm ở `prisma/seed-data.ts`.
- **Chỉ chạy khi bảng `menu_item` trống.** Chạy lại khi đã có dữ liệu thì bỏ qua (`seed.menu_exists`), để không tạo lại món chủ quán đã xóa hay đổi tên. Bài học này rút ra từ game.
- Nhóm upsert theo tên; món tạo bằng `createMany`; thứ tự trong mảng thành `sortOrder`; `bestSeller: true` thành `isBestSeller`.

---

## 💡 Điểm cần nhớ

- **Hai công tắc khác nhau**: `isAvailable = false` là **tạm hết**, món vẫn hiện. `isActive = false` là **ẩn** hẳn. Đừng nhầm.
- **Ẩn nhóm là ẩn cả món trong nhóm** (`VISIBLE` kiểm tra cả hai).
- **`GET /menu`** trả cả menu một lần, bỏ nhóm rỗng, giữ món tạm hết.
- **Tên món không trùng trong cùng nhóm**, kể cả khi chuyển nhóm: kiểm tra ở nhóm **đích**.
- **PUT sửa một phần**: không gửi thì giữ nguyên, nên nút "Tạm hết" chỉ gửi một trường.
- **`includeInactive` chỉ có tác dụng khi có token admin.**
- Tiền là **số nguyên đồng**; hiển thị "45K" là việc của frontend.
- Seed chỉ chạy khi bảng món trống.

## 🔗 Liên kết

- Được gọi bởi: frontend feature `menu` (trang `/menu`, mục menu ở trang chủ, các trang quản trị menu).
- Gọi tới: Prisma (`menuItem`, `menuCategory`); guard của `auth` (`optionalAdmin`, `requireAdmin`).
- Tài liệu: `backend/src/features/menu/context.md`; `01-share-docs/API_SPEC.md` mục 5 (mã `MENU_*`), mục 6 (bảng endpoint Menu); `01-share-docs/DATABASE.md` (Feature Menu); `backend/docs/BE-ARCHITECTURE.md` mục 3 (giải phẫu feature), mục 8 (chuỗi middleware).
- Bài cùng loại: [game.md](game.md) (cấu trúc hai tài nguyên tương tự, có thêm bảng nối).

Xem phần còn lại: [../../../../frontend/docs/explain/code/menu.md](../../../../frontend/docs/explain/code/menu.md)
