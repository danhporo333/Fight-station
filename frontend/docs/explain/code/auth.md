# Giải thích code: feature `auth` (Frontend)

| | |
|---|---|
| **Phía** | FE (frontend) |
| **Chế độ** | `code` |
| **Target** | `auth` |
| **Ngày viết** | 2026-10-07 (viết lại sau khi `FormAlert` chuyển sang `shared/` và có trang owner đầu tiên `/admin/shop`) |
| **Tài liệu đã đọc** | `frontend/src/features/auth/context.md` (trạng thái ✅ Đã cài đặt 2026-10-06), `frontend/src/features/shop/context.md` (phần dùng `RequireRole`), `frontend/docs/FE-ARCHITECTURE.md` |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `auth` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

Phía giao diện của `auth` lo 3 việc:

1. **Trang đăng nhập** `/admin/login`: gửi tên và mật khẩu lên API, nhận token rồi lưu lại.
2. **Gác cổng trang quản trị**: chưa đăng nhập thì không vào được `/admin/...`; nhân viên vào trang chỉ dành cho chủ quán thì thấy "Không đủ quyền".
3. **Trang tài khoản** `/admin/account`: xem thông tin và đổi mật khẩu.

Ví dụ đời thường: frontend giống **người gác cổng có danh sách khách**. Họ chỉ nhìn xem bạn có cầm thẻ hay không (token trong trình duyệt) để mở cửa cho nhanh. Còn thẻ thật hay giả, còn hạn hay không, do **phòng bảo vệ** (backend) quyết định mỗi lần bạn làm việc gì.

| Path | Trang | Ai vào được |
|---|---|---|
| `/admin/login` | `AdminLoginPage` | Ai cũng vào được; đã đăng nhập thì tự chuyển vào trong |
| `/admin` | chuyển tạm sang `/admin/account` (chưa có trang tổng quan) | Admin |
| `/admin/account` | `AdminAccountPage` | Admin (chủ quán hoặc nhân viên) |

Trang của feature khác cũng dùng "người gác cổng" của `auth`. Ví dụ `/admin/shop` (sửa thông tin quán, feature `shop`) nằm trong nhóm route chỉ chủ quán, nên nhân viên mở link đó sẽ thấy "Không đủ quyền".

### Cấu trúc thư mục và luồng gọi

Frontend cũng chia theo tầng, dữ liệu đi một chiều:

```
component → hook (TanStack Query) → service → http.ts (Axios) → API
```

| Thư mục | Vai trò |
|---|---|
| `types/` | Kiểu dữ liệu API trả về, và luật kiểm tra form (Zod) |
| `services/` | Hàm gọi API, **chỉ** đi qua `http.ts` |
| `hooks/` | Bọc TanStack Query: gọi service, quản lý loading/lỗi/cache |
| `components/` | Giao diện: form, khung chặn quyền, menu tài khoản |
| `utils/` | Hàm thuần (không gọi API, không hiển thị) |
| `pages/` | Trang hoàn chỉnh, ghép các component lại |
| `routes.tsx` | Khai báo route của feature, trang tải **lazy** |
| `index.ts` | Chỉ export những gì nơi khác được dùng |

---

## 📁 File: `types/auth.types.ts` và `types/auth.schema.ts`

### Mục đích
- `auth.types.ts`: mô tả **hình dạng dữ liệu** API trả về, để TypeScript bắt lỗi khi viết sai tên trường.
- `auth.schema.ts`: **luật kiểm tra form** bằng Zod, chạy ngay trên trình duyệt trước khi gửi.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: types, schema

### Phân tích
- `LoginResult`: `{ accessToken, expiresIn, admin }`, giống response của `POST /auth/login`.
- `CurrentAdmin`: tài khoản từ `GET /auth/me` (`id`, `username`, `role`, `isActive`, `lastLoginAt`, `createdAt`). Ngày giờ là **chuỗi** ISO, khi hiển thị mới đổi sang giờ Việt Nam.
- `loginSchema`, `changePasswordSchema`: **cùng luật và cùng thông báo** với backend (`auth.dto.ts`), nên người dùng thấy lỗi ngay mà không phải chờ server.
- `changePasswordSchema` có thêm ô `confirmPassword` ("Nhập lại mật khẩu mới"). Ô này **chỉ kiểm tra ở giao diện**, không gửi lên API.

