# SETUP-NOTES.md — Backend Fight Station

## 1. Tổng quan
Ngày 2026-10-06 đã dựng khung backend: cấu trúc thư mục theo feature, cài thư viện, file cấu hình và các module dùng chung (`config`, `core`, `shared`). Server chạy được, kể cả khi chưa có database; chưa có route feature nào.

> Ảnh chụp lúc init, có thể lỗi thời khi dự án phát triển. Nguồn chính xác là `BE-ARCHITECTURE.md`.

## 2. File và thư mục
| Đường dẫn | Làm gì | Vì sao cần | Trạng thái |
|---|---|---|---|
| `package.json` | Khai báo gói, script, `"type": "module"` | Chạy project bằng ESM, có script dev/build/test | Đã sửa (đổi script, gỡ nodemon/ts-node/dotenv) |
| `tsconfig.json` | Cấu hình TypeScript: `strict`, alias `@/` → `src/` | Bắt lỗi kiểu sớm, import ngắn gọn | Đã sửa (viết lại) |
| `tsconfig.build.json` | Cấu hình riêng khi build ra `dist/` | Bỏ file test khỏi bản build | Tạo mới |
| `.gitignore` | Bỏ qua `.env`, `dist/`, `src/generated/` | Không commit secret và file sinh tự động | Đã sửa |
| `.env.example` | Mẫu biến môi trường, không có giá trị thật | Người mới biết cần điền biến nào | Tạo mới |
| `.env` | Giá trị thật khi chạy máy mình | App đọc lúc khởi động | Đã sửa (thêm biến còn thiếu) |
| `eslint.config.js` | Luật kiểm tra code (lint) | Chặn import sai giữa feature, cấm `console.log` | Tạo mới |
| `.prettierrc.json`, `.prettierignore` | Định dạng code tự động | Code cùng một kiểu, review dễ hơn | Tạo mới |
| `vitest.config.ts` | Cấu hình test, alias `@/`, biến môi trường giả | Test chạy không cần `.env` hay database | Tạo mới |
| `prisma.config.ts` | Cấu hình Prisma CLI (đường dẫn schema, `DATABASE_URL`) | Prisma 7 bắt buộc có file này | Tạo mới |
| `prisma/schema.prisma` | Chỉ có `generator` và `datasource` MySQL | Chỗ để thêm model khi làm feature | Tạo mới |
| `src/generated/prisma/` | Prisma Client sinh tự động | Code gọi database có kiểu | Sinh khi `npm install` |
| `src/config/env.ts` | Đọc và kiểm tra `process.env` bằng Zod | Thiếu/sai biến thì dừng app ngay, báo rõ lỗi | Tạo mới |
| `src/config/index.ts` | Gom hằng số: CORS, JWT, phân trang, rate limit | Sửa cấu hình ở một chỗ | Tạo mới |
| `src/core/database/prisma.ts` | Một PrismaClient duy nhất (singleton) qua adapter mariadb, giờ UTC | Tránh mở nhiều kết nối; Prisma 7 cần adapter | Tạo mới |
| `src/core/logger/index.ts` | Logger Pino, che (redact) mật khẩu, token | Log dạng JSON, không lộ dữ liệu nhạy cảm | Tạo mới |
| `src/core/events/event-bus.ts` | Event bus trong process, có kiểu | Feature báo tin cho nhau mà không import nhau | Tạo mới |
| `src/core/cache/` | Thư mục trống | Dự phòng cache, chưa dùng | Tạo mới |
| `src/shared/errors/` | `AppError` và các lỗi 400/401/403/404/409, mã `COMMON_*` | Service ném lỗi có mã, client dựa vào `code` | Tạo mới |
| `src/shared/middlewares/request-id.ts` | Gắn `X-Request-Id` cho mỗi request | Tra log theo từng request | Tạo mới |
| `src/shared/middlewares/request-logger.ts` | Ghi log mỗi request (pino-http) | Biết request nào chậm, lỗi | Tạo mới |
| `src/shared/middlewares/validate.ts` | Kiểm tra body/query/params bằng Zod → `COMMON_001` | Controller chỉ nhận dữ liệu đã hợp lệ | Tạo mới |
| `src/shared/middlewares/rate-limit.ts` | Giới hạn 300 lần/phút; login 10 lần/15 phút | Chống spam, dò mật khẩu → `COMMON_004` | Tạo mới |
| `src/shared/middlewares/not-found.ts` | Route không có → `COMMON_003` | Lỗi 404 đúng định dạng chung | Tạo mới |
| `src/shared/middlewares/error-handler.ts` | Đổi mọi lỗi thành `{ success: false, error }` | Một chỗ duy nhất xử lý lỗi, không lộ stack | Tạo mới |
| `src/shared/middlewares/require-admin.ts` | Placeholder, đang chặn mọi request | Chờ feature `auth` làm JWT; chặn sẵn cho an toàn | Tạo mới |
| `src/shared/utils/response.ts` | `ok`, `created`, `noContent` | Response luôn đúng dạng `{ success, data, meta }` | Tạo mới |
| `src/shared/utils/pagination.ts` | Đọc `page`, `limit`, `sort`; tính `meta` | Endpoint danh sách dùng chung một cách | Tạo mới |
| `src/shared/types/express.d.ts` | Thêm `req.id`, `req.admin` vào kiểu Express | TypeScript biết các trường tự gắn | Tạo mới |
| `src/features/*` (7 thư mục) | Thư mục trống có `.gitkeep` | Chỗ để `/be-crud` thêm feature | Tạo mới |
| `src/app.ts` | `createApp()`: gắn middleware và route | Tách khỏi server để test bằng Supertest | Đã sửa (thay hello world) |
| `src/server.ts` | Mở cổng, tắt an toàn khi nhận `SIGTERM`/`SIGINT` | Không cắt ngang request, đóng kết nối DB | Tạo mới |
| `src/app.test.ts` | Test `/health`, 404, JSON sai | Kiểm tra khung chạy đúng | Tạo mới |
| `README.md`, `CLAUDE.md`, `docs/BE-*.md` | Tài liệu sẵn có | — | Đã có, bỏ qua |

