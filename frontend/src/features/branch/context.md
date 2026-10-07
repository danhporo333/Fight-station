# Feature: branch (frontend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Danh sách chi nhánh: địa chỉ, giờ mở cửa, số máy PS5, phòng VIP, diện tích, bản đồ, link liên hệ. Có bộ chọn chi nhánh để lọc game. Owner thêm, sửa, xóa chi nhánh.

## Endpoint dùng (backend `branch` đã xong)
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/branches?limit=100` | `BranchList` (trang `/branches`, trang chủ), `BranchPicker`; quản trị thêm `includeInactive=true` |
| GET | `/branches/:id?includeInactive=true` | `AdminBranchEditPage` (sửa được cả chi nhánh đang ẩn) |
| POST / PUT / DELETE | `/branches`, `/branches/:id` | Trang quản trị (Owner) |

## Route và trang
| Path | Trang | Quyền | Khai báo |
|---|---|---|---|
| `/branches` | `src/pages/BranchesPage.tsx` (lazy; trang ghép `branch` + `shop`) | Công khai | route khai báo thẳng trong `app/routes.tsx`; link "Chi nhánh" trong `PUBLIC_NAV`, nút "Liên hệ" (`PUBLIC_CTA`) cũng trỏ về đây |
| `/admin/branches` | `AdminBranchesPage`: bảng (kể cả đang ẩn), nút Thêm/Sửa/Xóa | Owner | `branchOwnerRoutes` trong nhóm `RequireRole owner`; menu "Chi nhánh" (`ownerOnly`) ở `app/AdminRoot.tsx` |
| `/admin/branches/new` | `AdminBranchNewPage` | Owner | như trên |
| `/admin/branches/:id/edit` | `AdminBranchEditPage` | Owner | như trên |

Trang chủ (`src/pages/HomePage.tsx`) ghép `BranchList` dưới `ShopHero` (mục `#branches`). Cả hai trang dùng `SectionHeading` ("// LOCATIONS", "Hệ thống **Chi nhánh**") và truyền `fallbackFacebookUrl={shop?.facebookUrl}` (lấy bằng `useShop` của `shop`).

## File
| Thư mục | Nội dung |
|---|---|
| `types/` | `branch.types.ts` (`Branch`, `BranchListQuery`, `BranchPayload`), `branch.schema.ts` (`branchFormSchema`, `BRANCH_FORM_FIELDS`) |
| `services/` | `getBranches`, `getBranch`, `createBranch`, `updateBranch`, `deleteBranch` |
| `hooks/` | `branch.keys.ts`, `useBranches`, `useBranchSummary`, `useBranch`, `useCreateBranch`, `useUpdateBranch`, `useDeleteBranch`, `useInvalidateBranches` |
| `utils/` | `BRANCH_SEARCH_PARAM`, `telHref`, `mapHref`, `zaloHref`, `EMPTY_BRANCH_FORM`, `toBranchFormValues`, `toBranchPayload` |
| `components/` | `BranchCard`, `BranchList`, `BranchPicker`, `BranchForm`, `BranchTable` |
| `pages/` | `AdminBranchesPage`, `AdminBranchNewPage`, `AdminBranchEditPage` (trang công khai ở `src/pages/BranchesPage.tsx`) |

## Public API (`index.ts`)
- `BranchList` (prop `fallbackFacebookUrl`), `BranchPicker`, `useBranchSummary` (`{ count, ps5Total }` cho số liệu hero trang chủ; dùng chung cache `useBranches`, không gọi API thêm), `BRANCH_SEARCH_PARAM`, `branchOwnerRoutes`, type `Branch`.

## Query key
- `['branches', query]` (query đã gộp `limit: 100`), `['branch', id, { includeInactive }]`.
- Thêm/sửa/xóa xong → `useInvalidateBranches` invalidate cả `['branches']` và `['branch']`; trang công khai và quản trị dùng chung cache.

## Quyết định đã chốt
- Không phân trang, không ô tìm kiếm (quán chỉ có vài chi nhánh): mọi danh sách gọi `limit: 100`.
- Form thêm/sửa là trang riêng (không popup); lưu xong về `/admin/branches` kèm toast. Nút "Lưu" khóa khi form chưa đổi.
- Form giữ mọi ô dạng chuỗi; ô số kiểm tra bằng regex (số nguyên, khoảng giá trị khớp `branch.dto.ts`), `toBranchPayload` đổi sang `number`, ô trống → `null`. Lỗi `details` của API gán vào đúng ô (`applyServerErrors` + `BRANCH_FORM_FIELDS`).
- Xóa dùng `ConfirmDialog` (shared), nói rõ xóa thật, game chỉ có ở riêng chi nhánh đó sẽ thành "mọi chi nhánh", và gợi ý "bỏ chọn Đang hoạt động" để ẩn tạm. Lỗi xóa (vd `BRANCH_001`) → toast.
- Link tự tạo khi trống: bản đồ → `https://www.google.com/maps/search/?api=1&query=<địa chỉ>`; Zalo → `https://zalo.me/<số điện thoại chỉ còn chữ số>` (không có số thì ẩn nút); gọi → `tel:`.
- **Facebook trống thì dùng Facebook của quán** (giống prototype): trang ghép truyền `fallbackFacebookUrl` vào `BranchList` → `BranchCard`; `branch` không import `shop`. Không có cả hai thì ẩn nút.
- `BranchPicker`: dãy nút vuông kiểu neon (chữ mono in hoa) "Tất cả chi nhánh" + từng chi nhánh, ghi `?branch=<id>` lên URL (`replace`, xóa `page`), không lưu store; đang tải/lỗi thì ẩn. Dùng ở `src/pages/GamesPage.tsx` (lọc game theo chi nhánh).

## Ghi chú UI
- `BranchCard` (giao diện neon theo prototype, đã được chủ dự án chỉnh): thẻ nền `bg-card`, vạch gradient cam trên đỉnh; nhãn `CHI NHÁNH 01` (số thứ tự theo vị trí trong danh sách, 2 chữ số) và tên in hoa, cả hai căn giữa; danh sách địa chỉ / hotline (`tel:`) / giờ mở cửa ngăn bằng gạch đứt; 3 nút xếp dọc "Facebook", "Zalo" (nền cam), "Đường đi" (viền). Lưới 4 cột từ `xl`, 2 cột từ `sm`.
- Ô số liệu trên thẻ (chữ Orbitron, giá trị 0 hoặc trống thì ẩn ô đó):
  - "Phòng PS5 + Xem phim" = `vipRoomCount`. Nhãn chứa `\n` và `<dt>` dùng `whitespace-pre-line` nên "+ Xem phim" xuống dòng; muốn ngắt dòng nhãn khác thì thêm `\n`.
  - "Phòng PC Gaming" = `pcRoomCount`; hiện chỉ chi nhánh 04 (Quận 7) có 1 phòng PC.
  - "Máy PS5", "Diện tích" đang tắt bằng comment trong `BranchCard.tsx` (bỏ `//` để bật lại).
- Phòng PC trong quản trị: form có ô "Số phòng PC" (nhóm Quy mô), bảng có cột "Phòng PC" (0 hiện `—`).
- `BranchList` đủ 3 trạng thái: khung xám (đang tải), lỗi + "Thử lại", "Chưa có chi nhánh nào".
- Bảng quản trị làm mờ hàng chi nhánh đang ẩn và gắn nhãn "Đang ẩn".
