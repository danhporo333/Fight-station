# Feature: game (frontend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Hiển thị game của quán theo thể loại, lọc theo chi nhánh và tìm theo tên. Admin (owner và staff) quản lý game và thể loại.

## Endpoint dùng (backend `game` đã xong)
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/games?q&categoryId&branchId&limit=100` | `GameList` (trang `/games`, trang chủ `limit=8`); quản trị thêm `includeInactive=true` |
| GET | `/games?limit=1` | `useGameCount` (đọc `meta.total` cho số "Tựa game" ở hero) |
| GET | `/games/:id?includeInactive=true` | `AdminGameEditPage` (có `branchIds`) |
| POST / PUT / DELETE | `/games`, `/games/:id` | Trang quản trị |
| GET | `/game-categories?limit=100` | `GameFilters` (nút thể loại), ô tick thể loại trong `GameForm` (`GameCategoriesField`, `includeInactive`), trang quản trị thể loại |
| POST / PUT / DELETE | `/game-categories`, `/game-categories/:id` | `AdminGameCategoriesPage` |
| GET | `/branches?limit=100&includeInactive=true` | `useBranchOptions` (ô tick chi nhánh trong form game). Gọi API thẳng, **không import feature `branch`**; key `['branches', params]` trùng trang quản trị chi nhánh nên dùng chung cache và tự làm mới khi chi nhánh đổi |

## Route và trang
| Path | Trang | Quyền | Khai báo |
|---|---|---|---|
| `/games` | `src/pages/GamesPage.tsx` (lazy; ghép `branch` + `game`; **8 game/trang**, thanh chuyển trang `?page=`) | Công khai | route trong `app/routes.tsx`; link "Game" trong `PUBLIC_NAV` |
| `/admin/games` | `AdminGamesPage`: ô tìm theo tên (`?q=` trên URL), bảng (kể cả đang ẩn), Thêm/Sửa/Xóa | Admin | `gameAdminRoutes` trong nhánh `admin`; menu "Game" ở `AdminRoot.tsx` |
| `/admin/games/new`, `/admin/games/:id/edit` | `AdminGameNewPage`, `AdminGameEditPage` (form có ô tick 1–5 thể loại) | Admin | như trên |
| `/admin/game-categories` | `AdminGameCategoriesPage`: thêm ở đầu trang, sửa ngay trên dòng, xóa | Admin | như trên; menu "Thể loại game" |

Trang chủ (`src/pages/HomePage.tsx`): hero thêm số "Tựa game" (`useGameCount`), nút "Xem game" → `/games`, mục `#games` "Kho game **Khủng bố**" với **`GameCarousel`** (dải tối đa 16 game tự trượt sang trái) + nút "Xem tất cả game".

## File
| Thư mục | Nội dung |
|---|---|
| `types/` | `game.types.ts` (`AccentColor`, `Game`, `GameDetail`, `GameListQuery`, `GamePayload`, `GameCategory`, `GameCategoryQuery`, `GameCategoryPayload`, `BranchOption`), `game.schema.ts` (`gameFormSchema`, `GAME_FORM_FIELDS`, `gameCategoryFormSchema`, `GAME_CATEGORY_FORM_FIELDS`) |
| `services/` | `game.service.ts` (`getGames`, `getGame`, `createGame`, `updateGame`, `deleteGame`, `getBranchOptions`, `BRANCH_OPTIONS_PARAMS`), `game-category.service.ts` |
| `hooks/` | `game.keys.ts`, `useGames`, `useGameCount`, `useGame`, `useCreateGame`, `useUpdateGame`, `useDeleteGame`, `useInvalidateGames`, `useGameCategories`, `useCreateGameCategory`, `useUpdateGameCategory`, `useDeleteGameCategory`, `useBranchOptions` |
| `utils/` | `accent.ts` (`ACCENT_TEXT_CLASS`, `ACCENT_SWATCH_CLASS`, `ACCENT_OPTIONS`), `game.utils.ts` (`GAME_SEARCH_PARAMS`, `readIdParam`, chuyển form ↔ API cho game và thể loại), `game-form-errors.ts` (`applyGameErrors`) |
| `components/` | Công khai: `GameCard`, `GameList`, `GameCarousel`, `GameFilters`. Quản trị: `GameForm` (+ `GameCategoriesField`, `AccentColorField`, `GameBranchesField`), `GameTable`, `AdminGameSearch`, `GameCategoryForm`, `GameCategoryRow` |
| `pages/` | `AdminGamesPage`, `AdminGameNewPage`, `AdminGameEditPage`, `AdminGameCategoriesPage` |

## Public API (`index.ts`)
- `GameCarousel` (prop `limit`), `GameList` (props `query`, `emptyMessage`, `onPageChange`), `GameFilters`, `useGameCount`, `gameAdminRoutes`, `GAME_SEARCH_PARAMS`, `readIdParam`, type `Game`, `GameListQuery`.

## Query key
- `['games', query]` (query gộp `limit`), `['game', id, { includeInactive }]`, `['game-categories', query]`.
- Mọi thao tác ghi (game hoặc thể loại) → `useInvalidateGames` làm mới cả `['games']`, `['game']`, `['game-categories']` (số game của thể loại, tên thể loại trên thẻ game đều có thể đổi).

