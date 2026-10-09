# SETUP-NOTES.md — Frontend Fight Station

## 1. Tổng quan
Ngày 2026-10-06 đã dựng khung frontend trên project Vite có sẵn: cấu trúc thư mục theo feature, cài thư viện, file cấu hình, các module dùng chung (`shared/`) và phần khởi tạo app (`app/`: provider, router, layout). App chạy được, có trang chủ tạm và trang 404; chưa có feature nào.

> Ảnh chụp lúc init, có thể lỗi thời khi dự án phát triển. Nguồn chính xác là `FE-ARCHITECTURE.md`.

## 2. File và thư mục
| Đường dẫn | Làm gì | Vì sao cần | Trạng thái |
|---|---|---|---|
| `package.json` | Đổi tên, thêm script `typecheck`, `test`, `format` | Chạy kiểm tra và test bằng một lệnh | Đã sửa |
| `tsconfig.app.json` | Bật `strict`, `noUncheckedIndexedAccess`, alias `@/` → `src/` | Bắt lỗi kiểu sớm, import ngắn gọn | Đã sửa |
| `vite.config.ts` | Alias `@/`, plugin Tailwind, proxy `/api` → `localhost:3000`, tách chunk `vendor`, cấu hình Vitest | Gọi API khi dev không lỗi CORS; khách tải code nhanh hơn | Đã sửa (giữ React Compiler) |
| `eslint.config.js` | Thêm `no-restricted-imports` và Prettier | Chặn import sâu vào feature, `shared/` không được import `features/` | Đã sửa |
| `.prettierrc.json`, `.prettierignore` | Định dạng code tự động (không dấu chấm phẩy, như code Vite sẵn có) | Code cùng một kiểu | Tạo mới |
| `.gitignore` | Thêm `.env`, `coverage` | Không commit file môi trường | Đã sửa |
| `.env.example` | `VITE_API_URL=/api/v1` | Biết app gọi API ở đâu (biến `VITE_*` là công khai, không để secret) | Tạo mới |
| `index.html` | `lang="vi"`, tiêu đề Fight Station, entry `src/app/main.tsx` | Trang tiếng Việt, chạy từ thư mục `app/` mới | Đã sửa |
| `src/vite-env.d.ts` | Khai báo kiểu cho `import.meta.env.VITE_API_URL` | TypeScript biết biến môi trường | Tạo mới |
| `src/styles/index.css` | `@import "tailwindcss"`, token màu cam `brand-50` … `brand-900` bằng `@theme`, nền tối | Dùng `bg-brand-600` thay vì mã màu cứng | Tạo mới |
| `src/app/main.tsx` | Điểm khởi động (entry point): render `<App />`, nạp CSS | Nơi app bắt đầu chạy | Tạo mới |
| `src/app/App.tsx` | `<AppProviders>` bọc `<RouterProvider>` | Gắn provider và router | Tạo mới |
| `src/app/providers.tsx` | ErrorBoundary → QueryClient (`staleTime` 60s) → Toaster; nghe `auth:expired` | Cache dữ liệu API, báo lỗi, tự đăng xuất khi token hết hạn | Tạo mới |
| `src/app/routes.tsx` | `createBrowserRouter`: PublicLayout (trang chủ, 404), AdminLayout | Một chỗ ghép route của mọi feature | Tạo mới |
| `src/app/routes.test.tsx` | Test trang chủ và trang 404 | Kiểm tra router chạy đúng | Tạo mới |
| `src/pages/HomePage.tsx` | Trang chủ tạm | Sau này ghép nhiều feature ở đây | Tạo mới |
| `src/shared/services/api/http.ts` | Axios instance duy nhất: gắn token, bóc `{ success, data, meta }`, lỗi thành `ApiError` | Feature gọi API giống nhau, không tự xử lý lỗi | Tạo mới |
| `src/shared/services/api/api-error.ts` | Class `ApiError` (`code`, `message`, `details`, `status`) | Giao diện báo lỗi theo `code` | Tạo mới |
| `src/shared/types/api.types.ts` | `Meta`, `Paged<T>`, `ApiResult<T>`, `ApiErrorBody` | Kiểu khớp `API_SPEC.md` | Tạo mới |
| `src/shared/stores/auth.store.ts` | Zustand `persist` (key `fs-auth`): `accessToken`, `admin` | Giữ đăng nhập khi tải lại trang; `http.ts` đọc token | Tạo mới |
| `src/shared/stores/ui.store.ts` | Trạng thái thu gọn sidebar quản trị | UI toàn cục | Tạo mới |
| `src/shared/utils/format.ts` (+ test) | `formatVnd` (15000 → `15.000đ`), `formatDate` (giờ Việt Nam) | Hiện tiền, ngày thống nhất | Tạo mới |
| `src/shared/utils/event-bus.ts` | Phát/nghe sự kiện có kiểu (`auth:expired`) | Báo tin một chiều giữa các phần tách rời | Tạo mới |
| `src/shared/hooks/` | `useDebounce` (300ms), `useDocumentTitle` | Ô tìm kiếm, tiêu đề tab | Tạo mới |
| `src/shared/components/ErrorBoundary.tsx` | Bắt lỗi render, hiện màn hình "Đã có lỗi xảy ra" | Không bị màn hình trắng | Tạo mới |
| `src/shared/components/NotFoundPage.tsx` | Trang 404 | Đường dẫn sai vẫn có trang báo | Tạo mới |
| `src/shared/components/layout/` | `PublicLayout`, `AdminLayout` (có `<Outlet />`) | Khung chung cho trang khách và trang quản trị | Tạo mới |
| `src/shared/components/ui/` | Thư mục trống | Chỗ cho Button, Modal, Skeleton... | Tạo mới |
| `src/features/*` (7 thư mục) | Thư mục trống có `.gitkeep` | Chỗ để `/fe-crud` thêm feature | Tạo mới |
| `src/test/setup.ts` | Nạp `jest-dom`, dọn DOM sau mỗi test | Dùng `toBeInTheDocument()` trong test | Tạo mới |
| `docs/FE-ARCHITECTURE.md`, `docs/FE-PROJECT-RULES.md` | Đổi `tailwind.config` thành `@theme` | Khớp Tailwind v4 | Đã sửa (1 dòng mỗi file) |
| `src/App.tsx`, `App.css`, `index.css`, `main.tsx`, `assets/*.svg`, `hero.png` | Code demo của Vite | Không còn được dùng, giữ theo yêu cầu | Đã có, bỏ qua |
| `README.md`, `CLAUDE.md`, `public/` | Tài liệu, favicon | — | Đã có, bỏ qua |

