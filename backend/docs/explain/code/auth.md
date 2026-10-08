> **Phía:** Backend (BE) · **Chế độ:** `code` · **Target:** feature `auth`
> **Ngày viết:** 2026-10-08
> **Tài liệu đã đọc:** `backend/src/features/auth/context.md`, `backend/docs/BE-ARCHITECTURE.md` (kèm `BE-PROJECT-RULES.md`, `API_SPEC.md`, `DATABASE.md` để đối chiếu mã lỗi, endpoint, bảng)
> Bài này dựa trên tài liệu, không quét source. Nếu code `features/auth` đổi sau ngày trên thì bài có thể đã cũ.

## 📁 Feature: auth (đăng nhập trang quản trị)

### Mục đích
`auth` cho chủ quán và nhân viên đăng nhập trang quản trị bằng **JWT**, xem tài khoản đang đăng nhập và đổi mật khẩu. Ngoài ra nó cung cấp "người gác cổng" (`AdminLookup` + `auth-guards`) để mọi route thêm/sửa/xóa của feature khác biết ai đang gọi và có đủ quyền không.

Ví dụ đời thường: quán có một **bảo vệ ở cửa kho**. Khách xem menu, game, bảng giá thì vào tự do (GET công khai). Muốn vào kho sửa giá thì phải qua bảo vệ: đưa thẻ (token), bảo vệ tra lại sổ nhân sự (database) xem thẻ còn hiệu lực và người đó còn làm không, rồi mới cho vào.

### Vị trí trong dự án
- Feature: `auth`, bảng `admin_user` (model `AdminUser`, enum `AdminRole { owner, staff }`)
- Các tầng: routes → controller → service → repository (đúng luồng chung của dự án)

### Endpoint (dưới `/api/v1`)
| Method | Path | Làm gì | Ai gọi được |
|---|---|---|---|
| POST | `/auth/login` | Trả `{ accessToken, expiresIn, admin: { id, username, role } }`, kèm `Cache-Control: no-store` | Công khai, giới hạn 10 lần **sai** / 15 phút / IP |
| GET | `/auth/me` | Thông tin tài khoản: `id, username, role, isActive, lastLoginAt, createdAt` | Admin (owner hoặc staff) |
| PUT | `/auth/password` | Nhận `{ currentPassword, newPassword }`, trả `data: null` | Admin |

### Phân tích từng file

**`auth.dto.ts`**: chứa Zod schema `loginSchema` và `changePasswordSchema`. Mật khẩu **không bị trim** (dấu cách đầu/cuối có thể là một phần mật khẩu) và tối đa 200 ký tự, để không ai gửi mật khẩu dài cả MB bắt server băm tốn sức. Route gọi `validate(schema)` nên controller và service chỉ nhận dữ liệu đã hợp lệ.

**`auth.entity.ts`**: định nghĩa kiểu `Admin`, `AdminSummary`, `LoginResult` và hằng `ADMIN_SELECT`. `ADMIN_SELECT` là danh sách cột được phép lấy ra, **không có `passwordHash`**, nên dù lỡ tay trả cả object ra response thì hash cũng không lộ.

**`auth.repository.ts`**: nơi duy nhất dùng Prisma của feature. `passwordHash` chỉ được đọc ở hai hàm riêng: `findCredentialsByUsername` (lúc đăng nhập) và `findPasswordHashById` (lúc đổi mật khẩu). Các truy vấn khác dùng `ADMIN_SELECT`.

**`auth.service.ts`**: chứa business rule.
- `login`: kiểm tra username và mật khẩu, kiểm tra tài khoản có bị khóa, ký JWT, cập nhật `last_login_at`.
- `getMe`: lấy thông tin tài khoản đang đăng nhập.
- `changePassword`: kiểm tra mật khẩu hiện tại rồi lưu hash mới.
- `findById`: để `AuthService` thỏa interface `AdminLookup`, giúp guard tra admin trong DB.

**`auth.controller.ts` + `auth.routes.ts`**: controller chỉ đọc `req`, gọi service, trả `ok()`. Không logic, không `try/catch` (Express 5 tự chuyển lỗi async sang `error-handler`). Route được tạo bằng `createAuthRouter(controller, guards)`, nhận `guards` từ `app.ts`.

**`index.ts`**: public API của feature, export `AuthRepository`, `AuthService`, `AuthController`, `createAuthRouter`. Feature khác chỉ được import qua file này.

**Code dùng chung (nằm ở `src/shared/`, không thuộc riêng auth)**
- `utils/password.ts`: băm và kiểm tra mật khẩu bằng **argon2id**.
- `utils/jwt.ts`: ký và đọc JWT, thuật toán **HS256**, bí mật là `JWT_SECRET`.
- `middlewares/auth-guards.ts`: `requireAdmin`, `requireOwner`, `optionalAdmin`.
- `middlewares/cache-control.ts`: đặt `no-store` cho response quản trị, `publicCache` cho GET công khai.

### Luồng đăng nhập (tóm tắt)
1. `POST /auth/login` đi qua rate limit, rồi `validate(loginSchema)`.
2. Service tìm tài khoản theo username và verify mật khẩu.
3. Đúng mật khẩu mà `is_active = 0` thì trả `403 AUTH_004`.
4. Ký JWT `{ sub: String(id), role }`, hết hạn theo `JWT_EXPIRES_IN` (mặc định `1d`, tức `expiresIn: 86400` giây).
5. Cập nhật `last_login_at`, ghi log `auth.login`, trả token.

