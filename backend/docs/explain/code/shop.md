# Giải thích code: feature `shop` (Backend)

| | |
|---|---|
| **Phía** | BE (backend) |
| **Chế độ** | `code` |
| **Target** | `shop` |
| **Ngày viết** | 2026-10-07 |
| **Tài liệu đã đọc** | `backend/src/features/shop/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07), `backend/docs/BE-ARCHITECTURE.md` (mục 3, 8), `01-share-docs/DATABASE.md`, `01-share-docs/API_SPEC.md` |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `shop` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

`shop` lưu **thông tin chung của quán**: tên, câu giới thiệu (tagline), giờ mở cửa, hotline, email, link Facebook/Zalo/TikTok/Instagram/YouTube.

Điểm đặc biệt: quán **chỉ có đúng một bản ghi** (`id = 1`). Không có "danh sách quán", không thêm, không xóa; chỉ **xem** và **sửa**.

Ví dụ đời thường: giống **tấm biển hiệu** trước cửa quán. Cả quán chỉ có một tấm. Khách nào cũng đọc được; chỉ **chủ quán** được sơn lại.

| Method | Path | Làm gì | Ai gọi được |
|---|---|---|---|
| GET | `/api/v1/shop` | Lấy thông tin quán | Ai cũng được (công khai) |
| PUT | `/api/v1/shop` | Sửa thông tin quán (chỉ gửi trường cần đổi) | Chỉ **Owner** (chủ quán) |

### Các file và tầng

Request đi một chiều qua các tầng, giống mọi feature khác:

```
shop.routes.ts → shop.controller.ts → shop.service.ts → shop.repository.ts → Prisma → MySQL
```

| File | Tầng | Một câu |
|---|---|---|
| `shop.dto.ts` | dto | Luật kiểm tra dữ liệu gửi lên khi sửa |
| `shop.entity.ts` | entity | Hình dạng dữ liệu trả ra API, và hằng số `SHOP_ID = 1` |
| `shop.repository.ts` | repository | Đọc và ghi bảng `shop`, luôn theo `id = 1` |
| `shop.service.ts` | service | Báo lỗi khi chưa có dữ liệu, ghi log khi sửa |
| `shop.controller.ts` | controller | Nhận request, gọi service, trả response |
| `shop.routes.ts` | routes | Gắn URL với quyền, kiểm tra dữ liệu và controller |
| `index.ts` | public API | Chỉ export thứ `app.ts` cần để nối dây |

---

## 🗄️ Bảng `shop` và migration

### Mục đích
Lưu một dòng duy nhất chứa thông tin quán.

### Phân tích
- Các cột: `name` (bắt buộc, tối đa 100 ký tự), `tagline` (500), `hours_label` (50), `hotline` (20), `email` (255), 5 cột link `*_url` (500), cùng `created_at`, `updated_at`. Ngoài `name`, mọi cột đều được để trống (`NULL`).
- **Chặn dòng thứ hai bằng CHECK:** migration `create_shop_table` được thêm tay dòng `CONSTRAINT chk_shop_single_row CHECK (id = 1)`. Prisma không tự sinh được CHECK, nên phải sửa file `migration.sql`. Từ đó, ai cố thêm dòng `id = 2` đều bị MySQL từ chối, kể cả khi viết SQL trực tiếp.
- **`id` không tự tăng:** bảng khác dùng `AUTO_INCREMENT`, riêng `shop.id` là `@default(1)`. Lý do: MySQL **không cho đặt CHECK trên cột AUTO_INCREMENT** (lỗi 3818). Bảng chỉ có một dòng nên cũng không cần tự tăng.
- **Collation** `utf8mb4_0900_ai_ci`: Prisma sinh ra `unicode_ci`, nên phải đổi tay như mọi bảng khác.

### Seed: dữ liệu ban đầu
`prisma/seed.ts` có hàm `seedShop()`. Hàm tạo dòng `id = 1` từ `seedShop` trong `prisma/seed-data.ts` (dữ liệu chép từ bản prototype), và đổi ô trống `''` thành `null`.

Nếu dòng đã tồn tại thì **bỏ qua**, không ghi đè. Nhờ vậy chủ quán sửa thông tin trên web rồi chạy lại `npx prisma db seed` cũng không bị mất.

### 💡 Điểm cần nhớ
- Muốn ép "chỉ một dòng", hãy chặn ở **database** (CHECK), không chỉ ở code. Code có thể sai, còn database thì luôn chặn.
- DB mới tạo mà chưa chạy seed thì bảng trống, và API trả `404 SHOP_001`.

---

## 📁 File: `shop.dto.ts`

### Mục đích
Kiểm tra body của `PUT /shop` bằng **Zod** trước khi dữ liệu đi vào service.

### Vị trí trong dự án
- Feature: `shop`
- Tầng: dto

### Phân tích
`updateShopSchema` gồm 10 trường, **trường nào cũng tùy chọn**: chỉ gửi trường cần đổi, trường không gửi giữ nguyên.

| Trường | Luật |
|---|---|
| `name` | Cắt khoảng trắng hai đầu, không được rỗng, tối đa 100 ký tự |
| `tagline`, `hoursLabel`, `hotline` | Cắt khoảng trắng, tối đa đúng độ dài cột. Rỗng thì đổi thành `null` |
| `email` | Phải đúng dạng email (nếu có giá trị) |
| `facebookUrl` … `youtubeUrl` | Phải là link đầy đủ (`https://...`), tối đa 500 ký tự (nếu có giá trị) |

