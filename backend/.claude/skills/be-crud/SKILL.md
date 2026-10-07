---
name: be-crud
description: >
  Sinh CRUD backend cho một feature của Fight Station (Express 5 + Prisma + MySQL + Zod):
  model Prisma + migration, dto, entity, repository, service, controller, routes, index.ts,
  nối dây trong app.ts và cập nhật context.md. Dùng khi user nói "tạo crud", "tạo feature",
  "add feature", "generate crud", "add entity", "làm API cho <feature>", hoặc /be-crud <feature>.
argument-hint: "[auth|shop|branch|game|price-plan|menu|promotion]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Sinh CRUD backend — Fight Station

> Skill nằm trong `backend/.claude/skills/`: mọi đường dẫn bên dưới tính từ thư mục `backend/`, mọi lệnh chạy trong `backend/`.

**Phạm vi:** một feature mỗi lần, từ bảng DB tới endpoint chạy được. Không viết test (để `/be-test`), không đụng frontend (để `/fe-crud`).

Feature hợp lệ: `auth`, `shop`, `branch`, `game` (gồm `game_category`, `branch_game`), `price-plan`, `menu`, `promotion`.
Thứ tự nên làm: `auth` → `shop` → `branch` → `game` → `price-plan` → `menu` → `promotion` (`auth` trước vì mọi route quản trị cần `requireAdmin`; `branch` trước `game` vì `game` cần `BranchLookup`).

## Pre-flight Checks

1. **Có argument chưa?** Thiếu → hỏi: "Feature nào? Ví dụ `/be-crud game`". Tên không thuộc danh sách trên → hỏi lại, không tự tạo feature mới.
2. **Đã init chưa?** Phải có `src/features/`, `src/app.ts`, `prisma/schema.prisma`. Thiếu → gợi ý chạy `/init-base backend` trước.
3. **Feature đã có code chưa?** Xem `src/features/<feature>/`:
   - Chỉ có `context.md` (dòng đầu "⏳ Chưa cài đặt") → làm bình thường.
   - Đã có file `.ts` → hỏi user: bổ sung phần còn thiếu hay dừng. **Không ghi đè** file đã có.
4. **Phụ thuộc đã sẵn sàng chưa?** (đọc mục "Phụ thuộc" trong `context.md`)
   - Route cần quyền Admin/Owner thì feature `auth` phải xong (có `src/shared/middlewares/auth-guards.ts` và `createAuthGuards` trong `src/app.ts`). Chưa có → đề nghị làm `auth` trước.
   - `game` cần `branch` đã có `index.ts` export service thỏa `BranchLookup`. Chưa có → đề nghị làm `branch` trước.
5. **"Câu hỏi còn mở" trong `context.md`?** Hỏi user chốt **trước khi** viết code, không tự chọn.

## Required Reading (ĐỌC TRƯỚC)

| File | Lấy gì |
|---|---|
| `src/features/<feature>/context.md` | Endpoint, bảng, mã lỗi, business rule, phụ thuộc, câu hỏi còn mở |
| `../01-share-docs/DATABASE.md` | Cột, kiểu, ràng buộc, index, ON DELETE, quy ước Prisma (`@map`, `map:` cho index, CHECK) |
| `../01-share-docs/API_SPEC.md` | Request/response mẫu (mục 7), query param chung (mục 3), envelope (mục 4), mã lỗi (mục 5), phân quyền |
| `docs/BE-PROJECT-RULES.md` | Quy tắc bắt buộc, anti-pattern, đặt tên |
| `docs/BE-ARCHITECTURE.md` | Giải phẫu feature (mục 3), giao tiếp giữa feature (mục 5), DI và chuỗi middleware (mục 8) |

Rồi đọc code đã có để làm theo đúng mẫu: `src/app.ts`, `src/shared/` (errors, middlewares, utils), `src/core/`, `prisma/schema.prisma`, và **feature đã làm xong gần nhất** (nếu có). Code đã có là chuẩn; mẫu trong skill này chỉ là gợi ý.

## Workflow

### Bước 1: Lập kế hoạch và xin xác nhận
Liệt kê cho user (ngắn gọn) rồi chờ đồng ý:
- Model Prisma sẽ thêm và tên migration
- File sẽ tạo trong `src/features/<feature>/`
- File có sẵn sẽ sửa: `prisma/schema.prisma`, `src/app.ts`, `src/shared/errors/error-codes.ts` (và file shared khác nếu cần)
- Cách hiểu các điểm docs chưa rõ

