# Giải thích code: feature `menu` (Frontend)

| | |
|---|---|
| **Phía** | FE (frontend) |
| **Chế độ** | `code` |
| **Target** | `menu` |
| **Ngày viết** | 2026-10-07 |
| **Tài liệu đã đọc** | `frontend/src/features/menu/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07, giao diện bảng giá kiểu tờ menu), `frontend/docs/FE-ARCHITECTURE.md` (mục 3, 4, 5, 6, 7, 9), `01-share-docs/API_SPEC.md` (mục 5, 6) |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `menu` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

| Ai | Thấy gì | Ở đâu |
|---|---|---|
| Khách | Menu đồ ăn, nước uống dạng **bảng giá** giống tờ menu của quán: 9 nhóm, mỗi món một dòng "Tên ······ 45K" | Trang `/menu` và mục "Ăn vặt **Phủ phê**" ở trang chủ |
| Chủ quán, nhân viên | Bảng món (tìm, lọc theo nhóm), nút **Còn hàng / Tạm hết** bấm một lần là đổi, form thêm/sửa món, trang nhóm menu | `/admin/menu`, `/admin/menu/new`, `/admin/menu/:id/edit`, `/admin/menu-categories` |

Ví dụ đời thường: trang khách là **tờ menu dán trên tường**: nhìn một lần thấy hết, không phải lật trang. Trang quản trị là **cuốn sổ của quầy**: tra món, gạch món tạm hết, thêm món mới.

### Vì sao là "bảng giá" chứ không phải "thẻ"?

Bản prototype hiện menu bằng **tab nhóm + thẻ to** (mỗi món một ô có viền). Khi nhập menu thật của quán thì thấy:
- Có **58 món**, hầu hết **không có mô tả**: thẻ to chứa mỗi tên và giá trông trống trải, và phải cuộn rất lâu.
- Khách quen nhìn **tờ menu giấy**: tên bên trái, giá bên phải, các nhóm đặt cạnh nhau.

Nên giao diện được đổi thành **bảng giá**: mọi nhóm hiện cùng lúc, mỗi món chỉ chiếm một dòng.

### Các thư mục

Theo FE-ARCHITECTURE mục 3, luồng một chiều:

```
component → hook (TanStack Query) → service → http (axios) → API
```

| Thư mục | Có gì |
|---|---|
| `types/` | Kiểu dữ liệu API (`menu.types.ts`), luật form (`menu.schema.ts`) |
| `services/` | Hàm gọi API: `menu.service.ts` (món + `/menu`), `menu-category.service.ts` |
| `hooks/` | 12 hook: đọc (`useMenu`, `useMenuItems`, `useMenuItem`, `useMenuCategories`), ghi (thêm/sửa/xóa món và nhóm), `useInvalidateMenu`, và `menu.keys.ts` |
| `utils/` | Chuyển form ↔ API (`menu.utils.ts`), gán lỗi API vào ô form (`menu-form-errors.ts`) |
| `components/` | Khách: `MenuBoard`, `MenuPriceRow`, `BestSellerBadge`. Quản trị: `AdminMenuFilters`, `MenuItemTable`, `MenuItemForm`, `MenuCategoryForm`, `MenuCategoryRow` |
| `pages/` | `MenuPage` + 4 trang quản trị |
| `routes.tsx`, `index.ts` | Khai báo route (tải lazy) và những gì cho bên ngoài dùng |

---

## 📁 File: `types/menu.types.ts`

### Mục đích
Mô tả **đúng** dữ liệu backend trả về, để TypeScript báo lỗi khi gõ sai tên trường.

### Phân tích

Có **hai dạng món**, giống backend:

| Kiểu | Từ API | Có gì |
|---|---|---|
| `MenuEntry` (nằm trong `MenuSection.items`) | `GET /menu` | Tên, mô tả, `priceVnd`, ảnh, `isAvailable`, `isBestSeller`, thứ tự |
| `MenuItem` (mở rộng `MenuEntry`) | `GET /menu-items` | Thêm `category: { id, name }`, `isActive`, ngày tạo/sửa |

`MenuItemPayload` là body gửi lên: dùng `menuCategoryId` (số) thay vì `category` (đối tượng). Ngày giờ là `string` (ISO), tiền là `number` (đồng).

---

## 📁 File: `services/` và `hooks/`

### Service: chỉ gọi API

```ts
export const getMenu = () => http.get<MenuSection[]>('/menu')
export const updateMenuItem = (id: number, payload: Partial<MenuItemPayload>) =>
  http.put<MenuItem>(`/menu-items/${id}`, payload)
