# Feature: price-plan (backend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `DATABASE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Bảng giá giờ chơi. Mỗi gói có giá, đơn vị và danh sách quyền lợi (features).

## Endpoint
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/price-plans` | Danh sách gói, kèm mảng `features` đã xếp thứ tự | Công khai |
| GET | `/price-plans/:id` | Chi tiết một gói | Công khai |
| POST | `/price-plans` | Thêm gói kèm `features` | Owner |
| PUT | `/price-plans/:id` | Sửa gói; nếu gửi `features` thì thay toàn bộ danh sách | Owner |
| DELETE | `/price-plans/:id` | Xóa gói (xóa luôn `features`) | Owner |

Ví dụ request/response: `API_SPEC.md` mục 7.6.

## Bảng DB
- `price_plan`: `name`, `price_vnd` (INT UNSIGNED, đơn vị đồng), `unit` (mặc định `/giờ`), `description`, `is_hot`, `sort_order`, `is_active`. Index `idx_price_plan_is_active_sort_order`.
- `price_plan_feature`: `price_plan_id` (FK, `CASCADE`), `content` (≤ 255 ký tự), `sort_order`
- Thêm tay `CHECK (price_vnd >= 0)` vào migration.

## Mã lỗi
| Mã | HTTP | Khi nào |
|---|---|---|
| `PRICE_001` | 404 | Không tìm thấy gói giá |
| `AUTH_005` | 403 | Staff gọi API ghi (chỉ owner được sửa giá) |
| `COMMON_001` | 400 | Vd `priceVnd` âm hoặc là số thập phân |

## Business rule
- Request gửi `features: string[]`. Response trả `features: [{ id, content, sortOrder }]`.
- Thứ tự trong mảng `features` quyết định `sortOrder` (0, 1, 2...).
- `PUT` có `features` thì xóa hết feature cũ rồi tạo lại, làm trong một transaction.
- `priceVnd` là số nguyên ≥ 0 (`15000` = 15.000đ).
- GET công khai chỉ trả `is_active = 1`.

## Phụ thuộc
- Không phụ thuộc feature nào khác.
