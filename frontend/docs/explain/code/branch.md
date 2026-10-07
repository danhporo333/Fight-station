# Giải thích code: feature `branch` (Frontend)

| | |
|---|---|
| **Phía** | FE (frontend) |
| **Chế độ** | `code` |
| **Target** | `branch` |
| **Ngày viết** | 2026-10-07 |
| **Tài liệu đã đọc** | `frontend/src/features/branch/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07, đã có phòng PC), `frontend/docs/FE-ARCHITECTURE.md` (mục 3, 5, 6, 9, 10) |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `branch` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

Phía giao diện của `branch` có **2 mặt**:

| Mặt | Ở đâu | Ai dùng |
|---|---|---|
| **Xem chi nhánh** | Trang `/branches`, mục "Hệ thống chi nhánh" ở trang chủ, số liệu "4 chi nhánh / 57 máy PS5" ở hero | Khách |
| **Quản lý chi nhánh** | `/admin/branches` (bảng), `/admin/branches/new` (thêm), `/admin/branches/:id/edit` (sửa) | Chỉ chủ quán |

Ngoài ra feature còn làm sẵn **`BranchPicker`** (dãy nút chọn chi nhánh) để trang game dùng sau này.

Ví dụ đời thường: khách nhìn **tấm bản đồ chuỗi cửa hàng** dán ở cửa; chủ quán có **sổ quản lý** để thêm, sửa, gạch tạm hay xóa cửa hàng. Cả hai cùng đọc một nguồn: cache TanStack Query lấy từ API `/branches`.

### Cấu trúc thư mục và luồng gọi

```
component → hook (TanStack Query) → service → http.ts (Axios) → API /api/v1/branches
```

| Thư mục | Nội dung |
|---|---|
| `types/` | `branch.types.ts` (hình dạng dữ liệu, query, payload), `branch.schema.ts` (luật form) |
| `services/` | `getBranches`, `getBranch`, `createBranch`, `updateBranch`, `deleteBranch` |
| `hooks/` | `branch.keys.ts`, `useBranches`, `useBranch`, `useBranchSummary`, `useCreateBranch`, `useUpdateBranch`, `useDeleteBranch`, `useInvalidateBranches` |
| `utils/` | Tạo link bản đồ / Zalo / gọi điện, đổi dữ liệu form ↔ API |
| `components/` | `BranchCard`, `BranchList`, `BranchPicker`, `BranchForm`, `BranchTable` |
| `pages/` | 3 trang quản trị. Trang công khai `/branches` nằm ở `src/pages/BranchesPage.tsx` (xem lý do bên dưới) |
| `routes.tsx`, `index.ts` | Route quản trị (lazy) và public API |

---

## 📁 File: `types/branch.types.ts` và `types/branch.schema.ts`

### Mục đích
- `branch.types.ts`: kiểu dữ liệu **giống hệt** API trả về.
- `branch.schema.ts`: luật kiểm tra form bằng Zod, khớp `branch.dto.ts` của backend.

### Vị trí trong dự án
- Feature: `branch`
- Tầng: types, schema

### Phân tích
- **`Branch`**: đủ các trường, kể cả `pcRoomCount` (0 = không có phòng PC). Ngày giờ là chuỗi ISO.
- **`BranchListQuery`**: `page`, `limit`, `sort`, `q`, `includeInactive`.
- **`BranchPayload`**: body gửi lên khi thêm/sửa (bỏ `id`, `createdAt`, `updatedAt`).
- **`branchFormSchema`**: điểm đặc biệt là **mọi ô đều là chuỗi**, kể cả ô số.
  - Lý do: ô `<input>` luôn cho ra chuỗi. Nếu ép thành số ngay, ô trống sẽ thành `0` hoặc `NaN`, và không phân biệt được "để trống" với "nhập 0".
  - Ô số được kiểm tra bằng biểu thức chính quy: phải là số nguyên, trong khoảng cho phép (ví dụ `ps5Count`, `vipRoomCount`, `pcRoomCount` từ 0 đến 65535; `areaM2` từ 1 đến 65535 hoặc để trống). Thông báo lỗi tiếng Việt: "Phải là số nguyên", "Từ 0 đến 65535".
  - Lúc gửi đi mới đổi sang số (xem `utils/`).
- **`BRANCH_FORM_FIELDS`**: tên các ô, để gán lỗi từ server vào đúng ô.

---

## 📁 File: `services/branch.service.ts`

### Phân tích
| Hàm | Gọi |
|---|---|
| `getBranches(params)` | `GET /branches?limit=100&...` |
| `getBranch(id, includeInactive)` | `GET /branches/:id` (thêm `?includeInactive=true` khi quản trị) |
| `createBranch(payload)` | `POST /branches` |
| `updateBranch(id, payload)` | `PUT /branches/:id` |
| `deleteBranch(id)` | `DELETE /branches/:id` |

Tất cả đi qua `http` của `shared/services/api/http.ts` (tự gắn token, bóc envelope, biến lỗi thành `ApiError` có `code`).

---

## 📁 File: thư mục `hooks/`

### Mục đích
Bọc service bằng TanStack Query: tự lo đang tải, lỗi, cache, làm mới.

### Phân tích

| Hook | Làm gì |
|---|---|
| `useBranches(query)` | Danh sách, luôn gộp `limit: 100`. Trang quản trị truyền `{ includeInactive: true }` |
| `useBranch(id, includeInactive)` | Một chi nhánh; chỉ gọi khi `id > 0` |
| `useBranchSummary()` | `{ count, ps5Total }` cho hero trang chủ. **Dùng lại** dữ liệu của `useBranches()`, không gọi API thêm |
| `useCreateBranch`, `useUpdateBranch`, `useDeleteBranch` | Thêm, sửa, xóa. Xong thì gọi `useInvalidateBranches` |
| `useInvalidateBranches` | Báo cache "dữ liệu cũ rồi" cho **cả** `['branches']` (danh sách) **và** `['branch']` (chi tiết) |
| `branch.keys.ts` | Query key: `['branches', query]`, `['branch', id, { includeInactive }]` |

**Vì sao xóa cache cả danh sách lẫn chi tiết?** Sửa chi nhánh Quận 7 làm thay đổi cả dòng của nó trong danh sách **và** trang sửa của nó. Chỉ làm mới một bên thì bên kia sẽ hiện dữ liệu cũ.

**Vì sao `useBranchSummary` không cần API riêng?** Nó gọi `useBranches()` với **cùng query key** như `BranchList` ở trang chủ. TanStack Query thấy trùng key thì dùng chung một lần gọi. Hero và danh sách bên dưới hiển thị cùng một dữ liệu, chỉ tốn **một** request.

### 📏 Quy tắc dự án liên quan
- Mỗi hook một file. Dữ liệu server chỉ nằm trong cache TanStack Query.

---

## 📁 File: `utils/branch.utils.ts`

### Phân tích
- **`mapHref(branch)`**: có `mapUrl` thì dùng; trống thì tạo link tìm Google Maps theo địa chỉ.
- **`zaloHref(branch)`**: có `zaloUrl` thì dùng; trống thì tạo `https://zalo.me/<số điện thoại chỉ còn chữ số>`; không có số thì trả `null` và ẩn nút.
- **`telHref(phone)`**: `"0345 789 200"` → `"tel:0345789200"`.
- **`toBranchFormValues(branch)`**: API → form (`null` → `''`, số → chuỗi).
- **`toBranchPayload(values)`**: form → API (`''` → `null`, chuỗi số → `number`).
- **`EMPTY_BRANCH_FORM`**: giá trị ban đầu của form thêm mới (các ô số là `'0'`, "Đang hoạt động" được tick).
- **`BRANCH_SEARCH_PARAM = 'branch'`**: tên tham số URL mà `BranchPicker` ghi và trang game sẽ đọc.

