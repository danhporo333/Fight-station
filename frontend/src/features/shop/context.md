# Feature: shop (frontend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Hiển thị thông tin quán (tên, tagline, giờ mở cửa, hotline, email, link mạng xã hội) ở hero trang chủ và footer mọi trang công khai. Owner sửa thông tin này trong trang quản trị.

## Endpoint dùng
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/shop` | `ShopFooter`, `ShopHero`, `AdminShopPage` (dùng chung một cache) |
| PUT | `/shop` | `ShopForm` (Owner) |

## Route và trang
| Path | Trang | Quyền | Khai báo |
|---|---|---|---|
| `/admin/shop` | `AdminShopPage` (lazy) | Owner | `shopOwnerRoutes`, gắn trong nhóm `RequireRole owner` của `app/routes.tsx`; menu "Thông tin quán" (`ownerOnly`) trong `app/AdminRoot.tsx` |

Phần công khai không có trang riêng:
- `ShopFooter`: `app/routes.tsx` truyền vào `PublicLayout` qua prop `footer` (shared không import features).
- `ShopHero`: `src/pages/HomePage.tsx` dùng.

## File
| Thư mục | Nội dung |
|---|---|
| `types/` | `shop.types.ts` (`Shop`, `UpdateShopPayload`, `ShopSocialKey`), `shop.schema.ts` (`shopFormSchema`, `SHOP_FORM_FIELDS`) |
| `services/` | `getShop`, `updateShop` |
| `hooks/` | `shop.keys.ts`, `useShop`, `useUpdateShop` |
| `utils/` | `getSocialLinks`, `socialLabel`, `SOCIAL_KEYS`, `toShopFormValues`, `toShopPayload`, `telHref` |
| `components/` | `ShopFooter`, `ShopHero`, `HeroController` (hình tay cầm SVG của hero), `ShopSocialLinks`, `ShopForm` |
| `pages/` | `AdminShopPage` |

## Public API (`index.ts`)
- `ShopFooter`, `ShopHero` (props `stats?: HeroStat[]`, `actions?: ReactNode`), type `HeroStat`, `useShop` (trang ghép đọc thông tin quán, vd Facebook dự phòng cho thẻ chi nhánh), `shopOwnerRoutes`, type `Shop`.

## Query key
- `['shop']` (`shopKeys.all`). `useUpdateShop` thành công → `invalidateQueries({ queryKey: ['shop'] })`, footer và hero tự cập nhật.

## Quyết định đã chốt
- Form gửi đủ 10 trường mỗi lần lưu; ô trống → `null` (`toShopPayload`). Nút "Lưu thay đổi" và "Hoàn tác" khóa khi form chưa đổi.
- Schema form khớp `shop.dto.ts` backend: `name` bắt buộc ≤ 100; độ dài theo cột; email và URL kiểm tra khi ô không trống. Lỗi `details` của API gán vào đúng ô (`applyServerErrors` + `SHOP_FORM_FIELDS`).
- Sau khi lưu, form khởi tạo lại theo dữ liệu server (`reset` + `key={shop.updatedAt}`).
- Link mạng xã hội hiện dạng nút chữ (Facebook, Zalo, TikTok, Instagram, YouTube), vì `lucide-react` không có icon thương hiệu; link trống thì ẩn.
- Hotline bấm được (`tel:`, bỏ khoảng trắng và dấu chấm); email là `mailto:`.

## Ghi chú UI
- `ShopHero` theo prototype: badge "System online — Ready player one" (chấm nhấp nháy), tên quán tách chữ đầu (trắng, hiệu ứng `animate-glitch`) và phần còn lại (chữ viền `text-outline`), tagline, `actions` do trang ghép truyền (trang chủ: "Xem game", "Tìm chi nhánh"), hàng số liệu = `stats` truyền vào + "Giờ mở cửa" từ `hoursLabel` (giá trị rỗng hoặc "0" thì ẩn), khung `HeroController` (cắt góc, tay cầm trôi `animate-float`), hai quầng sáng mờ phía sau. Số liệu của feature khác truyền qua props nên `shop` không import feature khác. Tắt hiệu ứng khi người dùng bật giảm chuyển động (`prefers-reduced-motion`).
- Lỗi `GET /shop` (kể cả `SHOP_001` chưa seed) ở trang công khai: footer chỉ hiện dòng bản quyền, hero chỉ hiện tên mặc định "Fight Station"; không làm vỡ trang.
- `AdminShopPage` gặp `SHOP_001`: hiện thông báo cần chạy `npx prisma db seed` và nút "Thử lại" thay cho form.
- Link mạng xã hội của `shop` là giá trị dự phòng cho chi nhánh để trống `facebookUrl` / `zaloUrl` (dùng khi làm `branch`).