### 💡 Điểm cần nhớ
- Kiểm tra ở giao diện là để **tiện cho người dùng**. Kiểm tra thật vẫn ở backend.

---

## 📁 File: `services/auth.service.ts`

### Mục đích
Nơi **duy nhất** của feature gọi API.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: service

### Phân tích
- `login(input)` → `POST /auth/login`
- `getCurrentAdmin()` → `GET /auth/me`
- `changePassword(input)` → `PUT /auth/password`, chỉ gửi `currentPassword` và `newPassword`.

Tất cả đi qua `http` trong `shared/services/api/http.ts`. File đó tự gắn token vào header, tự "bóc" envelope `{ success, data }` thành `{ data }`, và biến mọi lỗi thành `ApiError` có `code`.

### 📏 Quy tắc dự án liên quan
- Không gọi `axios` hay `fetch` trực tiếp trong component; không viết cứng URL.

---

## 📁 File: thư mục `hooks/`

### Mục đích
Cho component dùng dữ liệu và hành động API một cách đơn giản, nhờ **TanStack Query**: thư viện lo việc gọi API, nhớ kết quả (cache), báo đang tải, báo lỗi.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: hook

### Phân tích

| Hook | Làm gì |
|---|---|
| `useLogin` | Gửi đăng nhập. Thành công thì **xóa sạch cache cũ** và lưu phiên (token + thông tin admin) |
| `useCurrentAdmin` | Lấy `/auth/me`. **Chỉ gọi khi có token**. Query key `['auth', 'me']` |
| `useChangePassword` | Gửi đổi mật khẩu |
| `useLogout` | Xóa phiên, xóa cache, báo "Đã đăng xuất", về trang đăng nhập |
| `useHasRole(role)` | Trả `true/false`: người đang đăng nhập có đúng role không (để ẩn/hiện nút) |
| `auth.keys.ts` | Gom các query key một chỗ, tránh gõ sai |

**Vì sao đăng nhập và đăng xuất đều xóa cache?** Để không còn dữ liệu của người dùng trước trong bộ nhớ trình duyệt, ví dụ khi hai người dùng chung một máy.

### 📏 Quy tắc dự án liên quan
- Dữ liệu từ server **chỉ** nằm trong cache của TanStack Query, không chép sang `useState` hay Zustand.

---

## 📁 File: `components/RequireAuth.tsx` và `components/RequireRole.tsx`

### Mục đích
Hai "người gác cổng" của trang quản trị.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: component

### Phân tích
- **`RequireAuth`**: không có token → chuyển sang `/admin/login?next=<trang đang mở>`. Đăng nhập xong sẽ quay lại đúng trang đó.
- **`RequireRole role="owner"`**: người đang đăng nhập không phải chủ quán → hiện trang "403 Không đủ quyền" kèm link quay về. Không truyền `children` thì nó hiển thị các trang con bên trong (`<Outlet />`), nên dùng được làm "vỏ" cho cả nhóm route chỉ dành cho chủ quán.
  - Ví dụ thật trong `src/app/routes.tsx`: nhóm `<RequireRole role="owner" />` chứa `...shopOwnerRoutes` (trang `/admin/shop`). Sau này `branch` và `price-plan` cũng thêm route vào nhóm này.
  - Menu bên trái cũng ẩn mục chỉ dành cho chủ quán: trong `ADMIN_NAV`, mục "Thông tin quán" có `ownerOnly: true`, và `AdminRoot` dùng `useHasRole('owner')` để quyết định có hiện mục đó không.

### 💡 Điểm cần nhớ
- Hai component này **chỉ che giao diện**. Quyền thật do backend kiểm tra: nhân viên có gọi thẳng API của chủ quán thì vẫn nhận `403 AUTH_005`.
- `RequireAuth` chỉ xem **có token hay không**. Token hết hạn sẽ bị phát hiện ở lần gọi API kế tiếp (xem mục "Phiên hết hạn" bên dưới).

