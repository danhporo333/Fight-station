# Feature: shop (backend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Thông tin chung của quán: tên, tagline, giờ mở cửa, hotline, email, link mạng xã hội. Luôn chỉ có **một** bản ghi (`id = 1`).

## Endpoint
| Method | Path | Mô tả | Auth | Cache |
|---|---|---|---|---|
| GET | `/shop` | Lấy thông tin quán | Công khai | `public, max-age=60` |
| PUT | `/shop` | Cập nhật thông tin quán (chỉ gửi trường cần đổi) | Owner | `no-store` |

Không có POST hay DELETE.

Response (cả GET và PUT):
```json
{ "success": true, "data": { "id": 1, "name": "FIGHT STATION", "tagline": "...", "hoursLabel": "24/7",
  "hotline": "0901 234 567", "email": "hello@fightstation.vn", "facebookUrl": "https://...",
  "zaloUrl": null, "tiktokUrl": null, "instagramUrl": null, "youtubeUrl": null,
  "updatedAt": "2026-10-07T04:19:07.424Z" } }
```

## File
| File | Vai trò |
|---|---|
| `shop.dto.ts` | `updateShopSchema`: mọi trường tùy chọn, body rỗng `{}` bị từ chối |
| `shop.entity.ts` | Kiểu `Shop`, `SHOP_ID = 1`, `SHOP_SELECT` |
| `shop.repository.ts` | `find()`, `update(data)`, luôn theo `id = 1` |
| `shop.service.ts` | `get()`, `update(adminId, dto)`; thiếu dòng → `SHOP_001`; log `shop.updated` (adminId + tên trường đã đổi) |
| `shop.controller.ts` | `get`, `update` |
| `shop.routes.ts` | `createShopRouter(controller, guards)`: `GET /` → `publicCache`; `PUT /` → `requireOwner` → `validate` |
| `index.ts` | Export `ShopController`, `ShopRepository`, `ShopService`, `createShopRouter` |

## Bảng DB
- `shop`: `id`, `name`, `tagline`, `hours_label`, `hotline`, `email`, `facebook_url`, `zalo_url`, `tiktok_url`, `instagram_url`, `youtube_url`, `created_at`, `updated_at`
- `id` **không** auto-increment (`@default(1)`): MySQL không cho CHECK trên cột AUTO_INCREMENT. Migration `create_shop_table` có thêm tay `CONSTRAINT chk_shop_single_row CHECK (id = 1)`.
- Seed: `seedShop()` trong `prisma/seed.ts` tạo dòng `id = 1` từ `seedShop` trong `prisma/seed-data.ts`; đã có dòng thì bỏ qua (không ghi đè dữ liệu chủ quán đã sửa).

## Mã lỗi
| Mã | HTTP | Khi nào |
|---|---|---|
| `SHOP_001` | 404 | Chưa có dòng `id = 1` (cần chạy `npx prisma db seed`) |
| `COMMON_001` | 400 | Body rỗng `{}` (field `""`), `name` rỗng, email/URL sai, quá độ dài cột |
| `AUTH_002/003` | 401 | `PUT` thiếu token / token hết hạn |
| `AUTH_005` | 403 | Staff gọi `PUT` |

## Business rule
- Đọc và ghi luôn theo `id = 1`, không nhận id từ client.
- Chuỗi được trim. Trường tùy chọn gửi `""` hoặc toàn khoảng trắng → lưu `null`; gửi `null` để xóa giá trị. `name` bắt buộc, không được rỗng.
- Link mạng xã hội là URL đầy đủ, tối đa 500 ký tự. `hotline` chỉ giới hạn 20 ký tự, không kiểm tra định dạng (cho phép `0901 234 567`).
- `branch.facebook_url` / `zalo_url` để trống thì giao diện dùng link của `shop`.

## Phụ thuộc
- Không phụ thuộc feature nào khác. Dùng `guards.requireOwner` từ `auth`.
