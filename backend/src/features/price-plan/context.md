# Feature: price-plan (backend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Bảng giá giờ chơi. Mỗi gói có giá, đơn vị, dòng phụ dưới giá và danh sách quyền lợi (features).

## Endpoint
| Method | Path | Mô tả | Auth | Cache |
|---|---|---|---|---|
| GET | `/price-plans` | Danh sách gói, kèm mảng `features` đã xếp thứ tự. Query: `page`, `limit`, `sort`, `branchId`, `includeInactive` | Công khai | `public, max-age=60` (có token admin: `no-store`) |
| GET | `/price-plans/:id` | Chi tiết một gói. Query: `includeInactive` | Công khai | như trên |
| POST | `/price-plans` | Thêm gói kèm `features` → `201` | **Owner** | `no-store` |
| PUT | `/price-plans/:id` | Sửa gói (chỉ gửi trường cần đổi); gửi `features` thì thay toàn bộ → `200` | **Owner** | `no-store` |
| DELETE | `/price-plans/:id` | Xóa thật (xóa luôn `features`) → `204` | **Owner** | `no-store` |

Response gói (mọi endpoint trên):
```json
{ "id": 1, "name": "Quick Match", "priceVnd": 15000, "unit": "/giờ",
  "description": "Giờ thường — Thứ 2 đến Thứ 6", "isHot": false,
  "features": [ { "id": 1, "content": "Máy PS5 chuẩn", "sortOrder": 0 } ],
  "sortOrder": 0, "isActive": true, "createdAt": "...", "updatedAt": "..." }
```
Request gửi `features: string[]` (vd `["Phòng riêng", "Tặng 1 nước"]`), xem `API_SPEC.md` mục 7.6.

## File
| File | Vai trò |
|---|---|
| `price-plan.dto.ts` | `createPricePlanSchema`, `updatePricePlanSchema` (partial, không default, body rỗng bị từ chối), `pricePlanIdParamsSchema`, `listPricePlansQuerySchema`, `getPricePlanQuerySchema` |
| `price-plan.entity.ts` | `PricePlan`, `PricePlanFeature`, `PRICE_PLAN_SELECT`, `toPricePlan` (bóc chi nhánh khỏi dòng bảng nối), `PRICE_PLAN_SORT_FIELDS` |
| `price-plan.types.ts` | `PricePlanFilter`, `BranchLookup`, `BranchIdsChange` |
| `price-plan.repository.ts` | `findMany` (+`count` trong `$transaction`), `findById`, `create` (nested create quyền lợi), `update` (thay quyền lợi + sửa gói trong một interactive transaction), `delete` |
| `price-plan.service.ts` | `list`, `get`, `create`, `update`, `remove`; log `price_plan.created/updated/deleted` |
| `price-plan.controller.ts`, `price-plan.routes.ts` | GET: `optionalAdmin` → `publicCache` → `validate`; ghi: `requireOwner` → `validate` |
| `index.ts` | Controller, repository, service, router factory |

## Bảng DB
- `price_plan_branch`: bảng nối gói ↔ chi nhánh (`price_plan_id`, `branch_id`, đều FK CASCADE; UNIQUE `idx_price_plan_branch_price_plan_id_branch_id`, index `idx_price_plan_branch_branch_id`). Migration `add_branch_id_to_price_plan` (cột đơn, đã thay thế) rồi `change_price_plan_branch_to_many` (tạo bảng nối, chuyển dữ liệu `branch_id` cũ sang bảng nối, bỏ cột; viết tay vì `migrate dev` đòi xác nhận khi xóa cột).
- `price_plan`: `name` ≤ 100, `price_vnd` (INT UNSIGNED + `CHECK chk_price_plan_price_vnd (price_vnd >= 0)` thêm tay), `unit` ≤ 30 (mặc định `/giờ`), `description` ≤ 255, `is_hot`, `sort_order`, `is_active`. Index `idx_price_plan_is_active_sort_order`. Migration `20261007220000_create_price_plan_table`.
- `price_plan_feature`: `price_plan_id` (FK **CASCADE**), `content` ≤ 255, `sort_order`. Index `idx_price_plan_feature_price_plan_id`. Migration `20261007220100_create_price_plan_feature_table`.
- Tên migration đặt tay (Prisma lấy giờ máy, sinh tên sớm hơn migration đã áp dụng).
- Seed `seedPricePlans()`: **chỉ chạy khi bảng `price_plan` trống**. Từ 2026-10-08 là **bảng giá thật** từ tờ giá của quán: mỗi loại phòng một gói (VIP 69K, VVIP 79K, Luxury PS5 89K, Luxury PC 95K, Dorm 39K, giá Giờ lẻ), `period` → `description` ("Giờ lẻ"), các combo là dòng `features` dạng `Tên combo: 199K` (frontend nhận ra đuôi `: <số>K` và vẽ thành bảng giá nhỏ). Mỗi gói VIP/VVIP/Luxury có thêm 5 dòng dịch vụ trong phòng (PS5/PC, TV, Netflix, loa, WC...) từ tờ ROOM LIST; Dorm chưa có. 4 gói mẫu cũ đã bị xóa khỏi DB dev cùng ngày.

