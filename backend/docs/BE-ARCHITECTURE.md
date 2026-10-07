# ARCHITECTURE.md — Backend Fight Station

Kiến trúc API cho website quán PS5 (khách xem game, bảng giá, menu, chi nhánh; chủ quán đăng nhập để thêm/sửa/xóa). Schema xem `DATABASE.md`, quy tắc code xem `PROJECT-RULES.md`.

**Stack**: TypeScript (strict) · Node.js 24 LTS · Express 5 · Prisma + MySQL 8.4 · Zod · Pino · Vitest + Supertest

## 1. Tổng quan hệ thống

```mermaid
flowchart LR
    Web["Website khách<br/>(xem game, giá, menu)"] -->|GET công khai| API
    Admin["Trang quản trị<br/>(chủ quán / nhân viên)"] -->|POST/PUT/DELETE + JWT| API
    subgraph API["Express API (1 process)"]
        direction TB
        MW["Middleware chain"] --> F["features/<br/>auth · shop · branch · game<br/>price-plan · menu · promotion"]
        F --> S["shared/ (middlewares, utils, types, errors)"]
        F --> C["core/ (database, logger, events)"]
    end
    C -->|Prisma| DB[("MySQL 8.4")]
    CFG["config/env.ts<br/>(.env)"] -.-> API
```

**Vì sao tổ chức theo feature (không theo layer)**
- Mỗi tính năng của quán (game, menu, bảng giá...) tự đóng gói: sửa `menu` không phải mở thư mục `controllers/`, `services/` rồi nhặt từng file.
- Khớp với `DATABASE.md`: mỗi feature sở hữu nhóm bảng riêng, nên dễ biết ai chịu trách nhiệm bảng nào.
- Thêm/xóa feature (ví dụ thêm `event`) chỉ thêm một thư mục và một dòng trong `app.ts`.
- Dự án nhỏ, một chủ quán: dùng **modular monolith** (một process, một database), không cần microservice.

## 2. Cấu trúc thư mục

```
src/
├── config/                  # cấu hình, đọc và validate biến môi trường
│   ├── env.ts               # Zod schema cho process.env, export object `env` đã đúng kiểu
│   └── index.ts             # gom hằng số cấu hình (cors, jwt, pagination mặc định)
├── core/                    # hạ tầng: khởi tạo MỘT lần, mọi feature dùng chung
│   ├── database/prisma.ts   # PrismaClient singleton, hàm connect/disconnect
│   ├── logger/index.ts      # Pino logger (redact password, token)
│   ├── events/event-bus.ts  # event bus trong process (EventEmitter có kiểu)
│   └── cache/               # dự phòng (Redis/memory), CHƯA dùng ở giai đoạn này
├── shared/                  # code tái sử dụng, không gắn với feature nào
│   ├── middlewares/         # request-id, request-logger, validate, auth-guards, cache-control, rate-limit, not-found, error-handler
│   ├── errors/              # AppError, NotFoundError, ConflictError, ...
│   ├── utils/               # response.ts (ok, created), password.ts (hash/verify), pagination.ts
│   └── types/               # express.d.ts (req.admin, req.id), kiểu dùng chung (Pagination)
├── features/                # mỗi thư mục = một tính năng, xem mục 3
│   ├── auth/                # đăng nhập, JWT                       → admin_user
│   ├── shop/                # thông tin quán (1 dòng)              → shop
│   ├── branch/              # chi nhánh                            → branch
│   ├── game/                # game, thể loại, game theo chi nhánh  → game, game_category, branch_game
│   ├── price-plan/          # bảng giá theo giờ                    → price_plan, price_plan_feature
│   ├── menu/                # danh mục + món                       → menu_category, menu_item
│   └── promotion/           # khuyến mãi / sự kiện                 → promotion
├── app.ts                   # composition root: tạo repository → service → controller, gắn route
└── server.ts                # listen cổng, graceful shutdown (đóng HTTP và Prisma)
prisma/                      # schema.prisma, migrations/, seed.ts (ngoài src/)
```

Điều chỉnh theo Express/Prisma: `prisma/` nằm ngoài `src/` theo quy ước của Prisma; `app.ts` tách khỏi `server.ts` để Supertest import app mà không mở cổng.

## 3. Giải phẫu một feature

