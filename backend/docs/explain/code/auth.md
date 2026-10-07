# Giải thích code: feature `auth` (Backend)

| | |
|---|---|
| **Phía** | BE (backend) |
| **Chế độ** | `code` |
| **Target** | `auth` |
| **Ngày viết** | 2026-10-07 |
| **Tài liệu đã đọc** | `backend/src/features/auth/context.md` (trạng thái ✅ Đã cài đặt 2026-10-06), `backend/docs/BE-ARCHITECTURE.md` |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `auth` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

`auth` (viết tắt của *authentication*: xác thực) trả lời hai câu hỏi cho trang quản trị:

1. **Bạn là ai?** Đăng nhập bằng tên và mật khẩu, nhận về một "thẻ ra vào" gọi là **JWT** (JSON Web Token).
2. **Bạn được làm gì?** Mỗi lần gọi API quản trị, server xem thẻ và kiểm tra quyền: *chủ quán* (owner) hay *nhân viên* (staff).

Ví dụ đời thường: giống **thẻ nhân viên** ở quán. Quầy lễ tân (API đăng nhập) kiểm tra danh tính rồi phát thẻ có hạn 1 ngày. Mỗi cửa phòng (route quản trị) có bảo vệ quét thẻ, và **gọi điện hỏi lại văn phòng** xem người này còn làm ở quán không (đọc lại database), chứ không tin hoàn toàn vào tấm thẻ.

Feature có 3 endpoint (dưới `/api/v1`):

| Method | Path | Làm gì | Ai gọi được |
|---|---|---|---|
| POST | `/auth/login` | Đăng nhập, nhận `accessToken` | Ai cũng gọi được (giới hạn 10 lần **sai** / 15 phút / IP) |
| GET | `/auth/me` | Xem tài khoản đang đăng nhập | Admin (owner hoặc staff) |
| PUT | `/auth/password` | Đổi mật khẩu của chính mình | Admin |

Dữ liệu nằm ở bảng `admin_user` (cột chính: `username`, `password_hash`, `role`, `is_active`, `last_login_at`).

### Các file và tầng

Backend chia code theo **tầng** (layer), mỗi tầng một việc. Một request đi theo một chiều:

```
routes → controller → service → repository → Prisma → MySQL
```

| File | Tầng | Một câu |
|---|---|---|
| `auth.routes.ts` | routes | Gắn URL với hàm xử lý, kèm "bảo vệ" (guard, validate) |
| `auth.controller.ts` | controller | Nhận request, gọi service, trả response. Không có logic |
| `auth.service.ts` | service | **Logic nghiệp vụ**: kiểm tra mật khẩu, khóa tài khoản, ký token |
| `auth.repository.ts` | repository | Nơi **duy nhất** đọc/ghi bảng `admin_user` qua Prisma |
| `auth.dto.ts` | dto | Luật kiểm tra dữ liệu gửi lên (Zod) |
| `auth.entity.ts` | entity | Hình dạng dữ liệu trả ra API (không bao giờ có mật khẩu) |
| `index.ts` | public API | Chỉ export những gì `app.ts` cần để nối dây |

Code dùng chung nằm ngoài feature, ở `src/shared/`: `utils/password.ts`, `utils/jwt.ts`, `middlewares/auth-guards.ts`, `middlewares/cache-control.ts`.

---

## 📁 File: `auth.dto.ts`

### Mục đích
Khai báo **luật cho dữ liệu người dùng gửi lên**, để controller và service chỉ nhận dữ liệu đã hợp lệ.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: dto (Data Transfer Object: "gói dữ liệu" đi qua API)

### Phân tích

**Các schema (Zod)**
- `loginSchema`: `username` (bỏ khoảng trắng 2 đầu, 1–50 ký tự), `password` (1–200 ký tự).
- `changePasswordSchema`: `currentPassword`, `newPassword` (≥ 8 ký tự), và mật khẩu mới **phải khác** mật khẩu cũ.

**Vì sao mật khẩu không bị trim (cắt khoảng trắng)?** Khoảng trắng có thể là một phần mật khẩu thật. Cắt đi sẽ khiến người dùng không đăng nhập được.

**Vì sao giới hạn 200 ký tự?** Hàm hash mật khẩu (argon2) tốn tài nguyên; mật khẩu dài bất thường có thể bị lợi dụng để làm server chậm.

### 📏 Quy tắc dự án liên quan
- Validate bằng Zod ngay ở route (middleware `validate()`); sai → `400 COMMON_001` kèm `details` chỉ ra ô nào sai.

### 💡 Điểm cần nhớ
- Thông báo lỗi trong schema là tiếng Việt và **frontend dùng lại đúng các luật này** (xem bài FE).

---

## 📁 File: `auth.entity.ts`

### Mục đích
Định nghĩa **dữ liệu tài khoản được phép trả ra ngoài**.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: entity