Thêm hai luật đặc biệt:
- **Không lưu chuỗi rỗng:** gửi `""` hoặc toàn khoảng trắng thì tự đổi thành `null`. Gửi `null` cũng là cách **xóa** một giá trị.
- **Body rỗng `{}` bị từ chối:** trả `400 COMMON_001` với thông báo "Cần gửi ít nhất một trường", để không có request "sửa mà không sửa gì".

`hotline` **không** kiểm tra định dạng số điện thoại, vì người ta hay viết `0901 234 567` có dấu cách.

### 📏 Quy tắc dự án liên quan
- Độ dài trong DTO phải **khớp độ dài cột** trong `DATABASE.md`. Như vậy lỗi bị bắt ở bước kiểm tra (thông báo dễ hiểu), không phải ở MySQL (lỗi 500 khó hiểu).

---

## 📁 File: `shop.entity.ts`

### Mục đích
Mô tả dữ liệu trả ra API, và gom các hằng số của feature.

### Phân tích
- `Shop`: `id`, `name`, `tagline`, `hoursLabel`, `hotline`, `email`, 5 link, `updatedAt`. Tên trường dạng camelCase, còn tên cột trong DB là snake_case (`hours_label`). Prisma tự đổi qua lại nhờ `@map`.
- `SHOP_ID = 1`: hằng số dùng chung, để không phải gõ số `1` rải rác khắp nơi.
- `SHOP_SELECT`: danh sách cột được phép đọc ra, dùng làm `select` của Prisma. `createdAt` không trả ra, vì giao diện không cần.

---

## 📁 File: `shop.repository.ts`

### Mục đích
Nơi **duy nhất** của feature được dùng Prisma.

### Vị trí trong dự án
- Feature: `shop`
- Tầng: repository

### Phân tích
- `find()`: đọc dòng `id = 1`. Chưa có thì trả `null`.
- `update(data)`: sửa dòng `id = 1`, trả lại dữ liệu sau khi sửa.

Cả hai đều **tự dùng `SHOP_ID`**, không nhận id từ bên ngoài. Client không thể (và không cần) nói "sửa quán số 5".

### 📏 Quy tắc dự án liên quan
- Repository không ném lỗi HTTP và không chứa quy tắc nghiệp vụ. Việc quyết định "chưa có dữ liệu thì báo 404" là của service.

---

## 📁 File: `shop.service.ts`

### Mục đích
Quy tắc nghiệp vụ của `shop`.

### Vị trí trong dự án
- Feature: `shop`
- Tầng: service

### Phân tích
- **`get()`**: gọi `repo.find()`. Nếu `null` thì ném `NotFoundError` mã **`SHOP_001`** với lời nhắc "hãy chạy npx prisma db seed".
- **`update(adminId, dto)`**:
  1. Gọi `get()` trước. Chưa có dữ liệu thì trả `SHOP_001` dễ hiểu, thay vì để Prisma ném lỗi kỹ thuật `P2025` ("record not found") rồi biến thành lỗi 500.
  2. Gọi `repo.update(dto)`.
  3. Ghi log `shop.updated` kèm `adminId` và **tên** các trường đã đổi (ví dụ `["hotline"]`). Log không chứa nội dung, nên không làm lộ dữ liệu trong log.

### 💡 Điểm cần nhớ
- "Kiểm tra trước rồi mới làm" giúp API luôn trả **mã lỗi của dự án**, không để lộ lỗi nội bộ của thư viện.

---

## 📁 File: `shop.controller.ts`

