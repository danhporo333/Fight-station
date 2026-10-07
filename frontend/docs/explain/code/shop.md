# Giải thích code: feature `shop` (Frontend)

| | |
|---|---|
| **Phía** | FE (frontend) |
| **Chế độ** | `code` |
| **Target** | `shop` |
| **Ngày viết** | 2026-10-07 |
| **Tài liệu đã đọc** | `frontend/src/features/shop/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07), `frontend/docs/FE-ARCHITECTURE.md` (mục 3, 6, 9) |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `shop` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

Phía giao diện của `shop` hiển thị **thông tin quán** ở 3 chỗ:

| Chỗ | Ai thấy | Nội dung |
|---|---|---|
| **Footer** (chân trang) mọi trang công khai | Khách | Tên quán, hotline (bấm để gọi), email, giờ mở cửa, nút mạng xã hội |
| **Hero** (khối đầu) trang chủ `/` | Khách | Giờ mở cửa, tên quán, tagline |
| **`/admin/shop`** | Chỉ chủ quán | Form sửa toàn bộ thông tin trên |

Ví dụ đời thường: thông tin quán giống **một tờ giấy dán ở 3 nơi** (cửa, quầy, bàn). Chủ quán sửa ở một chỗ (form quản trị), cả 3 nơi tự đổi theo. Đó là nhờ cả 3 cùng đọc **một bản lưu chung** (cache TanStack Query, key `['shop']`).

`shop` **không có trang công khai riêng**. Footer và hero là component, được ghép vào layout và trang chủ.

### Cấu trúc thư mục và luồng gọi

```
component → hook (TanStack Query) → service → http.ts (Axios) → API /api/v1/shop
```

| Thư mục | Nội dung |
|---|---|
| `types/` | `shop.types.ts` (hình dạng dữ liệu), `shop.schema.ts` (luật form) |
| `services/` | `getShop`, `updateShop` |
| `hooks/` | `shop.keys.ts`, `useShop`, `useUpdateShop` |
| `utils/` | Hàm thuần: lọc link mạng xã hội, đổi dữ liệu form ↔ API, tạo link gọi điện |
| `components/` | `ShopFooter`, `ShopHero`, `ShopSocialLinks`, `ShopForm` |
| `pages/` | `AdminShopPage` |
| `routes.tsx`, `index.ts` | Route quản trị (lazy) và public API |

---

## 📁 File: `types/shop.types.ts` và `types/shop.schema.ts`

### Mục đích
- `shop.types.ts`: kiểu `Shop` **giống hệt** response của API, để TypeScript báo lỗi khi gõ sai tên trường.
- `shop.schema.ts`: luật kiểm tra form bằng Zod, chạy ngay trên trình duyệt.

### Vị trí trong dự án
- Feature: `shop`
- Tầng: types, schema

### Phân tích
- `Shop`: các trường có thể trống thì có kiểu `string | null`. `updatedAt` là **chuỗi** ISO (ngày giờ dạng chữ), khi hiển thị mới đổi sang giờ Việt Nam.
- `UpdateShopPayload`: body gửi lên `PUT /shop`, gồm các trường của `Shop` trừ `id` và `updatedAt`.
- `shopFormSchema`: **cùng luật và cùng thông báo** với `shop.dto.ts` của backend. Ví dụ `name` không rỗng, tối đa 100 ký tự; email và link chỉ kiểm tra khi ô có chữ.
- Khác với backend: trong form, **ô trống là chuỗi rỗng `''`**, vì ô nhập HTML luôn cho ra chuỗi. Lúc gửi đi mới đổi `''` thành `null` (xem `utils/` bên dưới).
- `SHOP_FORM_FIELDS`: danh sách tên các ô, dùng để gán lỗi từ server vào đúng ô.

### 💡 Điểm cần nhớ
- Kiểm tra ở giao diện là để người dùng **thấy lỗi ngay**; kiểm tra thật vẫn ở backend.

---

## 📁 File: `services/shop.service.ts`

### Mục đích
Nơi **duy nhất** của feature gọi API.

### Phân tích
- `getShop()` → `GET /shop`
- `updateShop(payload)` → `PUT /shop`

Cả hai đi qua `http` của `shared/services/api/http.ts`. Hàm này tự gắn token, tự "bóc" envelope `{ success, data }` thành `{ data }`, và biến lỗi thành `ApiError` có `code` (ví dụ `SHOP_001`).

---

## 📁 File: thư mục `hooks/`

### Mục đích
Cho component dùng dữ liệu quán mà không cần tự lo gọi API, đang tải, lỗi hay cache.

### Phân tích

| Hook | Làm gì |
|---|---|
| `useShop` | Lấy thông tin quán, query key `['shop']`. Footer, hero và trang quản trị **cùng dùng một bản cache**, nên mở trang chỉ gọi API **một lần** dù 2–3 component cùng cần |
| `useUpdateShop` | Gửi sửa. Thành công thì `invalidateQueries(['shop'])`: báo cache "dữ liệu cũ rồi", TanStack Query tự tải lại, và footer, hero đổi theo |
| `shop.keys.ts` | Gom query key một chỗ, tránh gõ sai `['shop']` ở mỗi nơi một kiểu |

Dữ liệu được coi là "còn mới" trong 60 giây (`staleTime`), khớp với `Cache-Control: max-age=60` của backend.

### 📏 Quy tắc dự án liên quan
- Dữ liệu server **chỉ** nằm trong cache TanStack Query, không chép sang `useState` hay Zustand.

---

## 📁 File: `utils/shop.utils.ts`

### Mục đích
Hàm thuần: không gọi API, không hiển thị gì. Dễ đọc và dễ test.

### Phân tích
- **`getSocialLinks(shop)`**: trả danh sách link mạng xã hội **có giá trị**, kèm nhãn ("Facebook", "Zalo"...). Link trống bị bỏ, nên giao diện không bao giờ hiện link hỏng.
- **`toShopFormValues(shop)`**: dữ liệu API → giá trị form (`null` → `''`).
- **`toShopPayload(values)`**: giá trị form → body gửi API (`''` → `null`, vì API dùng `null` để **xóa** giá trị).
- **`telHref(hotline)`**: `"0901 234 567"` → `"tel:0901234567"`, để bấm số trên điện thoại là gọi được.
- `SOCIAL_KEYS`, `socialLabel(key)`: dùng để vẽ 5 ô link trong form bằng vòng lặp, khỏi viết lặp 5 lần.

---

## 📁 File: `components/ShopFooter.tsx` và `ShopSocialLinks.tsx`

### Mục đích
Chân trang của mọi trang công khai.

### Vị trí trong dự án
- Feature: `shop`
- Tầng: component

### Phân tích
- Gọi `useShop()`. **Có dữ liệu:** hiện tên quán, nút mạng xã hội (`ShopSocialLinks`), hotline (link `tel:`), email (link `mailto:`) và giờ mở cửa. Dòng nào trống thì ẩn dòng đó.
- **Đang tải, lỗi, hay DB chưa seed (`SHOP_001`):** chỉ hiện dòng "© 2026 Fight Station". Trang **không bị vỡ**, khách vẫn xem được nội dung chính.
- Icon điện thoại, thư, đồng hồ lấy từ `lucide-react`. Mạng xã hội hiện bằng **nút chữ** (Facebook, Zalo...), vì `lucide-react` không có icon thương hiệu.
- Link mạng xã hội mở tab mới với `rel="noopener noreferrer"`, để trang kia không điều khiển được tab của mình.

**Vì sao footer nằm trong feature, mà layout lại nằm trong `shared`?** `PublicLayout` ở `shared/` **không được import** `features/` (quy tắc dự án, ESLint chặn). Vì vậy `PublicLayout` nhận prop `footer`, còn `app/routes.tsx` (nơi được phép biết mọi feature) truyền `<ShopFooter />` vào. Đây gọi là ghép bằng **props/slot**.

---

## 📁 File: `components/ShopHero.tsx`

### Mục đích
Khối đầu trang chủ.

### Phân tích
- Tên quán hiện ngay, mặc định là "Fight Station" khi chưa có dữ liệu, nên tiêu đề không bao giờ trống.
- Đang tải thì tagline hiện **khung xám nhấp nháy** (skeleton). Có dữ liệu thì hiện tagline, và giờ mở cửa trong khung viên thuốc phía trên.
- `src/pages/HomePage.tsx` chỉ còn `<ShopHero />`. Sau này trang chủ sẽ ghép thêm danh sách game, bảng giá, menu… từ các feature khác.

---

## 📁 File: `components/ShopForm.tsx`

### Mục đích
Form sửa thông tin quán, viết bằng **React Hook Form** với luật `shopFormSchema`.

### Phân tích
- **Props:** `shop`, dữ liệu hiện tại dùng làm giá trị ban đầu của form.
- **3 nhóm ô:** Thông tin chung (tên, tagline dùng ô nhiều dòng `TextAreaField`, giờ mở cửa), Liên hệ (hotline, email), Mạng xã hội (5 ô link, vẽ bằng vòng lặp `SOCIAL_KEYS`).
- **Nút "Lưu thay đổi"** bị khóa khi form **chưa đổi gì** (`isDirty`), và hiện vòng xoay trong lúc chờ API. **Nút "Hoàn tác"** đưa form về giá trị ban đầu.
- **Gửi:** `toShopPayload(values)` → `useUpdateShop`. Form gửi **đủ 10 trường** mỗi lần, cách này đơn giản mà API vẫn đúng.
- **Thành công:** hiện thông báo "Đã lưu thông tin quán", và form nhận lại dữ liệu mới từ server.
- **Lỗi:** `applyServerErrors` gán `details` của API vào đúng ô (ví dụ "Link không hợp lệ" dưới ô Facebook). Lỗi khác hiện ở khung đỏ `FormAlert` đầu form.

### 📏 Quy tắc dự án liên quan
- Component tối đa 150 dòng; logic đổi dữ liệu nằm ở `utils/`, không nằm trong component.
- `TextAreaField` và `FormAlert` ở `shared/components/ui/`, vì từ 2 feature trở lên dùng.

---

## 📁 File: `pages/AdminShopPage.tsx`

### Mục đích
Trang `/admin/shop`, chỉ chủ quán vào được.

### Phân tích
Trang có đủ **3 trạng thái**:

| Trạng thái | Hiện gì |
|---|---|
| Đang tải | 4 khung xám nhấp nháy |
| Lỗi | Khung đỏ và nút "Thử lại". Nếu là `SHOP_001`: "Chưa có dữ liệu quán. Hãy chạy `npx prisma db seed` trong thư mục backend." |
| Có dữ liệu | `ShopForm`, kèm dòng "Cập nhật lần cuối 07/10/2026, 11:25" (giờ Việt Nam) |

`<ShopForm key={shop.updatedAt} />`: khi dữ liệu trên server đổi (`updatedAt` mới), React **tạo lại form**, nên các ô luôn khớp với dữ liệu thật.

---

## 📁 File: `routes.tsx`, `index.ts` và chỗ ghép trong `app/`

- **`routes.tsx`**: export `shopOwnerRoutes` (path `shop`), trang **tải lazy**: chỉ tải code khi chủ quán mở trang, khách không phải tải.
- **`app/routes.tsx`**: route này nằm trong nhóm `<RequireRole role="owner" />` của feature `auth`. Nhân viên mở `/admin/shop` sẽ thấy "Không đủ quyền". Cũng ở file này, `<ShopFooter />` được truyền vào `PublicLayout`.
- **`app/AdminRoot.tsx`**: menu quản trị có mục "Thông tin quán" với `ownerOnly: true`, nên **chỉ chủ quán thấy** mục này.
- **`index.ts`** chỉ export `ShopFooter`, `ShopHero`, `shopOwnerRoutes` và type `Shop`. Service và hook không export, vì không ai ngoài feature cần.
- Mã lỗi `SHOP_001` được thêm vào `shared/utils/error-messages.ts`.

---

## 🔗 Liên kết

- **Được dùng bởi:** `src/app/routes.tsx` (footer, route owner), `src/app/AdminRoot.tsx` (menu), `src/pages/HomePage.tsx` (hero).
- **Gọi tới:** `shared/services/api/http.ts` → backend `/api/v1/shop`.
- **Dùng của feature khác:** `RequireRole` (từ `auth`, ghép ở `app/`); `Button`, `TextField`, `TextAreaField`, `FormAlert`, `applyServerErrors` (từ `shared`).
- **Tài liệu:** `frontend/src/features/shop/context.md`; `FE-ARCHITECTURE.md` mục 3 (giải phẫu feature), mục 6 (routing), mục 9 (shared hay feature).

## 💡 Điểm cần nhớ (cả feature)
- Một query key `['shop']` cho cả footer, hero và form. Sửa xong thì invalidate, và mọi nơi tự cập nhật.
- Lỗi ở trang công khai **không làm vỡ trang**: footer và hero luôn có bản dự phòng.
- Form: ô trống là `''`, gửi đi thành `null`; lỗi server gán vào đúng ô.
- `shared` không import feature: footer được "cắm" vào layout qua prop từ `app/routes.tsx`.
- Chưa có: test tự động riêng cho `shop` (`/fe-test shop`). Giao diện chưa được kiểm tra bằng mắt trên trình duyệt.

---

Xem phần còn lại: [Giải thích code `shop` phía Backend](../../../../backend/docs/explain/code/shop.md)