## Mã lỗi
| Mã | Hằng | HTTP | Khi nào |
|---|---|---|---|
| `PRICE_001` | `PRICE_PLAN_NOT_FOUND` | 404 | Không có gói, hoặc gói đang ẩn mà request không phải admin + `includeInactive=true` |
| `PRICE_002` | `PRICE_PLAN_BRANCH_NOT_FOUND` | 400 | `branchIds` ở POST/PUT có chi nhánh không tồn tại |
| `AUTH_005` | | 403 | Staff gọi API ghi (chỉ owner được sửa giá) |
| `COMMON_001` | | 400 | Sai dữ liệu: `priceVnd` âm hoặc số thập phân, quá 10 quyền lợi, quyền lợi rỗng (`details` field `features.1`), body PUT rỗng… |

## Business rule
- **Quyền lợi** (đã chốt 2026-10-07): 0–10 dòng, mỗi dòng 1–255 ký tự (trim). Thứ tự trong mảng quyết định `sortOrder` (0, 1, 2...). `features: []` hợp lệ (gói không có quyền lợi). Response xếp theo `sortOrder` rồi `id`.
- `PUT` có `features` thì xóa hết quyền lợi cũ rồi tạo lại, trong **một transaction**; không gửi `features` thì giữ nguyên.
- **Dòng phụ dưới giá** (vd "Giờ thường — Thứ 2 đến Thứ 6", đã chốt 2026-10-07) lưu ở `description`, không thêm cột.
- `priceVnd` số nguyên 0–100.000.000 (`15000` = 15.000đ). `unit` 1–30 ký tự, mặc định `/giờ`. `isHot` mặc định `false`, `sortOrder` 0, `isActive` `true`. `''` → `null` cho `description`.
- GET công khai chỉ trả `is_active = 1`; `includeInactive=true` chỉ có hiệu lực khi có token admin. `sort` cho phép `sortOrder` (mặc định), `name`, `priceVnd`, `createdAt`; luôn thêm `id` tăng dần cuối.
- Quyền ghi: **Owner** (khác game/menu là Admin). Chủ quán sửa/xóa được cả gói đang ẩn. Xóa là xóa thật.
- **Chi nhánh áp dụng** (2026-10-08, nhiều-nhiều qua `price_plan_branch`): `branchIds` khi ghi (`null` hoặc không gửi = mọi chi nhánh, mảng = chỉ các chi nhánh đó, `[]` bị từ chối, id trùng tự gộp); response trả `branches: [{ id, name }]` (mảng rỗng = mọi chi nhánh). Một gói chọn được nhiều chi nhánh để chi nhánh giá giống nhau không phải nhập lặp. Bảng giá thật hiện chỉ có ở chi nhánh 4 (Quận 7, chi nhánh duy nhất có phòng PC) nên 5 gói đều gắn chi nhánh 4. `GET /price-plans?branchId=X` trả gói có chi nhánh X cộng gói áp dụng mọi chi nhánh; không có `branchId` thì trả mọi gói. `PUT` có `branchIds` thì thay toàn bộ (xóa dòng cũ, tạo lại, cùng transaction), không gửi thì giữ nguyên. Có chi nhánh không tồn tại → `400 PRICE_002`. Xóa chi nhánh mà gói chỉ áp dụng ở đó thì gói thành "mọi chi nhánh" (CASCADE xóa dòng nối, giống `branch_game`).

## Phụ thuộc
- Cần `BranchLookup` (`existsAll`, khai báo ở `price-plan.types.ts`); `app.ts` truyền `BranchService` vào `PricePlanService`. Dùng `guards.optionalAdmin`, `guards.requireOwner` của `auth`; `@/shared/utils/zod-fields`, `@/shared/utils/pagination`.