### Bước 2: Prisma model và migration
- Viết model vào `prisma/schema.prisma` đúng mẫu ở cuối `DATABASE.md`:
  - Model PascalCase số ít + `@@map("<bảng>")`; trường camelCase + `@map("<cột>")`
  - `id Int @id @default(autoincrement()) @db.UnsignedInt`; khóa ngoại `@db.UnsignedInt`
  - `createdAt DateTime @default(now()) @map("created_at") @db.DateTime(3)`, `updatedAt DateTime @updatedAt @map("updated_at") @db.DateTime(3)`
  - Chuỗi có độ dài `@db.VarChar(n)`, TEXT `@db.Text`, số nhỏ `@db.UnsignedSmallInt`, tiền `Int @db.UnsignedInt`
  - **Mọi index và unique khai báo `map:`** theo `idx_<bảng>_<cột>`
  - `onDelete`: `Restrict` cho bảng cha có dữ liệu thật, `Cascade` cho bảng con phụ thuộc (theo `DATABASE.md` mục 3)
  - Bảng nối n-n khai báo rõ (`BranchGame`), không dùng quan hệ ẩn
  - Enum dùng chung (`AccentColor`) chỉ khai báo **một lần**; feature sau thấy có rồi thì dùng lại
- `npx prisma validate` → `npx prisma format`.
- Migration, **mỗi bảng một migration**, tên `create_<bảng>_table`:
  1. `npm run prisma:migrate -- --create-only --name create_<bảng>_table`
  2. Sửa tay file `migration.sql` vừa sinh:
     - **Luôn** đổi `COLLATE utf8mb4_unicode_ci` thành `COLLATE utf8mb4_0900_ai_ci` (Prisma sinh sai collation; `DATABASE.md` cần `0900_ai_ci` để tìm không phân biệt hoa thường và dấu)
     - Thêm CHECK constraint nếu `DATABASE.md` yêu cầu (`CHECK (price_vnd >= 0)`, `shop` có `CHECK (id = 1)`)
  3. `npm run prisma:migrate` để áp dụng, rồi `npx prisma generate`
- **Không kết nối được MySQL** → dừng ở `prisma validate` + `npx prisma generate`, báo user cần tạo database rồi chạy lại bước migration. Không dùng `db push`.
- Feature cần dữ liệu ban đầu (`shop` dòng `id = 1`, `auth` tài khoản owner) → thêm vào `prisma/seed.ts` (tạo nếu chưa có, khai báo `migrations.seed` trong `prisma.config.ts`). Mật khẩu seed đọc từ biến môi trường, thêm biến đó vào `.env.example` và `src/config/env.ts`.
- **Dữ liệu mẫu**: nếu `prisma/seed-data.ts` có mảng cho bảng của feature (`seedShop`, `seedBranches`, `seedGameCategories` + `seedGames`, `seedPricePlans`, `seedMenu`, `seedPromotions`) → thêm hàm `seed<Feature>()` vào `prisma/seed.ts`, gọi trong `main()` **theo thứ tự khóa ngoại** (bảng cha trước):
  - Đổi tên trường gốc sang trường Prisma theo `DATABASE.md` (vd `price` → `priceVnd`, `color` → `accentColor`, `desc` → `description`); chuỗi rỗng `''` → `null`; chỉ số trong mảng → `sortOrder`.
  - Chạy lại nhiều lần vẫn an toàn và **không ghi đè dữ liệu chủ quán đã sửa**: bảng có cột UNIQUE (`game.title`, `game_category.name`, `menu_category.name`…) dùng `upsert` với `update: {}`; bảng không có UNIQUE (`branch`, `price_plan`, `promotion`) chỉ seed khi bảng đang trống (`count() === 0`).
  - Bảng con (`price_plan_feature`, `menu_item`) tạo cùng bảng cha bằng nested `create`; game nối thể loại qua `category` → `label` của `seedGameCategories`.
  - Chạy `npx prisma db seed` hai lần liên tiếp, lần hai không được tạo thêm dòng.

### Bước 3: Sinh file feature
Cấu trúc **file phẳng** (theo `docs/BE-ARCHITECTURE.md` mục 3), chỉ tạo file thật sự cần:

```
src/features/<feature>/
├── <feature>.dto.ts          # Zod schema + type: create, update, query, params
├── <feature>.entity.ts       # kiểu domain + hàm map row Prisma → entity (bỏ cột nhạy cảm)
├── <feature>.types.ts        # interface nội bộ, interface feature này CẦN (vd BranchLookup), filter
├── <feature>.repository.ts   # nơi DUY NHẤT dùng Prisma của feature
├── <feature>.service.ts      # business logic, ném AppError
├── <feature>.controller.ts   # đọc req → gọi service → ok/created/noContent
├── <feature>.routes.ts       # create<Feature>Router(controller, guards): [guards.requireAdmin] → validate → controller
├── <feature>.utils.ts        # (nếu cần) hàm thuần
└── index.ts                  # public API: router factory, class cần nối dây, interface feature khác dùng
```
Feature có nhiều tài nguyên (`game` + `game-category`, `menu-item` + `menu-category`, `price-plan` + feature con) → mỗi tài nguyên một bộ file cùng thư mục, ví dụ `game-category.service.ts`. File vượt ~300 dòng mới tách thư mục.