```
features/game/
├── game.routes.ts           # URL → controller, gắn validate() và require-admin
├── game.controller.ts       # lấy dữ liệu từ req, gọi service, trả response (không logic)
├── game.service.ts          # business logic, ném AppError
├── game.repository.ts       # nơi DUY NHẤT dùng Prisma của feature
├── game.dto.ts              # Zod schema + type request/response
├── game.entity.ts           # kiểu domain + hàm map từ row Prisma
├── game.types.ts            # interface nội bộ (BranchLookup, GameFilter)
├── game.utils.ts            # hàm thuần của riêng feature
├── index.ts                 # public API: chỉ export thứ feature khác được dùng
├── tests/                   # game.service.test.ts, game.repository.test.ts, game.controller.test.ts
└── context.md               # mục đích, endpoint, bảng DB, phụ thuộc, business rule
```

Template gợi ý thư mục `dto/`, `entities/`, `types/`. Dự án này dùng **file phẳng** (`game.dto.ts`...) vì mỗi feature nhỏ; khi một file vượt khoảng 300 dòng thì mới đổi thành thư mục cùng tên.

| File | Được làm | Không được làm |
|------|----------|----------------|
| controller | đọc `req`, gọi service, `ok()/created()` | logic nghiệp vụ, gọi Prisma |
| service | quy tắc nghiệp vụ, phối hợp nhiều repository | đọc `req/res`, dùng Prisma |
| repository | truy vấn Prisma, `select` đúng cột | quy tắc nghiệp vụ, ném lỗi HTTP |

## 4. Luồng request

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant R as Routes + validate
    participant Ct as Controller
    participant S as Service
    participant Rp as Repository
    participant D as MySQL
    C->>M: POST /api/v1/games
    M->>R: requestId, log, auth (JWT)
    R->>Ct: body đã qua Zod
    Ct->>S: service.create(dto)
    S->>Rp: findByTitle(), create()
    Rp->>D: Prisma query
    D-->>Rp: row
    Rp-->>S: entity
    S-->>Ct: Game
    Ct-->>C: 201 { success, data }
```

- **Controller**: routing, nhận dữ liệu đã validate, định dạng response `{success, data, meta}`.
- **Service**: business logic (vd: trùng `title` → `ConflictError`, xóa thể loại còn game → `ConflictError`).
- **Repository**: chỉ truy cập dữ liệu, trả entity, không biết HTTP.
- **Lỗi**: bất kỳ tầng nào ném `AppError` → Express 5 chuyển tới `error-handler` → `{success:false, error:{code,message}}`.

## 5. Giao tiếp giữa các feature

```mermaid
flowchart LR
    app["app.ts<br/>(nối dây)"] --> game & branch & auth
    game -. "BranchLookup (interface)" .-> branch
    game -- "emit game.deleted" --> bus(["core/events"])
    promotion -- "subscribe (nếu cần)" --> bus
```

| Cách | Khi dùng | Ví dụ ở dự án |
|------|----------|---------------|
| **Dependency injection** (mặc định) | cần kết quả trả về | `GameService` cần kiểm tra chi nhánh tồn tại → nhận `BranchLookup` qua constructor |
| **Shared service** | logic dùng ở ≥ 3 feature, không thuộc feature nào | `PasswordService` (hash/verify) trong `shared/utils` |
| **Event bus** | chỉ thông báo, không cần kết quả | `game.deleted` → ghi log kiểm toán, xóa cache |

**Bị cấm**: import file nội bộ của feature khác (`from '../branch/branch.repository'`). Feature khác chỉ được import qua `index.ts`. Hai feature không được phụ thuộc vòng: interface đặt ở bên **cần** (`game.types.ts`), `app.ts` nối dây. ESLint `import/no-restricted-paths` chặn vi phạm, CI fail.

Hướng phụ thuộc duy nhất: `app.ts → features → shared / core / config`. `shared`, `core`, `config` **không bao giờ** import `features`.

## 6. Shared vs Core

| Tiêu chí | `shared/` | `core/` |
|----------|-----------|---------|
| Bản chất | Hàm/class tái sử dụng, không trạng thái | Thiết lập hạ tầng, có kết nối và vòng đời |
| Khởi tạo | Import là dùng | Khởi tạo một lần ở `server.ts` / `app.ts` |
| Nội dung | utility, type dùng chung, helper, middleware, error | kết nối database, cấu hình logger, event bus, cache |
| Ví dụ | `ok(res, data)`, `AppError`, `validate()` | `prisma` singleton, `logger`, `eventBus` |
| Test | unit test thuần | cần mock hoặc dùng database thật |

Quy tắc nhanh: nếu nó **mở kết nối hoặc giữ trạng thái** thì vào `core`; nếu chỉ là hàm/kiểu dùng lại thì vào `shared`; nếu chỉ một feature dùng thì để trong feature đó.

## 7. Quản lý cấu hình

**Biến môi trường** (`.env`, mẫu ở `.env.example`):

| Biến | Ví dụ | Ghi chú |
|------|-------|---------|
| `NODE_ENV` | `development` / `test` / `production` | |
| `PORT` | `3000` | |
| `DATABASE_URL` | `mysql://user:pass@localhost:3306/fight_station` | Prisma đọc trực tiếp |
| `JWT_SECRET` | chuỗi ngẫu nhiên ≥ 32 ký tự | **secret** |
| `JWT_EXPIRES_IN` | `1d` | |
| `CORS_ORIGINS` | `https://fightstation.vn` | danh sách, ngăn cách bằng dấu phẩy |
| `LOG_LEVEL` | `info` | `debug` khi phát triển |

