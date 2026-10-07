# API_SPEC.md — Fight Station

REST API cho website quán PS5: khách xem game, bảng giá, menu, chi nhánh, khuyến mãi (công khai); chủ quán và nhân viên đăng nhập để thêm/sửa/xóa. Bảng dữ liệu xem `DATABASE.md`, cấu trúc code xem `ARCHITECTURE.md`.

## 1. Tổng quan
| Mục | Quy ước |
|---|---|
| Base URL | `https://api.fightstation.vn/api/v1` (dev: `http://localhost:3000/api/v1`) |
| Versioning | Theo URL path (`/v1`). Chỉ tăng `v2` khi đổi phá vỡ (xóa/đổi tên trường, đổi ý nghĩa). Thêm trường mới không cần tăng version |
| Content-Type | Request và response đều `application/json; charset=utf-8`. Sai kiểu → `415` |
| Đặt tên | Path: kebab-case, số nhiều (`/price-plans`). Trường JSON: camelCase (`priceVnd`) ↔ cột snake_case trong DB |
| Kiểu dữ liệu | Thời gian: ISO 8601 UTC (`2026-10-05T15:30:00.000Z`). Ngày: `YYYY-MM-DD`. Tiền: số nguyên đơn vị đồng (`15000` = 15.000đ) |
| Health check | `GET /health` (ngoài `/v1`, không cần đăng nhập) → `200 { "status": "ok" }` |

## 2. Xác thực
- **Phương thức**: JWT (access token), chỉ cho trang quản trị. Mọi `GET` công khai không cần token.
- **Header**: `Authorization: Bearer <accessToken>`
- **Luồng token**: `POST /auth/login` → nhận `accessToken` (hết hạn sau `JWT_EXPIRES_IN`, mặc định 1 ngày) → gửi kèm mọi request quản trị → hết hạn thì đăng nhập lại.
- **Không dùng refresh token**: `DATABASE.md` không có bảng lưu token, và chỉ một chủ quán dùng nên đăng nhập lại mỗi ngày là chấp nhận được. Cần thêm sau thì tạo bảng `refresh_token` và endpoint `POST /auth/refresh`.
- **Payload JWT**: `{ sub: adminUserId, role: 'owner' | 'staff' }`. Mỗi request, `requireAdmin` kiểm tra lại `admin_user.is_active`, nên khóa tài khoản có hiệu lực ngay.
- **Phân quyền**: `Owner` = chỉ `role = owner`; `Admin` = owner hoặc staff.

| Tình huống | HTTP | Mã lỗi |
|---|---|---|
| Sai username / mật khẩu (không nói rõ cái nào sai) | 401 | `AUTH_001` |
| Thiếu token, token sai định dạng hoặc chữ ký sai | 401 | `AUTH_002` |
| Token hết hạn | 401 | `AUTH_003` |
| Tài khoản bị khóa (`is_active = 0`) | 403 | `AUTH_004` |
| Đủ đăng nhập nhưng không đủ quyền (staff gọi API của owner) | 403 | `AUTH_005` |

Đăng nhập sai quá 10 lần / 15 phút / IP → `429 COMMON_004`.

## 3. Quy ước request
**Query param (cho endpoint danh sách)**
| Nhóm | Param | Mặc định | Ví dụ |
|---|---|---|---|
| Phân trang | `page`, `limit` | `1`, `20` (tối đa `100`) | `?page=2&limit=12` |
| Sắp xếp | `sort`: tên trường, thêm `-` đầu để giảm dần, nhiều trường cách bằng `,` | `sortOrder` (tăng dần) | `?sort=-createdAt` |
| Tìm kiếm | `q`: không phân biệt hoa thường và dấu | không | `?q=tekken` |
| Lọc | tên trường riêng của từng endpoint (mục 6) | không | `?categoryId=2&branchId=1` |
| Ẩn/hiện | `includeInactive=true` (cần token Admin) | `false` | chỉ khi vào trang quản trị |

Mặc định, `GET` công khai chỉ trả bản ghi `is_active = 1`. Param lạ bị bỏ qua; giá trị sai kiểu → `400 COMMON_001`.

**Request body**: JSON, tối đa 100 KB (quá → `413 COMMON_005`). Server `trim` chuỗi; trường tùy chọn gửi `null` để xóa giá trị. `POST` cần đủ trường bắt buộc. `PUT` cập nhật một phần: trường không gửi thì **giữ nguyên**. Id trong path là số nguyên dương.

**Upload file**: chưa hỗ trợ. Ảnh chỉ lưu đường dẫn (`posterUrl`, `imageUrl`: URL đầy đủ, tối đa 500 ký tự). Khi cần upload sẽ thêm `POST /v1/uploads` (`multipart/form-data`, trường `file`, ≤ 2 MB, `image/jpeg|png|webp`) trả về `url`.

