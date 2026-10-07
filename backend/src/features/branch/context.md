# Feature: branch (backend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Quản lý chi nhánh của quán: địa chỉ, giờ mở cửa, số máy PS5, phòng VIP, diện tích, bản đồ, link liên hệ.

## Endpoint
| Method | Path | Mô tả | Auth | Cache |
|---|---|---|---|---|
| GET | `/branches` | Danh sách. Query: `page`, `limit`, `sort`, `q`, `includeInactive` | Công khai | `public, max-age=60` (có token admin: `no-store`) |
| GET | `/branches/:id` | Chi tiết. Query: `includeInactive` | Công khai | như trên |
| POST | `/branches` | Thêm chi nhánh → `201` | Owner | `no-store` |
| PUT | `/branches/:id` | Sửa (chỉ gửi trường cần đổi) → `200` | Owner | `no-store` |
| DELETE | `/branches/:id` | Xóa thật → `204` | Owner | `no-store` |

Response một chi nhánh:
```json
{ "id": 1, "name": "Quận 10 — Flagship", "address": "123 Sư Vạn Hạnh, ...", "phone": "0901 234 567",
  "openHours": "Mở cửa 24/7", "ps5Count": 20, "vipRoomCount": 3, "pcRoomCount": 0, "areaM2": 120,
  "mapUrl": null, "facebookUrl": null, "zaloUrl": null, "sortOrder": 0, "isActive": true,
  "createdAt": "...", "updatedAt": "..." }
```
Danh sách có thêm `meta: { page, limit, total, totalPages }`.

## File
| File | Vai trò |
|---|---|
| `branch.dto.ts` | `createBranchSchema`, `updateBranchSchema` (partial, không default, body rỗng bị từ chối), `branchIdParamsSchema`, `listBranchesQuerySchema`, `getBranchQuerySchema` |
| `branch.entity.ts` | Kiểu `Branch`, `BRANCH_SELECT`, `BRANCH_SORT_FIELDS` |
| `branch.types.ts` | `BranchFilter` |
| `branch.repository.ts` | `findMany` (+`count` trong `$transaction`), `findById(id, includeInactive)`, `create`, `update`, `delete`, `countByIds`, `findAllIds` |
| `branch.service.ts` | `list`, `get`, `create`, `update`, `remove`; `existsAll`, `findAllIds` (BranchLookup cho `game`); log `branch.created/updated/deleted` |
| `branch.controller.ts` | `list`, `get`, `create`, `update`, `remove` |
| `branch.routes.ts` | GET: `optionalAdmin` → `publicCache` → `validate`; ghi: `requireOwner` → `validate` |
| `index.ts` | `BranchController`, `BranchRepository`, `BranchService`, `createBranchRouter`, type `Branch` |

## Bảng DB
- `branch`: `name`, `address`, `phone`, `open_hours`, `ps5_count`, `vip_room_count`, `pc_room_count`, `area_m2`, `map_url`, `facebook_url`, `zalo_url`, `sort_order`, `is_active`, `created_at`, `updated_at`
- Index: `idx_branch_is_active_sort_order`. Migration `create_branch_table`, `add_pc_room_count_to_branch` (2026-10-07: thêm số phòng PC, mặc định 0; chi nhánh cũ không mất dữ liệu).
- `branch_game.branch_id` dùng `ON DELETE CASCADE` (migration `create_branch_game_table` của `game`): xóa chi nhánh tự gỡ khỏi các game. Model `Branch` có quan hệ `games BranchGame[]`. Lưu ý: game chỉ có ở đúng chi nhánh bị xóa sẽ thành "mọi chi nhánh" (xem `game/context.md`).
- Seed: `seedBranches()` tạo 4 chi nhánh từ `seedBranches` trong `prisma/seed-data.ts` khi bảng đang trống (bảng không có cột UNIQUE nên không upsert được); `sortOrder` theo thứ tự trong file. Chi nhánh mẫu nào có `pcRoom` thì ghi vào `pc_room_count` (mẫu: Tân Bình = 1), còn lại 0.

## Mã lỗi
| Mã | HTTP | Khi nào |
|---|---|---|
| `BRANCH_001` | 404 | Không có chi nhánh, hoặc chi nhánh đang ẩn mà request không phải admin + `includeInactive=true` |
| `COMMON_001` | 400 | Sai dữ liệu: thiếu `name`/`address`, số không nguyên, URL sai, `limit` > 100, id không phải số, body PUT rỗng |
| `AUTH_002/003`, `AUTH_005` | 401, 403 | Ghi khi chưa đăng nhập / staff gọi |

## Business rule
- GET công khai chỉ trả `is_active = 1`. `includeInactive=true` chỉ có hiệu lực khi có token admin hợp lệ; không có token thì **bỏ qua** (không báo lỗi). Áp dụng cho cả danh sách và chi tiết.
- `q` tìm trong `name` **và** `address`, không phân biệt hoa thường và dấu (`go vap` → "Gò Vấp").
- `sort` cho phép: `sortOrder` (mặc định, tăng dần), `name`, `ps5Count`, `createdAt`; trường lạ bỏ qua. Luôn thêm `id` tăng dần cuối cùng để thứ tự ổn định khi phân trang.
- Validate: `name` 1–100, `address` 1–255 (bắt buộc); `ps5Count`, `vipRoomCount`, `pcRoomCount` số nguyên 0–65535 (mặc định 0); `areaM2` số nguyên 1–65535 hoặc `null`; `openHours` ≤ 100; `phone` ≤ 20 (không kiểm định dạng); link là URL đầy đủ ≤ 500. Chuỗi trim, `''` → `null`.
- `POST` không gửi `sortOrder` → 0, không gửi `isActive` → `true`.
- Owner sửa/xóa được cả chi nhánh đang ẩn. Xóa là xóa thật; muốn ẩn tạm thì `PUT { "isActive": false }`.
- `map_url` / `facebook_url` / `zalo_url` để trống thì giao diện tự xử lý: tìm bản đồ theo địa chỉ, dùng link của `shop`, tạo link Zalo từ `phone`.

## Phụ thuộc và public API
- Dùng `guards.optionalAdmin`, `guards.requireOwner` của `auth`. Dùng chung `@/shared/utils/zod-fields` (`requiredText`, `optionalText`, `optionalUrl`, `hasAnyField`) với `shop`.
- `BranchService` thỏa `BranchLookup` mà `game` sẽ khai báo: `existsAll(ids): Promise<boolean>` (đếm cả chi nhánh đang ẩn; danh sách rỗng → `true`) và `findAllIds(): Promise<number[]>`. `app.ts` truyền `branchService` vào `GameService` (đã nối dây). `findAllIds` hiện chưa dùng (game chọn cách "không có dòng = mọi chi nhánh").
- Không import feature nào khác.
