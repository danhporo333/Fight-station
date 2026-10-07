# Quy ước commit của Fight Station

Repo là monorepo: `backend/` (Express 5 + Prisma + MySQL) và `frontend/` (React + Vite), tài liệu dùng chung ở `01-share-docs/`.

**Toàn bộ commit message viết bằng tiếng Việt có dấu**, kể cả loại commit. Chỉ giữ nguyên các tên riêng trong code: tên feature/thư mục (`game`, `price-plan`), tên file, tên endpoint, tên thư viện (`Prisma`, `Vite`, `JWT`).

## Định dạng

```
<loại>(<phạm vi>): <mô tả ngắn>

<nội dung>

<chân trang>
```

- `loại`: chọn từ bảng bên dưới, viết thường.
- `phạm vi`: tên feature hoặc khu vực code, viết thường (xem mục "Nhận diện phạm vi").
- `mô tả ngắn`, `nội dung`, `chân trang`: tiếng Việt có dấu.

## Các loại commit

| Loại | Khi nào dùng | Ví dụ thay đổi |
|------|--------------|----------------|
| `tính năng` | Tính năng mới | Thêm endpoint, component, trang, model Prisma mới |
| `sửa lỗi` | Sửa lỗi | Sửa crash, sửa logic sai, xử lý trường hợp biên |
| `tái cấu trúc` | Sắp xếp lại code, không đổi hành vi | Đổi tên, tách hàm, sắp xếp lại thư mục |
| `tài liệu` | Tài liệu | README, `context.md`, `CLAUDE.md`, `01-share-docs/*`, `docs/*` |
| `định dạng` | Định dạng, không đổi code | Prettier, sửa lỗi ESLint, khoảng trắng |
| `kiểm thử` | Thêm/sửa test | File `*.test.ts`, `*.test.tsx` (Vitest) |
| `bảo trì` | Việc lặt vặt, bảo trì | Dependency, config, script, skill trong `.claude/` |
| `hiệu năng` | Cải thiện hiệu năng | Tối ưu query Prisma, giảm kích thước bundle |
| `tích hợp` | CI/CD | GitHub Actions |
| `đóng gói` | Hệ thống build | `vite.config.ts`, `tsconfig*.json`, Dockerfile |
| `hoàn tác` | Hoàn tác commit | Hoàn tác một commit trước đó |

## Tự nhận diện loại

| File/nội dung thay đổi | Loại |
|------------------------|------|
| Chỉ có `*.test.ts`, `*.test.tsx`, `src/test/*` | `kiểm thử` |
| Chỉ có `*.md` (README, `context.md`, `CLAUDE.md`, `01-share-docs/`, `docs/`) | `tài liệu` |
| Chỉ có `package.json`, `package-lock.json`, `eslint.config.js`, `.prettierrc.json`, `.env.example` | `bảo trì` |
| Chỉ có `.claude/` (skill, settings) | `bảo trì` |
| `vite.config.ts`, `tsconfig*.json`, `prisma.config.ts`, `Dockerfile` | `đóng gói` |
| `.github/workflows/*` | `tích hợp` |
| Thêm model trong `schema.prisma` + migration mới | `tính năng` |
| File mới + export mới (route, service, component, trang) | `tính năng` |
| Sửa logic có sẵn, xử lý lỗi | `sửa lỗi` |
| Đổi tên, di chuyển file, không đổi logic | `tái cấu trúc` |

Bỏ qua thư mục sinh tự động khi nhận diện: `backend/src/generated/`, `frontend/dist/`. Nếu chúng bị stage → cảnh báo người dùng.

## Nhận diện phạm vi

| Đường dẫn file | Phạm vi |
|----------------|---------|
| `backend/src/features/<tên>/*` | `<tên>` (ví dụ `auth`, `game`) |
| `frontend/src/features/<tên>/*` | `<tên>` |
| Cùng một feature ở cả backend và frontend | `<tên>` |
| `backend/prisma/*` (schema, migration) đi kèm một feature | `<tên>` của feature đó |
| `backend/prisma/*` đứng riêng | `csdl` |
| `backend/src/core/*`, `backend/src/shared/*`, `backend/src/config/*`, `backend/src/app.ts`, `server.ts` | `backend` |
| `frontend/src/app/*`, `frontend/src/shared/*`, `frontend/src/pages/*`, `frontend/src/styles/*` | `frontend` |
| `01-share-docs/API_SPEC.md` | `api` |
| `01-share-docs/DATABASE.md` | `csdl` |
| `.claude/*` | `claude` |
| Nhiều feature không liên quan | bỏ phạm vi, hoặc gợi ý tách commit |

Các feature hiện có: `auth`, `shop`, `branch`, `game`, `price-plan`, `menu`, `promotion`.

## Quy tắc mô tả ngắn

- Bắt đầu bằng động từ: "thêm", "sửa", "xóa", "cập nhật", "tách", "đổi tên"…
- Viết thường chữ cái đầu (trừ tên riêng như `README`, `JWT`, `Prisma`).
- Không chấm câu ở cuối.
- Tối đa 72 ký tự tính cả `loại(phạm vi): `.
- Đọc liền thành câu: "Commit này sẽ… <mô tả ngắn>".

## Quy tắc nội dung

- Cách dòng mô tả ngắn một dòng trống.
- Xuống dòng ở khoảng 72 ký tự.
- Giải thích **làm gì** và **tại sao**, không cần giải thích **làm thế nào**.
- Nhiều thay đổi thì dùng gạch đầu dòng.

## Chân trang

- Liên kết issue: `Liên quan: #12`.
- Thay đổi phá vỡ tương thích: thêm `!` sau phạm vi và dòng `PHÁ VỠ TƯƠNG THÍCH: <giải thích>`.

## Ví dụ

### Tính năng đơn giản
```
tính năng(game): thêm trang danh sách game cho khách
```

### Tính năng có nội dung
```
tính năng(auth): thêm endpoint làm mới JWT

- Thêm POST /api/auth/refresh
- Lưu refresh token vào bảng RefreshToken, xoay vòng mỗi lần dùng
- Refresh token hết hạn sau 7 ngày
```

### Sửa lỗi
```
sửa lỗi(price-plan): chặn giá giờ chơi âm

Form quản trị cho phép nhập giá âm khiến bảng giá ngoài
trang khách hiển thị sai.

Liên quan: #12
```

### Thay đổi phá vỡ tương thích
```
tính năng(api)!: đổi định dạng response sang dạng envelope

PHÁ VỠ TƯƠNG THÍCH: Mọi response API giờ được bọc trong
{ success, data, error }. Frontend cần cập nhật service.
```

### Thay đổi chung ở backend
```
tái cấu trúc(backend): tách middleware xử lý lỗi vào core

- Chuyển errorHandler sang src/core/middlewares
- Cập nhật import trong app.ts
```

### Nhiều phạm vi (hạn chế dùng)
```
bảo trì: cập nhật dependency cho cả backend và frontend

- Nâng Prisma lên bản mới
- Nâng Vite lên bản mới
```