### Mục đích
Cầu nối giữa HTTP và service, không chứa logic.

### Phân tích
- `get`: gọi `service.get()`, trả `ok(res, shop)` → `200 { success: true, data: {...} }`.
- `update`: lấy admin đang đăng nhập bằng `getRequestAdmin(req)` (do guard gắn vào), gọi `service.update(admin.id, req.body)`, trả `200` với dữ liệu sau khi sửa.

Không có `try/catch`: Express 5 tự chuyển lỗi sang `errorHandler`.

---

## 📁 File: `shop.routes.ts`

### Mục đích
Gắn URL với chuỗi "kiểm tra" trước khi tới controller.

### Phân tích
```
GET /  → publicCache → controller.get
PUT /  → guards.requireOwner → validate(updateShopSchema) → controller.update
```
- **`publicCache`**: thêm header `Cache-Control: public, max-age=60`. Trình duyệt được phép nhớ kết quả 60 giây, vì thông tin quán rất ít khi đổi.
- **`guards.requireOwner`** (từ feature `auth`): chưa đăng nhập → `401 AUTH_002`; là nhân viên (staff) → `403 AUTH_005`. Guard cũng tự đặt `no-store`, để response của trang quản trị không bị lưu cache.
- **`validate(updateShopSchema)`**: body sai → `400 COMMON_001` kèm `details` liệt kê **từng ô** sai.

Thứ tự này quan trọng: **kiểm tra quyền trước, kiểm tra dữ liệu sau**. Người không có quyền sẽ không biết gì về luật dữ liệu.

### 💡 Điểm cần nhớ
- `guards` không import trực tiếp mà được `app.ts` truyền vào hàm `createShopRouter(controller, guards)`. Đây là cách dự án nối dây (DI bằng tay, xem BE-ARCHITECTURE mục 8).

---

## 📁 File: `index.ts` và nối dây trong `app.ts`

- `index.ts` chỉ export `ShopController`, `ShopRepository`, `ShopService`, `createShopRouter`.
- `app.ts` tạo theo thứ tự `ShopRepository(db)` → `ShopService(repo)` → `ShopController(service)`, rồi gắn `v1.use('/shop', createShopRouter(shopController, guards))`.
- Mã lỗi `SHOP_NOT_FOUND: 'SHOP_001'` được thêm vào `shared/errors/error-codes.ts`.

---

## 🧪 Ví dụ request thật

```http
PUT /api/v1/shop
Authorization: Bearer <token của owner>
Content-Type: application/json

{ "hotline": "0909 999 999", "zaloUrl": "   " }
```
Kết quả: `200`. `hotline` đổi thành `"0909 999 999"`, còn `zaloUrl` toàn khoảng trắng được lưu thành `null`.

| Gửi | Nhận |
|---|---|
| Không có token | `401 AUTH_002` |
| Token của nhân viên | `403 AUTH_005` |
| `{}` | `400 COMMON_001` "Cần gửi ít nhất một trường" |
| `{ "name": "", "email": "abc", "facebookUrl": "khong-phai-link" }` | `400 COMMON_001`, `details` có đủ 3 lỗi: `name`, `email`, `facebookUrl` |
| DB chưa seed | `404 SHOP_001` |

---

## 🔗 Liên kết

- **Được gọi bởi:** `src/app.ts` (nối dây, gắn route `/api/v1/shop`); frontend gọi qua `shop.service.ts`.
- **Gọi tới:** Prisma (`db.shop`); `guards.requireOwner` của feature `auth`.
- **Tài liệu:** `backend/src/features/shop/context.md`; `BE-ARCHITECTURE.md` mục 3 (giải phẫu feature), mục 8 (chuỗi middleware, DI); `DATABASE.md` (bảng `shop`, ngoại lệ khóa chính); `API_SPEC.md` mục 3 (PUT cập nhật một phần), mục 5 (`SHOP_001`), mục 8 (cache).

## 💡 Điểm cần nhớ (cả feature)
- Một bảng, một dòng (`id = 1`), được chặn bằng CHECK ở database. `id` không tự tăng vì giới hạn của MySQL.
- `GET` công khai và cache 60 giây; `PUT` chỉ chủ quán dùng được, cập nhật một phần, ô trống thành `null`.
- Chưa có dữ liệu thì trả `SHOP_001`; cách sửa là chạy `npx prisma db seed`.
- Chưa có: test tự động riêng cho `shop` (`/be-test shop`).

---

Xem phần còn lại: [Giải thích code `shop` phía Frontend](../../../../frontend/docs/explain/code/shop.md)