### Phân tích
- `Admin`: `id`, `username`, `role`, `isActive`, `lastLoginAt`, `createdAt`. **Không có `passwordHash`.**
- `AdminSummary`: bản rút gọn `{ id, username, role }`, nằm trong response đăng nhập.
- `LoginResult`: `{ accessToken, expiresIn, admin }`.
- `ADMIN_SELECT`: danh sách cột được phép đọc từ DB. Repository dùng nó làm `select`, nên **cột mật khẩu không bao giờ lọt ra** do quên.

### 💡 Điểm cần nhớ
- Cách chặn rò rỉ mật khẩu tốt nhất là **không đọc nó ra** ngay từ đầu, thay vì đọc ra rồi nhớ xóa.

---

## 📁 File: `auth.repository.ts`

### Mục đích
Nơi **duy nhất** của feature được nói chuyện với database (bảng `admin_user`).

### Vị trí trong dự án
- Feature: `auth`
- Tầng: repository

### Phân tích

**Class `AuthRepository`** nhận Prisma qua constructor (gọi là *dependency injection*: được "đưa" công cụ từ bên ngoài, không tự tạo). Nhờ vậy khi test có thể đưa một database giả.

**Các method**
- `findById(id)`: tìm tài khoản theo id, chỉ lấy cột trong `ADMIN_SELECT`.
- `findCredentialsByUsername(username)`: lấy tài khoản **kèm** `passwordHash`, chỉ dùng khi cần so mật khẩu lúc đăng nhập.
- `findPasswordHashById(id)`: lấy hash để so mật khẩu cũ khi đổi mật khẩu.
- `updateLastLogin(id, at)`: ghi thời điểm đăng nhập gần nhất.
- `updatePasswordHash(id, hash)`: lưu mật khẩu mới (đã hash).

### 📏 Quy tắc dự án liên quan
- Chỉ repository được dùng Prisma. Repository **không** chứa logic nghiệp vụ và **không** ném lỗi HTTP.

### 💡 Điểm cần nhớ
- `passwordHash` chỉ rời repository ở 2 method có tên nói rõ điều đó, và không bao giờ rời service.

---

## 📁 File: `auth.service.ts`

### Mục đích
Chứa **toàn bộ logic nghiệp vụ** của đăng nhập và đổi mật khẩu. Đây là file quan trọng nhất của feature.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: service

### Phân tích

**Class `AuthService`** nhận `AuthRepository` qua constructor. Nó cũng đóng vai trò `AdminLookup` (cách tra cứu admin) mà guard trong `shared/` cần (xem phần guard bên dưới).

**Các method**

- `login({ username, password })`, từng bước:
  1. Tìm tài khoản theo username.
  2. **Luôn** so mật khẩu, kể cả khi không có tài khoản (so với một "hash giả"). Nhờ vậy thời gian phản hồi giống nhau, kẻ xấu không đoán được username nào tồn tại.
  3. Sai username **hoặc** sai mật khẩu → cùng một lỗi `401 AUTH_001` "Tên đăng nhập hoặc mật khẩu không đúng".
  4. Mật khẩu đúng nhưng tài khoản bị khóa (`is_active = 0`) → `403 AUTH_004`. Kiểm tra khóa **sau** mật khẩu, nên người không biết mật khẩu không biết tài khoản bị khóa.
  5. Ghi `last_login_at`, ký JWT, trả `{ accessToken, expiresIn, admin }`.
- `getMe(adminId)`: trả thông tin tài khoản; không còn tài khoản → `AUTH_002`.
- `changePassword(adminId, dto)`: so mật khẩu hiện tại; sai → `400 COMMON_001` kèm `details` ở ô `currentPassword` (để giao diện báo đúng ô). Đúng → hash mật khẩu mới và lưu.
- `findById(id)`: dùng cho guard kiểm tra quyền mỗi request.

**Log (nhật ký)**: `auth.login`, `auth.login_failed` (có username, **không** có mật khẩu), `auth.password_changed`.

### 📏 Quy tắc dự án liên quan
- Service ném `AppError` (`UnauthorizedError`, `ForbiddenError`, `ValidationError`); không tự dựng response JSON.
- Service không dùng Prisma trực tiếp, chỉ gọi repository.

### 💡 Điểm cần nhớ
- Hai kỹ thuật bảo mật: **cùng một thông báo lỗi** và **hash giả**, đều để không lộ tài khoản nào tồn tại.
- Đổi mật khẩu **không** làm token cũ mất hiệu lực; token vẫn dùng được tới khi hết hạn (mặc định 1 ngày).

---

## 📁 File: `auth.controller.ts`

### Mục đích
Cầu nối giữa HTTP và service: lấy dữ liệu từ request, gọi service, trả response.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: controller

### Phân tích
- `login`: gọi `service.login(body)` → `200` với kết quả.
- `me`: lấy admin đang đăng nhập bằng `getRequestAdmin(req)` → `service.getMe(id)`.
- `changePassword`: `service.changePassword(id, body)` → `200` với `data: null`.

