# PROJECT-RULES.md — Backend Fight Station

API cho website quán PS5: khách xem game, bảng giá, menu, chi nhánh; chủ quán đăng nhập để thêm/sửa/xóa. Schema xem `DATABASE.md`.

## Tech Stack
- **Ngôn ngữ**: TypeScript (`strict: true`), alias đường dẫn `@/` → `src/`
- **Runtime / Framework**: Node.js 24 LTS + Express 5
- **ORM / Database**: Prisma ORM + MySQL 8.4
- **Thư viện kèm theo**: Zod (validation), Pino (logging), Vitest + Supertest (test)

## 1. Cấu trúc feature
Các feature: `auth`, `shop`, `branch`, `game` (gồm `game_category`, `branch_game`), `price-plan`, `menu`, `promotion`.
```
src/
├── features/
│   └── game/
│       ├── game.routes.ts       # map URL → controller, gắn middleware
│       ├── game.controller.ts   # nhận request, gọi service, trả response
│       ├── game.service.ts      # business logic
│       ├── game.repository.ts   # truy vấn Prisma (nơi DUY NHẤT dùng Prisma)
│       ├── game.dto.ts          # Zod schema + type request/response
│       ├── game.entity.ts       # kiểu domain + hàm map từ row Prisma
│       ├── game.types.ts        # type/interface nội bộ
│       ├── game.utils.ts        # hàm thuần của riêng feature
│       ├── index.ts             # public API: chỉ export thứ feature khác được dùng
│       ├── tests/               # game.service.test.ts, game.repository.test.ts...
│       └── context.md           # mục đích, endpoint, bảng DB, phụ thuộc, business rule
├── config/                      # env.ts (Zod validate process.env)
├── core/                        # hạ tầng: database/prisma.ts, logger, events, cache
├── shared/                      # middlewares, errors, utils, types dùng chung
├── app.ts                       # composition root: repository → service → controller (DI)
└── server.ts
```
Luồng gọi: `routes → controller → service → repository → Prisma`. Không đi tắt, không gọi ngược lên.

## 2. Quy ước đặt tên
| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Thư mục feature | kebab-case, số ít | `game`, `price-plan` |
| File | `[feature].[layer].ts`, kebab-case | `price-plan.service.ts`, `game.dto.ts` |
| Class | PascalCase + hậu tố layer | `GameService`, `GameRepository` |
| Function | camelCase, bắt đầu bằng động từ | `createGame`, `findActiveGames` |
| Biến | camelCase | `gameCategoryId` |
| Hằng số | UPPER_SNAKE_CASE | `MAX_TITLE_LENGTH` |
| Type / Interface | PascalCase, không tiền tố `I` | `CreateGameDto`, `BranchLookup` |
| Cột DB ↔ code | snake_case ↔ camelCase qua `@map` | `is_active` ↔ `isActive` |

## 3. Quy tắc cho feature
- Feature tự đóng gói: code, test, `context.md` nằm hết trong thư mục feature. Thêm/xóa feature không phải sửa feature khác.
- Không import trực tiếp giữa các feature. Chỉ import qua `index.ts` hoặc qua interface được inject.
- Giao tiếp giữa feature: (1) **Dependency injection** (mặc định), (2) **Shared service** trong `src/shared/`, (3) **Event** (`src/core/events`) khi chỉ cần thông báo, không cần kết quả.
- Code dùng chung đặt ở `src/shared/` (tái sử dụng) hoặc `src/core/` (hạ tầng). Hướng phụ thuộc duy nhất: `app.ts → features → shared/core/config` (ba thư mục này không import `features`).
- Bật `import/no-restricted-paths` trong ESLint cho các quy tắc trên, CI fail nếu vi phạm.

```ts
// ❌ KHÔNG NÊN: import file nội bộ của feature khác
import { BranchRepository } from '../branch/branch.repository';

// ✅ NÊN: game khai báo thứ nó cần, app.ts nối dây
// game/game.types.ts
export interface BranchLookup { existsAll(ids: number[]): Promise<boolean>; }
// game/game.service.ts
export class GameService {
  constructor(private repo: GameRepository, private branches: BranchLookup) {}
}
// app.ts
const gameService = new GameService(gameRepo, branchService); // branchService lấy từ '@/features/branch'
```