### Bước 4: Viết từng tầng

**DTO (`*.dto.ts`)**: Zod 4, khớp `API_SPEC.md` và giới hạn cột trong `DATABASE.md`.
- Chuỗi `.trim()` + `.min/.max` đúng độ dài cột; URL `z.url().max(500)`; tiền `z.number().int().min(0)`; ngày `YYYY-MM-DD`
- Trường tùy chọn `.nullable().optional()` (gửi `null` để xóa giá trị)
- `update` = `create.partial()` (PUT cập nhật một phần, trường không gửi giữ nguyên)
- Params: `z.object({ id: z.coerce.number().int().positive() })`
- Query danh sách: `paginationQuerySchema.extend({ ...bộ lọc của endpoint, includeInactive })` từ `@/shared/utils/pagination`; boolean trên query dùng `z.enum(['true','false']).transform(...)`, không dùng `z.coerce.boolean()` (vì `"false"` thành `true`)
- Export type bằng `z.infer`

**Entity (`*.entity.ts`)**: kiểu trả ra API (camelCase, đúng response mẫu) + hàm `toXxx(row)`. Không bao giờ có `passwordHash`.

**Repository**: nhận `Database` (`typeof prisma` từ `@/core/database/prisma`) qua constructor.
- `select`/`include` đúng cột cần, trả entity; không ném lỗi HTTP, không chứa quy tắc nghiệp vụ
- Danh sách: `findMany` + `count` trong `prisma.$transaction([...])`, dùng `toSkipTake`, `parseSort(sort, [trường được phép])`
- Mặc định lọc `isActive: true`; chỉ bỏ lọc khi service yêu cầu `includeInactive`
- Thao tác nhiều bảng (thay toàn bộ `features`, `branchIds`) làm trong một `$transaction`
- Tìm `q`: `contains` (collation `utf8mb4_0900_ai_ci` đã không phân biệt hoa thường và dấu)

**Service**: nhận repository và các interface phụ thuộc qua constructor.
- Không tồn tại → `NotFoundError(ErrorCode.X_NOT_FOUND, ...)`; trùng → kiểm tra trước rồi `ConflictError`; còn bản ghi con (`RESTRICT`) → đếm rồi `ConflictError` kèm số lượng (vd "Thể loại còn 8 game, ...")
- Gọi feature khác chỉ qua interface khai báo trong `<feature>.types.ts`
- Chỉ phát event qua `eventBus` từ `@/core/events/event-bus` khi `context.md` yêu cầu; khai báo payload bằng module augmentation `AppEvents`
- Ghi log thao tác quản trị bằng `logger.info({ id, adminId }, '<feature>.<action>')`, không log body

**Controller**: class, method dạng arrow function (để truyền thẳng vào router). Không `try/catch` (Express 5 tự chuyển lỗi), không logic. `GET` → `ok(res, data, meta)`, `POST` → `created`, `PUT` → `ok`, `DELETE` → `noContent` (204, không body).

**Routes**: export hàm `create<Feature>Router(controller, guards: AuthGuards)` trả `express.Router()`. `guards` do `app.ts` tạo (`createAuthGuards(authService)`), **không** import guard tĩnh từ shared.
- Thứ tự mỗi route: `[guards.requireAdmin | guards.requireOwner]` → `validate(schema, 'params' | 'query' | 'body')` → controller method
- Quyền lấy từ cột Auth trong `API_SPEC.md` mục 6 (Công khai / Admin / Owner). Controller lấy admin bằng `getRequestAdmin(req)`
- GET công khai: `guards.optionalAdmin` → `publicCache` → `validate(query)` → controller. Service chỉ bỏ lọc `isActive` khi `includeInactive` **và** có `req.admin`
- Cache: `publicCache` (từ `@/shared/middlewares`) cho GET công khai; guard quản trị tự đặt `no-store`. Chi tiết guard: `src/features/auth/context.md`

**index.ts**: chỉ export thứ `app.ts` và feature khác cần. Không export repository ra ngoài trừ khi `app.ts` cần để nối dây.

### Bước 5: Mã lỗi và nối dây
- Thêm mã của feature vào `src/shared/errors/error-codes.ts`, tên hằng theo nghĩa: `GAME_NOT_FOUND: 'GAME_001'`, đúng bảng mã trong `API_SPEC.md` mục 5. Không tự đặt mã mới; thiếu mã thì hỏi user và cập nhật `API_SPEC.md`.
- `src/app.ts` (composition root): tạo `Repository(prisma)` → `Service(repo, ...phụ thuộc)` → `Controller(service)` ở đầu `createApp()`, rồi `v1.use('/<path>', create<Feature>Router(controller, guards))`. Path kebab-case số nhiều đúng `API_SPEC.md`. Chỉ import từ `@/features/<feature>` (index.ts). `createApp(db)` nhận `db` để test truyền DB giả: repository tạo bằng `db`, không dùng thẳng `prisma`.

