# Feature: menu (frontend)

> ✅ **Đã cài đặt** (2026-10-07).

## Mục đích
Menu đồ ăn và nước uống, nhóm theo Combo, Đồ Ăn, Snack, Nước, Cafe. Admin (owner và staff) quản lý món, nhóm và trạng thái "tạm hết".

## Endpoint dùng (backend `menu` đã xong)
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/menu` | `MenuBoard` (trang `/menu`, mục `#menu` ở trang chủ): nhóm kèm `items`, một request |
| GET | `/menu-items?q&categoryId&includeInactive=true&limit=100` | Bảng món ở `AdminMenuPage` |
| GET | `/menu-items/:id?includeInactive=true` | `AdminMenuItemEditPage` |
| POST / PUT / DELETE | `/menu-items`, `/menu-items/:id` | Trang quản trị; nút "Còn hàng / Tạm hết" gửi `PUT { isAvailable }` |
| GET | `/menu-categories?limit=100&includeInactive=true` | Ô chọn nhóm (form món, bộ lọc quản trị), `AdminMenuCategoriesPage` |
| POST / PUT / DELETE | `/menu-categories`, `/menu-categories/:id` | `AdminMenuCategoriesPage` |

## Route và trang
| Path | Trang | Quyền | Khai báo |
|---|---|---|---|
| `/menu` | `MenuPage` (lazy): tiêu đề "Ăn vặt **Phủ phê**" (theo tờ menu của quán) + `<MenuBoard headingLevel="h2" />` | Công khai | `menuPublicRoutes` trong `children` của PublicLayout; link "Menu" trong `PUBLIC_NAV` (cả footer) |
| `/admin/menu` | `AdminMenuPage`: ô tìm tên (`?q=`), ô chọn nhóm (`?category=`), bảng món (kể cả đang ẩn), nút đổi nhanh "Còn hàng / Tạm hết", Sửa/Xóa | Admin | `menuAdminRoutes` trong nhánh `admin`; menu "Menu" ở `AdminRoot.tsx` |
| `/admin/menu/new`, `/admin/menu/:id/edit` | `AdminMenuItemNewPage`, `AdminMenuItemEditPage` (`MenuItemForm`) | Admin | như trên |
| `/admin/menu-categories` | `AdminMenuCategoriesPage`: thêm ở đầu trang, sửa ngay trên dòng, xóa | Admin | như trên; menu "Nhóm menu" |

Trang chủ (`src/pages/HomePage.tsx`): mục `#menu` "Ăn vặt **Phủ phê**" với `<MenuBoard />` (tên nhóm là h3), nằm giữa "Kho game" và "Chi nhánh".

## File
| Thư mục | Nội dung |
|---|---|
| `types/` | `menu.types.ts` (`MenuEntry`, `MenuSection`, `MenuItem`, `MenuItemQuery`, `MenuItemPayload`, `MenuCategory`, `MenuCategoryQuery`, `MenuCategoryPayload`), `menu.schema.ts` (`menuItemFormSchema`, `MENU_ITEM_FORM_FIELDS`, `menuCategoryFormSchema`, `MENU_CATEGORY_FORM_FIELDS`) |
| `services/` | `menu.service.ts` (`getMenu`, `getMenuItems`, `getMenuItem`, `createMenuItem`, `updateMenuItem`, `deleteMenuItem`), `menu-category.service.ts` |
| `hooks/` | `menu.keys.ts`, `useMenu`, `useMenuItems`, `useMenuItem`, `useCreateMenuItem`, `useUpdateMenuItem`, `useDeleteMenuItem`, `useMenuCategories`, `useCreateMenuCategory`, `useUpdateMenuCategory`, `useDeleteMenuCategory`, `useInvalidateMenu` |
| `utils/` | `menu.utils.ts` (`MENU_SEARCH_PARAMS`, `readIdParam`, chuyển form ↔ API cho món và nhóm), `menu-form-errors.ts` (`applyMenuItemErrors`, `applyMenuCategoryErrors`) |
| `components/` | Công khai: `MenuBoard`, `MenuPriceRow`, `BestSellerBadge` (cũng dùng ở bảng quản trị). Quản trị: `AdminMenuFilters`, `MenuItemTable`, `MenuItemForm`, `MenuCategoryForm`, `MenuCategoryRow` |
| `pages/` | `MenuPage`, `AdminMenuPage`, `AdminMenuItemNewPage`, `AdminMenuItemEditPage`, `AdminMenuCategoriesPage` |