### 📏 Quy tắc nghiệp vụ đáng nhớ
- **Sai username hay sai mật khẩu đều trả `401 AUTH_001` cùng một thông báo.** Kẻ tấn công không biết username có tồn tại không. Username không tồn tại vẫn verify với một **hash giả** để thời gian phản hồi giống nhau (chống dò username qua thời gian).
- **Kiểm tra khóa (`AUTH_004`) sau khi mật khẩu đúng.** Người không biết mật khẩu thì không biết tài khoản có bị khóa hay không.
- **Không tin token về role và trạng thái.** Mỗi request quản trị, guard đọc lại `admin_user` trong DB. Vì vậy khóa tài khoản hoặc đổi quyền có hiệu lực **ngay**, không phải chờ token hết hạn. Admin bị xóa khỏi DB thì token cũ trả `AUTH_002`.
- **Không có refresh token.** Token sống 1 ngày, hết hạn thì đăng nhập lại (chỉ một chủ quán dùng nên chấp nhận được).
- **Đổi mật khẩu:** sai `currentPassword` trả `400 COMMON_001` kèm `details` trỏ vào field `currentPassword`. Token cũ **vẫn dùng được** tới khi hết hạn.
- **Log:** `auth.login`, `auth.login_failed` (có username, **không có mật khẩu**), `auth.password_changed`.

### Mã lỗi liên quan
| Mã | HTTP | Khi nào |
|---|---|---|
| `AUTH_001` | 401 | Sai username hoặc mật khẩu |
| `AUTH_002` | 401 | Thiếu token, token sai định dạng/chữ ký, hoặc admin không còn trong DB |
| `AUTH_003` | 401 | Token hết hạn |
| `AUTH_004` | 403 | Tài khoản bị khóa (chỉ báo khi mật khẩu đúng) |
| `AUTH_005` | 403 | Staff gọi API chỉ dành cho owner |
| `COMMON_001` | 400 | Dữ liệu sai, hoặc sai mật khẩu hiện tại khi đổi mật khẩu |
| `COMMON_004` | 429 | Đăng nhập sai quá 10 lần / 15 phút / IP |

### Cách feature khác dùng quyền
`app.ts` tạo `guards = createAuthGuards(authService)` một lần rồi truyền vào router của từng feature: `createXxxRouter(controller, guards)`. Feature khác **không import** gì từ auth, nên không bị phụ thuộc vòng.
- `guards.requireAdmin`: owner hoặc staff đều qua. Gắn `req.admin`, đặt `Cache-Control: no-store`.
- `guards.requireOwner`: chỉ owner; staff nhận `403 AUTH_005`.
- `guards.optionalAdmin`: có header `Authorization` thì xác thực, không có thì cho qua. Dùng cho `includeInactive=true` ở các GET công khai (chỉ admin mới thấy bản ghi đang ẩn).
- Controller lấy admin bằng `getRequestAdmin(req)`.

Ví dụ: tạo gói giá (`POST /price-plans`) cần `requireOwner`; thêm game (`POST /games`) chỉ cần `requireAdmin`.

### Seed tài khoản owner
`npx prisma db seed` tạo owner từ `SEED_OWNER_USERNAME` / `SEED_OWNER_PASSWORD` trong `.env`, **chỉ khi DB chưa có tài khoản owner nào**. Seed không tìm theo username, vì chủ quán có thể đổi tên đăng nhập (vd `owner` → `admin`); nếu seed tìm theo tên thì sẽ tạo thêm một owner mới dùng mật khẩu trong `.env` (chuyện này đã xảy ra ngày 2026-10-07 và đã được sửa).

### 💡 Điểm cần nhớ
- `passwordHash` chỉ xuất hiện ở hai hàm repository; mọi chỗ khác dùng `ADMIN_SELECT`.
- Quyền được kiểm tra lại từ DB ở **mỗi request**, không dựa vào nội dung token.
- Thông báo lỗi đăng nhập cố ý mơ hồ để không lộ thông tin cho kẻ dò.
- Thêm route quản trị mới: chỉ cần nhận `guards` và gắn `guards.requireAdmin` hoặc `guards.requireOwner` trước `validate(...)`.

### Chưa làm
- Test tự động (`/be-test auth`); hiện mới kiểm tra bằng gọi API thật (21 tình huống và rate limit đều đúng).
- Quản lý tài khoản staff (thêm/khóa/xóa): `API_SPEC.md` chưa có endpoint, hiện chỉ sửa trực tiếp trong DB.

### 🔗 Liên kết
- Được gọi bởi: `app.ts` (nối dây `AuthRepository → AuthService → AuthController`, tạo `guards`); mọi router quản trị của các feature khác dùng `guards`.
- Gọi tới: `shared/utils/password.ts`, `shared/utils/jwt.ts`, `core/database/prisma.ts` (qua repository), `core/logger`.
- Tài liệu: `backend/src/features/auth/context.md`; `API_SPEC.md` mục 2 (xác thực), mục 5 (mã lỗi), mục 7.1 và 7.1b (chi tiết endpoint); `DATABASE.md` bảng `admin_user`; `BE-ARCHITECTURE.md` mục 3 (giải phẫu feature), mục 5 (giao tiếp giữa feature), mục 8 (chuỗi middleware).
