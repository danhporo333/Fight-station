# Fight Station

Website cho quán chơi game **PS5**: khách xem thông tin quán, danh sách game, bảng giá giờ chơi, menu đồ ăn nước uống, chi nhánh và khuyến mãi. Chủ quán và nhân viên đăng nhập trang quản trị để tự cập nhật nội dung, không cần sửa code.

Giao diện tông **cam**, hiện đại, dùng tốt trên điện thoại.

> **Trạng thái:** đang phát triển. Đã xong khung dự án và tính năng **đăng nhập quản trị**, **thông tin quán**, **chi nhánh** và **game** (backend + frontend). Các tính năng nội dung đang được làm lần lượt (xem [Lộ trình](#lộ-trình)).

---

## Tính năng

| Tính năng | Khách xem | Quản trị | Trạng thái |
|---|---|---|---|
| Đăng nhập, phân quyền chủ quán / nhân viên, đổi mật khẩu | — | ✔ | ✅ Xong |
| Thông tin quán: giờ mở cửa, hotline, mạng xã hội | ✔ | Chủ quán sửa | ✅ Xong |
| Chi nhánh: địa chỉ, bản đồ, số máy PS5, phòng VIP | ✔ | Chủ quán sửa | ✅ Xong |
| Game: lọc theo thể loại, chi nhánh, tìm theo tên | ✔ | ✔ | ✅ Xong |
| Bảng giá giờ chơi theo gói | ✔ | Chủ quán sửa | ⏳ Chưa làm |
| Menu đồ ăn, nước uống (có trạng thái "tạm hết") | ✔ | ✔ | ✅ Xong |
| Khuyến mãi, sự kiện | ✔ | ✔ | ⏳ Chưa làm |

**Phân quyền:** *chủ quán* (owner) làm được mọi việc; *nhân viên* (staff) quản lý game, menu, khuyến mãi nhưng không sửa thông tin quán, chi nhánh, bảng giá. Quyền luôn được kiểm tra ở backend, giao diện chỉ ẩn bớt nút.

---

## Công nghệ

| Phần | Công nghệ |
|---|---|
| Backend | Node.js 24 LTS, Express 5, TypeScript (strict) |
| Database | MySQL 8, Prisma ORM 7 |
| Kiểm tra dữ liệu | Zod |
| Xác thực | JWT (HS256), mật khẩu hash bằng argon2id |
| Log | Pino |
| Frontend | React 19 + React Compiler, Vite 8, TypeScript (strict) |
| Giao diện | Tailwind CSS v4 (màu chủ đạo khai báo thành token `brand-*`) |
| Dữ liệu phía giao diện | TanStack Query, Zustand, Axios, React Router v7 |
| Form | React Hook Form + Zod |
| Test | Vitest, Supertest (BE), React Testing Library + MSW (FE) |

---

## Kiến trúc

```
Trình duyệt ──► Frontend (React SPA, :5173)
                   │  gọi /api/v1/... (dev: qua proxy của Vite)
                   ▼
                Backend (Express REST API, :8000)
                   │  Prisma
                   ▼
                MySQL
```

- **Hai project tách riêng** trong cùng một repo: `backend/` chỉ cung cấp REST API, `frontend/` chỉ gọi API.
- **Tổ chức theo tính năng (feature-based):** mỗi tính năng (`auth`, `game`, `menu`...) là một thư mục tự chứa đủ code của nó, cùng tên ở backend và frontend, nên dễ lần theo: bảng DB → endpoint → màn hình.
- **Backend:** mỗi request đi qua `routes → controller → service → repository → Prisma`; chỉ repository được chạm vào database.
- **Frontend:** `component → hook (TanStack Query) → service → http`; dữ liệu từ server chỉ nằm trong cache của TanStack Query.
- **Định dạng API thống nhất:** thành công `{ success, data, meta }`, lỗi `{ success: false, error: { code, message, details } }` với mã lỗi dạng `GAME_001`.

Chi tiết xem [backend/docs/BE-ARCHITECTURE.md](backend/docs/BE-ARCHITECTURE.md) và [frontend/docs/FE-ARCHITECTURE.md](frontend/docs/FE-ARCHITECTURE.md).

---

## Cấu trúc thư mục

```
.
├── 01-share-docs/        # Tài liệu dùng chung: API_SPEC.md (hợp đồng API), DATABASE.md (schema)
├── backend/
│   ├── prisma/           # schema.prisma, migrations/, seed.ts
│   ├── docs/             # Kiến trúc, quy tắc code, ghi chú setup
│   └── src/
│       ├── config/       # Đọc và kiểm tra biến môi trường
│       ├── core/         # Kết nối DB, logger, event bus
│       ├── shared/       # Middleware, lỗi, tiện ích dùng chung
│       └── features/     # auth, shop, branch, game, price-plan, menu, promotion
├── frontend/
│   ├── docs/             # Kiến trúc, quy tắc code, ghi chú setup
│   └── src/
│       ├── app/          # Khởi tạo app, provider, router
│       ├── pages/        # Trang ghép nhiều tính năng (trang chủ...)
│       ├── shared/       # Component, hook, API client, store dùng chung
│       └── features/     # cùng tên với backend
└── CLAUDE.md             # Điều hướng tài liệu cho Claude Code
```

Mỗi thư mục tính năng có file `context.md` mô tả: mục đích, endpoint, bảng DB, quy tắc nghiệp vụ và trạng thái (đã làm / chưa làm).

---

## Chạy dự án trên máy

### Yêu cầu
- **Node.js 24** trở lên
- **MySQL 8** (8.0.16 trở lên, cần CHECK constraint)

### 1. Tạo database

```sql
CREATE DATABASE fight_station CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

Collation `utf8mb4_0900_ai_ci` giúp tìm kiếm không phân biệt hoa thường và dấu (gõ "tekken" vẫn ra "Tekken").

### 2. Backend

```bash
cd backend
npm install                 # tự chạy prisma generate
cp .env.example .env        # rồi điền giá trị thật, xem bảng bên dưới
npx prisma migrate deploy   # tạo bảng
npx prisma db seed          # tạo tài khoản chủ quán đầu tiên
npm run dev
```

Thấy dòng `Application running on: http://localhost:8000/health` là chạy được.

| Biến trong `backend/.env` | Ý nghĩa |
|---|---|
| `PORT` | **Đặt `8000`** (proxy của frontend đang trỏ tới cổng này) |
| `DATABASE_URL` | `mysql://user:password@localhost:3306/fight_station` |
| `JWT_SECRET` | Chuỗi ngẫu nhiên ≥ 32 ký tự, ví dụ: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `JWT_EXPIRES_IN` | Thời gian sống của token, mặc định `1d` |
| `CORS_ORIGINS` | Origin được gọi API, dev: `http://localhost:5173` |
| `SEED_OWNER_USERNAME`, `SEED_OWNER_PASSWORD` | Tài khoản chủ quán tạo bởi seed (mật khẩu ≥ 8 ký tự) |

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=/api/v1 là đủ khi chạy dev
npm run dev
```

Mở **http://localhost:5173**. Trang quản trị: **http://localhost:5173/admin**, đăng nhập bằng tài khoản `SEED_OWNER_*` đã khai báo.

---

## Lệnh thường dùng

| Lệnh | Backend | Frontend |
|---|---|---|
| `npm run dev` | Chạy API, tự khởi động lại khi sửa code | Chạy giao diện ở cổng 5173 |
| `npm run build` | Build ra `dist/` | Build ra `dist/` |
| `npm test` | Chạy test (Vitest + Supertest) | Chạy test (Vitest + Testing Library) |
| `npm run lint` / `npm run typecheck` | Kiểm tra quy tắc code / kiểu | Như bên trái |
| `npm run format` | Định dạng code (Prettier) | Như bên trái |
| `npm run prisma:migrate -- --name <tên>` | Tạo migration khi đổi schema | — |
| `npx prisma db seed` | Tạo dữ liệu ban đầu (chạy lại vẫn an toàn) | — |

Kiểm tra nhanh backend: `GET http://localhost:8000/health` → `{ "status": "ok" }`. Mỗi response có header `X-Request-Id`, trùng với `requestId` trong log để tra lỗi.

---

## Tài liệu

| Muốn biết | Đọc |
|---|---|
| Tất cả endpoint, request/response, mã lỗi, phân quyền | [01-share-docs/API_SPEC.md](01-share-docs/API_SPEC.md) |
| Bảng, cột, quan hệ, quy tắc migration | [01-share-docs/DATABASE.md](01-share-docs/DATABASE.md) |
| Kiến trúc và quy tắc code backend | [backend/docs/](backend/docs/) |
| Kiến trúc và quy tắc code frontend | [frontend/docs/](frontend/docs/) |
| Chi tiết từng tính năng | `backend/src/features/<tên>/context.md`, `frontend/src/features/<tên>/context.md` |
| Đã setup gì, vì sao | [backend/docs/SETUP-NOTES.md](backend/docs/SETUP-NOTES.md), [frontend/docs/SETUP-NOTES.md](frontend/docs/SETUP-NOTES.md) |

---

## Quy ước khi đóng góp

- **Branch:** `<type>/<feature>-<mô-tả>`, ví dụ `feature/game-filter-by-branch`.
- **Commit** theo Conventional Commits, scope là tên tính năng: `feat(game): thêm lọc theo chi nhánh`, `fix(menu): sửa hiển thị giá`.
- **Trước khi mở PR:** `lint`, `typecheck`, `test`, `build` phải qua; đổi API thì cập nhật `API_SPEC.md`; đổi schema thì cập nhật `DATABASE.md` và kèm migration; đổi hành vi tính năng thì cập nhật `context.md` của tính năng đó.
- Không import file nội bộ của tính năng khác (chỉ qua `index.ts`); ESLint sẽ chặn.

Dự án dùng [Claude Code](https://claude.com/claude-code) để hỗ trợ phát triển. Các skill nằm trong `.claude/skills/`, `backend/.claude/skills/`, `frontend/.claude/skills/` (ví dụ `/be-crud <feature>`, `/fe-crud <feature>` để sinh CRUD theo đúng quy ước), danh sách xem [CLAUDE.md](CLAUDE.md).

---

## Lộ trình

- [x] Khung dự án backend và frontend
- [x] Đăng nhập, phân quyền, đổi mật khẩu
- [x] Thông tin quán (`shop`)
- [x] Chi nhánh (`branch`)
- [x] Game và thể loại (`game`)
- [ ] Bảng giá (`price-plan`)
- [x] Menu đồ ăn, nước uống (`menu`)
- [ ] Khuyến mãi (`promotion`)
- [ ] Test tự động đầy đủ cho từng tính năng
- [ ] Upload ảnh (hiện chỉ lưu đường dẫn ảnh)