### Bước 6: Kiểm tra
Chạy trong `backend/`, tất cả phải pass:
```bash
npx prisma validate
npm run typecheck
npm run lint
npm test
```
Nếu có MySQL và đã migrate: `npm run dev`, gọi thử bằng `curl.exe`:
- `GET` danh sách → `200 { success: true, data: [...], meta }`
- `GET /:id` không tồn tại → `404` đúng mã lỗi feature
- Body sai → `400 COMMON_001` kèm `details`

Tắt server bằng đúng PID của nó, **không** dùng `taskkill /IM node.exe`.

### Bước 7: Cập nhật tài liệu
- `src/features/<feature>/context.md`: **bỏ dòng "⏳ Chưa cài đặt"**, sửa lại theo code thật (endpoint, file, public API, business rule đã chốt), xóa mục "Câu hỏi còn mở" đã được trả lời.
- Đổi endpoint, mã lỗi hay bảng so với docs → cập nhật `../01-share-docs/API_SPEC.md` / `../01-share-docs/DATABASE.md` và báo user.
- Bài giải thích của feature (`docs/explain/code/<feature>.md`, `docs/explain/flow/<feature>.md`) nếu có → hỏi user: chạy lại `/explain code|flow <feature>` (ghi đè), hay để sau. Để sau thì chèn ngay dưới bảng thông tin đầu bài dòng `> ⚠️ Code đã thay đổi ngày <YYYY-MM-DD> (<tóm tắt 1 dòng>), bài có thể đã cũ.` (chỉ sửa dòng này, không viết lại bài).
- Không thêm chi tiết vào `../CLAUDE.md` (file gốc chỉ để điều hướng).

## Output

```
✅ Feature "<feature>" (backend) xong!

🗄️  Database:
- Model: <Model>, ... | Migration: <tên> (hoặc: chưa chạy, lý do)

📁 File tạo mới: src/features/<feature>/...
📝 File đã sửa: prisma/schema.prisma, src/app.ts, src/shared/errors/error-codes.ts, ...

🔌 Endpoint:
| Method | Path | Quyền |

🧪 Kiểm tra: prisma validate / typecheck / lint / test / gọi thử API (kết quả thật)

⚠️  Còn lại: TODO, giả định đã chọn, phụ thuộc chưa có

🚀 Tiếp theo: /be-test <feature> (khi có), /fe-crud <feature>
```

## Quy tắc quan trọng
1. **Bám docs và code đã có**: tên bảng/cột/index đúng `DATABASE.md`, endpoint/response/mã lỗi đúng `API_SPEC.md`, mẫu code giống feature đã làm.
2. **Luồng một chiều**: routes → controller → service → repository → Prisma. Chỉ repository dùng Prisma.
3. **Không import nội bộ feature khác**: chỉ qua `@/features/<x>` (index.ts) hoặc interface inject ở `app.ts`. `src/shared/`, `src/core/`, `src/config/` không import `src/features/` (ESLint chặn).
4. **Không `any`, không `console.log`**, không trả hay log `password_hash`/token, không hardcode cấu hình (đọc từ `@/config`).
5. **Không ghi đè file đã có**; sửa file shared hoặc config thì nói rõ sửa gì.
6. **Hỏi khi docs mơ hồ hoặc mâu thuẫn**, không tự chọn.
7. Mỗi file tạo/sửa: nói bằng tiếng Việt 1–2 câu file làm gì, vì sao cần.

## Xử lý lỗi

| Lỗi | Hành động |
|---|---|
| Thiếu tên feature | Hỏi: "Feature nào? Ví dụ `/be-crud game`" |
| Tên feature không có trong danh sách | Hỏi lại; feature mới cần thêm vào `API_SPEC.md`, `DATABASE.md` trước |
| Chưa init backend | Gợi ý `/init-base backend` |
| Thiếu `context.md` hoặc docs | Liệt kê file thiếu, hỏi user tạo trước hoặc cho phép lấy từ `API_SPEC.md`/`DATABASE.md` |
| Không kết nối được MySQL | Dừng ở `prisma generate`, vẫn sinh code và chạy typecheck/lint/test, báo cần migrate |
| Feature phụ thuộc chưa làm | Đề nghị làm feature đó trước, hoặc hỏi user có muốn làm tạm với TODO |
| typecheck/lint/test fail | Sửa tới khi pass; không tắt rule, không `// @ts-ignore` |
