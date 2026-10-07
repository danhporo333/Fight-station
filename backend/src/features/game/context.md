# Feature: game (backend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Danh sách game của quán, thể loại game, và game nào có ở chi nhánh nào.

## Endpoint
| Method | Path | Mô tả | Auth | Cache |
|---|---|---|---|---|
| GET | `/games` | Danh sách. Query: `page`, `limit`, `sort`, `q` (theo tên), `categoryId` (game có thể loại này), `branchId`, `includeInactive` | Công khai | `public, max-age=60` (có token admin: `no-store`) |
| GET | `/games/:id` | Chi tiết, kèm `categories` và `branchIds`. Query: `includeInactive` | Công khai | như trên |
| POST | `/games` | Thêm game → `201` | Admin | `no-store` |
| PUT | `/games/:id` | Sửa (chỉ gửi trường cần đổi; `branchIds` thay toàn bộ) → `200` | Admin | `no-store` |
| DELETE | `/games/:id` | Xóa thật → `204` | Admin | `no-store` |
| GET | `/game-categories` | Danh sách thể loại, kèm `gameCount`. Query: `page`, `limit`, `sort`, `includeInactive` | Công khai | như `/games` |
| POST | `/game-categories` | Thêm thể loại → `201` | Admin | `no-store` |
| PUT | `/game-categories/:id` | Sửa thể loại → `200` | Admin | `no-store` |
| DELETE | `/game-categories/:id` | Xóa thể loại → `204` (409 nếu còn game) | Admin | `no-store` |

Response game chi tiết (`GET /games/:id`, `POST`, `PUT`):
```json
{ "id": 1, "title": "Tekken 8", "players": "1-2P", "posterUrl": null, "accentColor": "red",
  "description": null, "categories": [ { "id": 1, "name": "Đối Kháng" } ],
  "sortOrder": 0, "isActive": true, "createdAt": "...", "updatedAt": "...",
  "branchIds": null }
```
- `branchIds: null` = có ở **mọi** chi nhánh; `[1, 3]` = chỉ chi nhánh 1 và 3 (tăng dần).
- `categories`: 1–5 thể loại, xếp theo `sortOrder` của thể loại (rồi id).
- Danh sách `GET /games` có cùng các trường **trừ** `branchIds`, kèm `meta`.
- Thể loại: `{ "id", "name", "sortOrder", "isActive", "gameCount", "createdAt", "updatedAt" }` (`gameCount` đếm cả game đang ẩn).

## File
| File | Vai trò |
|---|---|
| `game.dto.ts` | `createGameSchema`, `updateGameSchema` (partial, không default, body rỗng bị từ chối), `gameIdParamsSchema`, `listGamesQuerySchema`, `getGameQuerySchema` |
| `game.entity.ts` | `GameListItem`, `GameDetail`, `GAME_LIST_SELECT`, `GAME_DETAIL_SELECT`, `toGameListItem`, `toGameDetail` (không có dòng nối → `branchIds: null`), `GAME_SORT_FIELDS` |
| `game.types.ts` | `BranchLookup` (`existsAll`), `GameFilter`, `BranchIdsChange` |
| `game.repository.ts` | `findMany` (+`count` trong `$transaction`, điều kiện ghép bằng `AND`), `findById`, `findIdByTitle`, `countCategories`, `create` (nested create dòng nối thể loại + chi nhánh), `update` (thay dòng nối thể loại và/hoặc chi nhánh + sửa game trong một interactive transaction), `delete` |
| `game.service.ts` | `list`, `get`, `create`, `update`, `remove`; kiểm tra trùng tên, mọi thể loại tồn tại (`checkCategoryIds`), chi nhánh tồn tại (qua `BranchLookup`), bỏ id trùng và sắp tăng dần; log `game.created/updated/deleted` |
| `game.controller.ts`, `game.routes.ts` | GET: `optionalAdmin` → `publicCache` → `validate`; ghi: `requireAdmin` → `validate` |
| `game-category.{dto,entity,repository,service,controller,routes}.ts` | CRUD thể loại (không có `GET /:id`); `GameCategoryFilter` khai báo trong repository; log `game_category.created/updated/deleted` |
| `index.ts` | Controller, repository, service, router factory của game và thể loại; type `BranchLookup` |

## Bảng DB
- `game_category`: `name` (UNIQUE `idx_game_category_name`), `sort_order`, `is_active`. Migration `create_game_category_table`.
- `game`: `title` (UNIQUE `idx_game_title`, ≤ 150), `players`, `poster_url`, `accent_color` (enum `AccentColor`: `orange`/`red`/`amber`/`gold`, khai báo một lần, `promotion` dùng lại), `description` (TEXT), `sort_order`, `is_active`. Index `idx_game_is_active_sort_order`. Migration `create_game_table`.
- `game_game_category` (2026-10-07, game có nhiều thể loại): `game_id` (FK CASCADE), `game_category_id` (FK RESTRICT), UNIQUE `idx_game_game_category_game_id_game_category_id`, index `idx_game_game_category_game_category_id`. Migration `change_game_category_to_many` **viết tay**: tạo bảng nối → chép `game.game_category_id` sang (mỗi game giữ thể loại cũ) → mới xóa cột `game.game_category_id` (thứ tự Prisma tự sinh sẽ làm mất dữ liệu). `GameCategory.games` giờ là `GameGameCategory[]`.
- `branch_game`: `branch_id`, `game_id`, UNIQUE `idx_branch_game_branch_id_game_id`, index `idx_branch_game_game_id`, cả hai FK `CASCADE`. Migration `create_branch_game_table`. Model `Branch` có thêm quan hệ `games BranchGame[]` (bảng `branch` không đổi).
- Seed `seedGames()`: **chỉ chạy khi bảng `game` trống** (DB mới/reset). Upsert 5 thể loại theo `name`, tạo 12 game (mỗi game 1 thể loại, nối qua `category` → `label` của `seedGameCategories`), không ghi dòng `branch_game` (= mọi chi nhánh). Không upsert game theo tên khi đã có dữ liệu: trước đây làm vậy đã tạo lại game chủ quán đã xóa/đổi tên.

