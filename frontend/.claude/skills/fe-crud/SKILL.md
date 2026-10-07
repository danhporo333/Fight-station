---
name: fe-crud
description: >
  Sinh giao diện CRUD cho một feature của Fight Station (React 19 + Vite + TanStack Query + React Hook Form
  + Zod + Tailwind v4): types, schema, service, hooks, components, trang công khai và trang quản trị,
  routes (lazy), index.ts, ghép vào app/routes.tsx và cập nhật context.md. Dùng khi user nói "tạo giao diện",
  "làm trang <feature>", "fe crud", "frontend cho <feature>", "generate pages", hoặc /fe-crud <feature>.
argument-hint: "[auth|shop|branch|game|price-plan|menu|promotion]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Sinh CRUD frontend — Fight Station

> Skill nằm trong `frontend/.claude/skills/`: mọi đường dẫn bên dưới tính từ thư mục `frontend/`, mọi lệnh chạy trong `frontend/`.

**Phạm vi:** một feature mỗi lần, từ type tới trang chạy được trên trình duyệt. Không sửa backend (để `/be-crud`), không viết test (để `/fe-test`).

Feature hợp lệ: `auth`, `shop`, `branch`, `game`, `price-plan`, `menu`, `promotion` (trùng tên backend).
Thứ tự nên làm: `auth` → `shop` → `branch` → `game` → `price-plan` → `menu` → `promotion` (`auth` trước vì trang quản trị cần `RequireAuth`; `branch` trước `game` vì `GamesPage` ghép `BranchPicker`).

## Pre-flight Checks

1. **Có argument chưa?** Thiếu → hỏi: "Feature nào? Ví dụ `/fe-crud game`". Tên không thuộc danh sách trên → hỏi lại.
2. **Đã init chưa?** Phải có `src/features/`, `src/app/routes.tsx`, `src/shared/services/api/http.ts`. Thiếu → gợi ý `/init-base frontend`.
3. **Feature đã có code chưa?** Xem `src/features/<feature>/`:
   - Chỉ có `context.md` (dòng đầu "⏳ Chưa cài đặt") → làm bình thường.
   - Đã có file `.ts/.tsx` → hỏi user: bổ sung phần còn thiếu hay dừng. **Không ghi đè** file đã có.
4. **Backend của feature đã xong chưa?** Đọc `../backend/src/features/<feature>/context.md`:
   - Dòng đầu "✅ Đã cài đặt" → dùng làm nguồn chính xác cho response, mã lỗi, quyền.
   - Chưa → báo user và hỏi: chờ `/be-crud <feature>`, hay làm trước theo `API_SPEC.md` (kiểm tra bằng MSW, ghi rõ phần chưa thử với API thật).
5. **Phụ thuộc phía frontend** (mục "Phụ thuộc"/"Ghi chú UI" trong `context.md`):
   - Có trang quản trị mà feature `auth` (frontend) chưa có `RequireAuth`/`RequireRole` → đề nghị làm `auth` trước.
   - Trang ghép ≥ 2 feature (vd `GamesPage` cần `branch`) → feature kia phải export component cần dùng qua `index.ts`.
6. **Proxy đúng cổng backend?** `vite.config.ts` proxy `/api` phải trỏ đúng `PORT` trong `../backend/.env`. Lệch → báo user (không tự đổi `.env` của backend).
7. **"Câu hỏi còn mở" trong `context.md`** (frontend hoặc backend) → hỏi user chốt **trước khi** viết code.

## Required Reading (ĐỌC TRƯỚC)

| File | Lấy gì |
|---|---|
| `src/features/<feature>/context.md` | Endpoint dùng, route và trang, public API dự kiến, query key, ghi chú UI |
| `../backend/src/features/<feature>/context.md` | API **thật**: response, mã lỗi, quyền, business rule đã chốt |
| `../01-share-docs/API_SPEC.md` | Request/response mẫu (mục 7), query param (mục 3), envelope (mục 4), mã lỗi (mục 5), quyền (mục 6) |
| `docs/FE-PROJECT-RULES.md` | Quy tắc bắt buộc, anti-pattern, đặt tên, giới hạn 150 dòng/component |
| `docs/FE-ARCHITECTURE.md` | Giải phẫu feature (mục 3), luồng dữ liệu (4), giao tiếp feature (5), routing (6), state (7), tầng API (8) |

Rồi đọc code đã có để làm theo đúng mẫu: `src/app/` (routes, providers), `src/shared/` (http, ApiError, api.types, stores, hooks, utils, components), và **feature đã làm xong gần nhất** (nếu có). Code đã có là chuẩn; mẫu trong skill này chỉ là gợi ý.