## Public API (`index.ts`)
- `MenuBoard` (prop `headingLevel`: `h2` | `h3`, mặc định `h3`), `menuPublicRoutes, `menuAdminRoutes`.

## Query key
- `['menu']` (trang khách), `['menu-items', query]` (query gộp `limit`), `['menu-item', id, { includeInactive }]`, `['menu-categories', query]`.
- Mọi thao tác ghi (món hoặc nhóm) → `useInvalidateMenu` làm mới cả 4 key gốc (trang khách đọc `['menu']`; số món của nhóm, tên nhóm trên bảng món cũng có thể đổi).

## Quyết định đã chốt
- **Bảng giá kiểu tờ menu** (2026-10-07, thay cho tab + thẻ của prototype vì menu thật có 58 món, hầu hết không có mô tả): **mọi nhóm hiện cùng lúc**, mỗi nhóm một khối có tiêu đề (nền cam, vát góc), mỗi món một dòng "Tên ······ 35K" (đường chấm nối tên với giá). Khối xếp bằng CSS columns 1 → 2 (`md`) → 3 (`lg`) cột, `break-inside-avoid`, nên khối dài ngắn khác nhau xếp khít.
- **Hàng nút nhảy nhanh** tới từng nhóm phía trên (`<a href="#menu-<id>">`, khối có `scroll-mt-24` để không bị header che); trên điện thoại vuốt ngang.
- **Giá kiểu "35K"** (`formatVndShort` ở `shared/utils/format.ts`): tròn nghìn thì viết K, giá lẻ (22.500đ) ghi đủ. Bảng quản trị vẫn ghi đủ `formatVnd`.
- **Bán chạy** (`isBestSeller`): huy hiệu ★ "Best seller" viền vàng cạnh tên (trang khách và bảng quản trị); form có ô tick "Bán chạy".
- **Món tạm hết**: vẫn hiện, mờ (`opacity-50`), giá gạch ngang, nhãn "Hết" viền đỏ cạnh tên. Admin đổi nhanh bằng nút tròn có chấm màu trong bảng (xanh "Còn hàng" / vàng "Tạm hết"); nút riêng chứ không dùng `Button` vì màu chữ của variant đè mất màu trạng thái.
- **Ảnh món**: có `imageUrl` thì ô vuông 40px đầu dòng; trống thì chỉ có chữ (như tờ menu).
- **Giá** gõ số nguyên đồng (`25000`, không dấu chấm), trang khách hiển thị `formatVndShort` ("35K"). Form khớp `dto` backend: tên 1–150, mô tả ≤ 255, giá 0–100.000.000, link ảnh ≤ 500.
- **Lỗi form**: `MENU_003` → ô `name` ("Nhóm này đã có món cùng tên" / "Tên nhóm đã tồn tại"); `MENU_002` → ô chọn nhóm; `details` (COMMON_001) → đúng ô; còn lại → khung lỗi đầu form. `MENU_004` (xóa nhóm còn món) → toast; nút Xóa nhóm bị khóa khi `itemCount > 0` (tooltip "Còn N món…").
- **Ô chọn nhóm** (form món, bộ lọc quản trị) liệt kê cả nhóm đang ẩn, ghi "(đang ẩn)". `SelectField` có `key` theo số nhóm để chọn đúng giá trị mặc định khi danh sách nhóm tải xong sau form.
- Bảng món đang lọc theo nhóm → nút "Thêm món" mở form chọn sẵn nhóm đó (`/admin/menu/new?category=<id>`); thêm xong quay về bảng lọc theo nhóm của món vừa thêm. Ở trang nhóm, bấm "N món" mở bảng món lọc theo nhóm đó.
- Nhóm đang ẩn ghi "Đang ẩn (mọi món trong nhóm ẩn theo)".
- `useMenuItems` dùng `placeholderData: keepPreviousData` (đổi từ khóa / nhóm không nháy khung xám). Bảng quản trị `limit: 100`, chưa phân trang.

## Ghi chú UI
- `MenuPriceRow`: tên đậm, mô tả nhỏ `text-muted` dưới tên (vị, số lượng), giá mono `text-neon-gold` phát sáng nhẹ; giá có chữ "Giá" ẩn cho trình đọc màn hình, đường chấm `aria-hidden`.
- `MenuBoard`: khối nhóm `bg-card/80` viền cam mờ. Đủ 3 trạng thái: khung xám, lỗi + "Thử lại", rỗng ("Menu đang được cập nhật.").
- Chưa có: test chính thức (`/fe-test menu`), upload ảnh món (chỉ nhập link), phân trang bảng quản trị.