---

## 📁 File: `components/BranchCard.tsx`

### Mục đích
Thẻ một chi nhánh, giao diện neon theo prototype.

### Vị trí trong dự án
- Feature: `branch`
- Tầng: component

### Phân tích

**Props**
- `branch`: dữ liệu chi nhánh.
- `index`: thứ tự hiển thị, in thành "CHI NHÁNH 01".
- `fallbackFacebookUrl`: Facebook **của quán**, dùng khi chi nhánh để trống Facebook.

**Từ trên xuống:**
- Nhãn "CHI NHÁNH 01" và tên chi nhánh in hoa, căn giữa.
- Danh sách địa chỉ, số điện thoại (bấm để gọi), giờ mở cửa, ngăn bằng gạch đứt.
- **Ô số liệu**, chỉ hiện ô có giá trị lớn hơn 0:
  - "Phòng PS5 + Xem phim" = `vipRoomCount`. Nhãn có ký tự `\n` và thẻ `<dt>` dùng `whitespace-pre-line`, nên "+ Xem phim" xuống dòng dưới "Phòng PS5".
  - "Phòng PC Gaming" = `pcRoomCount`. Chỉ chi nhánh có phòng PC (hiện là Quận 7) mới hiện ô này.
  - "Máy PS5" và "Diện tích" đang được tắt bằng comment, mở lại bằng cách bỏ `//`.
