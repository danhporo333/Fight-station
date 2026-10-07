# Feature: game (backend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `DATABASE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Danh sách game của quán, thể loại game, và game nào có ở chi nhánh nào.

## Endpoint
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/games` | Danh sách game. Lọc: `q` (theo tên), `categoryId`, `branchId` | Công khai |
| GET | `/games/:id` | Chi tiết game, kèm `category` và `branchIds` | Công khai |
| POST | `/games` | Thêm game | Admin |
| PUT | `/games/:id` | Sửa game (gồm `branchIds`) | Admin |
| DELETE | `/games/:id` | Xóa game | Admin |
| GET | `/game-categories` | Danh sách thể loại | Công khai |
| POST | `/game-categories` | Thêm thể loại | Admin |
| PUT | `/game-categories/:id` | Sửa thể loại | Admin |
| DELETE | `/game-categories/:id` | Xóa thể loại (409 nếu còn game) | Admin |

Ví dụ request/response chi tiết: `API_SPEC.md` mục 7.2 – 7.5.

## Bảng DB
- `game_category`: `name` (UNIQUE), `sort_order`, `is_active`
- `game`: `game_category_id` (FK, `RESTRICT`), `title` (UNIQUE, ≤ 150 ký tự), `players`, `poster_url`, `accent_color` (`orange` / `red` / `amber` / `gold`), `description`, `sort_order`, `is_active`
- `branch_game`: `branch_id`, `game_id`, UNIQUE trên cặp này, cả hai FK đều `CASCADE`. Dùng bảng nối khai báo rõ, không dùng bảng ẩn của Prisma.

## Mã lỗi
| Mã | HTTP | Khi nào |
|---|---|---|
| `GAME_001` | 404 | Không tìm thấy game |
| `GAME_002` | 409 | `title` đã tồn tại |
| `GAME_003` | 404 | Không tìm thấy thể loại |
| `GAME_004` | 409 | Tên thể loại đã tồn tại |
| `GAME_005` | 409 | Thể loại còn game ("Thể loại còn N game, hãy chuyển hoặc xóa game trước") |
| `GAME_006` | 400 | `branchIds` chứa chi nhánh không tồn tại |

## Business rule
- Bắt buộc khi tạo game: `title` (1–150 ký tự) và `gameCategoryId`.
- Không gửi `branchIds` khi tạo thì game có ở **mọi** chi nhánh.
- `PUT` có `branchIds` thì **thay toàn bộ** danh sách chi nhánh của game.
- Danh sách `/games` không trả `branchIds` (nặng); chỉ `/games/:id` mới trả.
- Tìm `q` không phân biệt hoa thường và dấu (collation `utf8mb4_0900_ai_ci`).
- GET công khai chỉ trả `is_active = 1`.

## Phụ thuộc
- Khai báo `BranchLookup` trong `game.types.ts`, nhận qua constructor của `GameService`. `app.ts` truyền service của `branch` vào. Không import file nội bộ của `branch`.
- Có thể phát event `game.deleted` qua `core/events` (khai báo bằng module augmentation `AppEvents`).

## Câu hỏi còn mở
- "Có ở mọi chi nhánh" nghĩa là ghi sẵn tất cả `branch_id` hiện có vào `branch_game`, hay hiểu "không có dòng nào = có ở mọi nơi"? Hai cách khác nhau khi sau này thêm chi nhánh mới. Cần chốt trước khi làm.
