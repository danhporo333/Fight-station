---
name: "init-base"
description: "Setup cấu trúc thư mục, dependencies và config cho backend (Express 5 + Prisma + MySQL) hoặc frontend (React + Vite) của dự án Fight Station, theo kiến trúc feature-based. Không viết code feature. Dùng khi user nói \"init backend\", \"init frontend\", \"setup structure\", \"scaffold project\", \"setup environment\", \"khởi tạo dự án\", \"setup môi trường\".\n"
argument-hint: "[frontend|backend]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

# Setup Project Architecture & Environment — Fight Station

Dự án: website quán PS5. Khách xem game, bảng giá, menu, chi nhánh, khuyến mãi; chủ quán đăng nhập trang quản trị để thêm/sửa/xóa.

**Phạm vi:** chỉ Structure + Dependencies + Configs. KHÔNG viết code feature.

Skill này làm:

- ✅ Cấu trúc thư mục (feature-based)
- ✅ Cài dependencies
- ✅ File config (.env.example, tsconfig, ESLint, Prettier...)
- ✅ Module core/shared ở mức tối thiểu, chạy được
- ❌ KHÔNG viết code feature (dùng `/be-crud` hoặc `/fe-crud` sau, nếu đã có)

Các feature của dự án (backend và frontend dùng cùng tên): `auth`, `shop`, `branch`, `game` (gồm `game_category`, `branch_game`), `price-plan`, `menu`, `promotion`.

## Pre-flight Checks

1. **Có argument chưa?** Phải là `frontend` hoặc `backend`
2. **Thư mục project có tồn tại không?**
   - Backend: `backend/`
   - Frontend: `frontend/`
3. **Project đã khởi tạo chưa?** Kiểm tra `package.json`
   - Chưa có → báo lỗi và gợi ý:
     - Backend: `mkdir backend && cd backend && npm init -y`
     - Frontend: `npm create vite@latest frontend -- --template react-ts`
4. **Các file docs có đủ không?** (xem mục Required Reading). Thiếu file nào thì liệt kê và dừng.

Cấu trúc repo mong đợi:

```
01-share-docs/   # DATABASE.md, API_SPEC.md
backend/docs/    # BE-PROJECT-RULES.md, BE-ARCHITECTURE.md, CLAUDE.md
frontend/docs/   # FE-PROJECT-RULES.md, FE-ARCHITECTURE.md, CLAUDE.md
```

Nếu tên thư mục thực tế khác, hỏi user thay vì đoán.

---

## Task: Backend Scaffolding

Stack: TypeScript (strict) · Node.js 24 LTS · Express 5 · Prisma + MySQL 8.4 · Zod · Pino · Vitest + Supertest.

### Required Reading (ĐỌC TRƯỚC)

| Doc                                | Mục đích                                                               |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `01-share-docs/DATABASE.md`        | Schema, tên bảng, quy ước đặt tên, migration                           |
| `01-share-docs/API_SPEC.md`        | Endpoint, định dạng response, mã lỗi `[FEATURE]_[NUMBER]`, query param |
| `backend/docs/BE-PROJECT-RULES.md` | Quy ước code, pattern bắt buộc, anti-pattern                           |
| `backend/docs/BE-ARCHITECTURE.md`  | Cấu trúc thư mục, chuỗi middleware, DI, config                         |

### Workflow

1. Đọc hết docs ở trên để hiểu quy ước của dự án
2. Quét project hiện tại xem đã có gì
3. **Cài dependencies còn thiếu** (xem bên dưới)
4. **Tạo cấu trúc thư mục** theo quy định tại `BE-ARCHITECTURE.md`:
   - `src/features/{auth,shop,branch,game,price-plan,menu,promotion}/` (thư mục rỗng, thêm `.gitkeep`)
   - `src/config/`
   - `src/core/{database,logger,events,cache}/` (`cache/` chỉ tạo thư mục, chưa dùng)
   - `src/shared/{middlewares,errors,utils,types}/`
   - `prisma/` (ngoài `src/`)
