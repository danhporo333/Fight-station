# Feature: branch (frontend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `FE-ARCHITECTURE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Danh sách chi nhánh: địa chỉ, giờ mở cửa, số máy PS5, phòng VIP, bản đồ, link liên hệ. Có bộ chọn chi nhánh để lọc game. Owner thêm, sửa, xóa chi nhánh.

## Endpoint dùng
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/branches` | Trang chi nhánh, `BranchPicker`, trang chủ |
| GET | `/branches/:id` | Chi tiết chi nhánh, form sửa |
| POST / PUT / DELETE | `/branches`, `/branches/:id` | Trang quản trị (Owner) |

## Route và trang
| Path | Trang | Quyền |
|---|---|---|
| `/branches` | `BranchesPage` (lazy) | Công khai |
| `/admin/branches` | `AdminBranchesPage` | Owner |

## Public API (dự kiến)
- `BranchList`, `BranchCard`, `BranchPicker`, `branchRoutes`.

## Query key
- `['branches', query]`, `['branch', id]`. Sau khi thêm/sửa/xóa thì invalidate `['branches']`.

## Ghi chú UI
- `BranchPicker` ghi chi nhánh đã chọn vào URL (`?branch=1`), không lưu vào store. `GameList` đọc URL này. Việc ghép hai component làm ở `src/pages/GamesPage.tsx`, không import chéo giữa hai feature.
- `mapUrl` trống thì tạo link Google Maps từ `address`. `zaloUrl` trống thì tạo link từ `phone`. `facebookUrl` trống thì dùng link của `shop`.
- Xóa chi nhánh cần hộp xác nhận (xóa thật, game tự bị gỡ khỏi chi nhánh này). Lỗi `BRANCH_001` → toast.