```
Không bắt lỗi, không có logic. Lỗi API đi lên thành `ApiError` (có `code`, `message`, `details`).

### Hook: bọc TanStack Query

**Query key** gom một chỗ ở `menu.keys.ts`:

| Key | Dữ liệu |
|---|---|
| `['menu']` | Cả menu cho trang khách |
| `['menu-items', query]` | Danh sách món ở trang quản trị (mỗi bộ lọc một ô cache) |
| `['menu-item', id, { includeInactive }]` | Một món (trang sửa) |
| `['menu-categories', query]` | Danh sách nhóm |

Ví dụ đời thường: query key giống **nhãn trên hộp đựng** trong tủ lạnh. Cùng nhãn thì lấy hộp cũ ra dùng, không nấu lại (không gọi lại API).

**`useInvalidateMenu`**: mọi thao tác ghi (thêm/sửa/xóa món **hoặc** nhóm) đều làm mới **cả 4** key. Vì sao không chỉ key danh sách món?
- Trang khách đọc `['menu']`: sửa giá mà không làm mới thì khách vẫn thấy giá cũ.
- Đổi tên nhóm thì cột "Nhóm" trong bảng món cũng đổi.
- Thêm/xóa món thì `itemCount` của nhóm đổi.

**`useMenuItems`** dùng `placeholderData: keepPreviousData`: đang gõ tìm hoặc đổi nhóm thì bảng cũ vẫn hiện trong lúc tải, không nháy về khung xám.

### 📏 Quy tắc dự án liên quan
- Dữ liệu server **chỉ nằm trong TanStack Query**, không chép vào `useState` (FE-ARCHITECTURE mục 7).
- Component không gọi `http` trực tiếp, không `useEffect` để tải dữ liệu.

---

## 📁 File: `components/MenuBoard.tsx` (trang khách)

### Mục đích
Vẽ cả menu dạng bảng giá: hàng nút nhóm ở trên, bên dưới là các khối nhóm.

### Phân tích

**Một request cho cả trang**: `useMenu()` gọi `GET /menu` một lần, nhận đủ 9 nhóm kèm món. Backend đã bỏ nhóm rỗng và món ẩn, frontend chỉ việc vẽ.

**Đủ 3 trạng thái** (bắt buộc với mọi danh sách):

| Trạng thái | Hiện gì |
|---|---|
| Đang tải | 6 khối xám nhấp nháy, cao thấp khác nhau cho giống thật |
| Lỗi | Thông báo + nút "Thử lại" (`refetch`) |
| Rỗng | "Menu đang được cập nhật." |

**Xếp khối bằng CSS columns** (`columns-1 md:columns-2 lg:columns-3`):
- Nhóm Mì có 11 món, nhóm Nui có 3 món. Nếu dùng lưới (grid), mỗi hàng cao bằng khối cao nhất nên khối Nui sẽ hở một khoảng lớn.
- **CSS columns** xếp như **cột báo**: khối này nối tiếp khối kia từ trên xuống, hết cột thì sang cột sau, nên các khối xếp khít.
- `break-inside-avoid` giữ mỗi khối nguyên vẹn, không bị cắt đôi sang hai cột.
- Kết quả: 1 cột trên điện thoại, 2 cột trên máy tính bảng (`md`), 3 cột trên máy tính (`lg`).

**Hàng nút nhảy nhanh**:
- Mỗi nút là một link thường `<a href="#menu-7">`, bấm thì trình duyệt cuộn tới khối có `id="menu-7"`.
- Khối có `scroll-mt-24` (chừa 6rem phía trên), để tiêu đề nhóm không bị thanh header dính trên cùng che mất.
- Trên điện thoại, 9 nút không vừa một hàng nên hàng nút **vuốt ngang** được (`overflow-x-auto`). Đây là lý do có hàng nút này: trên điện thoại 58 món xếp một cột rất dài.

**Prop `headingLevel`** (`'h2' | 'h3'`, mặc định `h3`): cấp tiêu đề của tên nhóm.
- Trang `/menu`: tiêu đề trang là h1, nên tên nhóm là **h2**.
- Trang chủ: mục "Ăn vặt Phủ phê" đã là h2, nên tên nhóm là **h3**.
- Tiêu đề không nhảy cóc cấp (h1 → h3) giúp trình đọc màn hình đọc đúng cấu trúc trang.

---

## 📁 File: `components/MenuPriceRow.tsx` và `BestSellerBadge.tsx`

### Mục đích
Một dòng của bảng giá: `Mì trộn best seller ★BEST SELLER ·········· 45K`.

### Phân tích

**Đường chấm nối tên với giá**: giữa tên và giá là một thẻ `<span>` rỗng có `flex-1` (giãn hết chỗ trống) và viền dưới chấm chấm (`border-dotted`). Tên dài thì đường chấm ngắn lại, tên ngắn thì dài ra, nên giá luôn thẳng cột bên phải. Thẻ này có `aria-hidden`: trình đọc màn hình không đọc "chấm chấm chấm".

**Giá kiểu "45K"**: `formatVndShort` (ở `shared/utils/format.ts`, có test):

| Giá (đồng) | Hiện |
|---|---|
| 45000 | `45K` |
| 8000 | `8K` |
| 22500 | `22.500đ` (giá lẻ ghi đủ, không làm tròn sai) |

Trước giá có chữ "Giá" ẩn (`sr-only`), nên trình đọc màn hình đọc "Mì trộn best seller, Giá 45K".

**Ba trạng thái của một món**:

| Dữ liệu | Hiện |
|---|---|
| `isBestSeller: true` | Huy hiệu ★ "BEST SELLER" viền vàng cạnh tên (`BestSellerBadge`, bảng quản trị cũng dùng) |
| `isAvailable: false` | Cả dòng mờ đi (`opacity-50`), giá gạch ngang, nhãn đỏ "Hết". Món **vẫn hiện** để khách biết quán có món này |
| `description` có nội dung | Dòng chữ nhỏ dưới tên, vd "Việt quất / Chanh dây / Dâu…", "3 cây" |

Có `imageUrl` thì hiện ảnh vuông 40px đầu dòng (`alt`, `loading="lazy"`, kích thước cố định); trống thì chỉ có chữ, như tờ menu.

---

## 📁 Trang quản trị

### `AdminMenuPage` + `AdminMenuFilters` + `MenuItemTable`

**Bộ lọc nằm trên URL**: ô tìm ghi `?q=` (chờ 300ms sau lần gõ cuối, `useDebounce`), ô chọn nhóm ghi `?category=`. Tải lại trang hay gửi link cho người khác vẫn giữ nguyên bộ lọc. Trang đọc URL rồi gọi `useMenuItems({ includeInactive: true, q, categoryId })`.

**Nút "Còn hàng / Tạm hết"** trong bảng:
- Bấm thì gọi `PUT /menu-items/:id` với **đúng một trường** `{ isAvailable: !isAvailable }`. Backend sửa một phần nên các trường khác giữ nguyên.
- Đang gửi thì nút của **đúng dòng đó** bị khóa (`togglingId` lấy từ `updateItem.variables?.id`).
- Màu theo trạng thái: chấm xanh "Còn hàng" / chấm vàng "Tạm hết".
- Đây là nút tự viết, **không dùng `Button` dùng chung**: `Button` có sẵn màu chữ theo kiểu (variant), màu đó đè mất màu xanh/vàng. Lỗi này được phát hiện khi chụp màn hình kiểm tra.

**Đi lại tiện tay giữa các trang**:
- Đang lọc nhóm "Mì" mà bấm "Thêm món" → mở `/admin/menu/new?category=<id Mì>`, form **chọn sẵn** nhóm Mì.
- Thêm xong → quay về bảng lọc theo nhóm của món vừa thêm.
- Ở trang nhóm, bấm "11 món" → mở bảng món lọc theo nhóm đó.

**Xóa món** luôn qua `ConfirmDialog`, có nhắc: hết hàng tạm thời thì dùng nút "Tạm hết", muốn ẩn thì bỏ chọn "Đang hoạt động".

### `MenuItemForm` (trang thêm và trang sửa dùng chung)

React Hook Form + `zodResolver(menuItemFormSchema)`. Luật form **khớp `dto` backend** (tên 1–150, mô tả ≤ 255, giá 0–100.000.000, link ≤ 500) để báo lỗi ngay, không cần chờ server.

**Ô nhập luôn là chuỗi**: ô giá chứa chữ `"45000"`, chỉ đổi sang số khi gửi (`toMenuItemPayload`). Gõ `45.000` thì báo "Giá phải là số nguyên không âm, vd 25000". Ô trống đổi thành `null` khi gửi.

**Ô chọn nhóm** liệt kê cả nhóm đang ẩn (ghi "(đang ẩn)"). Có một mẹo nhỏ: form có thể hiện **trước** khi danh sách nhóm tải xong, lúc đó ô chọn chưa có lựa chọn nào để chọn sẵn. `SelectField` được gắn `key` theo số nhóm, nên khi danh sách về thì ô chọn được vẽ lại và chọn đúng nhóm của món.

Ba ô tick ở mục "Hiển thị": **Còn hàng**, **Bán chạy**, **Đang hoạt động**.

**Lỗi từ server gán vào đúng ô** (`applyMenuItemErrors`):

| Mã lỗi | Hiện ở |
|---|---|
| `MENU_003` (trùng tên trong nhóm) | Dưới ô Tên món: "Nhóm này đã có món cùng tên" |
| `MENU_002` (nhóm vừa bị xóa) | Dưới ô Nhóm menu |
| `COMMON_001` có `details` | Dưới từng ô sai |
| Lỗi khác | Khung lỗi đầu form |

### `AdminMenuCategoriesPage` + `MenuCategoryForm` + `MenuCategoryRow`

Giống trang thể loại game: thêm nhóm ở đầu trang, **sửa ngay trên dòng** (bấm "Sửa" thì dòng đổi thành form), xóa qua hộp xác nhận.
- Nút Xóa **bị khóa** khi nhóm còn món (`itemCount > 0`), rê chuột hiện "Còn N món, chuyển hoặc xóa món trước". Nếu vẫn lọt tới API (`MENU_004`) thì báo bằng toast.
- Nhóm đang ẩn ghi rõ "Đang ẩn (mọi món trong nhóm ẩn theo)".

---

## 📁 Ghép vào app: `routes.tsx`, `index.ts`

```ts
export const menuPublicRoutes  = [{ path: 'menu', lazy: ... }]          // gắn vào PublicLayout
export const menuAdminRoutes   = [{ path: 'menu', lazy: ... }, ...]     // gắn dưới /admin (đã bọc RequireAuth)
```
- Mọi trang **tải lazy**: khách vào trang chủ không phải tải code trang quản trị.
- `app/routes.tsx` thêm "Menu" vào `PUBLIC_NAV`: link tự hiện ở thanh menu trên cùng **và** footer.
- `AdminRoot.tsx` thêm 2 mục "Menu", "Nhóm menu" (không có `ownerOnly`: nhân viên cũng vào được).
- `src/pages/HomePage.tsx` (trang ghép nhiều feature) đặt `<MenuBoard />` giữa "Kho game" và "Chi nhánh".
- `index.ts` chỉ export `MenuBoard`, `menuPublicRoutes`, `menuAdminRoutes`. Hook, service, form là chuyện nội bộ.

---

## 💡 Điểm cần nhớ

- Trang khách là **bảng giá**: mọi nhóm hiện cùng lúc, xếp bằng **CSS columns** cho khít, có hàng nút nhảy nhanh tới nhóm.
- **Một request** `GET /menu` cho cả trang khách; trang quản trị dùng `/menu-items` có lọc.
- Giá trang khách ghi **"45K"** (`formatVndShort`), trang quản trị ghi đủ "45.000đ".
- **Tạm hết vẫn hiện** (mờ, gạch giá, nhãn "Hết"); bán chạy có huy hiệu ★.
- Nút "Tạm hết" chỉ gửi **một trường** `isAvailable`.
- Mọi thao tác ghi làm mới **cả 4 query key**, để trang khách thấy thay đổi ngay.
- Bộ lọc quản trị nằm **trên URL**; lỗi server gán vào **đúng ô** của form.

## 🔗 Liên kết

- Gọi tới: API backend `menu` (`/menu`, `/menu-items`, `/menu-categories`).
- Dùng của shared: `http`, `formatVnd`, `formatVndShort`, `Button`, `TextField`, `SelectField`, `CheckboxField`, `ConfirmDialog`, `FormAlert`, `SectionHeading`, `useDebounce`, `applyServerErrors`, `getErrorMessage`.
- Được dùng bởi: `src/pages/HomePage.tsx` (`MenuBoard`), `src/app/routes.tsx` (route).
- Tài liệu: `frontend/src/features/menu/context.md`; `frontend/docs/FE-ARCHITECTURE.md` mục 3 (giải phẫu feature), 4 (luồng dữ liệu), 6 (routing), 7 (state); `01-share-docs/API_SPEC.md` mục 5 (mã `MENU_*`).
- Bài cùng loại: [game.md](game.md) (cấu trúc trang quản trị và thể loại tương tự).

Xem phần còn lại: [../../../../backend/docs/explain/code/menu.md](../../../../backend/docs/explain/code/menu.md)
