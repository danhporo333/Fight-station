# Giải thích code: feature `branch` (Backend)

| | |
|---|---|
| **Phía** | BE (backend) |
| **Chế độ** | `code` |
| **Target** | `branch` |
| **Ngày viết** | 2026-10-07 |
| **Tài liệu đã đọc** | `backend/src/features/branch/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07, đã có phòng PC), `backend/docs/BE-ARCHITECTURE.md` (mục 3, 5, 8), `01-share-docs/DATABASE.md`, `01-share-docs/API_SPEC.md` |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `branch` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

`branch` quản lý **các chi nhánh của quán**: tên, địa chỉ, số điện thoại, giờ mở cửa, số máy PS5, số phòng VIP, số phòng PC, diện tích, link bản đồ / Facebook / Zalo.

So với `shop` (chỉ một bản ghi), `branch` là **CRUD đầy đủ**: xem danh sách, xem một chi nhánh, thêm, sửa, xóa. Đây là feature mẫu tốt để hiểu cách làm các feature danh sách sau này (`game`, `menu`, `promotion`).

Ví dụ đời thường: giống **sổ danh bạ các cửa hàng** của một chuỗi. Khách được xem các trang đang mở (`isActive = true`). Chủ quán được thêm trang, sửa, gạch tạm (ẩn), hoặc xé hẳn trang (xóa thật).

| Method | Path | Làm gì | Ai gọi được |
|---|---|---|---|
| GET | `/api/v1/branches` | Danh sách, có phân trang, sắp xếp, tìm kiếm | Công khai |
| GET | `/api/v1/branches/:id` | Một chi nhánh | Công khai |
| POST | `/api/v1/branches` | Thêm → `201` | Chỉ **Owner** |
| PUT | `/api/v1/branches/:id` | Sửa một phần → `200` | Chỉ **Owner** |
| DELETE | `/api/v1/branches/:id` | Xóa thật → `204` (không có body) | Chỉ **Owner** |

### Các file và tầng

```
branch.routes.ts → branch.controller.ts → branch.service.ts → branch.repository.ts → Prisma → MySQL
```

| File | Tầng | Một câu |
|---|---|---|
| `branch.dto.ts` | dto | Luật kiểm tra body, query, params |
| `branch.entity.ts` | entity | Hình dạng dữ liệu trả ra, cột được đọc, trường được sắp xếp |
| `branch.types.ts` | types | `BranchFilter`: điều kiện lọc service đưa xuống repository |
| `branch.repository.ts` | repository | Mọi câu truy vấn Prisma của feature |
| `branch.service.ts` | service | Quy tắc nghiệp vụ, mã lỗi, log; phục vụ cả feature `game` |
| `branch.controller.ts` | controller | Đọc request, gọi service, trả response |
| `branch.routes.ts` | routes | Gắn URL với quyền, kiểm tra dữ liệu, controller |
| `index.ts` | public API | Export thứ `app.ts` cần |

---

## 🗄️ Bảng `branch` và migration

### Phân tích
- **Cột:** `name` (bắt buộc, ≤ 100), `address` (bắt buộc, ≤ 255), `phone` (≤ 20), `open_hours` (≤ 100), `ps5_count`, `vip_room_count`, `pc_room_count` (số nguyên không âm, mặc định 0), `area_m2` (có thể trống), 3 cột link (≤ 500), `sort_order` (thứ tự hiển thị), `is_active` (đang hoạt động), `created_at`, `updated_at`.
- **Index `idx_branch_is_active_sort_order`** trên cặp (`is_active`, `sort_order`): câu hỏi hay gặp nhất là "các chi nhánh đang hoạt động, sắp theo thứ tự", index này giúp MySQL trả lời nhanh.
- **Hai migration:**
  1. `create_branch_table`: tạo bảng (sửa tay collation sang `utf8mb4_0900_ai_ci`).
  2. `add_pc_room_count_to_branch`: thêm cột `pc_room_count` **sau khi bảng đã có dữ liệu**. Câu lệnh là `ALTER TABLE ... ADD COLUMN ... DEFAULT 0`, nên các chi nhánh cũ tự nhận 0, không mất gì.

### Seed
`seedBranches()` trong `prisma/seed.ts` tạo 4 chi nhánh mẫu từ `prisma/seed-data.ts`, **chỉ khi bảng đang trống**.
- Vì sao không dùng `upsert` như `shop`? `upsert` cần một cột duy nhất (UNIQUE) để biết "dòng này đã có chưa". Bảng `branch` không có cột nào như vậy (hai chi nhánh có thể trùng tên), nên cách an toàn là "trống thì tạo, có rồi thì thôi".
- `sortOrder` lấy theo vị trí trong file; chi nhánh mẫu nào có `pcRoom` thì ghi vào `pc_room_count`.

### 💡 Điểm cần nhớ
- Thêm cột vào bảng đang có dữ liệu: luôn có `DEFAULT`, để migration không lỗi với các dòng cũ.

---

## 📁 File: `branch.dto.ts`

### Mục đích
Kiểm tra mọi dữ liệu từ client bằng **Zod** trước khi vào service.

### Vị trí trong dự án
- Feature: `branch`
- Tầng: dto

### Phân tích

**Imports**
- `requiredText`, `optionalText`, `optionalUrl`, `hasAnyField` từ `@/shared/utils/zod-fields`: các trường chuỗi dùng chung với `shop` (cắt khoảng trắng, `''` → `null`, kiểm tra link).
- `paginationQuerySchema` từ `@/shared/utils/pagination`: `page`, `limit` (tối đa 100), `sort` dùng chung cho mọi danh sách.

**Các schema**

| Schema | Dùng cho | Điểm chính |
|---|---|---|
| `createBranchSchema` | Body `POST` | `name`, `address` bắt buộc; `ps5Count`, `vipRoomCount`, `pcRoomCount` là số nguyên 0–65535, **mặc định 0**; `areaM2` 1–65535 hoặc `null`; `sortOrder` mặc định 0, `isActive` mặc định `true` |
| `updateBranchSchema` | Body `PUT` | Mọi trường tùy chọn, **bỏ giá trị mặc định**, body rỗng `{}` bị từ chối |
| `branchIdParamsSchema` | `:id` trên URL | Đổi chuỗi `"4"` thành số `4`; `"abc"` → lỗi 400 |
| `listBranchesQuerySchema` | Query `GET /branches` | Phân trang + `q` (tìm kiếm) + `includeInactive` |
| `getBranchQuerySchema` | Query `GET /branches/:id` | Chỉ `includeInactive` |

**Vì sao `updateBranchSchema` phải bỏ giá trị mặc định?** Nếu giữ `ps5Count: count.default(0)`, thì `PUT { "name": "Mới" }` sẽ tự điền `ps5Count = 0`, và chi nhánh **mất hết số máy** dù bạn chỉ định đổi tên. Bỏ mặc định thì trường không gửi sẽ **giữ nguyên**, đúng nghĩa "cập nhật một phần".

**Vì sao `includeInactive` không dùng `z.coerce.boolean()`?** Vì `Boolean("false")` là `true` trong JavaScript (chuỗi không rỗng). Dự án dùng `z.enum(['true', 'false'])` rồi so sánh, nên `?includeInactive=false` hiểu đúng là `false`.

### 📏 Quy tắc dự án liên quan
- Độ dài và khoảng giá trị khớp cột trong `DATABASE.md` (`SMALLINT UNSIGNED` = 0–65535).

---

## 📁 File: `branch.entity.ts` và `branch.types.ts`

### Phân tích
- **`Branch`**: dữ liệu trả ra API, đủ các cột kể cả `pcRoomCount`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`.
- **`BRANCH_SELECT`**: danh sách cột Prisma được đọc. Thêm cột mới mà quên ghi vào đây thì API không trả cột đó (lúc thêm `pcRoomCount` phải sửa cả hai chỗ).
- **`BRANCH_SORT_FIELDS`** = `sortOrder`, `name`, `ps5Count`, `createdAt`: chỉ những trường này được dùng trong `?sort=`. Trường lạ bị bỏ qua, để không ai sắp xếp theo cột không có index hay cột nhạy cảm.
- **`BranchFilter`** (`branch.types.ts`): `page`, `limit`, `sort`, `q`, `includeInactive`. Service tính xong mới đưa xuống repository, nên repository không phải biết "ai đang gọi".