**Cấu trúc**: `config/env.ts` parse `process.env` bằng Zod ngay lúc khởi động. Thiếu hoặc sai biến thì **dừng app** kèm thông báo rõ, không chạy tiếp với giá trị mặc định nguy hiểm.

```ts
// config/env.ts
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
});
export const env = schema.parse(process.env);   // nơi DUY NHẤT đọc process.env
```

**Secret**:
- `.env` nằm trong `.gitignore`; chỉ commit `.env.example` (không có giá trị thật).
- Production: đưa secret qua biến môi trường của nền tảng triển khai (secret manager), không ghi vào ảnh Docker hay mã nguồn.
- Không log secret: Pino `redact` các trường `password`, `password_hash`, `authorization`, `token`.
- Đổi `JWT_SECRET` thì mọi token cũ mất hiệu lực; đổi định kỳ và khi nghi ngờ lộ.

## 8. Bổ sung riêng cho Express + Prisma

**Chuỗi middleware** (thứ tự quan trọng):

```
requestId → pino-http → helmet → cors → express.json({ limit: '100kb' }) → rate-limit (/api/v1/auth)
   → /api/v1/* routes (mỗi route: [requireAdmin] → validate(schema) → controller)
   → notFound → errorHandler (luôn cuối cùng)
```

**Thiết lập DI** (`app.ts`, không dùng container, nối tay bằng constructor):

```ts
export function createApp() {
  const branchRepo = new BranchRepository(prisma);
  const branchService = new BranchService(branchRepo);
  const gameRepo = new GameRepository(prisma);
  const gameService = new GameService(gameRepo, branchService);   // branchService thỏa BranchLookup
  const gameController = new GameController(gameService);

  const app = express();
  app.use(requestId, requestLogger, helmet(), cors({ origin: env.CORS_ORIGINS }), express.json());
  app.use('/api/v1/games', gameRouter(gameController));
  // ...các feature khác
  app.use(notFound, errorHandler);
  return app;
}
```

**Route công khai và route quản trị**

| Nhóm | Endpoint | Quyền |
|------|----------|-------|
| Công khai | `GET /api/v1/games`, `/api/v1/menu`, `/api/v1/price-plans`, `/api/v1/branches`, `/api/v1/promotions`, `/api/v1/shop` | không cần đăng nhập, chỉ trả bản ghi `is_active = 1` |
| Quản trị | `POST/PUT/DELETE` các tài nguyên trên | `requireAdmin` (JWT); xóa người dùng/cấu hình nhạy cảm chỉ `role = owner` |
| Auth | `POST /api/v1/auth/login` | rate-limit chống dò mật khẩu |

**Prisma**: một `PrismaClient` singleton ở `core/database/prisma.ts`; repository nhận nó qua constructor (dễ mock khi test). Migration chạy bằng `prisma migrate deploy` ở CI/production, không dùng `db push`.

**Tắt an toàn**: `server.ts` bắt `SIGTERM/SIGINT` → ngừng nhận request → `prisma.$disconnect()` → thoát.