## 4. Code pattern (BẮT BUỘC)
**Xử lý lỗi**: service ném `AppError` (`NotFoundError` 404, `ValidationError` 400, `ConflictError` 409, `UnauthorizedError` 401, `ForbiddenError` 403). Controller không `try/catch` (Express 5 tự chuyển lỗi async). Chỉ một error middleware ở `shared/middlewares/error-handler.ts` đổi lỗi thành response; lỗi lạ trả 500, ghi log, không lộ stack.
```ts
if (!game) throw new NotFoundError(ErrorCode.GAME_NOT_FOUND, `Không tìm thấy game ${id}`);   // ✅
res.status(404).json({ msg: 'not found' });                                          // ❌ tự dựng lỗi
```
**Validation**: Zod schema trong `*.dto.ts`, validate ở route bằng middleware, controller và service chỉ nhận dữ liệu đã hợp lệ.
```ts
export const createGameSchema = z.object({
  title: z.string().trim().min(1).max(150),
  gameCategoryId: z.number().int().positive(),
  posterUrl: z.string().url().optional(),
});
export type CreateGameDto = z.infer<typeof createGameSchema>;
router.post('/', guards.requireAdmin, validate(createGameSchema), controller.create); // guards truyền vào từ app.ts
```
**Logging**: Pino (`core/logger/index.ts`), log JSON, mỗi request có `requestId`. Không log mật khẩu, token, `password_hash`. Không dùng `console.log`.
```ts
logger.info({ gameId, adminId }, 'game.deleted');   // ✅ có ngữ cảnh, không lộ dữ liệu nhạy cảm
console.log('deleted', req.body);                   // ❌
```
**Định dạng response**: controller dùng helper `ok(res, data)`, `created(res, data)`, không tự dựng JSON.
```json
{ "success": true, "data": { "id": 1, "title": "Tekken 8" }, "meta": { "page": 1, "total": 12 } }
{ "success": false, "error": { "code": "GAME_001", "message": "Không tìm thấy game 99" } }
```
Mã lỗi dạng `[FEATURE]_[SỐ]` (xem `API_SPEC.md`), hằng số ở `shared/errors/error-codes.ts`; lỗi validate có thêm `details`.
Mã HTTP: 200 (GET/PUT), 201 (POST), 204 (DELETE, không body), 400 (dữ liệu sai), 401/403 (quyền), 404, 409 (trùng `title`), 500.

## 5. Anti-pattern (KHÔNG ĐƯỢC làm)
| Vi phạm | ❌ KHÔNG NÊN | ✅ NÊN |
|---|---|---|
| Import file nội bộ feature khác | `from '../game/game.repository'` | `from '@/features/game'` (qua `index.ts`) |
| Phụ thuộc vòng giữa feature | `game` và `branch` import lẫn nhau | Đặt interface (`BranchLookup`) ở bên cần, nối ở `app.ts` |
| Business logic trong controller | Controller kiểm tra giá âm rồi gọi Prisma | Controller: `service.create(dto)` → `created(res, data)` |
| Truy vấn ngoài repository | `prisma.game.findMany()` trong service | `gameRepository.findActive()` |
| Hardcode cấu hình | `jwt.sign(x, 'secret123')` | `env.JWT_SECRET` từ `config/env.ts` (Zod validate, có `.env.example`) |
| SQL nối chuỗi | `` $queryRawUnsafe(`... '${title}'`) `` | Prisma Client, hoặc `` $queryRaw`... ${title}` `` |
| Lộ dữ liệu nhạy cảm | Trả cả `password_hash` ra response | `select` đúng cột ở repository, map sang DTO |

## 6. Git workflow
- **Branch**: `<type>/<feature>-<mô-tả-ngắn>`, kebab-case. `type`: `feature`, `fix`, `refactor`, `chore`, `docs`, `test`. Ví dụ `feature/game-delete-api`, `fix/menu-negative-price`.
- **Commit** (Conventional Commits, scope là tên feature): `<type>(<feature>): <mô tả>`. Ví dụ `feat(game): thêm API xóa game`, `fix(menu): chặn giá âm`. Không viết kiểu `update`, `fix bug`.
- **Pull Request**: tiêu đề theo format commit; mô tả nêu thay đổi gì, vì sao, cách kiểm tra; tối đa khoảng 400 dòng thay đổi (lớn hơn thì tách); CI xanh (lint, typecheck, test, coverage); ít nhất 1 người approve; có migration thì ghi rõ và cập nhật `DATABASE.md`; đổi API hoặc business rule thì cập nhật `context.md`. Không đẩy thẳng lên `main`.

## 7. Testing
- **Vị trí**: `src/features/<feature>/tests/`. **Tên file**: `<feature>.<layer>.test.ts`, ví dụ `game.service.test.ts`.
- **Loại test**: service là unit test (mock repository); repository là integration test với MySQL 8.4 thật (Docker, database test riêng, chạy `prisma migrate deploy` trước); controller test bằng Supertest.
- **Cấu trúc**: `describe(class)` → `describe(method)` → `it('mô tả hành vi')`, mỗi test theo Arrange – Act – Assert.
- **Coverage**: toàn dự án ≥ 80%, tầng service ≥ 90%, code mới ≥ 80%. CI fail nếu thấp hơn. Test không bao giờ chạm database dev hoặc production.
```ts
describe('GameService', () => {
  describe('create', () => {
    it('ném ConflictError khi title đã tồn tại', async () => {
      repo.findByTitle.mockResolvedValue(existingGame);                    // Arrange
      await expect(service.create(dto)).rejects.toThrow(ConflictError);    // Act + Assert
    });
  });
});
```