5. **Setup file config**:
   - `.env.example` đủ biến: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `LOG_LEVEL`
   - `.gitignore` có `.env`
   - `tsconfig.json`: `strict: true`, alias `@/` → `src/`
   - ESLint có `import/no-restricted-paths` (feature không import nội bộ feature khác; `shared`, `core`, `config` không import `features`) + Prettier
   - `vitest.config.ts` có alias `@/`
   - `prisma/schema.prisma`: chỉ `generator` và `datasource` MySQL, chưa có model
   - `package.json` scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`
6. **Setup module core** (tối thiểu, dùng được ngay):
   - `config/env.ts`: Zod parse `process.env`, thiếu/sai biến thì dừng app (nơi DUY NHẤT đọc `process.env`)
   - `core/database/prisma.ts`: PrismaClient singleton (chỉ khai báo, không gọi `$connect` lúc khởi động)
   - `core/logger/index.ts`: Pino, `redact` các trường `password`, `password_hash`, `authorization`, `token`
   - `core/events/event-bus.ts`: event bus trong process (EventEmitter có kiểu)
7. **Setup module shared** (tối thiểu):
   - `shared/errors/`: `AppError` và `NotFoundError` 404, `ValidationError` 400, `ConflictError` 409, `UnauthorizedError` 401, `ForbiddenError` 403; `error-codes.ts` chỉ chứa mã `COMMON_*` (mã của feature thêm khi làm feature)
   - `shared/middlewares/`: `request-id`, `request-logger` (pino-http), `validate` (Zod → `COMMON_001` kèm `details`), `not-found` (`COMMON_003`), `error-handler`; `require-admin` chỉ là placeholder có TODO (làm khi tới feature `auth`)
   - `shared/utils/response.ts`: `ok`, `created`, `noContent` theo envelope `{ success, data, meta }`
   - `shared/utils/pagination.ts`: đọc `page`, `limit` (mặc định 1 và 20, tối đa 100), `sort`
   - `shared/types/express.d.ts`: mở rộng `req.id`, `req.admin`
8. **Tạo `app.ts` và `server.ts`**:
   - `app.ts` export `createApp()` (composition root, chưa có route feature), gắn middleware theo thứ tự: `requestId → pino-http → helmet → cors → express.json({ limit: '100kb' }) → rate-limit → routes → notFound → errorHandler`
   - `GET /health` nằm ngoài `/api/v1`, trả `200 { "status": "ok" }`; route feature sau này gắn dưới `/api/v1`
   - `server.ts`: listen cổng, graceful shutdown (`SIGTERM`/`SIGINT` → đóng HTTP → `prisma.$disconnect()`)
   - Khi server listen xong, log đúng một dòng: `Application running on: http://localhost:${PORT}/health` (dùng `logger.info`, không dùng `console.log`). Dòng này in ra terminal để user bấm vào mở trình duyệt; `/health` trả `200 { "status": "ok" }` nên bấm vào là thấy trạng thái thành công, không lỗi. Ở môi trường `development`, Pino dùng `pino-pretty` để dòng log dễ đọc và link bấm được
9. Giữ nguyên file đang có, KHÔNG ghi đè
10. **Viết `backend/docs/SETUP-NOTES.md`** giải thích những gì vừa làm (xem mục Ghi chú giải thích)

**KHÔNG làm (để `/be-crud` làm sau):**

- Model Prisma và migration
- Routes, controller, service, repository của feature
- Logic đăng nhập, JWT, hash mật khẩu

### Install Missing Dependencies

Đọc `package.json` trước, chỉ cài thứ còn thiếu:

```bash
# Runtime
npm install express@5 zod pino pino-http helmet cors express-rate-limit
npm install @prisma/client

# Auth (chỉ cài ở bước này để sẵn, chưa viết logic)
npm install jsonwebtoken argon2

# Dev: TypeScript, Prisma CLI, chạy TS
npm install -D typescript tsx tsc-alias prisma @types/node @types/express @types/cors @types/jsonwebtoken

# Test
npm install -D vitest supertest @types/supertest

# Lint / format
npm install -D eslint typescript-eslint eslint-plugin-import prettier eslint-config-prettier
```

