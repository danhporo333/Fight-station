# Giải thích code: feature `shop` (Frontend)

| | |
|---|---|
| **Phía** | FE (frontend) |
| **Chế độ** | `code` |
| **Target** | `shop` |
| **Ngày viết** | 2026-10-07 (viết lại: giao diện neon, hero mới, `useShop` được export; footer làm lại 4 cột theo prototype) |
| **Tài liệu đã đọc** | `frontend/src/features/shop/context.md` (trạng thái ✅ Đã cài đặt 2026-10-07), `frontend/src/features/branch/context.md` (trang chủ, `/branches`, `useBranchSummary`), `frontend/docs/FE-ARCHITECTURE.md` (mục 3, 6, 9, 10) |

> Bài viết dựa trên tài liệu tại ngày viết. Nếu code `shop` thay đổi sau đó, đối chiếu lại với `context.md`.

---

## Tổng quan: feature này làm gì?

Phía giao diện của `shop` hiển thị **thông tin quán** ở 3 chỗ:

| Chỗ | Ai thấy | Nội dung |
|---|---|---|
| **Footer** (chân trang) mọi trang công khai | Khách | 4 cột: giới thiệu quán + icon mạng xã hội · Khám phá · Chi nhánh · Liên hệ; dòng bản quyền |
| **Hero** (khối đầu) trang chủ `/` | Khách | Tên quán cỡ lớn, tagline, nút "Xem game" / "Tìm chi nhánh", hàng số liệu (máy PS5, chi nhánh, giờ mở cửa), hình tay cầm |
| **`/admin/shop`** | Chỉ chủ quán | Form sửa toàn bộ thông tin trên |

Ví dụ đời thường: thông tin quán giống **một tờ giấy dán ở 3 nơi** (cửa, quầy, bàn). Chủ quán sửa ở một chỗ (form quản trị), cả 3 nơi tự đổi theo. Đó là nhờ cả 3 cùng đọc **một bản lưu chung** (cache TanStack Query, key `['shop']`).

`shop` **không có trang công khai riêng**. Footer và hero là component, được ghép vào layout và trang chủ. Ngoài ra, trang ghép khác cũng đọc thông tin quán qua `useShop`: trang `/branches` và trang chủ lấy **Facebook của quán** làm link dự phòng cho chi nhánh nào để trống Facebook.

Giao diện theo bản prototype (theme "neon cam", xem `FE-ARCHITECTURE.md` mục 10): màu và font khai báo một chỗ trong `src/styles/index.css`, component chỉ dùng class như `text-brand-500`, `bg-dark`, `font-display`.

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
| `components/` | `ShopFooter`, `ShopHero`, `HeroController` (hình tay cầm), `ShopSocialLinks`, `SocialIcon`, `ShopForm` |
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
| `useShop` | Lấy thông tin quán, query key `['shop']`. Footer, hero, trang quản trị và các trang ghép (trang chủ, `/branches`) **cùng dùng một bản cache**, nên mở trang chỉ gọi API **một lần** dù nhiều chỗ cùng cần. Đây là hook duy nhất được export ra ngoài feature |
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

## 📁 File: `components/ShopFooter.tsx`, `ShopSocialLinks.tsx`, `SocialIcon.tsx`

### Mục đích
Chân trang của mọi trang công khai.

### Vị trí trong dự án
- Feature: `shop`
- Tầng: component

### Phân tích
Footer làm theo bản prototype: **4 cột** trên màn hình lớn (cột đầu rộng gấp đôi), 2 cột trên máy tính bảng, 1 cột trên điện thoại.

| Cột | Nội dung | Lấy từ đâu |
|---|---|---|
| Giới thiệu | Logo lục giác + tên quán (Orbitron phát sáng), tagline, **ô vuông icon mạng xã hội** | `useShop()` |
| Khám phá | Trang chủ · Game · Chi nhánh | Prop **`links`** (app/routes.tsx truyền `PUBLIC_NAV`, chung với menu header) |
| Chi nhánh | Tên các chi nhánh đang hoạt động, bấm → `/branches` | Prop **`branches`** (app/routes.tsx truyền `<BranchFooterList />` của feature `branch`) |
| Liên hệ | Fanpage Facebook, Zalo quán, hotline (`tel:`), email (`mailto:`), giờ mở cửa | `useShop()` |

Dòng cuối: "© 2026 **FIGHT STATION** — All rights reserved." (chữ mono, tên quán màu cam).

