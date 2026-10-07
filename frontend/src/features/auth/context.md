# Feature: auth (frontend)

> ✅ **Đã cài đặt** (2026-10-06). Kiểm tra: typecheck, lint, test, build; gọi API thật qua proxy Vite; hành vi component (chuyển hướng, lỗi form, 403, `next` an toàn) bằng test jsdom tạm. Chưa xem giao diện bằng trình duyệt thật. Chưa có test chính thức (`/fe-test auth`).

## Mục đích
Đăng nhập trang quản trị, xem tài khoản và đổi mật khẩu, chặn route quản trị khi chưa đăng nhập hoặc không đủ quyền.

## Endpoint dùng (backend `auth` đã xong)
| Method | Path | Dùng ở |
|---|---|---|
| POST | `/auth/login` | `LoginForm` → `setSession(accessToken, admin)` |
| GET | `/auth/me` | `AdminUserMenu`, `AccountInfo` (phát hiện sớm token hết hạn / tài khoản bị khóa) |
| PUT | `/auth/password` | `ChangePasswordForm` (gửi `currentPassword`, `newPassword`) |

## Route và trang
| Path | Trang | Quyền |
|---|---|---|
| `/admin/login` | `AdminLoginPage` (đã đăng nhập → chuyển thẳng tới `next`) | Công khai |
| `/admin` | chuyển tới `/admin/account` (tạm, chưa có trang tổng quan) | Admin |
| `/admin/account` | `AdminAccountPage`: thông tin tài khoản + đổi mật khẩu | Admin |

Nhánh `/admin` ghép ở `src/app/AdminRoot.tsx` (lazy): `RequireAuth` → `AdminLayout` (menu `ADMIN_NAV`, khu `AdminUserMenu`). Nhóm route chỉ owner trong `src/app/routes.tsx` bọc `<RequireRole role="owner" />`.

## Public API (`index.ts`)
- `RequireAuth`: chưa có token → `/admin/login?next=<path+search>`
- `RequireRole` (`role`, `children?`): sai role → trang "403 Không đủ quyền"; không có children thì render `<Outlet />`
- `useHasRole(role)`: ẩn/hiện nút theo role
- `AdminUserMenu`: tên, vai trò, link tài khoản, đăng xuất
- `authPublicRoutes`, `authAdminRoutes`; type `AdminRole`

## File
| Thư mục | Nội dung |
|---|---|
| `types/` | `auth.types.ts` (`LoginResult`, `CurrentAdmin`), `auth.schema.ts` (`loginSchema`, `changePasswordSchema`: khớp `auth.dto.ts` backend, thêm `confirmPassword` chỉ ở giao diện) |
| `services/auth.service.ts` | `login`, `getCurrentAdmin`, `changePassword` |
| `hooks/` | `useLogin`, `useCurrentAdmin`, `useChangePassword`, `useLogout`, `useHasRole`, `auth.keys.ts` |
| `components/` | `LoginForm`, `ChangePasswordForm`, `AccountInfo`, `FormAlert`, `RequireAuth`, `RequireRole`, `AdminUserMenu` |
| `utils/auth.utils.ts` | `getSafeNextPath`, `ROLE_LABEL` |
| `pages/` | `AdminLoginPage`, `AdminAccountPage` |

## State và query key
- Phiên (`accessToken`, `admin`) ở `shared/stores/auth.store.ts` (localStorage `fs-auth`), không ở feature.
- Query key: `['auth', 'me']`. Đăng nhập và đăng xuất đều `queryClient.clear()` (không để dữ liệu của phiên trước).
- Token hết hạn / tài khoản bị khóa: API trả `AUTH_002/003/004` → `http.ts` phát `auth:expired` (AUTH_002/003) → `app/providers.tsx` xóa phiên, toast, về `/admin/login?next=`.

## Quyết định đã chốt
- `?next=` chỉ nhận đường dẫn nội bộ bắt đầu bằng một `/` (chặn `//evil.com`, `/\evil.com`, URL tuyệt đối); trỏ về `/admin/login` thì đổi thành `/admin`.
- Lỗi form: `details` từ API gán vào ô (`applyServerErrors`); lỗi khác (sai mật khẩu `AUTH_001`, khóa `AUTH_004`, `429`) hiện ở `FormAlert` đầu form, thông báo lấy từ `ERROR_MESSAGES`.
- `RequireRole` dùng role lưu lúc đăng nhập (nhanh); quyền thật do API kiểm tra (`AUTH_005`).

## Chưa làm
- Test chính thức (`/fe-test auth`).
- Trang tổng quan `/admin` (hiện chuyển tạm sang `/admin/account`).
- Quản lý tài khoản staff: backend chưa có API.
- Đồng bộ `auth.store.admin` với `/auth/me` khi owner đổi role của tài khoản đang đăng nhập (hiện phải đăng nhập lại mới thấy role mới).
