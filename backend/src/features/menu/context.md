# Feature: menu (backend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Menu đồ ăn và nước uống: nhóm menu (Nước uống, Trà, Sữa chua & Soda, Cơm chiên, Mì, Nui, Đồ ăn vặt, Snack, Topping thêm) và các món trong từng nhóm.

## Endpoint
| Method | Path | Mô tả | Auth | Cache |
|---|---|---|---|---|
| GET | `/menu` | Toàn bộ menu cho trang khách: nhóm kèm mảng `items`, không phân trang | Công khai | `public, max-age=60` |
| GET | `/menu-items` | Danh sách món. Query: `page`, `limit`, `sort`, `q` (theo tên), `categoryId`, `isAvailable`, `includeInactive` | Công khai | `public, max-age=60` (có token admin: `no-store`) |
| GET | `/menu-items/:id` | Chi tiết một món (trang sửa món). Query: `includeInactive` | Công khai | như trên |
| POST | `/menu-items` | Thêm món → `201` | Admin | `no-store` |
| PUT | `/menu-items/:id` | Sửa món (chỉ gửi trường cần đổi, gồm `isAvailable`: tạm hết) → `200` | Admin | `no-store` |
| DELETE | `/menu-items/:id` | Xóa thật → `204` | Admin | `no-store` |
| GET | `/menu-categories` | Danh sách nhóm, kèm `itemCount`. Query: `page`, `limit`, `sort`, `includeInactive` | Công khai | như `/menu-items` |
| POST | `/menu-categories` | Thêm nhóm → `201` | Admin | `no-store` |
| PUT | `/menu-categories/:id` | Sửa nhóm → `200` | Admin | `no-store` |
| DELETE | `/menu-categories/:id` | Xóa nhóm → `204` (409 nếu còn món) | Admin | `no-store` |

Response món (`GET /menu-items`, `GET /menu-items/:id`, `POST`, `PUT`):
```json
{ "id": 50, "category": { "id": 11, "name": "Mì" }, "name": "Mì trộn best seller",
  "description": null, "priceVnd": 45000, "imageUrl": null,
  "isAvailable": true, "isBestSeller": true, "sortOrder": 0, "isActive": true, "createdAt": "...", "updatedAt": "..." }
```
- Gửi lên dùng `menuCategoryId`; trả về dùng `category: { id, name }` (bảng quản trị hiện được tên nhóm).

`GET /menu`:
```json
[ { "id": 7, "name": "Nước uống", "sortOrder": 0,
    "items": [ { "id": 31, "name": "Nước ép trái cây", "description": "Theo mùa",
                 "priceVnd": 32000, "imageUrl": null, "isAvailable": true, "isBestSeller": false,
                 "sortOrder": 0 } ] } ]
```

Nhóm: `{ "id", "name", "sortOrder", "isActive", "itemCount", "createdAt", "updatedAt" }` (`itemCount` đếm cả món đang ẩn).

## File
| File | Vai trò |
|---|---|
| `menu-item.dto.ts` | `createMenuItemSchema`, `updateMenuItemSchema` (partial, không default, body rỗng bị từ chối), `menuItemIdParamsSchema`, `listMenuItemsQuerySchema`, `getMenuItemQuerySchema` |
| `menu-item.entity.ts` | `MenuItem`, `MENU_ITEM_SELECT`, `toMenuItem` (`menuCategory` → `category`), `MenuSection` + `MenuEntryItem` (dạng của `GET /menu`), `MENU_ITEM_SORT_FIELDS` |
| `menu-item.types.ts` | `MenuItemFilter` |
| `menu-item.repository.ts` | `findMany` (+`count` trong `$transaction`), `findById`, `findIdByName` (trong một nhóm), `categoryExists`, `findMenu`, `create`, `update`, `delete` |
| `menu-item.service.ts` | `getMenu`, `list`, `get`, `create`, `update`, `remove`; kiểm tra nhóm tồn tại và tên không trùng trong nhóm; log `menu_item.created/updated/deleted` |
| `menu-item.controller.ts` | Một controller cho cả `/menu` (`menu`) và `/menu-items` |
| `menu-item.routes.ts` | `createMenuItemRouter(controller, guards)` và `createMenuRouter(controller)` (chỉ `publicCache`, không guard) |
| `menu-category.{dto,entity,repository,service,controller,routes}.ts` | CRUD nhóm (không có `GET /:id`); `MenuCategoryFilter` khai báo trong repository; log `menu_category.created/updated/deleted` |
| `index.ts` | Controller, repository, service, router factory của món và nhóm |