## 3. Dependencies
| Gói | Dùng để làm gì | Loại |
|---|---|---|
| `express` 5 | Web framework, tự chuyển lỗi async tới error handler | runtime |
| `zod` | Kiểm tra dữ liệu vào và biến môi trường | runtime |
| `pino`, `pino-http` | Ghi log JSON, log từng request | runtime |
| `helmet` | Thêm header bảo mật | runtime |
| `cors` | Chỉ cho các origin trong `CORS_ORIGINS` gọi API | runtime |
| `express-rate-limit` | Giới hạn số lần gọi | runtime |
| `@prisma/client`, `@prisma/adapter-mariadb` | Truy vấn MySQL qua Prisma 7 | runtime |
| `jsonwebtoken`, `argon2` | JWT và hash mật khẩu (cài sẵn cho feature `auth`) | runtime |
| `typescript` ~6.0 | Biên dịch TS (TS 7 chưa hợp với typescript-eslint) | dev |
| `tsx` | Chạy TS trực tiếp, tự khởi động lại khi sửa file | dev |
| `tsc-alias` | Đổi `@/` thành đường dẫn thật sau khi build | dev |
| `prisma` 7.10 | CLI: generate, migrate | dev |
| `@types/*` | Kiểu cho node, express, cors, jsonwebtoken, supertest | dev |
| `vitest`, `supertest` | Chạy test, gọi HTTP vào app khi test | dev |
| `eslint` 9, `typescript-eslint`, `@eslint/js` | Lint code TS | dev |
| `eslint-plugin-import`, `eslint-import-resolver-typescript` | Luật `no-restricted-paths`, hiểu alias `@/` | dev |
| `prettier`, `eslint-config-prettier` | Định dạng code, tắt luật lint trùng với Prettier | dev |

## 4. Luồng chạy
Một request đi qua các middleware (middleware: hàm chạy trước khi request tới controller) theo thứ tự:

1. `requestId`: gắn mã request, trả lại ở header `X-Request-Id`.
2. `pino-http`: ghi log request khi xong.
3. `helmet` → `cors`: header bảo mật, kiểm tra origin.
4. `express.json`: đọc body JSON tối đa 100 KB (sai cú pháp → `COMMON_002`, quá lớn → `COMMON_005`).
5. `/health` trả `{ status: "ok" }`; `/api/v1/*` qua rate limit rồi tới route của feature.
6. Trong feature (sau này): `requireAdmin` → `validate` → controller → service → repository → Prisma → MySQL.
7. Không khớp route nào → `notFound` (`COMMON_003`). Có lỗi ở bất kỳ đâu → `errorHandler` trả JSON lỗi.

## 5. Chưa làm
- Model Prisma và migration (thêm theo từng feature).
- Routes, controller, service, repository của 7 feature → `/be-crud`.
- Feature `auth`: đăng nhập, JWT, hash mật khẩu, `requireAdmin` thật và `requireOwner`.
- Trả `415` khi sai Content-Type; header `Cache-Control` cho GET công khai và quản trị.
- Seed dữ liệu (`prisma/seed.ts`), Swagger.

## 6. Lệnh hay dùng
| Lệnh | Làm gì |
|---|---|
| `npm run dev` | Chạy server, tự khởi động lại khi sửa code |
| `npm run build` / `npm start` | Build ra `dist/` / chạy bản build |
| `npm test` | Chạy test một lần (`npx vitest run src/app.test.ts` cho một file) |
| `npm run lint` / `npm run typecheck` | Kiểm tra luật code / kiểu |
| `npm run format` | Định dạng code bằng Prettier |
| `npm run prisma:migrate -- --name <tên>` | Tạo migration khi dev |
| `npm run prisma:deploy` | Áp migration ở production |

## Cập nhật 2026-10-06: link kiểm tra khi khởi động
Khi server lên, terminal in đúng một dòng để bấm mở trình duyệt:

```
[11:03:13] INFO: Application running on: http://localhost:8000/health
```

Bấm vào link sẽ thấy `{"status":"ok"}`, nghĩa là server chạy thành công. Cổng lấy từ `PORT` trong `.env`.

| Đường dẫn / Gói | Làm gì | Vì sao cần | Trạng thái |
|---|---|---|---|
| `pino-pretty` | Định dạng log cho dễ đọc (màu, giờ), chỉ bật khi `NODE_ENV=development` | Dòng log ngắn gọn, link bấm được; production vẫn ghi JSON | Gói dev, cài mới |
| `src/core/logger/index.ts` | Thêm `transport: pino-pretty` cho môi trường development | Như trên | Đã sửa |
| `src/server.ts` | Đổi log khởi động thành `Application running on: http://localhost:${PORT}/health` | Người mới biết ngay cách kiểm tra server | Đã sửa |

## Cập nhật 2026-10-06: làm feature `auth`
Placeholder `src/shared/middlewares/require-admin.ts` ở bảng mục 2 **đã bị xóa**, thay bằng `auth-guards.ts`. Chi tiết feature xem `src/features/auth/context.md`.

| Đường dẫn | Làm gì | Trạng thái |
|---|---|---|
| `src/shared/middlewares/auth-guards.ts` | `createAuthGuards(lookup)` → `requireAdmin`, `requireOwner`, `optionalAdmin` (guard: hàm kiểm tra quyền trước khi vào controller) | Tạo mới |
| `src/shared/middlewares/cache-control.ts` | `publicCache` (GET công khai, 60 giây), `noStore` | Tạo mới |
| `src/shared/utils/password.ts`, `jwt.ts` | Hash mật khẩu argon2id; ký/kiểm tra JWT | Tạo mới |
| `src/app.ts` | `createApp(db)` nối dây `auth`, tạo `guards` truyền cho router các feature | Đã sửa |
| `prisma/seed.ts` | Tạo owner đầu tiên từ `SEED_OWNER_*` trong `.env` | Tạo mới |
| `prisma/migrations/` | Migration đầu tiên `create_admin_user_table` | Tạo mới |

Lệnh mới: `npx prisma db seed` (tạo dữ liệu ban đầu, chạy lại nhiều lần vẫn an toàn).
