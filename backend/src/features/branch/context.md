# Feature: branch (backend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `DATABASE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Quản lý chi nhánh của quán: địa chỉ, giờ mở cửa, số máy PS5, phòng VIP, bản đồ, link liên hệ.

## Endpoint
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/branches` | Danh sách chi nhánh. Lọc: `q` | Công khai |
| GET | `/branches/:id` | Chi tiết chi nhánh | Công khai |
| POST | `/branches` | Thêm chi nhánh | Owner |
| PUT | `/branches/:id` | Sửa chi nhánh (chỉ gửi trường cần đổi) | Owner |
| DELETE | `/branches/:id` | Xóa chi nhánh, tự gỡ khỏi `branch_game` | Owner |

## Bảng DB
- `branch`: `name`, `address`, `phone`, `open_hours`, `ps5_count`, `vip_room_count`, `area_m2`, `map_url`, `facebook_url`, `zalo_url`, `sort_order`, `is_active`
- Index: `idx_branch_is_active_sort_order`
- `branch_game.branch_id` dùng `ON DELETE CASCADE` (bảng nối thuộc feature `game`)

## Mã lỗi
| Mã | HTTP | Khi nào |
|---|---|---|
| `BRANCH_001` | 404 | Không tìm thấy chi nhánh |

## Business rule
- GET công khai chỉ trả `is_active = 1`. `includeInactive=true` cần token Admin.
- Sắp xếp mặc định theo `sortOrder` tăng dần. Hỗ trợ phân trang (`page`, `limit`) và `sort`.
- `map_url` / `facebook_url` / `zalo_url` để trống thì giao diện tự xử lý: tìm bản đồ theo địa chỉ, dùng link của `shop`, tạo link Zalo từ `phone`.
- Xóa là xóa thật (không soft delete). Muốn ẩn tạm thì đặt `isActive = false`.

## Phụ thuộc và public API
- Export qua `index.ts` một service thỏa interface `BranchLookup` mà feature `game` khai báo, ví dụ `existsAll(ids: number[]): Promise<boolean>` và `findAllIds()`. `app.ts` nối hai feature với nhau.
- Không import feature nào khác.