Muốn biết chính xác backend validate gì: đọc `../backend/src/features/<feature>/<feature>.dto.ts` (chỉ đọc, không import chéo project).

## Workflow

### Bước 1: Lập kế hoạch và xin xác nhận
Liệt kê cho user (ngắn gọn) rồi chờ đồng ý:
- Trang sẽ tạo (path, công khai/Admin/Owner, nằm ở `features/<feature>/pages` hay `src/pages`)
- File sẽ tạo trong `src/features/<feature>/` và file shared mới (nếu có)
- File có sẵn sẽ sửa: `src/app/routes.tsx`, `src/app/AdminRoot.tsx` (menu quản trị), `src/shared/...`
- Cách hiểu các điểm docs chưa rõ

### Bước 2: Sinh file feature
Theo `docs/FE-ARCHITECTURE.md` mục 3, **chỉ tạo thư mục thật sự cần**:

```
src/features/<feature>/
├── types/
│   ├── <feature>.types.ts     # kiểu dữ liệu API trả về + query (khớp response thật)
│   └── <feature>.schema.ts    # Zod schema form + type suy ra (khớp luật dto backend)
├── services/<feature>.service.ts   # MỌI lời gọi API của feature, qua `http`
├── hooks/                     # use<Feature>s, use<Feature>, useCreate…, useUpdate…, useDelete…
├── components/                # <Feature>Card, <Feature>List, <Feature>ListSkeleton, <Feature>Form, ...
├── utils/                     # (nếu cần) hàm thuần: groupByCategory, accentClass
├── pages/                     # trang chỉ dùng feature này: <Feature>sPage, Admin<Feature>sPage
├── routes.tsx                 # RouteObject[]: route công khai và route quản trị tách riêng
├── index.ts                   # public API
└── context.md                 # đã có, cập nhật ở bước 7
```
Feature nhiều tài nguyên (`game` + thể loại, `menu` + nhóm) → file riêng cho từng tài nguyên trong cùng thư mục con, ví dụ `services/game-category.service.ts`, `hooks/useGameCategories.ts`.

### Bước 3: Viết từng tầng

**Types (`types/<feature>.types.ts`)**: interface PascalCase đúng tên trường camelCase của API. Ngày giờ từ API là `string` (ISO), tiền là `number`. Query danh sách gồm `page`, `limit`, `sort`, `q`, bộ lọc riêng, `includeInactive`.

**Schema (`types/<feature>.schema.ts`)**: Zod 4 cho form, khớp `dto.ts` backend (độ dài, bắt buộc, `min`, số nguyên) và **cùng thông báo lỗi tiếng Việt**. Trường tùy chọn rỗng → gửi `null` (API dùng `null` để xóa giá trị). Ô số trong form dùng `z.coerce.number()` hoặc `valueAsNumber`. Export `type <Feature>Input = z.infer<...>`.

**Service (`services/<feature>.service.ts`)**: hàm động từ (`getGames`, `getGame`, `createGame`, `updateGame`, `deleteGame`), chỉ gọi `http` từ `@/shared/services/api`.
- `http.get<T>()` trả `ApiResult<T>` = `{ data, meta? }` (đã bóc envelope); danh sách trả `Paged<T>` (`{ data, meta }`)
- Không dùng axios trực tiếp, không hardcode URL, không bắt lỗi (để `ApiError` đi lên hook)

**Hooks (`hooks/`)**: một hook một file, bọc TanStack Query.
- Query key gom một chỗ, đúng mẫu `context.md`: `['games', query]`, `['game', id]`, `['game-categories']`
- `useQuery` cho đọc (`enabled: id > 0` cho chi tiết); `useMutation` cho ghi, `onSuccess` → `invalidateQueries` **đúng key gốc** (và key công khai liên quan, vd sửa món thì invalidate cả `['menu']`)
- Toast thành công/lỗi bằng `toast` của `sonner`. Lỗi: `ERROR_MESSAGES[error.code] ?? error.message`. Nếu chưa có `src/shared/utils/error-messages.ts` thì tạo một lần, mỗi feature bổ sung mã của mình
- Trang quản trị gọi danh sách với `includeInactive: true`; trang công khai dùng `limit: 100` (không phân trang phía client)

