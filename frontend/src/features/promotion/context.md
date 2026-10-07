# Feature: promotion (frontend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `FE-ARCHITECTURE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Khuyến mãi và sự kiện (giải đấu, ưu đãi sinh viên...). Khuyến mãi nổi bật hiện ở trang chủ. Admin thêm, sửa, xóa.

## Endpoint dùng
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/promotions?isFeatured=true` | Khối nổi bật ở trang chủ |
| GET | `/promotions` | Trang khuyến mãi (API chỉ trả khuyến mãi còn hiệu lực) |
| GET | `/promotions?includeInactive=true` | Trang quản trị (cần token) |
| POST / PUT / DELETE | `/promotions`, `/promotions/:id` | Trang quản trị (Admin) |

API không có `GET /promotions/:id`. Form sửa lấy dữ liệu từ danh sách đã tải.

## Route và trang
| Path | Trang | Quyền |
|---|---|---|
| `/promotions` | `PromotionsPage` (lazy) | Công khai |
| `/admin/promotions` | `AdminPromotionsPage` | Admin |

## Public API (dự kiến)
- `PromotionList`, `PromotionCard`, `FeaturedPromotions`, `promotionRoutes`.

## Query key
- `['promotions', query]`. Thêm/sửa/xóa thì invalidate `['promotions']`.

## Ghi chú UI
- Thẻ hiện `tag` (nhãn nhỏ), `title`, `description`, `note` (dòng cuối: thời gian, địa điểm). Màu theo `accentColor`.
- Ngày `startDate` / `endDate` dạng `YYYY-MM-DD`, hiển thị bằng `formatDate`. Trống nghĩa là không giới hạn.
- Form: kiểm tra `endDate ≥ startDate` ngay trên form (Zod `refine`), khớp lỗi `PROMO_002` của API.