## Quyết định đã chốt
- **Nhiều thể loại** (2026-10-07): `Game.categories` là mảng (xếp theo `sortOrder` thể loại); form dùng ô tick (`GameCategoriesField`), chọn 1–5, liệt kê cả thể loại đang ẩn (ghi "đang ẩn"); gửi `gameCategoryIds: number[]`. Thẻ game ghi `Hành Động · Co-op`, bảng quản trị ghi `Hành Động, Co-op`. `GAME_003` (thể loại vừa bị xóa) → lỗi ngay ở ô thể loại.
- **Chi nhánh**: form có ô "Có ở mọi chi nhánh" (mặc định) → gửi `branchIds: null`; bỏ chọn thì hiện ô tick từng chi nhánh (kể cả chi nhánh đang ẩn, ghi "(đang ẩn)"), phải tick ≥ 1 → gửi mảng. Khớp quy ước backend "không có dòng = mọi chi nhánh".
- **Phân trang `/games`** (2026-10-07): mỗi trang `GAMES_PER_PAGE` = 8 game (`?page=N`, trang 1 không ghi). `useGames` trả `{ items, meta }`; `GameList` nhận `onPageChange` thì hiện `Pagination` (shared: mũi tên ‹ ›, số trang có "…" khi nhiều trang, ẩn khi chỉ 1 trang). Đổi trang ghi URL **không** `replace` (nút Quay lại về trang trước) và cuộn lên đầu danh sách. Đổi chi nhánh/thể loại/từ khóa thì xóa `?page` (về trang 1). Trang vượt quá số trang → "Không có game nào ở trang này." kèm thanh để quay lại. Trang chủ vẫn 8 game đầu, không phân trang; trang quản trị vẫn `limit: 100`.
- **Bộ lọc trên URL**: `GameFilters` ghi `?category=<id>` và `?q=` (ô tìm chờ 300ms bằng `useDebounce`, `replace`); `BranchPicker` (branch) ghi `?branch=<id>`. `GamesPage` đọc cả ba (`readIdParam` bỏ giá trị sai) rồi truyền vào `GameList`.
- **Mọi thẻ game cao bằng nhau** (2026-10-07): tên luôn chiếm đúng 2 dòng (`line-clamp-2` + `min-h-[2lh]`, dài hơn thì "…"), thể loại 1 dòng (`truncate`), dòng thể loại/số người đẩy xuống đáy (`mt-auto`), thẻ `h-full` để giãn theo ô lưới/dải trượt. Tên và thể loại đầy đủ hiện khi rê chuột (`title`).
- **Thẻ game** theo prototype: poster 3:4 (`posterUrl` trống → tên game chữ to, màu theo `accentColor` qua `ACCENT_TEXT_CLASS`, phát sáng), tên in hoa, thể loại (cam) và số người chơi (mono). Lưới 2 cột → 3 (`sm`) → 4 (`lg`).
- **Màu nhấn**: 4 ô màu dạng radio (`AccentColorField`), có chữ cho trình đọc màn hình.
- **Lỗi form**: `GAME_002` → ô `title` ("Tên game đã tồn tại"); `details` (COMMON_001) → đúng ô; còn lại (`GAME_003`, `GAME_006`) → khung lỗi đầu form (`applyGameErrors`). Thể loại: `GAME_004` qua `details`/khung lỗi.
- **Xóa thể loại**: nút Xóa bị khóa khi `gameCount > 0` (tooltip "Còn N game…"); API vẫn chặn bằng `GAME_005`. Xóa game/thể loại đều có `ConfirmDialog`.
- **Tìm ở trang quản trị**: `AdminGameSearch` ghi `?q=` (chờ 300ms, `replace`, nút ✕ xóa từ khóa); `AdminGamesPage` đọc `q` rồi gọi `useGames({ includeInactive: true, q })`. Không có kết quả thì ghi "Không có game nào có tên chứa …".
- `useGames` dùng `placeholderData: keepPreviousData`: đổi bộ lọc hoặc từ khóa thì giữ danh sách cũ trên màn hình trong lúc tải, không nháy về khung xám.
- Thể loại đang ẩn ghi "Đang ẩn (game chỉ có thể loại này sẽ ẩn theo)" ở trang quản trị thể loại: game chỉ ẩn khi **mọi** thể loại của nó đều ẩn. `shared/components/ui/SelectField.tsx` hiện chưa nơi nào dùng (giữ cho `menu`, `promotion`).

## Ghi chú UI
- **`GameCarousel`** (trang chủ, 2026-10-07): danh sách lặp 2 lần trong một hàng `w-max`, chạy `animate-marquee` (keyframes trong `styles/index.css`: `translateX(0 → -50%)`, **60s một vòng**, `linear infinite`) nên nối liền mạch. Khoảng cách giữa thẻ dùng `pr-*` (không dùng `gap`) để 2 bản lặp dài đúng bằng nhau. Rê chuột hoặc focus bên trong thì dừng (`animation-play-state: paused`). Hai mép mờ dần (`mask-image`). Bản lặp thứ 2 `aria-hidden`. `prefers-reduced-motion`: không chạy, cho cuộn ngang. Đang tải, lỗi, hoặc **dưới 6 game** → hiện `GameList` 8 game (lưới) thay vì dải trượt (ít game sẽ hở khoảng trống). Muốn nhanh/chậm hơn: đổi `60s` ở `--animate-marquee`.
- `GameList` đủ 3 trạng thái: khung xám (tối đa 8), lỗi + "Thử lại", rỗng ("Chưa có game nào." / "Không có game nào khớp bộ lọc." trên `/games` khi đang lọc).
- `GameFilters`: nút thể loại vuông kiểu prototype (đang chọn nền cam phát sáng), ô tìm có icon kính lúp.
- Hộp xác nhận xóa chi nhánh (feature `branch`) đã ghi: game chỉ có ở riêng chi nhánh đó sẽ chuyển thành có ở mọi chi nhánh.
- Chưa có: test chính thức (`/fe-test game`), lọc theo thể loại ở bảng quản trị, upload ảnh poster (chỉ nhập link).
