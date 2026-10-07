# Feature: menu (frontend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `FE-ARCHITECTURE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Menu đồ ăn và nước uống, nhóm theo Combo, Đồ Ăn, Snack, Nước, Cafe. Admin quản lý món, nhóm và trạng thái "tạm hết".

## Endpoint dùng
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/menu` | Trang menu, trang chủ (nhóm kèm `items`, một request) |
| GET | `/menu-items?q&categoryId&isAvailable` | Bảng món ở trang quản trị |
| POST / PUT / DELETE | `/menu-items`, `/menu-items/:id` | Trang quản trị (Admin) |
| GET / POST / PUT / DELETE | `/menu-categories` | Quản lý nhóm menu |

## Route và trang
| Path | Trang | Quyền |
|---|---|---|
| `/menu` | `MenuPage` (lazy) | Công khai |
| `/admin/menu` | `AdminMenuPage` | Admin |

## Public API (dự kiến)
- `MenuList` (theo nhóm), `MenuItemRow`, `menuRoutes`.

## Query key
- `['menu']`, `['menu-items', query]`, `['menu-categories']`. Sửa món hoặc nhóm thì invalidate cả `['menu']`, vì trang công khai đọc từ key này.

## Ghi chú UI
- `isAvailable = false`: món **vẫn hiện**, nhưng mờ đi và có nhãn "Tạm hết". Admin bật/tắt nhanh bằng một nút (`PUT` chỉ gửi `isAvailable`).
- Giá dùng `formatVnd`. `imageUrl` trống thì không hiện ảnh hoặc hiện ảnh dự phòng.
- Lỗi cần báo: `MENU_003` (trùng tên) gán vào trường `name`. `MENU_004` (nhóm còn món) báo bằng toast.