Lưu ý:

- Node 24 đọc `.env` bằng `node --env-file=.env`, không cần `dotenv`. Script dev: `tsx watch --env-file=.env src/server.ts`
- `tsc` không đổi alias `@/` khi build, nên dùng `tsc-alias` sau `tsc`
- Cách khởi tạo PrismaClient phụ thuộc phiên bản Prisma đã cài (bản mới có thể cần `prisma.config.ts` hoặc driver adapter MySQL). Xem tài liệu của đúng phiên bản trước khi viết `core/database/prisma.ts`
- Mật khẩu dùng argon2id (hoặc bcrypt) theo `DATABASE.md`

**Trước khi cài:**

- Liệt kê những gói sẽ cài và hỏi user xác nhận

### Validation

- [ ] Cấu trúc thư mục khớp `BE-ARCHITECTURE.md`
- [ ] Dependencies đã cài đủ
- [ ] `.env.example` đủ biến, `.env` nằm trong `.gitignore`
- [ ] `prisma/schema.prisma` có generator + datasource MySQL, `npx prisma validate` pass
- [ ] `npm run typecheck` và `npm run lint` pass
- [ ] Chạy `npm run dev` → server lên không lỗi (không cần có database), `GET /health` trả 200
- [ ] Gọi route không tồn tại → trả `{ "success": false, "error": { "code": "COMMON_003", ... } }`
- [ ] Có `backend/docs/SETUP-NOTES.md`
- [ ] Sẵn sàng thêm feature bằng `/be-crud`

---

## Task: Frontend Scaffolding

Stack: React 19 + TypeScript (strict) + Vite · React Router · TanStack Query · Zustand · Tailwind CSS · Axios · React Hook Form + Zod · Vitest + React Testing Library + MSW.

### Required Reading (ĐỌC TRƯỚC)

| Doc                                 | Mục đích                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| `01-share-docs/API_SPEC.md`         | Endpoint, mã lỗi, định dạng response, phân quyền Admin/Owner |
| `frontend/docs/FE-PROJECT-RULES.md` | Quy ước code, quy tắc state, anti-pattern                    |
| `frontend/docs/FE-ARCHITECTURE.md`  | Cấu trúc thư mục, routing, tầng API, state                   |

### Workflow

1. Đọc hết docs ở trên để hiểu quy ước của dự án
2. Quét project hiện tại xem đã có gì
3. **Cài dependencies còn thiếu** (xem bên dưới)
4. **Tạo cấu trúc thư mục** theo quy định tại `FE-ARCHITECTURE.md`:
   - `src/app/`, `src/pages/`
   - `src/features/{auth,shop,branch,game,price-plan,menu,promotion}/` (thư mục rỗng, thêm `.gitkeep`)
   - `src/shared/{components/ui,components/layout,hooks,services/api,stores,types,utils}/`
   - `src/assets/`, `src/styles/`
5. **Setup file config**:
   - `.env.example`: `VITE_API_URL=/api/v1` (dev đi qua proxy; production ghi URL đầy đủ, ví dụ `https://api.fightstation.vn/api/v1`)
   - Path alias `@/` → `src/` trong `tsconfig` và `vite.config.ts`
   - `vite.config.ts`: dev proxy `/api` → `http://localhost:3000`, `manualChunks` tách `vendor` (chunk `admin` thêm khi có trang quản trị)
   - Tailwind: nếu dùng v4 thì plugin `@tailwindcss/vite` và `@import "tailwindcss";` trong `src/styles/index.css`, token màu cam (`brand-50` … `brand-900`) khai báo bằng `@theme` (không có `tailwind.config`). Nếu project đang dùng v3 thì khai báo token trong `tailwind.config`
   - ESLint có `no-restricted-imports` chặn mẫu `@/features/*/*` (chỉ được import qua `index.ts`)
   - Vitest: môi trường `jsdom`, file setup nạp `@testing-library/jest-dom`
   - `package.json` scripts: `dev`, `build`, `lint`, `typecheck`, `test`
