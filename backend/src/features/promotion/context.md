# Feature: promotion (backend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `DATABASE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Khuyến mãi và sự kiện của quán (giải đấu, ưu đãi sinh viên...), có thời gian hiệu lực và có thể đánh dấu nổi bật.

## Endpoint
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/promotions` | Khuyến mãi còn hiệu lực. Lọc: `isFeatured` | Công khai |
| POST | `/promotions` | Thêm khuyến mãi | Admin |
| PUT | `/promotions/:id` | Sửa khuyến mãi | Admin |
| DELETE | `/promotions/:id` | Xóa khuyến mãi | Admin |

API_SPEC không có `GET /promotions/:id`.

## Bảng DB
- `promotion`: `title` (≤ 150 ký tự), `tag` (nhãn nhỏ: Giải đấu, Sinh viên...), `description`, `note` (dòng cuối thẻ: thời gian, địa điểm), `accent_color` (`orange` / `red` / `amber` / `gold`), `is_featured`, `start_date`, `end_date` (DATE, trống = không giới hạn), `sort_order`, `is_active`
- Index `idx_promotion_is_active_end_date`

## Mã lỗi
| Mã | HTTP | Khi nào |
|---|---|---|
| `PROMO_001` | 404 | Không tìm thấy khuyến mãi |
| `PROMO_002` | 400 | `endDate` nhỏ hơn `startDate` |

## Business rule
- "Còn hiệu lực": `is_active = 1` **và** (`end_date` trống **hoặc** `end_date` ≥ hôm nay).
- Ngày gửi và nhận dạng `YYYY-MM-DD`.
- Kiểm tra `endDate ≥ startDate` cả khi `PUT` chỉ gửi một trong hai trường (so với giá trị đang lưu).
- Admin xem cả khuyến mãi hết hạn hoặc bị ẩn bằng `includeInactive=true`.

## Câu hỏi còn mở
- "Hôm nay" tính theo giờ Việt Nam (UTC+7) hay UTC? Nên dùng giờ Việt Nam, vì quanh nửa đêm hai cách cho kết quả khác nhau.
- Có lọc theo `start_date` không (khuyến mãi chưa bắt đầu có hiện không)? API_SPEC chưa nói.

## Phụ thuộc
- Không phụ thuộc feature nào khác.