- **Dòng hay link nào trống thì ẩn.** Quán mới nhập Facebook thì chỉ thấy icon Facebook; nhập thêm TikTok ở `/admin/shop` là icon TikTok tự hiện.
- **Đang tải, lỗi, hay DB chưa seed (`SHOP_001`):** vẫn hiện khung footer với tên mặc định "Fight Station", chỉ ẩn tagline, mạng xã hội và cột Liên hệ. Trang **không bị vỡ**.
- **Icon mạng xã hội (`SocialIcon`):** `lucide-react` không có icon thương hiệu, nên đường vẽ SVG của Facebook, TikTok, Instagram, YouTube được lấy từ bản prototype; Zalo hiện chữ "Zalo". `ShopSocialLinks` đặt mỗi icon trong ô vuông 42px viền cam, rê chuột thì nổi lên và chuyển nền cam. Mỗi ô có `aria-label` (vd "Facebook") cho trình đọc màn hình.

**Vì sao cột "Chi nhánh" phải truyền qua prop?** Tên chi nhánh là dữ liệu của feature `branch`, mà `shop` không được import `branch`. `app/routes.tsx` (nơi được biết mọi feature) tạo `<BranchFooterList />` rồi truyền vào `ShopFooter` như một "ô trống chờ lắp" (slot). `BranchFooterList` dùng chung cache với thẻ chi nhánh nên không gọi API thêm.
- Link mạng xã hội mở tab mới với `rel="noopener noreferrer"`, để trang kia không điều khiển được tab của mình.

**Vì sao footer nằm trong feature, mà layout lại nằm trong `shared`?** `PublicLayout` ở `shared/` **không được import** `features/` (quy tắc dự án, ESLint chặn). Vì vậy `PublicLayout` nhận prop `footer`, còn `app/routes.tsx` (nơi được phép biết mọi feature) truyền `<ShopFooter />` vào. Đây gọi là ghép bằng **props/slot**.

Menu trên header cũng làm cùng cách: `PublicLayout` có thêm prop `navItems` (danh sách `PUBLIC_NAV`: Trang chủ, Chi nhánh…) và `cta` (nút "Liên hệ" vát góc). Mỗi feature có trang công khai thì thêm một dòng vào `PUBLIC_NAV`.

```tsx
// app/routes.tsx
<PublicLayout
  navItems={PUBLIC_NAV}
  cta={PUBLIC_CTA}
  footer={<ShopFooter links={PUBLIC_NAV} branches={<BranchFooterList />} />}
/>
```

---

## 📁 File: `components/ShopHero.tsx` và `HeroController.tsx`

### Mục đích
Khối đầu trang chủ, làm theo bản prototype.

### Phân tích

**Các phần, từ trên xuống:**
- **Badge** "SYSTEM ONLINE — READY PLAYER ONE" có chấm cam nhấp nháy.
- **Tên quán** cỡ rất lớn, tách theo dấu cách: chữ đầu ("FIGHT") màu trắng có **hiệu ứng nhiễu màu** (`animate-glitch`), phần còn lại ("STATION") là **chữ rỗng chỉ có viền cam** (`text-outline`). Chưa có dữ liệu thì dùng tên mặc định "Fight Station", nên tiêu đề không bao giờ trống. Giữa hai phần có một dấu cách ẩn, để trình đọc màn hình đọc đúng "Fight Station" thay vì "FightStation".
- **Tagline**: đang tải thì hiện khung xám nhấp nháy.
- **Nút hành động** và **hàng số liệu** (xem "Props" bên dưới).
- **`HeroController`** bên phải: khung cắt 2 góc (`clip-corner`), nhãn "PS5 // PRO GEAR", hình tay cầm vẽ bằng SVG trôi lên xuống (`animate-float`). SVG dùng màu theme (`var(--color-brand-500)`…), không viết cứng mã màu. Hình chỉ để trang trí nên có `aria-hidden`.
- Hai **quầng sáng mờ** phía sau (cam và đỏ).

**Props**
- `stats?: HeroStat[]`: số liệu do **trang ghép** tính rồi truyền vào, mỗi mục `{ value, label }`. `ShopHero` tự thêm "Giờ mở cửa" (`hoursLabel`) vào cuối; mục rỗng hoặc bằng "0" thì ẩn.
- `actions?: ReactNode`: các nút, cũng do trang ghép truyền vào.

