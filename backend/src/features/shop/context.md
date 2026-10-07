# Feature: shop (backend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `DATABASE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Thông tin chung của quán: tên, tagline, giờ mở cửa, hotline, email, link mạng xã hội. Luôn chỉ có **một** bản ghi.

## Endpoint
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/shop` | Lấy thông tin quán | Công khai |
| PUT | `/shop` | Cập nhật thông tin quán (chỉ gửi trường cần đổi) | Owner |

Không có POST hay DELETE.

## Bảng DB
- `shop`: `name`, `tagline`, `hours_label`, `hotline`, `email`, `facebook_url`, `zalo_url`, `tiktok_url`, `instagram_url`, `youtube_url`
- Chỉ có dòng `id = 1`: thêm tay `CHECK (id = 1)` vào file migration (Prisma không tự tạo được).

## Mã lỗi
| Mã | HTTP | Khi nào |
|---|---|---|
| `SHOP_001` | 404 | Chưa có dòng `id = 1` (cần chạy seed) |

## Business rule
- Đọc và ghi luôn theo `id = 1`, không nhận id từ client.
- Trường tùy chọn: gửi `null` để xóa giá trị. Không lưu chuỗi rỗng.
- Link mạng xã hội là URL đầy đủ, tối đa 500 ký tự.
- `branch.facebook_url` / `zalo_url` để trống thì giao diện dùng link của `shop`.

## Phụ thuộc
- Không phụ thuộc feature nào khác.
- Cần seed dòng `id = 1` trong `prisma/seed.ts`.