## 4. Định dạng response
Thành công (một đối tượng):
```json
{ "success": true, "data": { "id": 1, "title": "Tekken 8" } }
```
Thành công (danh sách, có `meta`):
```json
{ "success": true, "data": [ { "id": 1, "title": "Tekken 8" } ],
  "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 } }
```
Lỗi (`details` chỉ có khi lỗi validate, liệt kê từng trường):
```json
{ "success": false,
  "error": { "code": "COMMON_001", "message": "Dữ liệu không hợp lệ",
             "details": [ { "field": "title", "message": "Không được để trống" } ] } }
```
`DELETE` thành công trả `204` và **không có body**. Stack trace không bao giờ có trong response. Mọi response có header `X-Request-Id` (trùng `requestId` trong log) để tra lỗi.

## 5. Mã lỗi
Định dạng `[FEATURE]_[NUMBER]` (3 chữ số). Tiền tố: `COMMON`, `AUTH`, `SHOP`, `BRANCH`, `GAME`, `PRICE`, `MENU`, `PROMO`. Hằng số trong code nằm ở `shared/errors/error-codes.ts` (vd `ErrorCode.GAME_NOT_FOUND = 'GAME_001'`). Client dựa vào `code`, không dựa vào `message`.

**Mã chung**
| Mã | HTTP | Ý nghĩa |
|---|---|---|
| `COMMON_001` | 400 | Dữ liệu không hợp lệ (Zod), kèm `details` |
| `COMMON_002` | 400 | JSON sai cú pháp |
| `COMMON_003` | 404 | Không có endpoint này |
| `COMMON_004` | 429 | Gọi quá nhiều lần |
| `COMMON_005` | 413 | Body quá lớn |
| `COMMON_500` | 500 | Lỗi hệ thống (chỉ ghi log, không lộ chi tiết) |

**Mã theo feature** (mã `AUTH_*` ở mục 2)
| Mã | HTTP | Ý nghĩa |
|---|---|---|
| `SHOP_001` | 404 | Chưa có dữ liệu quán (thiếu dòng `id = 1`, cần chạy seed) |
| `BRANCH_001` | 404 | Không tìm thấy chi nhánh |
| `GAME_001` | 404 | Không tìm thấy game |
| `GAME_002` | 409 | Tên game (`title`) đã tồn tại |
| `GAME_003` | 404 | Không tìm thấy thể loại game |
| `GAME_004` | 409 | Tên thể loại đã tồn tại |
| `GAME_005` | 409 | Thể loại còn game, chuyển hoặc xóa game trước |
| `GAME_006` | 400 | `branchIds` chứa chi nhánh không tồn tại |
| `PRICE_001` | 404 | Không tìm thấy gói giá |
| `MENU_001` | 404 | Không tìm thấy món |
| `MENU_002` | 404 | Không tìm thấy nhóm menu |
| `MENU_003` | 409 | Tên nhóm menu, hoặc tên món trong nhóm, đã tồn tại |
| `MENU_004` | 409 | Nhóm menu còn món, chuyển hoặc xóa món trước |
| `PROMO_001` | 404 | Không tìm thấy khuyến mãi |
| `PROMO_002` | 400 | `endDate` nhỏ hơn `startDate` |

**Cách dùng HTTP status**: `200` GET/PUT thành công · `201` POST tạo mới (kèm đối tượng vừa tạo) · `204` DELETE · `400` dữ liệu sai · `401` chưa/hết hạn đăng nhập · `403` không đủ quyền · `404` không tìm thấy · `409` trùng hoặc bị ràng buộc khóa ngoại chặn · `413` body quá lớn · `415` sai Content-Type · `429` quá giới hạn · `500` lỗi hệ thống.

## 6. Endpoint theo feature
Cột Auth: **Công khai** = không cần token; **Admin** = owner hoặc staff; **Owner** = chỉ owner. Mọi `:id` là số nguyên.

### Auth
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/auth/login` | Đăng nhập, nhận `accessToken` | Công khai |
| GET | `/auth/me` | Thông tin tài khoản đang đăng nhập | Admin |
| PUT | `/auth/password` | Đổi mật khẩu của chính mình (`currentPassword`, `newPassword` ≥ 8 ký tự) | Admin |

### Shop (thông tin quán, luôn là 1 bản ghi)
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/shop` | Tên, tagline, giờ mở cửa, hotline, link mạng xã hội | Công khai |
| PUT | `/shop` | Cập nhật thông tin quán | Owner |

