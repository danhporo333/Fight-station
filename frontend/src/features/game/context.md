# Feature: game (frontend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `FE-ARCHITECTURE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Hiển thị game của quán theo thể loại, lọc theo chi nhánh và tìm theo tên. Admin quản lý game và thể loại.

## Endpoint dùng
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/games?q&categoryId&branchId&page&limit` | `GameList` (danh sách công khai dùng `limit=100`) |
| GET | `/games/:id` | Form sửa (có `branchIds`) |
| POST / PUT / DELETE | `/games`, `/games/:id` | Trang quản trị (Admin) |
| GET / POST / PUT / DELETE | `/game-categories` | Bộ lọc thể loại, quản lý thể loại |

## Route và trang
| Path | Trang | Nơi khai báo | Quyền |
|---|---|---|---|
| `/games` | `GamesPage` (ghép `BranchPicker` + `GameFilters` + `GameList`) | `src/pages` | Công khai |
| `/admin/games` | `AdminGamesPage` | `features/game/pages` | Admin |

## Public API (dự kiến)
- `GameList`, `GameCard`, `GameFilters`, `gameRoutes`, kiểu `Game`, `GameQuery`.

## Query key
- `['games', query]`, `['game', id]`, `['game-categories']`. Sau khi sửa game thì invalidate `['games']` và `['game', id]`.

## Ghi chú UI
- Bộ lọc nằm trên URL: `/games?category=2&branch=1&q=tekken`. Ô tìm kiếm debounce 300ms (`useDebounce`) rồi mới ghi vào URL.
- `posterUrl` trống thì hiện tên game bằng chữ. Ảnh có `alt`, `loading="lazy"` và kích thước cố định để không nhảy layout.
- `accentColor` (`orange` / `red` / `amber` / `gold`) đổi thành class Tailwind qua `utils/accentClass.ts`.
- `utils/groupByCategory.ts` nhóm game theo thể loại (hàm thuần, có test).
- Form: `title` 1–150 ký tự, `gameCategoryId` bắt buộc. Không chọn chi nhánh nào thì game có ở mọi chi nhánh.
- Lỗi cần báo: `GAME_002` (trùng tên) gán vào trường `title` bằng `setError`. `GAME_005` (thể loại còn game) báo bằng toast.
