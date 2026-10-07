# Feature: shop (frontend)

> ⏳ **Chưa cài đặt.** Tạo lúc init (2026-10-06) từ `API_SPEC.md` và `FE-ARCHITECTURE.md`. Khi làm feature, cập nhật file này theo code thật.

## Mục đích
Hiển thị thông tin quán (tên, tagline, giờ mở cửa, hotline, link Facebook/Zalo/TikTok...) ở trang chủ, phần liên hệ và footer. Owner sửa thông tin này trong trang quản trị.

## Endpoint dùng
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/shop` | Footer, phần liên hệ, hero trang chủ |
| PUT | `/shop` | Form sửa thông tin quán (Owner) |

## Route và trang
| Path | Trang | Quyền |
|---|---|---|
| `/admin/shop` | `AdminShopPage` | Owner |

Phần công khai không có trang riêng; component được ghép vào layout hoặc `HomePage`.

## Public API (dự kiến)
- `ShopContact` (hotline, link mạng xã hội), `ShopHours`, `useShop`, `shopRoutes`.

## Query key
- `['shop']`. Sau khi `PUT /shop` thành công thì `invalidateQueries({ queryKey: ['shop'] })`.

## Ghi chú UI
- Link mạng xã hội trống thì ẩn icon đó, không hiện link hỏng.
- Lỗi `SHOP_001` (chưa seed dữ liệu): hiện giao diện dự phòng, không làm vỡ trang.
- Link mạng xã hội của `shop` là giá trị dự phòng cho chi nhánh nào để trống `facebookUrl` / `zaloUrl`.
- Muốn dùng `ShopContact` trong `PublicLayout` (nằm ở `shared`) thì không import trực tiếp được, vì `shared` không được import `features`. Truyền qua props/slot từ `app/routes.tsx`, hoặc đặt footer ở `pages/`.