- Ba nút xếp dọc: **Facebook**, **Zalo** (nền cam), **Đường đi** (viền cam). Nút nào không có link thì ẩn.

**Vì sao số liệu không viết cứng "nếu chi nhánh 4 thì hiện phòng PC"?** Vì id có thể đổi khi xóa và tạo lại, và chủ quán phải tự bật/tắt được trong trang quản trị. Thẻ chỉ nhìn giá trị `pcRoomCount`: lớn hơn 0 thì hiện.

---

## 📁 File: `components/BranchList.tsx`

### Phân tích
- Gọi `useBranches()` và vẽ lưới thẻ: 1 cột trên điện thoại, 2 cột từ màn hình vừa, 4 cột từ màn hình lớn.
- Đủ **3 trạng thái**: 4 khung xám nhấp nháy (đang tải), thông báo lỗi kèm nút "Thử lại", và "Chưa có chi nhánh nào" (rỗng).
- **Prop `fallbackFacebookUrl`** chuyền tiếp xuống từng `BranchCard`.

**Vì sao Facebook của quán đi qua prop?** `branch` không được import `shop` (quy tắc: feature không import lẫn nhau). Trang ghép (`src/pages/BranchesPage.tsx`, `src/pages/HomePage.tsx`) được phép biết cả hai feature, nên trang đó lấy Facebook bằng `useShop()` của `shop`, rồi truyền vào:

```tsx
// src/pages/BranchesPage.tsx (rút gọn)
const { data: shop } = useShop()
<SectionHeading as="h1" tag="Locations" title="Hệ thống" accent="Chi nhánh">…</SectionHeading>
<BranchList fallbackFacebookUrl={shop?.facebookUrl} />
```

Đó cũng là lý do trang `/branches` nằm ở `src/pages/`, không nằm trong `features/branch/pages/`.

---

## 📁 File: `components/BranchPicker.tsx`

### Phân tích
- Dãy nút: "Tất cả chi nhánh" và tên từng chi nhánh. Bấm thì ghi `?branch=<id>` lên URL; bấm "Tất cả" thì xóa tham số đó.
- **Ghi lên URL, không lưu vào store**: gửi link cho bạn bè là họ thấy đúng bộ lọc, bấm "Quay lại" trên trình duyệt cũng đúng.
- Đổi chi nhánh thì xóa `page` (quay về trang 1), và dùng `replace` để không làm dài lịch sử trình duyệt.
- **Chưa có trang nào dùng**: sẽ được ghép vào trang game (`src/pages/GamesPage.tsx`) khi làm feature `game`.

---

## 📁 File: `components/BranchForm.tsx` và `BranchTable.tsx`

### Phân tích

**`BranchForm`**: dùng chung cho trang thêm và trang sửa.
- **Props:** `defaultValues` (giá trị ban đầu), `submitLabel` (chữ trên nút), `pending` (đang gửi), `onSubmit(values, setError)` (trang cha gọi mutation và gán lỗi server ngược vào form).
- **4 nhóm ô:**
  - Thông tin chung: tên, địa chỉ, số điện thoại, giờ mở cửa.
  - Quy mô: số máy PS5, số phòng VIP, **số phòng PC**, diện tích.
  - Liên kết: Google Maps, Facebook, Zalo. Placeholder nói rõ để trống thì điều gì xảy ra.
  - Hiển thị: thứ tự, ô tick "Đang hoạt động" (`CheckboxField`).
- Nút "Lưu" bị khóa khi chưa đổi gì; hiện vòng xoay khi đang gửi.

**`BranchTable`**: bảng ở trang quản trị.
- Các cột: Chi nhánh (tên + địa chỉ), PS5, VIP, Phòng PC (0 hiện `—`), Thứ tự, Trạng thái, Sửa/Xóa.
- Chi nhánh đang ẩn: hàng bị làm mờ và có nhãn "Đang ẩn".