**Vì sao số liệu và nút đi qua props?** "57 máy PS5" và "4 chi nhánh" là dữ liệu của feature `branch`, mà `shop` không được import feature khác. Vì vậy `src/pages/HomePage.tsx` (trang ghép, được biết mọi feature) lấy số liệu bằng `useBranchSummary()` của `branch`, rồi truyền vào:

```tsx
// src/pages/HomePage.tsx (rút gọn)
const branchSummary = useBranchSummary()   // { count: 4, ps5Total: 57 }
<ShopHero
  stats={[{ value: '57', label: 'Máy PS5' }, { value: '4', label: 'Chi nhánh' }]}
  actions={<><Link to="/games">Xem game</Link><Link to="/branches">Tìm chi nhánh</Link></>}
/>
```

Sau hero, trang chủ có mục "Hệ thống chi nhánh" (`<BranchList />` của `branch`). Sau này trang chủ sẽ ghép thêm game, bảng giá, menu…

### 💡 Điểm cần nhớ
- Hiệu ứng nhiễu và trôi **tự tắt** khi người dùng bật "giảm chuyển động" trong hệ điều hành (`prefers-reduced-motion`).
- Chưa có feature `game`, nên **chưa có số "Tựa game"** và nút "Xem game" tạm dẫn tới trang 404. Trong code có ghi chú `TODO(game)` ở `HomePage.tsx`.

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
- **`app/routes.tsx`**: route này nằm trong nhóm `<RequireRole role="owner" />` của feature `auth`. Nhân viên mở `/admin/shop` sẽ thấy "Không đủ quyền". Cũng ở file này, `<ShopFooter links={PUBLIC_NAV} branches={<BranchFooterList />} />` (prop `footer`) và menu `PUBLIC_NAV` (prop `navItems`) được truyền vào `PublicLayout`.
- **`app/AdminRoot.tsx`**: menu quản trị có mục "Thông tin quán" với `ownerOnly: true`, nên **chỉ chủ quán thấy** mục này.
- **`index.ts`** export `ShopFooter` (props `links`, `branches`), `ShopHero` (kèm type `HeroStat`), `useShop`, `shopOwnerRoutes` và type `Shop`. `useShop` được export vì trang ghép cần đọc thông tin quán (Facebook dự phòng cho chi nhánh). Service và các hook còn lại không export, vì không ai ngoài feature cần.
- Mã lỗi `SHOP_001` được thêm vào `shared/utils/error-messages.ts`.

---

## 🔗 Liên kết

- **Được dùng bởi:** `src/app/routes.tsx` (footer, route owner), `src/app/AdminRoot.tsx` (menu), `src/pages/HomePage.tsx` (hero + `useShop`), `src/pages/BranchesPage.tsx` (`useShop` cho Facebook dự phòng).
- **Gọi tới:** `shared/services/api/http.ts` → backend `/api/v1/shop`.
- **Dùng của feature khác:** `RequireRole` (từ `auth`, ghép ở `app/`); `Button`, `TextField`, `TextAreaField`, `FormAlert`, `applyServerErrors` (từ `shared`).
- **Tài liệu:** `frontend/src/features/shop/context.md`; `FE-ARCHITECTURE.md` mục 3 (giải phẫu feature), mục 6 (routing), mục 9 (shared hay feature), mục 10 (theme neon: màu, font, hiệu ứng).

## 💡 Điểm cần nhớ (cả feature)
- Một query key `['shop']` cho cả footer, hero và form. Sửa xong thì invalidate, và mọi nơi tự cập nhật.
- Lỗi ở trang công khai **không làm vỡ trang**: footer và hero luôn có bản dự phòng.
- Footer 4 cột; cột "Khám phá" và "Chi nhánh" do `app/routes.tsx` truyền vào qua prop.
- Form: ô trống là `''`, gửi đi thành `null`; lỗi server gán vào đúng ô.
- `shared` không import feature: footer (và menu) được "cắm" vào layout qua prop từ `app/routes.tsx`. Feature cũng không import nhau: số liệu chi nhánh vào hero qua props, do trang ghép ở `src/pages/` truyền.
- Chưa có: test tự động riêng cho `shop` (`/fe-test shop`). Giao diện đã đối chiếu với prototype bằng ảnh chụp tự động, nhưng chưa thử tay hiệu ứng rê chuột trên trình duyệt thật.

---

Xem phần còn lại: [Giải thích code `shop` phía Backend](../../../../backend/docs/explain/code/shop.md)