### 📏 Quy tắc dự án liên quan
- Controller **không** có logic, **không** `try/catch`. Express 5 tự chuyển lỗi tới error-handler.
- Response luôn qua helper `ok()`, nên định dạng luôn là `{ success, data }`.

---

## 📁 File: `auth.routes.ts`

### Mục đích
Gắn URL với controller, kèm các bước kiểm tra trước khi vào controller.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: routes

### Phân tích
Hàm `createAuthRouter(controller, guards)` trả về một router:

| Route | Thứ tự các bước |
|---|---|
| `POST /login` | giới hạn số lần sai → không cache → `validate(loginSchema)` → `controller.login` |
| `GET /me` | `guards.requireAdmin` → `controller.me` |
| `PUT /password` | `guards.requireAdmin` → `validate(changePasswordSchema)` → `controller.changePassword` |

**Middleware** là hàm chạy trước khi request tới controller, như các trạm kiểm soát xếp hàng.

### 💡 Điểm cần nhớ
- `guards` được **truyền vào** từ `app.ts`, không import thẳng. Các feature khác (game, menu...) cũng nhận `guards` theo cách này.

---

## 📁 Code dùng chung mà `auth` cung cấp hoặc dùng

### `shared/middlewares/auth-guards.ts`: "bảo vệ" của mọi route quản trị
`createAuthGuards(lookup)` tạo 3 guard:

| Guard | Cho qua khi | Từ chối |
|---|---|---|
| `requireAdmin` | Token hợp lệ, tài khoản còn hoạt động | Không/sai token → `401 AUTH_002`; hết hạn → `401 AUTH_003`; bị khóa → `403 AUTH_004` |
| `requireOwner` | Như trên **và** role là `owner` | Staff → `403 AUTH_005` |
| `optionalAdmin` | Không có token → cho qua; có token → kiểm tra như `requireAdmin` | Dùng cho tham số `includeInactive=true` |

Điểm quan trọng: guard **đọc lại database mỗi request** (role và `is_active` lấy từ DB, không tin token). Chủ quán khóa một nhân viên thì có hiệu lực **ngay lập tức**, không phải chờ token hết hạn.

**Vì sao guard nằm ở `shared/` mà không ở `features/auth/`?** Vì mọi feature đều cần nó, và quy tắc dự án cấm `shared/` import `features/`. Nên guard chỉ biết một *interface* `AdminLookup`; `app.ts` đưa `AuthService` vào làm `AdminLookup`.

### `shared/utils/password.ts`
- `hashPassword(plain)`: hash bằng **argon2id** (thuật toán hash mật khẩu hiện đại, cố tình chậm để chống dò).
- `verifyPassword(hash, plain)`: so mật khẩu; truyền `null` thì so với hash giả (kỹ thuật ở `login`).

### `shared/utils/jwt.ts`
- `signAccessToken({ sub, role })`: ký token HS256, hạn theo `JWT_EXPIRES_IN` (mặc định `1d` → `expiresIn: 86400` giây).
- `verifyAccessToken(token)`: kiểm tra chữ ký và hạn, phân biệt "hết hạn" và "không hợp lệ".
- `sub` (id admin) được lưu dạng chuỗi vì thư viện `jsonwebtoken` yêu cầu vậy, đọc ra thì đổi lại thành số.

### `shared/middlewares/cache-control.ts`
- `noStore`: response chứa token hoặc dữ liệu quản trị → trình duyệt không được lưu cache.
- `publicCache`: GET công khai được cache 60 giây (các feature khác dùng).

---

## 🔗 Liên kết

- **Được gọi bởi:** `src/app.ts` (nối dây: `AuthRepository` → `AuthService` → `AuthController`, tạo `guards`, gắn router ở `/api/v1/auth`).
- **Gọi tới:** Prisma (bảng `admin_user`), `shared/utils/password.ts`, `shared/utils/jwt.ts`, logger.
- **Dữ liệu ban đầu:** `npx prisma db seed` tạo tài khoản owner từ `SEED_OWNER_USERNAME` / `SEED_OWNER_PASSWORD` trong `.env`.
- **Tài liệu:** `backend/src/features/auth/context.md`; `BE-ARCHITECTURE.md` mục 3 (giải phẫu feature), mục 5 (giao tiếp giữa feature), mục 8 (chuỗi middleware); `API_SPEC.md` mục 2 (xác thực), 7.1 và 7.1b.

## 💡 Điểm cần nhớ (cả feature)
- Một request quản trị: **guard** (bạn là ai, được làm gì) → **validate** (dữ liệu đúng chưa) → controller → service → repository.
- Mật khẩu: hash argon2id, không trim, không bao giờ trả ra hay ghi log.
- Lỗi đăng nhập luôn mơ hồ có chủ đích (`AUTH_001`) để không lộ thông tin.
- Chưa có: test tự động, API quản lý tài khoản nhân viên.

---

Xem phần còn lại: [Giải thích code `auth` phía Frontend](../../../../frontend/docs/explain/code/auth.md)