### Branch (chi nhánh)
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/branches` | Danh sách chi nhánh. Lọc: `q` | Công khai |
| GET | `/branches/:id` | Chi tiết chi nhánh | Công khai |
| POST | `/branches` | Thêm chi nhánh | Owner |
| PUT | `/branches/:id` | Sửa chi nhánh | Owner |
| DELETE | `/branches/:id` | Xóa chi nhánh (tự gỡ khỏi `branch_game`) | Owner |

### Game
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/games` | Danh sách game. Lọc: `q` (theo tên), `categoryId` (game có thể loại này trong số các thể loại của nó), `branchId` | Công khai |
| GET | `/games/:id` | Chi tiết game, kèm `categories` và `branchIds` (`null` = mọi chi nhánh) | Công khai |
| POST | `/games` | Thêm game | Admin |
| PUT | `/games/:id` | Sửa game (gồm `branchIds`) | Admin |
| DELETE | `/games/:id` | Xóa game | Admin |
| GET | `/game-categories` | Danh sách thể loại, kèm `gameCount` (số game, kể cả game ẩn) | Công khai |
| POST | `/game-categories` | Thêm thể loại | Admin |
| PUT | `/game-categories/:id` | Sửa thể loại | Admin |
| DELETE | `/game-categories/:id` | Xóa thể loại (409 nếu còn game) | Admin |

### Price plan (bảng giá)
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/price-plans` | Danh sách gói giá, kèm mảng `features` (đã xếp thứ tự) | Công khai |
| GET | `/price-plans/:id` | Chi tiết một gói | Công khai |
| POST | `/price-plans` | Thêm gói kèm `features` | Owner |
| PUT | `/price-plans/:id` | Sửa gói; nếu gửi `features` thì thay toàn bộ danh sách | Owner |
| DELETE | `/price-plans/:id` | Xóa gói (xóa luôn `features`) | Owner |

### Menu (đồ ăn, nước uống)
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/menu` | Toàn bộ menu: nhóm kèm mảng `items` (dùng cho trang chủ). Chỉ nhóm và món đang hiện; nhóm không còn món nào đang hiện thì bỏ | Công khai |
| GET | `/menu-items` | Danh sách món, kèm `category: { id, name }`. Lọc: `q`, `categoryId`, `isAvailable` | Công khai |
| GET | `/menu-items/:id` | Chi tiết một món (trang sửa món) | Công khai |
| POST | `/menu-items` | Thêm món (`menuCategoryId`, `name`, `priceVnd` bắt buộc) | Admin |
| PUT | `/menu-items/:id` | Sửa món (gồm đổi `isAvailable`: tạm hết; `isBestSeller`: món bán chạy) | Admin |
| DELETE | `/menu-items/:id` | Xóa món | Admin |
| GET | `/menu-categories` | Danh sách nhóm menu, kèm `itemCount` (số món, kể cả món ẩn) | Công khai |
| POST | `/menu-categories` | Thêm nhóm | Admin |
| PUT | `/menu-categories/:id` | Sửa nhóm | Admin |
| DELETE | `/menu-categories/:id` | Xóa nhóm (409 nếu còn món) | Admin |

### Promotion (khuyến mãi)
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/promotions` | Danh sách khuyến mãi còn hiệu lực (`endDate` trống hoặc ≥ hôm nay). Lọc: `isFeatured` | Công khai |
| POST | `/promotions` | Thêm khuyến mãi | Admin |
| PUT | `/promotions/:id` | Sửa khuyến mãi | Admin |
| DELETE | `/promotions/:id` | Xóa khuyến mãi | Admin |

## 7. Chi tiết endpoint
### 7.1 `POST /auth/login`
```json
// Request
{ "username": "owner", "password": "matkhau-cua-ban" }
// 200
{ "success": true, "data": { "accessToken": "eyJhbGciOi...", "expiresIn": 86400,
  "admin": { "id": 1, "username": "owner", "role": "owner" } } }
```
Lỗi: `400 COMMON_001` thiếu trường · `401 AUTH_001` sai thông tin · `403 AUTH_004` tài khoản bị khóa (chỉ trả khi mật khẩu đúng) · `429 COMMON_004` thử quá nhiều (chỉ tính lần sai). Thành công thì cập nhật `last_login_at`. Response có `Cache-Control: no-store`.

### 7.1b `PUT /auth/password` (Admin)
```json
// Request
{ "currentPassword": "matkhau-cu", "newPassword": "matkhau-moi-123" }
// 200
{ "success": true, "data": null }
```
Lỗi: `400 COMMON_001` kèm `details` (sai `currentPassword` → `{ "field": "currentPassword", "message": "Mật khẩu hiện tại không đúng" }`; `newPassword` < 8 ký tự hoặc trùng mật khẩu cũ → field `newPassword`) · `401 AUTH_002/003`. Token cũ vẫn dùng được tới khi hết hạn.

### 7.2 `GET /games?q=tek&categoryId=2&branchId=1&page=1&limit=12`
```json
// 200
{ "success": true,
  "data": [ { "id": 5, "title": "Tekken 8", "players": "1-2P", "posterUrl": "https://.../tekken8.jpg",
              "accentColor": "orange", "description": "Game đối kháng...",
              "categories": [ { "id": 2, "name": "Đối Kháng" } ], "sortOrder": 1, "isActive": true } ],
  "meta": { "page": 1, "limit": 12, "total": 1, "totalPages": 1 } }