**Components (`components/`)**: theo `docs/FE-PROJECT-RULES.md` mục 4.
- Mỗi file một component, `export function` (không default), Props type riêng `<Tên>Props`, **≤ 150 dòng**
- Chỉ hiển thị: lấy dữ liệu qua hook, logic thuần ra `utils/`
- Đủ 3 trạng thái: loading (skeleton), lỗi (thông báo + thử lại), rỗng (dòng thông báo riêng)
- Màu bằng token `brand-*` và class Tailwind, không inline style, không mã màu cứng; `accentColor` → class qua `utils/accentClass.ts`
- Tiền `formatVnd`, ngày `formatDate` (từ `@/shared/utils/format`); `<img>` luôn có `alt`, `loading="lazy"`, kích thước cố định; ảnh trống → hiện tên bằng chữ
- `key` là `id` từ API
- Component dùng ở ≥ 2 feature (Button, Modal, ConfirmDialog, Skeleton, ErrorMessage) → tạo trong `src/shared/components/ui/` (không biết nghiệp vụ); chỉ một feature dùng thì để trong feature

**Form**: React Hook Form + `zodResolver(<schema>)`.
- Nút gửi `disabled` + spinner khi `isPending`
- Lỗi `COMMON_001` có `details` → `setError(detail.field, { message })` cho từng ô; lỗi trùng (409, vd `GAME_002`) → gán vào ô tương ứng; lỗi khác → toast
- Xóa luôn có hộp xác nhận (xóa thật, không khôi phục được)

**Trang (`pages/`)**: trang chỉ dùng feature này nằm ở `features/<feature>/pages/`; trang ghép ≥ 2 feature nằm ở `src/pages/` (theo bảng routing `docs/FE-ARCHITECTURE.md` mục 6). Mỗi trang gọi `useDocumentTitle('<Tên trang>')`. Bộ lọc, từ khóa, trang hiện tại nằm trên URL (`useSearchParams`), ô tìm kiếm qua `useDebounce` 300ms.

**Routes (`routes.tsx`)**: export riêng từng nhóm để `app/routes.tsx` đặt đúng chỗ, tải **lazy**:
```tsx
export const gamePublicRoutes: RouteObject[] = [
  { path: 'games', lazy: async () => ({ Component: (await import('./pages/GamesPage')).GamesPage }) },
];
export const gameAdminRoutes: RouteObject[] = [
  { path: 'games', lazy: async () => ({ Component: (await import('./pages/AdminGamesPage')).AdminGamesPage }) },
];
```
Route quản trị dùng path tương đối (nằm dưới `admin`). Route chỉ owner được (`/admin/shop`, `/admin/branches`, `/admin/price-plans`) export tên `<feature>OwnerRoutes`.

**index.ts**: chỉ export thứ nơi khác cần: route, component dùng ở trang ghép (`GameList`, `BranchPicker`), type cần thiết. Không export service hay hook nội bộ nếu không ai ngoài feature dùng.

### Bước 4: Ghép vào app
- `src/app/routes.tsx`: route công khai vào `children` của `PublicLayout` (trước route `*`); route quản trị vào nhánh `admin` (bọc `RequireAuth`), route owner bọc thêm `RequireRole role="owner"`. Chỉ import từ `@/features/<feature>`.
- Trang ghép nhiều feature (vd `src/pages/GamesPage.tsx`): ghép bằng props/URL param, không import chéo feature.
- Trang quản trị mới: thêm một dòng vào `ADMIN_NAV` trong `src/app/AdminRoot.tsx` (`ownerOnly: true` cho trang chỉ owner). Trang quản trị đặt tên `Admin<Tên>Page` và **tải lazy**; **không** thêm chunk vào `manualChunks` (Rolldown sẽ kéo code dùng chung vào, trang công khai phải tải theo).
- Quyền và form dùng sẵn (feature `auth` đã xong, chi tiết trong `src/features/auth/context.md`): `RequireRole`, `useHasRole` từ `@/features/auth`; `Button`, `TextField`, `TextAreaField`, `CheckboxField`, `SelectField`, `FormAlert` (lỗi chung của form), `ConfirmDialog` (xác nhận xóa), `SectionHeading` (tiêu đề mục trang khách) từ `@/shared/components/ui/`; màu, font, utility của theme neon xem `docs/FE-ARCHITECTURE.md` mục 10; menu trang khách thêm vào `PUBLIC_NAV` trong `src/app/routes.tsx`; `applyServerErrors(error, setError, fields)` từ `@/shared/utils/form-errors`; `getErrorMessage`, `ERROR_MESSAGES` từ `@/shared/utils/error-messages` (thêm mã lỗi của feature vào đây).
- Link điều hướng trong `PublicLayout`/`AdminLayout` (shared): truyền danh sách link từ `app/routes.tsx` qua props, **không** import feature vào shared.