---

## 📁 File: thư mục `pages/` (quản trị)

| Trang | Làm gì |
|---|---|
| `AdminBranchesPage` | `useBranches({ includeInactive: true })` → `BranchTable`. Bấm "Xóa" mở `ConfirmDialog`: nói rõ xóa thật, game ở chi nhánh này tự được gỡ, gợi ý bỏ tick "Đang hoạt động" nếu chỉ muốn ẩn tạm. Xóa xong hiện toast |
| `AdminBranchNewPage` | `BranchForm` với `EMPTY_BRANCH_FORM`; lưu xong về danh sách kèm toast "Đã thêm chi nhánh …" |
| `AdminBranchEditPage` | Đọc `:id` trên URL → `useBranch(id, true)`. Id sai hoặc `BRANCH_001` → khung lỗi kèm link về danh sách. `key={branch.updatedAt}` để form khởi tạo lại khi dữ liệu đổi |

Lỗi khi lưu: `applyServerErrors(error, setError, BRANCH_FORM_FIELDS)` gán `details` của API vào đúng ô, lỗi khác hiện ở khung đỏ đầu form.

---

## 📁 File: `routes.tsx`, `index.ts` và chỗ ghép trong `app/`

- **`routes.tsx`**: chỉ có `branchOwnerRoutes` (3 trang quản trị, **tải lazy**).
- **`app/routes.tsx`**:
  - Nhóm `<RequireRole role="owner" />` chứa `...branchOwnerRoutes`, nên nhân viên thấy "Không đủ quyền".
  - Route `/branches` khai báo thẳng ở đây, tải lazy từ `@/pages/BranchesPage`.
  - Menu header `PUBLIC_NAV` có "Chi nhánh"; nút "Liên hệ" (`PUBLIC_CTA`) cũng trỏ về `/branches`.
- **`app/AdminRoot.tsx`**: menu quản trị có "Chi nhánh" (`ownerOnly: true`).
- **`index.ts`** export: `BranchList`, `BranchPicker`, `useBranchSummary`, `BRANCH_SEARCH_PARAM`, `branchOwnerRoutes`, type `Branch`. Service và các hook còn lại không export.
- `shared/utils/error-messages.ts` có `BRANCH_001`: "Không tìm thấy chi nhánh (có thể đã bị xóa)".

---

## 🔗 Liên kết

- **Được dùng bởi:** `src/pages/BranchesPage.tsx`, `src/pages/HomePage.tsx` (`BranchList`, `useBranchSummary`), `src/app/routes.tsx`, `src/app/AdminRoot.tsx`; sau này `src/pages/GamesPage.tsx` (`BranchPicker`).
- **Gọi tới:** `shared/services/api/http.ts` → backend `/api/v1/branches`.
- **Dùng của nơi khác:** `RequireRole` (từ `auth`, ghép ở `app/`); `Button`, `TextField`, `CheckboxField`, `FormAlert`, `ConfirmDialog`, `SectionHeading`, `applyServerErrors`, `getErrorMessage` (từ `shared`).
- **Tài liệu:** `frontend/src/features/branch/context.md`; `FE-ARCHITECTURE.md` mục 3 (giải phẫu feature), 5 (giao tiếp feature), 6 (routing), 9 (shared hay feature), 10 (theme neon).

## 💡 Điểm cần nhớ (cả feature)
- Mọi danh sách gọi `limit: 100`, không phân trang, vì quán chỉ có vài chi nhánh. Trang công khai và quản trị dùng chung cache; ghi xong thì làm mới cả danh sách lẫn chi tiết.
- Form giữ ô số dạng chuỗi, lúc gửi mới đổi sang số; ô trống → `null`.
- Thẻ chỉ hiện ô số liệu khi giá trị lớn hơn 0 (phòng PC chỉ hiện ở chi nhánh có phòng PC); không viết cứng theo id.
- Dữ liệu của feature khác (Facebook của quán) đi vào qua prop từ trang ghép ở `src/pages/`.
- Chưa có: test tự động (`/fe-test branch`); `BranchPicker` chưa được dùng (chờ `game`).

---

Xem phần còn lại: [Giải thích code `branch` phía Backend](../../../../backend/docs/explain/code/branch.md)