---

## 📁 File: `components/LoginForm.tsx`, `ChangePasswordForm.tsx`

### Mục đích
Hai form của feature, viết bằng **React Hook Form** (thư viện quản lý form) với luật Zod ở trên.

> `FormAlert` (khung lỗi chung của form) **không còn nằm trong `auth`**. Nó đã được chuyển sang `shared/components/ui/FormAlert.tsx`, vì form của feature `shop` cũng dùng. Quy tắc dự án: thứ gì từ **2 feature** trở lên dùng thì chuyển vào `shared/`.

### Vị trí trong dự án
- Feature: `auth`
- Tầng: component

### Phân tích

**Lỗi được hiển thị ở 2 chỗ:**

| Loại lỗi | Hiện ở đâu | Ví dụ |
|---|---|---|
| Lỗi của **một ô** | Ngay dưới ô đó, viền ô chuyển đỏ | "Nhập mật khẩu", "Mật khẩu hiện tại không đúng" |
| Lỗi **chung** của form | Khung đỏ `FormAlert` (từ `@/shared/components/ui/FormAlert`) ở đầu form | "Tên đăng nhập hoặc mật khẩu không đúng", "Tài khoản đã bị khóa" |

Hàm dùng chung `applyServerErrors` (ở `shared/utils/form-errors.ts`) quyết định chỗ hiện lỗi. Nếu API trả `details` chỉ ra ô nào sai thì gán vào đúng ô đó; còn lại thì hiện ở khung lỗi chung. Thông báo lấy từ `ERROR_MESSAGES` theo **mã lỗi** (`AUTH_001`, `AUTH_004`...), không phụ thuộc chữ server trả về.

**Props**
- `LoginForm`: `onSuccess`, hàm gọi khi đăng nhập xong (trang dùng để chuyển hướng).
- `ChangePasswordForm`: không có props. Đổi xong thì báo "Đã đổi mật khẩu" và xóa trắng các ô.

Nút gửi hiện vòng xoay và bị khóa trong lúc chờ API, tránh bấm hai lần.

---

## 📁 File: `components/AccountInfo.tsx` và `AdminUserMenu.tsx`

### Mục đích
- `AccountInfo`: khối thông tin tài khoản trên trang `/admin/account`.
- `AdminUserMenu`: góc trên phải trang quản trị: tên, vai trò ("Chủ quán"/"Nhân viên"), nút **Đăng xuất**.

### Phân tích
- `AccountInfo` có đủ **3 trạng thái**: đang tải (khung xám nhấp nháy), lỗi (thông báo + nút "Thử lại"), có dữ liệu (tên, vai trò, lần đăng nhập gần nhất theo giờ Việt Nam, ngày tạo).
- `AdminUserMenu` gọi `/auth/me` mỗi khi vào trang quản trị. Mục đích là **phát hiện sớm** token hết hạn hoặc tài khoản bị khóa. Trong lúc chờ, nó hiện thông tin đã lưu lúc đăng nhập để không bị trống.

---

## 📁 File: `utils/auth.utils.ts`

### Mục đích
Hàm thuần, không gọi API, không hiển thị gì.

### Phân tích
- **`getSafeNextPath(next)`**: kiểm tra tham số `?next=` trước khi chuyển hướng. Chỉ nhận đường dẫn **trong website**, bắt đầu bằng một dấu `/`. Chặn `//evil.com`, `/\evil.com`, `https://...`. Nếu trỏ lại `/admin/login` thì đổi thành `/admin`.
  - Lý do: nếu không chặn, kẻ xấu có thể gửi link `.../admin/login?next=https://trang-gia.com`, người dùng đăng nhập xong sẽ bị đưa sang trang giả (lỗi bảo mật gọi là *open redirect*).
- **`ROLE_LABEL`**: đổi `owner` → "Chủ quán", `staff` → "Nhân viên".

---

## 📁 File: `pages/` và `routes.tsx`