### Bước 5: Kiểm tra
Chạy trong `frontend/`, tất cả phải pass:
```bash
npm run typecheck
npm run lint
npm test
npm run build
```
Rồi chạy thật: backend (`npm run dev` trong `../backend`) + `npm run dev` ở đây, mở `http://localhost:5173`:
- Trang công khai: loading → dữ liệu; danh sách rỗng có thông báo; đổi bộ lọc thì URL đổi theo
- Trang quản trị: chưa đăng nhập → về `/admin/login`; thêm/sửa/xóa xong danh sách tự cập nhật; nhập sai → lỗi hiện đúng ô
- Console trình duyệt không có lỗi; Network gọi đúng `/api/v1/...`

Nếu không mở được trình duyệt: ít nhất gọi thử API qua proxy (`curl.exe http://localhost:5173/api/v1/...`) và báo user phần chưa kiểm tra bằng mắt. Tắt server bằng đúng PID của nó, **không** dùng `taskkill /IM node.exe`.

### Bước 6: Cập nhật tài liệu
- `src/features/<feature>/context.md`: **bỏ dòng "⏳ Chưa cài đặt"**, sửa theo code thật (trang, route, component export, query key, quyết định đã chốt), xóa "Câu hỏi còn mở" đã trả lời.
- Thêm component/hook/util vào `src/shared/` → cập nhật `docs/FE-ARCHITECTURE.md` mục 9 nếu đổi quy ước.
- Bài giải thích của feature (`docs/explain/code/<feature>.md`, `docs/explain/flow/<feature>.md`) nếu có → hỏi user: chạy lại `/explain code|flow <feature>` (ghi đè), hay để sau. Để sau thì chèn ngay dưới bảng thông tin đầu bài dòng `> ⚠️ Code đã thay đổi ngày <YYYY-MM-DD> (<tóm tắt 1 dòng>), bài có thể đã cũ.` (chỉ sửa dòng này, không viết lại bài).
- Không thêm chi tiết vào `../CLAUDE.md` (file gốc chỉ để điều hướng).

## Output

```
✅ Feature "<feature>" (frontend) xong!

🖥️  Trang:
| Path | Trang | Quyền |

📁 File tạo mới: src/features/<feature>/...
📝 File đã sửa: src/app/routes.tsx, vite.config.ts, src/shared/..., ...

🧪 Kiểm tra: typecheck / lint / test / build / chạy thử trên trình duyệt (kết quả thật, phần nào chưa thử)

⚠️  Còn lại: TODO, giả định đã chọn, phụ thuộc chưa có

🚀 Tiếp theo: /fe-test <feature> (khi có), feature kế tiếp
```

## Quy tắc quan trọng
1. **Bám API thật**: tên trường, response, mã lỗi đúng backend `context.md` và `API_SPEC.md`; schema form khớp `dto.ts` backend.
2. **Luồng một chiều**: component → hook → service → `http`. Không gọi axios/fetch trong component, không `useEffect` để tải dữ liệu.
3. **Dữ liệu server chỉ ở TanStack Query**: không chép vào `useState`/Zustand. Zustand chỉ cho `auth.store` và `ui.store`.
4. **Không import nội bộ feature khác**: chỉ `@/features/<x>` (ESLint chặn `@/features/*/*`); `src/shared/` không import `src/features/`.
5. **Không `any`, không `export default`, không inline style/mã màu cứng, không `console.log`**; không để secret trong biến `VITE_*`.
6. **Không ghi đè file đã có**; sửa file shared/config thì nói rõ sửa gì.
7. **Hỏi khi docs mơ hồ hoặc mâu thuẫn**, không tự chọn.
8. Mỗi file tạo/sửa: nói bằng tiếng Việt 1–2 câu file làm gì, vì sao cần.

## Xử lý lỗi

| Lỗi | Hành động |
|---|---|
| Thiếu tên feature | Hỏi: "Feature nào? Ví dụ `/fe-crud game`" |
| Tên feature không có trong danh sách | Hỏi lại; feature mới cần thêm vào `API_SPEC.md` và backend trước |
| Chưa init frontend | Gợi ý `/init-base frontend` |
| Backend feature chưa xong | Hỏi: chờ `/be-crud`, hay làm theo `API_SPEC.md` và kiểm tra bằng MSW |
| Proxy lệch cổng backend | Báo user cổng nào đúng; không tự sửa `.env` backend |
| Response thật khác `API_SPEC.md` | Theo API thật, báo user để cập nhật `API_SPEC.md` |
| Component vượt 150 dòng | Tách component con hoặc đưa logic ra hook/util |
| typecheck/lint/test/build fail | Sửa tới khi pass; không tắt rule, không `// @ts-ignore`, không `any` |