## 3. Dependencies
| Gói | Dùng để làm gì | Loại |
|---|---|---|
| `react-router` v7 | Điều hướng trang (routing), `createBrowserRouter` | runtime |
| `@tanstack/react-query` | Cache dữ liệu API, trạng thái loading/lỗi, tải lại | runtime |
| `axios` | Gọi HTTP, interceptor gắn token và xử lý lỗi | runtime |
| `react-hook-form`, `@hookform/resolvers`, `zod` | Form quản trị và kiểm tra dữ liệu | runtime |
| `zustand` | Store nhỏ cho đăng nhập và UI | runtime |
| `tailwindcss`, `@tailwindcss/vite` | CSS dạng class tiện ích (utility), Tailwind v4 | runtime |
| `lucide-react` | Bộ icon | runtime |
| `sonner` | Thông báo nổi (toast), `<Toaster>` | runtime |
| `vitest`, `jsdom` | Chạy test, giả lập trình duyệt | dev |
| `@testing-library/react`, `dom`, `user-event`, `jest-dom` | Test theo hành vi người dùng | dev |
| `msw` | Giả lập API khi test, không gọi backend thật | dev |
| `prettier`, `eslint-config-prettier` | Định dạng code, tắt luật lint trùng | dev |

Không cài `eslint-plugin-import`: gói này chưa hỗ trợ ESLint 10, còn `no-restricted-imports` đã có sẵn trong ESLint.