### Phân tích
- **`AdminLoginPage`**: đọc `?next=` qua `getSafeNextPath`. Đã đăng nhập thì chuyển thẳng tới đó; chưa thì hiện `LoginForm`.
- **`AdminAccountPage`**: ghép `AccountInfo` và `ChangePasswordForm`.
- **`routes.tsx`**: export `authPublicRoutes` (gắn vào khung trang công khai) và `authAdminRoutes` (gắn dưới `/admin`). Cả hai trang đều **tải lazy**: chỉ tải code khi người dùng mở trang đó, nên khách xem trang chủ không phải tải mã quản trị.

---

## 🔗 Phần dùng chung liên quan (ngoài thư mục feature)

| File | Vai trò với `auth` |
|---|---|
| `shared/stores/auth.store.ts` | **Nơi lưu phiên**: `accessToken` và `admin`, lưu trong localStorage (key `fs-auth`), nên tải lại trang vẫn đăng nhập. Nằm ở `shared/` vì `http.ts` cần đọc token, mà `shared/` không được import `features/` |
| `shared/services/api/http.ts` | Gắn `Authorization: Bearer <token>` vào mọi request; gặp `AUTH_002/003` thì phát sự kiện `auth:expired` |
| `app/providers.tsx` | Nghe `auth:expired` → xóa phiên, xóa cache, báo "Phiên đăng nhập đã hết hạn", về `/admin/login?next=...` |
| `app/AdminRoot.tsx` | Gốc nhánh `/admin`: `RequireAuth` bọc `AdminLayout`, truyền menu `ADMIN_NAV` (mục `ownerOnly` chỉ hiện với chủ quán) và `AdminUserMenu` |
| `shared/components/ui/Button.tsx`, `TextField.tsx` | Nút có trạng thái đang xử lý; ô nhập có nhãn và dòng lỗi |
| `shared/components/ui/FormAlert.tsx` | Khung lỗi chung của form; dùng ở `LoginForm`, `ChangePasswordForm` và `ShopForm` |
| `shared/utils/error-messages.ts`, `form-errors.ts` | Thông báo theo mã lỗi; gán lỗi API vào ô của form |

### Phiên hết hạn hoạt động thế nào?
Token sống 1 ngày. Khi hết hạn, `RequireAuth` vẫn thấy "có token" và cho vào. Nhưng lần gọi API đầu tiên (thường là `/auth/me` từ `AdminUserMenu`) sẽ nhận `401 AUTH_003`. Khi đó `http.ts` phát `auth:expired`, `providers.tsx` dọn phiên và đưa về trang đăng nhập, kèm `next` để quay lại đúng trang sau khi đăng nhập.

---

## 🔗 Liên kết

- **Được dùng bởi:** `src/app/routes.tsx` (gắn route, nhóm owner bọc `RequireRole` chứa `/admin/shop`), `src/app/AdminRoot.tsx`.
- **Gọi tới:** `shared/services/api/http.ts` → backend `/api/v1/auth/*`.
- **Tài liệu:** `frontend/src/features/auth/context.md`; `FE-ARCHITECTURE.md` mục 3 (giải phẫu feature), mục 5 (giao tiếp giữa feature), mục 6 (routing), mục 7 (state), mục 8 (tầng API); `API_SPEC.md` mục 2, 7.1 và 7.1b.

## 💡 Điểm cần nhớ (cả feature)
- Frontend chặn quyền để **trải nghiệm tốt**; backend chặn quyền để **an toàn**.
- Token và thông tin admin nằm trong `auth.store` (localStorage); dữ liệu API khác nằm trong cache TanStack Query.
- Lỗi form: gán vào ô nếu biết ô nào, còn lại hiện ở khung chung; thông báo theo mã lỗi.
- Chưa có: test chính thức, trang tổng quan `/admin`, quản lý tài khoản nhân viên. Đổi role của người đang đăng nhập thì họ phải đăng nhập lại mới thấy.

---

Xem phần còn lại: [Giải thích code `auth` phía Backend](../../../../backend/docs/explain/code/auth.md)