## Mã lỗi
| Mã | Hằng | HTTP | Khi nào |
|---|---|---|---|
| `GAME_001` | `GAME_NOT_FOUND` | 404 | Không có game, hoặc game ẩn / thuộc thể loại ẩn mà request không phải admin + `includeInactive=true` |
| `GAME_002` | `GAME_TITLE_TAKEN` | 409 | `title` trùng (không phân biệt hoa thường và dấu) |
| `GAME_003` | `GAME_CATEGORY_NOT_FOUND` | 404 | `gameCategoryIds` có thể loại không tồn tại; sửa/xóa thể loại không tồn tại |
| `GAME_004` | `GAME_CATEGORY_NAME_TAKEN` | 409 | Tên thể loại trùng (không phân biệt hoa thường và dấu) |
| `GAME_005` | `GAME_CATEGORY_HAS_GAMES` | 409 | Xóa thể loại còn game (còn dòng nối): "Thể loại còn N game, hãy chuyển hoặc xóa game trước". Không tự gỡ, vì game chỉ có đúng thể loại đó sẽ mất hết thể loại |
| `GAME_006` | `GAME_BRANCH_NOT_FOUND` | 400 | `branchIds` có chi nhánh không tồn tại |
| `COMMON_001` | | 400 | Sai dữ liệu: thiếu `title`, `gameCategoryIds` rỗng hoặc > 5, `branchIds: []`, màu lạ, `limit` > 100, body PUT rỗng… |

## Business rule
- **Game có ở chi nhánh nào** (đã chốt 2026-10-07): **không có dòng `branch_game` nào = có ở mọi chi nhánh**, kể cả chi nhánh mở sau này.
  - `POST` không gửi `branchIds` hoặc gửi `null` → mọi chi nhánh. Mảng → chỉ những chi nhánh đó (id trùng tự gộp, sắp tăng dần). `[]` bị từ chối (lẫn với "mọi chi nhánh").
  - `PUT`: không gửi `branchIds` → giữ nguyên; `null` → chuyển về mọi chi nhánh (xóa hết dòng nối); mảng → thay toàn bộ.
  - Lọc `?branchId=X`: game không có dòng nối nào **hoặc** có dòng của chi nhánh X.
  - `existsAll` đếm cả chi nhánh đang ẩn (được phép gán game vào chi nhánh đang ẩn).
  - ⚠️ Xóa chi nhánh mà game chỉ có ở đúng chi nhánh đó → dòng nối bị xóa theo (CASCADE) → game thành "mọi chi nhánh". Đã chấp nhận (quán hiếm khi xóa chi nhánh, khuyên dùng ẩn); frontend nên ghi rõ trong hộp xác nhận xóa chi nhánh.
- **Thể loại** (đã chốt 2026-10-07): mỗi game có 1–5 thể loại. `PUT` có `gameCategoryIds` thì thay toàn bộ; không gửi thì giữ nguyên. Lọc `?categoryId=X`: game có X trong số các thể loại.
- GET công khai chỉ trả game `is_active = 1` **và còn ít nhất một thể loại `is_active = 1`**: ẩn thể loại thì game chỉ ẩn khi **mọi** thể loại của nó đều ẩn (vd ẩn "Co-op" thì "It Takes Two" vẫn hiện vì còn "Hành Động"). `includeInactive=true` chỉ có hiệu lực khi có token admin; không có thì bỏ qua.
- `q` tìm theo `title`, không phân biệt hoa thường và dấu. `sort` game: `sortOrder` (mặc định), `title`, `createdAt`; thể loại: `sortOrder`, `name`, `createdAt`. Luôn thêm `id` tăng dần cuối cùng.
- Validate: `title` 1–150, `gameCategoryIds` 1–5 số nguyên dương (bắt buộc); `players` ≤ 20; `posterUrl` URL ≤ 500; `description` ≤ 2000; `accentColor` mặc định `orange`; `sortOrder` mặc định 0; `isActive` mặc định `true`. Thể loại: `name` 1–50. Chuỗi trim, `''` → `null`.
- Quản trị sửa/xóa được cả game và thể loại đang ẩn. Xóa là xóa thật.
- Quyền ghi: **Admin** (owner hoặc staff), khác `branch`/`shop` (chỉ Owner).
- Chưa phát event `game.deleted` (chưa có ai nghe); thêm khi cần.

## Phụ thuộc
- `BranchLookup` khai báo trong `game.types.ts`, nhận qua constructor `GameService`; `app.ts` truyền `branchService` của `branch`. Không import file nội bộ của `branch`.
- Dùng `guards.optionalAdmin`, `guards.requireAdmin` của `auth`; `@/shared/utils/zod-fields`, `@/shared/utils/pagination`.