## Bảng DB
- `menu_category`: `name` (UNIQUE `idx_menu_category_name`, ≤ 50), `sort_order`, `is_active`. Migration `20261007200000_create_menu_category_table`.
- `menu_item`: `menu_category_id` (FK `RESTRICT`), `name` ≤ 150, `description` ≤ 255, `price_vnd` (INT UNSIGNED + `CHECK chk_menu_item_price_vnd (price_vnd >= 0)` thêm tay), `image_url` ≤ 500, `is_available`, `is_best_seller` (thêm 2026-10-07, migration `20261007210000_add_is_best_seller_to_menu_item`), `sort_order`, `is_active`. UNIQUE `idx_menu_item_menu_category_id_name` (cũng dùng cho lọc theo nhóm). Migration `20261007200100_create_menu_item_table`.
- Hai migration được đặt tên tay sau `20261007195001_change_game_category_to_many`: Prisma lấy giờ máy, sinh tên sớm hơn migration đã áp dụng.
- Seed `seedMenu()`: **chỉ chạy khi bảng `menu_item` trống**. Dữ liệu là **menu thật của quán** (tờ menu "Ăn vặt phủ phê", 2026-10-07; thay cho 30 món mẫu của prototype): upsert 9 nhóm theo `name`, tạo 58 món bằng `createMany` (`desc` → `description`, `price` → `priceVnd`, `bestSeller` → `isBestSeller`, thứ tự trong mảng → `sortOrder`). Phần trong ngoặc của tờ menu (vị, số lượng) nằm ở `description`; nhóm đồ uống "Ún mín nha" tách 3 nhóm theo 3 cụm trên tờ menu.

## Mã lỗi
| Mã | Hằng | HTTP | Khi nào |
|---|---|---|---|
| `MENU_001` | `MENU_ITEM_NOT_FOUND` | 404 | Không có món, hoặc món ẩn / thuộc nhóm ẩn mà request không phải admin + `includeInactive=true` |
| `MENU_002` | `MENU_CATEGORY_NOT_FOUND` | 404 | `menuCategoryId` gửi lên không tồn tại; sửa/xóa nhóm không tồn tại |
| `MENU_003` | `MENU_NAME_TAKEN` | 409 | Tên nhóm trùng, hoặc tên món đã có trong nhóm (kể cả khi chuyển món sang nhóm khác). Không phân biệt hoa thường và dấu |
| `MENU_004` | `MENU_CATEGORY_HAS_ITEMS` | 409 | Xóa nhóm còn món: "Nhóm còn N món, hãy chuyển hoặc xóa món trước" |
| `COMMON_001` | | 400 | Sai dữ liệu: thiếu `name`/`menuCategoryId`/`priceVnd`, giá âm hoặc số thập phân, `isAvailable=abc`, body PUT rỗng… |

## Business rule
- `isAvailable = false` nghĩa là "tạm hết": món **vẫn hiện** trên web (kể cả trong `GET /menu`). `isActive = false` mới là ẩn.
- **Ẩn nhóm thì món trong nhóm ẩn theo** (đã chốt 2026-10-07): GET công khai chỉ trả món `is_active = 1` **và** nhóm `is_active = 1`.
- `GET /menu`: nhóm đang hiện, xếp theo `sortOrder` nhóm rồi `sortOrder` món (rồi id). **Nhóm không còn món nào đang hiện thì bỏ** (không có tab rỗng).
- `GET /menu-items` không gửi `sort`: xếp theo thứ tự nhóm, rồi `sortOrder` món. `sort` cho phép `sortOrder`, `name`, `priceVnd`, `createdAt`. Nhóm: `sortOrder` (mặc định), `name`, `createdAt`. Luôn thêm `id` tăng dần cuối cùng.
- `includeInactive=true` chỉ có hiệu lực khi có token admin; không có thì bỏ qua.
- Validate: `name` 1–150, `menuCategoryId` số nguyên dương, `priceVnd` số nguyên 0–100.000.000 (đồng) là bắt buộc; `description` ≤ 255; `imageUrl` URL ≤ 500; `isAvailable`, `isActive` mặc định `true`; `isBestSeller` mặc định `false`; `sortOrder` mặc định 0. Nhóm: `name` 1–50. Chuỗi trim, `''` → `null`.
- `isBestSeller = true`: món bán chạy, trang khách hiện huy hiệu "Best seller" (chỉ hiển thị, không ảnh hưởng thứ tự).
- Quản trị sửa/xóa được cả món và nhóm đang ẩn. Xóa là xóa thật. Quyền ghi: **Admin** (owner hoặc staff).

## Phụ thuộc
- Không phụ thuộc feature nào khác. Dùng `guards.optionalAdmin`, `guards.requireAdmin` của `auth`; `@/shared/utils/zod-fields`, `@/shared/utils/pagination`.