---

## 📁 File: `branch.repository.ts`

### Mục đích
Nơi **duy nhất** của feature dùng Prisma.

### Vị trí trong dự án
- Feature: `branch`
- Tầng: repository

### Phân tích

| Hàm | Làm gì |
|---|---|
| `findMany(filter)` | Lấy một trang danh sách **và** đếm tổng số, hai câu chạy chung trong `$transaction` để số liệu khớp nhau |
| `findById(id, includeInactive)` | Một chi nhánh; không có `includeInactive` thì chỉ tìm trong chi nhánh đang hoạt động |
| `create`, `update`, `delete` | Thêm, sửa, xóa |
| `countByIds(ids)` | Đếm bao nhiêu id trong danh sách là chi nhánh có thật (dành cho `game`) |
| `findAllIds()` | Id của mọi chi nhánh (dành cho `game`) |

**Bên trong `findMany`:**
- Mặc định lọc `isActive: true`; chỉ bỏ lọc khi `filter.includeInactive` là `true`.
- `q` tìm bằng `contains` trong **cả `name` lẫn `address`** (`OR`). Collation `utf8mb4_0900_ai_ci` làm MySQL so sánh **không phân biệt hoa thường và dấu**, nên `?q=go vap` tìm ra "Gò Vấp" mà code không phải tự bỏ dấu.
- `orderBy` = trường từ `?sort=` (hoặc `sortOrder` mặc định) **cộng thêm `id` tăng dần ở cuối**. Hai chi nhánh cùng `sortOrder` vẫn luôn ra theo một thứ tự cố định, nên khi phân trang không bị một chi nhánh xuất hiện ở cả trang 1 lẫn trang 2.

