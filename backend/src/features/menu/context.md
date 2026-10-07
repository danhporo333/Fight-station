# Feature: menu (backend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `DATABASE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Menu đồ ăn và nước uống: nhóm menu (Combo, Đồ Ăn, Snack, Nước, Cafe) và các món trong từng nhóm.

## Endpoint
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/menu` | Toàn bộ menu: các nhóm, mỗi nhóm kèm mảng `items` (dùng cho trang chủ) | Công khai |
| GET | `/menu-items` | Danh sách món. Lọc: `q`, `categoryId`, `isAvailable` | Công khai |
| POST | `/menu-items` | Thêm món | Admin |
| PUT | `/menu-items/:id` | Sửa món (gồm đổi `isAvailable`: tạm hết) | Admin |
| DELETE | `/menu-items/:id` | Xóa món | Admin |
| GET | `/menu-categories` | Danh sách nhóm menu | Công khai |
| POST | `/menu-categories` | Thêm nhóm | Admin |
| PUT | `/menu-categories/:id` | Sửa nhóm | Admin |
| DELETE | `/menu-categories/:id` | Xóa nhóm (409 nếu còn món) | Admin |

## Bảng DB
- `menu_category`: `name` (UNIQUE), `sort_order`, `is_active`
- `menu_item`: `menu_category_id` (FK, `RESTRICT`), `name`, `description`, `price_vnd`, `image_url`, `is_available`, `sort_order`, `is_active`
- Index `idx_menu_item_menu_category_id_name` (UNIQUE): tên món không trùng trong cùng nhóm. Index này cũng dùng cho lọc theo nhóm, nên không cần index riêng cho FK.
- Thêm tay `CHECK (price_vnd >= 0)` vào migration.

## Mã lỗi
| Mã | HTTP | Khi nào |
|---|---|---|
| `MENU_001` | 404 | Không tìm thấy món |
| `MENU_002` | 404 | Không tìm thấy nhóm menu (cả khi `menuCategoryId` gửi lên không tồn tại) |
| `MENU_003` | 409 | Tên nhóm đã tồn tại, hoặc tên món đã có trong nhóm |
| `MENU_004` | 409 | Nhóm còn món, cần chuyển hoặc xóa món trước |

## Business rule
- `is_available = 0` nghĩa là "tạm hết": món **vẫn hiện** trên web. `is_active = 0` mới là ẩn khỏi web.
- `GET /menu` chỉ lấy nhóm và món có `is_active = 1`, xếp theo `sortOrder` của nhóm rồi của món.
- Tiền là số nguyên đơn vị đồng.

## Phụ thuộc
- Không phụ thuộc feature nào khác.
