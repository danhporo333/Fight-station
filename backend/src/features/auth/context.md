# Feature: auth (backend)

> ✅ **Đã cài đặt** (2026-10-06). Kiểm tra bằng gọi API thật: 21 tình huống + rate limit đều đúng. Chưa có test tự động (`/be-test auth`).

## Mục đích
Đăng nhập trang quản trị bằng JWT, xem tài khoản đang đăng nhập, đổi mật khẩu. Cung cấp `AdminLookup` để `shared/middlewares/auth-guards.ts` phân quyền mọi route quản trị.

## Endpoint (dưới `/api/v1`)
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/auth/login` | Trả `{ accessToken, expiresIn, admin: { id, username, role } }`, `Cache-Control: no-store` | Công khai, rate limit 10 lần **sai** / 15 phút / IP |
| GET | `/auth/me` | `{ id, username, role, isActive, lastLoginAt, createdAt }` | Admin |
| PUT | `/auth/password` | `{ currentPassword, newPassword }` → `data: null` | Admin |

Chi tiết request/response: `API_SPEC.md` mục 7.1 và 7.1b.

## Bảng DB
- `admin_user` (model `AdminUser`, enum `AdminRole { owner staff }`), migration `create_admin_user_table`.

## File
| File | Vai trò |
|---|---|
| `auth.dto.ts` | `loginSchema`, `changePasswordSchema` (mật khẩu không trim, tối đa 200 ký tự) |
| `auth.entity.ts` | `Admin`, `AdminSummary`, `LoginResult`, `ADMIN_SELECT` (không có `passwordHash`) |
| `auth.repository.ts` | Truy vấn `admin_user`; `passwordHash` chỉ đọc ở `findCredentialsByUsername` / `findPasswordHashById` |
| `auth.service.ts` | `login`, `getMe`, `changePassword`; `findById` để thỏa `AdminLookup` |
| `auth.controller.ts`, `auth.routes.ts` | `createAuthRouter(controller, guards)` |
| `index.ts` | Export `AuthRepository`, `AuthService`, `AuthController`, `createAuthRouter` |

Dùng chung (ở `src/shared/`): `utils/password.ts` (argon2id), `utils/jwt.ts` (HS256), `middlewares/auth-guards.ts`, `middlewares/cache-control.ts`.

## Business rule
- Sai username hay sai mật khẩu đều `401 AUTH_001` cùng thông báo; username không tồn tại vẫn verify với hash giả để thời gian phản hồi như nhau.
- Kiểm tra khóa (`AUTH_004`) **sau** khi mật khẩu đúng: người không biết mật khẩu không biết tài khoản bị khóa.
- JWT: `{ sub: String(id), role }`, HS256, hết hạn theo `JWT_EXPIRES_IN` (mặc định `1d` → `expiresIn: 86400`). Không có refresh token.
- Mỗi request quản trị, guard đọc lại `admin_user` (role và `is_active` lấy từ DB, không tin token): khóa hoặc đổi quyền có hiệu lực ngay. Admin bị xóa → `AUTH_002`.
- Đổi mật khẩu: sai `currentPassword` → `400 COMMON_001` kèm `details` field `currentPassword`. Token cũ vẫn hợp lệ tới khi hết hạn.
- Đăng nhập thành công cập nhật `last_login_at`; log `auth.login`, `auth.login_failed` (có username, không có mật khẩu), `auth.password_changed`.

## Cách feature khác dùng quyền
`app.ts` tạo `guards = createAuthGuards(authService)` rồi truyền vào router factory của feature: `createXxxRouter(controller, guards)`.
- `guards.requireAdmin` (owner hoặc staff), `guards.requireOwner` (chỉ owner, staff → `403 AUTH_005`): gắn `req.admin`, đặt `Cache-Control: no-store`.
- `guards.optionalAdmin`: có header `Authorization` thì xác thực, không có thì cho qua; dùng cho `includeInactive=true`.
- Controller lấy admin bằng `getRequestAdmin(req)`. GET công khai gắn `publicCache`.

## Seed
`npx prisma db seed` tạo owner từ `SEED_OWNER_USERNAME` / `SEED_OWNER_PASSWORD` (trong `.env`); username đã có thì bỏ qua.

## Chưa làm
- Test tự động (`/be-test auth`).
- Quản lý tài khoản staff (thêm/khóa/xóa): API_SPEC chưa có endpoint, hiện chỉ sửa trực tiếp DB.