### 📏 Quy tắc dự án liên quan
- Repository không ném lỗi HTTP, không chứa quy tắc nghiệp vụ.

---

## 📁 File: `branch.service.ts`

### Mục đích
Quy tắc nghiệp vụ của `branch`, đồng thời là "cửa" để feature `game` hỏi về chi nhánh.

### Vị trí trong dự án
- Feature: `branch`
- Tầng: service

### Phân tích

**CRUD**
- **`list(query, isAdmin)`**: `includeInactive` chỉ có tác dụng khi **vừa** gửi `?includeInactive=true` **vừa** có token admin. Khách tò mò gửi `?includeInactive=true` thì bị **lờ đi** (không báo lỗi), vẫn chỉ thấy chi nhánh đang hoạt động. Trả về `items` kèm `meta` (`page`, `limit`, `total`, `totalPages`).
- **`get(id, includeInactive)`**: không thấy → `404 BRANCH_001`. Chi nhánh đang ẩn cũng trả 404 với khách, như thể nó không tồn tại.
- **`create(adminId, dto)`**: thêm rồi ghi log `branch.created`.
- **`update(adminId, id, dto)`**: kiểm tra tồn tại trước (kể cả chi nhánh đang ẩn, vì chủ quán phải sửa được), rồi sửa, ghi log `branch.updated` kèm **tên** các trường đã đổi.
- **`remove(adminId, id)`**: kiểm tra tồn tại, xóa thật, ghi log `branch.deleted`.

**BranchLookup (dành cho `game`)**
- **`existsAll(ids)`**: `true` nếu mọi id đều là chi nhánh có thật. Bỏ id trùng trước khi đếm, danh sách rỗng → `true`. Khi thêm game với `branchIds: [1, 99]`, `game` hỏi hàm này để trả lỗi `GAME_006` "chi nhánh không tồn tại".
- **`findAllIds()`**: id của mọi chi nhánh, dùng khi game "có ở mọi chi nhánh".

**Vì sao `game` không gọi thẳng repository của `branch`?** Quy tắc dự án: feature không import nội bộ của nhau. `game` sẽ tự khai báo một interface `BranchLookup` (chỉ gồm 2 hàm trên), và `app.ts` truyền `branchService` vào. `game` chỉ biết "có ai đó trả lời được 2 câu hỏi này", không biết bên trong `branch` làm thế nào. Đây là **dependency injection** (xem BE-ARCHITECTURE mục 5, 8).

### 💡 Điểm cần nhớ
- Xóa chi nhánh sẽ tự gỡ nó khỏi các game (`ON DELETE CASCADE` trên bảng `branch_game`). Bảng đó thuộc `game` và **chưa được tạo**.

---

## 📁 File: `branch.controller.ts` và `branch.routes.ts`

### Phân tích

**Controller**: mỗi hàm chỉ đọc request, gọi service, trả kết quả.
- `list` → `ok(res, items, meta)`; `get` → `ok`; `create` → `created` (201); `update` → `ok`; `remove` → `noContent` (204, không có body).
- `req.admin !== undefined` cho biết request có token admin hợp lệ hay không (do guard gắn vào).