## 4. Luồng chạy
1. `index.html` nạp `src/app/main.tsx` → render `<App />`.
2. `App` bọc `AppProviders` (ErrorBoundary → QueryClient → Toaster) quanh `RouterProvider`.
3. Router chọn layout (`PublicLayout` hoặc `AdminLayout`) rồi trang con qua `<Outlet />`.
4. Khi có feature: Component → Hook (TanStack Query) → Service → `http.ts` → `/api/v1/...`.
5. Dev: `/api` đi qua proxy của Vite tới backend `localhost:3000`.
6. Response `{ success, data, meta }` được bóc thành `{ data, meta }`, lưu trong cache 60 giây.
7. Lỗi luôn là `ApiError`. Nếu mã là `AUTH_002`/`AUTH_003`: `http.ts` phát `auth:expired` → `providers.tsx` xóa token, báo toast, chuyển `/admin/login?next=...`.

## 5. Chưa làm
- Component, hook, service, schema, trang và route của 7 feature → `/fe-crud`.
- Feature `auth`: trang đăng nhập, `RequireAuth`, `RequireRole` (route `/admin` hiện chưa được bảo vệ).
- Chunk `admin` trong `manualChunks` (thêm khi có trang quản trị lazy).
- `ERROR_MESSAGES[code]` để báo lỗi theo mã; component `ui/` (Button, Modal, Skeleton).
- Handler MSW dùng chung cho test.

## 6. Lệnh hay dùng
| Lệnh | Làm gì |
|---|---|
| `npm run dev` | Chạy app ở `http://localhost:5173` |
| `npm run build` / `npm run preview` | Build ra `dist/` / xem thử bản build |
| `npm test` | Chạy test một lần (`npx vitest run src/shared/utils/format.test.ts` cho một file) |
| `npm run lint` / `npm run typecheck` | Kiểm tra luật code / kiểu |
| `npm run format` | Định dạng code bằng Prettier |

## Cập nhật 2026-10-06: làm feature `auth`
Chi tiết feature xem `src/features/auth/context.md`. Thay đổi so với lúc init:

| Đường dẫn | Làm gì | Trạng thái |
|---|---|---|
| `vite.config.ts` | Proxy `/api` → `http://localhost:8000` (trùng `PORT` backend). **Không** dùng chunk `admin` (mục 5 cũ): mã quản trị tách nhờ lazy route | Đã sửa |
| `src/app/AdminRoot.tsx` | Gốc nhánh `/admin` (tải lazy): `RequireAuth` + `AdminLayout` + menu `ADMIN_NAV` + `AdminUserMenu` | Tạo mới |
| `src/app/routes.tsx` | Ghép `/admin/login`, `/admin/account`, nhóm route chỉ owner (`RequireRole`) | Đã sửa |
| `src/shared/components/layout/AdminLayout.tsx` | Nhận `navItems`, `showOwnerItems`, `actions` qua props (shared không import features). Responsive (2026-10-08): từ `md` trở lên có sidebar thu gọn được; điện thoại ẩn sidebar, nút ☰ trên thanh trên mở menu dạng ngăn kéo (đóng khi chọn mục, bấm nền tối hoặc Esc) | Đã sửa |
| `src/shared/components/ui/Button.tsx`, `TextField.tsx` | Nút có trạng thái loading; ô nhập có nhãn + lỗi, dùng với `register()` | Tạo mới |
| `src/shared/utils/error-messages.ts` | `ERROR_MESSAGES` theo mã lỗi API, `getErrorMessage(error)` | Tạo mới |
| `src/shared/utils/form-errors.ts` | `applyServerErrors`: gán `details` từ API vào đúng ô của form | Tạo mới |

Mục 5 "Chưa làm": `RequireAuth`, `RequireRole`, `ERROR_MESSAGES`, `Button` đã xong; chunk `admin` bỏ (thay bằng lazy route).