6. **Setup module shared** (tối thiểu, dùng được ngay):
   - `shared/services/api/http.ts`: Axios instance, interceptor gắn `Authorization: Bearer`, bóc `{ success, data, meta }`, lỗi thành `ApiError`; gặp `AUTH_002`/`AUTH_003` thì phát `auth:expired`
   - `shared/services/api/api-error.ts`: class `ApiError` (`code`, `message`, `details`)
   - `shared/types/api.types.ts`: `Meta`, `Paged<T>`, `ApiErrorBody`
   - `shared/stores/auth.store.ts` (Zustand `persist`, key `fs-auth`: `accessToken`, `admin`) và `ui.store.ts`
   - `shared/utils/`: `formatVnd` (15000 → `15.000đ`), `formatDate`, `event-bus.ts`
   - `shared/hooks/`: `useDebounce`, `useDocumentTitle`
   - `shared/components/ErrorBoundary.tsx`
7. **Setup app và routing**:
   - `app/main.tsx`, `app/App.tsx`
   - `app/providers.tsx`: `ErrorBoundary` → `QueryClientProvider` (`staleTime` 60s) → `Toaster`; lắng nghe `auth:expired` để xóa token và chuyển về `/admin/login`
   - `app/routes.tsx`: `createBrowserRouter`, chỉ có layout, một trang placeholder và route `*` (NotFoundPage)
8. **Setup layout** (tối thiểu): `PublicLayout` và `AdminLayout` (wrapper có `<Outlet />`)
9. Giữ nguyên file đang có, KHÔNG ghi đè
10. **Viết `frontend/docs/SETUP-NOTES.md`** giải thích những gì vừa làm (xem mục Ghi chú giải thích)

**KHÔNG làm (để `/fe-crud` làm sau):**

- Component, page, hook, service, schema của feature
- `RequireAuth`, `RequireRole` (thuộc feature `auth`)
- Route của từng feature

### Install Missing Dependencies

Đọc `package.json` trước, chỉ cài thứ còn thiếu:

```bash
# Routing, server state, HTTP
npm install react-router @tanstack/react-query axios

# Form + validation
npm install react-hook-form zod @hookform/resolvers

# Client state
npm install zustand

# Styling (Tailwind v4)
npm install tailwindcss @tailwindcss/vite

# Icons (tùy chọn)
npm install lucide-react

# Dev: types, test, lint
npm install -D @types/node vitest jsdom msw
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D prettier eslint-config-prettier eslint-plugin-import
```

**Trước khi cài:**

- Liệt kê những gói sẽ cài và hỏi user xác nhận

### Validation

- [ ] Cấu trúc thư mục khớp `FE-ARCHITECTURE.md`
- [ ] Dependencies đã cài đủ
- [ ] `.env.example` có `VITE_API_URL`
- [ ] Axios instance có interceptor, lỗi trả về là `ApiError`
- [ ] TanStack Query client đã cấu hình, `Providers` bọc app
- [ ] Router chạy, route lạ hiện NotFoundPage
- [ ] `npm run typecheck` và `npm run lint` pass
- [ ] Chạy `npm run dev` → app lên không lỗi
- [ ] Có `frontend/docs/SETUP-NOTES.md`
- [ ] Sẵn sàng thêm feature bằng `/fe-crud`

---

## Ghi chú giải thích (SETUP-NOTES.md)

Sau khi setup xong, tạo `{backend|frontend}/docs/SETUP-NOTES.md` bằng tiếng Việt để người mới đọc hiểu vừa có gì và vì sao. Đây là tài liệu tham khảo: KHÔNG thêm vào mục "Bắt buộc đọc" của `CLAUDE.md`.

Nội dung theo thứ tự:

1. **Tổng quan**: 2-3 câu, đã setup gì, ngày chạy. Ghi chú: "Ảnh chụp lúc init, có thể lỗi thời khi dự án phát triển. Nguồn chính xác là `*-ARCHITECTURE.md`."
2. **Bảng file/thư mục**: `Đường dẫn | Làm gì | Vì sao cần | Trạng thái` (Tạo mới / Đã sửa / Đã có, bỏ qua)
3. **Bảng dependencies**: `Gói | Dùng để làm gì | Loại` (runtime / dev)
4. **Luồng chạy**: vài dòng chữ. Backend: một request đi qua những middleware nào rồi tới đâu. Frontend: dữ liệu đi từ component tới API và quay về ra sao
5. **Chưa làm**: những gì để `/be-crud` hoặc `/fe-crud` làm sau
6. **Lệnh hay dùng**: `dev`, `build`, `test`, `lint`, `typecheck`

Quy tắc viết:

- Câu ngắn, từ đơn giản; thuật ngữ khó thì giải nghĩa ở lần đầu (ví dụ: "middleware: hàm chạy trước khi request tới controller")
- Mỗi file hoặc gói một dòng, không dài quá khoảng 120 dòng
- Nếu `SETUP-NOTES.md` đã tồn tại: KHÔNG ghi đè, thêm một mục mới ở cuối kèm ngày

---

## Output

Sau khi xong, báo cáo theo mẫu:

```
✅ Setup {Backend|Frontend} xong!

📁 Vị trí: ./{backend|frontend}/

📦 Dependencies đã cài:
- [danh sách gói mới]

📂 Thư mục đã tạo:
- src/features/ (rỗng, 7 feature)
- src/core/ hoặc src/app/ ...
- [các thư mục khác]

⚙️  Config đã tạo:
- .env.example
- [các file config khác]

📖 Giải thích từng file: xem {backend|frontend}/docs/SETUP-NOTES.md

⚠️  Bỏ qua (đã tồn tại):
- [danh sách]

🚀 Bước tiếp theo:
1. cp .env.example .env
2. Điền giá trị thật vào .env (backend: DATABASE_URL, JWT_SECRET ≥ 32 ký tự)
3. npm run dev để kiểm tra
4. Backend: tạo database MySQL rồi chạy migration khi có model; thêm feature bằng /be-crud hoặc /fe-crud
```

---

## Quy tắc quan trọng

1. **KHÔNG xóa hoặc ghi đè file đã có**
2. **Hỏi trước khi sửa file đã có** (ví dụ `package.json`, `vite.config.ts`, `tsconfig.json`)
3. **Báo những gì đã bỏ qua** để user biết cái gì đã tồn tại
4. **Giữ code mẫu đang chạy được** (hello world của Vite) cho tới khi user đồng ý thay
5. Mọi quyết định phải bám `PROJECT-RULES.md` và `ARCHITECTURE.md`; nếu docs mâu thuẫn nhau thì hỏi user, không tự chọn
6. Không đưa secret thật vào bất kỳ file nào được commit
7. Mỗi lần tạo hoặc sửa file, nói bằng tiếng Việt: file làm gì, vì sao dự án cần nó (1-2 câu, từ đơn giản). Khi sửa file đã có, nói rõ đã thêm hoặc đổi gì
8. Luôn tạo `SETUP-NOTES.md` ở bước cuối (xem mục Ghi chú giải thích)

## Xử lý lỗi

| Lỗi                       | Hành động                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Thiếu argument            | Hỏi: "Project nào? `/init-base backend` hay `/init-base frontend`"                                         |
| Không tìm thấy file docs  | Liệt kê file thiếu và yêu cầu user tạo trước                                                               |
| Không có `package.json`   | Báo: "Không thấy package.json. Đây có phải đúng thư mục không?" và gợi ý lệnh tạo project (xem Pre-flight) |
| Không có kết nối database | Không phải lỗi của bước này: server vẫn phải chạy được và `/health` vẫn trả 200                            |