**Routes**

```
GET    /      → optionalAdmin → publicCache → validate(query)            → list
GET    /:id   → optionalAdmin → publicCache → validate(params, query)    → get
POST   /      → requireOwner  → validate(body)                           → create
PUT    /:id   → requireOwner  → validate(params) → validate(body)        → update
DELETE /:id   → requireOwner  → validate(params)                         → remove
```

- **`optionalAdmin`**: có header `Authorization` thì kiểm tra token và gắn `req.admin`; không có thì cho qua như khách. Nhờ vậy cùng một URL vừa phục vụ khách vừa phục vụ trang quản trị.
- **`publicCache`**: khách nhận `Cache-Control: public, max-age=60`. Có `req.admin` thì đổi thành `no-store`, để danh sách có chi nhánh ẩn không bị trình duyệt hay proxy lưu lại.
- **`requireOwner`**: chưa đăng nhập → `401 AUTH_002`; nhân viên → `403 AUTH_005`.

---

## 📁 File: `index.ts` và nối dây trong `app.ts`

- `index.ts` export `BranchController`, `BranchRepository`, `BranchService`, `createBranchRouter`, type `Branch`.
- `app.ts` tạo `branchService` thành **biến riêng** (không viết gộp một dòng như `shop`), vì sau này còn truyền nó vào `GameService`. Rồi gắn `v1.use('/branches', createBranchRouter(branchController, guards))`.
- Mã lỗi `BRANCH_NOT_FOUND: 'BRANCH_001'` trong `shared/errors/error-codes.ts`.

---

## 🧪 Ví dụ request thật

| Gửi | Nhận |
|---|---|
| `GET /branches?q=go vap` | Chỉ "Gò Vấp" |
| `GET /branches?sort=-ps5Count&limit=2` | 2 chi nhánh nhiều máy nhất, `meta.totalPages` tính theo `limit=2` |
| `GET /branches?limit=500` | `400 COMMON_001` (tối đa 100) |
| `GET /branches/abc` | `400 COMMON_001` (id phải là số) |
| `GET /branches/5` (chi nhánh đang ẩn, không token) | `404 BRANCH_001` |
| `GET /branches/5?includeInactive=true` (token owner) | `200` |
| `POST` thiếu `address` / `areaM2: 1.5` / `mapUrl: "x"` | `400 COMMON_001`, `details` chỉ đúng ô |
| `PUT /branches/4` `{ "pcRoomCount": 1 }` | `200`, chỉ đổi số phòng PC |
| `PUT /branches/4` `{ "pcRoomCount": -1 }` | `400 COMMON_001` |
| `DELETE /branches/5` (không token) | `401 AUTH_002` |
| `DELETE /branches/5` (owner) → gọi lại lần 2 | `204` → `404 BRANCH_001` |

---

## 🔗 Liên kết

- **Được gọi bởi:** `src/app.ts` (route `/api/v1/branches`); sau này `GameService` qua `BranchLookup`. Frontend gọi qua `branch.service.ts`.
- **Gọi tới:** Prisma (`db.branch`); `guards.optionalAdmin`, `guards.requireOwner` của `auth`; `shared/utils/zod-fields`, `shared/utils/pagination`.
- **Tài liệu:** `backend/src/features/branch/context.md`; `BE-ARCHITECTURE.md` mục 3 (giải phẫu feature), mục 5 (giao tiếp giữa feature), mục 8 (DI, chuỗi middleware); `DATABASE.md` (bảng `branch`); `API_SPEC.md` mục 3 (query chung), 4 (envelope, `meta`), 5 (`BRANCH_001`).

## 💡 Điểm cần nhớ (cả feature)
- Một URL công khai phục vụ cả khách và quản trị nhờ `optionalAdmin` + `includeInactive`; khách không bao giờ thấy chi nhánh ẩn.
- `PUT` cập nhật một phần: schema sửa **không có giá trị mặc định**, trường không gửi giữ nguyên.
- Danh sách luôn có `meta` và thứ tự ổn định (`id` ở cuối `orderBy`).
- `BranchService` là cầu nối cho `game` qua interface, không import chéo.
- Chưa có: test tự động (`/be-test branch`), bảng `branch_game` (chờ `game`).

---

Xem phần còn lại: [Giải thích code `branch` phía Frontend](../../../../frontend/docs/explain/code/branch.md)
