# Feature: price-plan (frontend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `FE-ARCHITECTURE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Bảng giá giờ chơi: các gói giá, kèm danh sách quyền lợi và nhãn "HOT". Owner thêm, sửa, xóa gói.

## Endpoint dùng
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/price-plans` | Trang bảng giá, trang chủ |
| GET | `/price-plans/:id` | Form sửa |
| POST / PUT / DELETE | `/price-plans`, `/price-plans/:id` | Trang quản trị (Owner) |

## Route và trang
| Path | Trang | Quyền |
|---|---|---|
| `/pricing` | `PricingPage` (lazy) | Công khai |
| `/admin/price-plans` | `AdminPricePlansPage` | Owner |

## Public API (dự kiến)
- `PricePlanList`, `PricePlanCard`, `pricePlanRoutes`.

## Query key
- `['price-plans']`, `['price-plan', id]`.

## Ghi chú UI
- Giá hiển thị bằng `formatVnd(priceVnd)` + `unit`, vd `15.000đ/giờ`.
- `isHot` thì làm nổi thẻ (viền hoặc nhãn màu `brand`).
- `features` đã được API xếp đúng thứ tự, không cần sắp xếp lại.
- Form: danh sách quyền lợi thêm/xóa/kéo thứ tự được (`useFieldArray`). Gửi lên là `string[]`, thứ tự trong mảng chính là thứ tự hiển thị.
- `priceVnd` là số nguyên ≥ 0. Không cho nhập số thập phân.