```
Danh sách không trả `branchIds` (nặng); xem ở `GET /games/:id`. Lỗi: `400 COMMON_001` (vd `limit=500`).

### 7.3 `POST /games` (Admin)
```json
// Request
{ "title": "EA FC 26", "gameCategoryIds": [3, 5], "players": "1-4P", "accentColor": "amber",
  "posterUrl": null, "description": "Bóng đá", "branchIds": [1, 2] }
// 201
{ "success": true, "data": { "id": 21, "title": "EA FC 26",
  "categories": [ { "id": 3, "name": "Thể Thao" }, { "id": 5, "name": "Co-op" } ],
  "accentColor": "amber", "branchIds": [1, 2], "isActive": true, "sortOrder": 0,
  "createdAt": "2026-10-05T15:30:00.000Z" } }
```
Bắt buộc: `title` (1–150 ký tự), `gameCategoryIds` (1–5 id thể loại; id trùng tự gộp; `categories` trả về xếp theo `sortOrder` của thể loại). Không gửi `branchIds` (hoặc gửi `null`) thì game có ở **mọi** chi nhánh, kể cả chi nhánh mở sau này: không ghi dòng `branch_game` nào, response trả `"branchIds": null`. `branchIds: []` bị từ chối (`400 COMMON_001`). Response `201` có cùng dạng với `GET /games/:id` (thêm `category`, `description`...). Lỗi: `401 AUTH_002/003` · `409 GAME_002` trùng tên · `404 GAME_003` có thể loại không tồn tại · `400 GAME_006` chi nhánh không tồn tại · `400 COMMON_001` sai dữ liệu.

### 7.4 `PUT /games/:id` (Admin)
Chỉ gửi trường cần đổi. `gameCategoryIds` nếu có sẽ **thay toàn bộ** thể loại của game. `branchIds` nếu có sẽ **thay toàn bộ** danh sách chi nhánh của game; `branchIds: null` chuyển về mọi chi nhánh; không gửi thì giữ nguyên.
```json
{ "isActive": false, "branchIds": [1] }
```
`200` trả game sau khi sửa. Lỗi: `404 GAME_001` · `409 GAME_002` · `400 GAME_006`.

### 7.5 `DELETE /game-categories/:id` (Admin)
`204` nếu thành công. Nếu thể loại còn game (khóa ngoại `RESTRICT`):
```json
// 409
{ "success": false, "error": { "code": "GAME_005",
  "message": "Thể loại còn 8 game, hãy chuyển hoặc xóa game trước" } }
```

### 7.6 `POST /price-plans` (Owner)
```json
// Request
{ "name": "Gói VIP", "priceVnd": 45000, "unit": "/giờ", "isHot": true,
  "features": ["Phòng riêng", "Tặng 1 nước", "Ưu tiên đặt máy"] }
// 201: trả gói vừa tạo, features thành [{ "id": 11, "content": "Phòng riêng", "sortOrder": 0 }, ...]
```
Thứ tự `features` trong mảng quyết định `sortOrder`. Lỗi: `403 AUTH_005` (staff gọi) · `400 COMMON_001` (vd `priceVnd` âm hoặc là số thập phân).

## 8. Bổ sung riêng cho Express + Zod
- Không dùng GraphQL, WebSocket hay gRPC: dữ liệu ít thay đổi, chỉ cần REST. Muốn cập nhật thời gian thực thì làm sau.
- **Validation**: Zod schema ở `*.dto.ts`, middleware `validate()` đổi `ZodError` thành `COMMON_001` kèm `details` (`field` là đường dẫn, vd `features.0`).
- **Chuỗi middleware** của `/api/v1` xem `ARCHITECTURE.md`. Rate limit riêng: `/auth/login` 10 lần / 15 phút / IP; các route còn lại 300 lần / phút / IP.
- **CORS**: chỉ cho origin trong `CORS_ORIGINS`; method `GET, POST, PUT, DELETE`; header `Authorization, Content-Type`.
- **Cache**: `GET` công khai trả `Cache-Control: public, max-age=60`; response quản trị trả `no-store`.
- **Tài liệu**: nếu cần Swagger UI, sinh OpenAPI từ Zod schema (`zod-to-openapi`) để tránh lệch với code.
