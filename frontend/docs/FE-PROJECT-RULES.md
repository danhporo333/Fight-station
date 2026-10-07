# PROJECT-RULES.md — Frontend Fight Station

Website quán PS5: khách xem game, bảng giá, menu, chi nhánh, khuyến mãi; chủ quán đăng nhập trang quản trị để thêm/sửa/xóa. API xem `API_SPEC.md`.

## Tech Stack
- **Framework**: React 19 + TypeScript (`strict: true`) + Vite, React Router, alias `@/` → `src/`
- **Quản lý state**: TanStack Query (dữ liệu từ API), Zustand (state toàn cục, chỉ cho đăng nhập), `useState` (state cục bộ)
- **Styling**: Tailwind CSS, v4, màu chủ đạo cam khai báo thành token `brand-50` … `brand-900` bằng `@theme` trong `src/styles/index.css`
- **HTTP client**: Axios, một instance duy nhất ở `shared/services/api/http.ts`
- **Khác**: React Hook Form + Zod (form), Vitest + React Testing Library + MSW (test)

## 1. Cấu trúc feature
Feature trùng tên với backend: `auth`, `shop`, `branch`, `game`, `price-plan`, `menu`, `promotion`.
```
src/
├── app/                      # main.tsx, App.tsx, providers.tsx (QueryClient, ErrorBoundary), routes.tsx
├── pages/                    # CHỈ trang ghép ≥ 2 feature: HomePage.tsx, GamesPage.tsx
├── features/
│   └── game/
│       ├── components/       # GameCard.tsx, GameList.tsx, GameForm.tsx (+ test, cạnh file)
│       ├── hooks/            # useGames.ts, useCreateGame.ts (bọc TanStack Query)
│       ├── services/         # game.service.ts: MỌI lời gọi API của feature
│       ├── stores/           # chỉ khi feature cần state riêng (hiện chưa feature nào dùng)
│       ├── types/            # game.types.ts, game.schema.ts (Zod + type suy ra)
│       ├── utils/            # hàm thuần: groupByCategory.ts
│       ├── pages/            # trang chỉ dùng feature này: AdminGamesPage.tsx
│       ├── routes.tsx        # RouteObject[] của feature (lazy)
│       ├── index.ts          # public export (barrel)
│       └── context.md        # mục đích, endpoint dùng, thứ export, phụ thuộc
├── shared/                   # components/ui, hooks, services/api (http.ts), stores (auth, ui), types, utils (formatVnd, event-bus)
├── assets/                   # logo, ảnh nền, font
└── styles/                   # Tailwind, token màu
```
Điều chỉnh theo React: `pages/` cấp cao chỉ cho trang ghép nhiều feature (feature không tự ghép nhau); trang chỉ dùng một feature nằm trong `features/[x]/pages/`. Store đăng nhập (`auth.store.ts`) đặt ở `shared/stores` vì `http.ts` cần đọc token. Phần khách xem và phần quản trị của một feature nằm chung thư mục vì dùng chung type và service.

## 2. Quy ước đặt tên
| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Thư mục feature | kebab-case, số ít | `game`, `price-plan` |
| Component (file + tên) | PascalCase, `.tsx` | `GameCard.tsx`, `GameCardProps` |
| Hook | camelCase, tiền tố `use` | `useGames.ts`, `useCreateGame.ts` |
| Service | `[feature].service.ts`, hàm bắt đầu bằng động từ | `getGames`, `createGame` |
| Type / Interface | PascalCase, không tiền tố `I`; schema Zod đuôi `Schema` | `Game`, `CreateGameInput`, `gameSchema` |
| Hằng số | UPPER_SNAKE_CASE | `ERROR_MESSAGES` |
| Field JSON | camelCase đúng như API | `priceVnd`, `posterUrl` |

## 3. Quy tắc cho feature
- Feature tự đóng gói: component, hook, service, type, test, `context.md` nằm hết trong thư mục feature.
- Chỉ export qua `index.ts`. Bên ngoài chỉ được `import { GameCard } from '@/features/game'`.
- Không import trực tiếp giữa các feature. Cần ghép nhiều feature thì làm ở `pages/`.
- Giao tiếp giữa feature: (1) **URL param** (mặc định, vd bộ lọc game `?category=2&q=tekken`); (2) **Event** (`shared/utils/event-bus.ts`) cho thông báo một chiều; (3) **Global state** chỉ khi bắt buộc, hiện chỉ có `auth`.
- Component dùng chung ở `src/shared/components/`; chỉ đưa vào đó khi ≥ 2 feature dùng.
- ESLint `no-restricted-imports` chặn mẫu `@/features/*/*`, CI fail nếu vi phạm.
```tsx
// ❌ KHÔNG NÊN: import file nội bộ của feature khác
import { useBranches } from '@/features/branch/hooks/useBranches';
// ✅ NÊN: ghép ở page, truyền qua props / URL param
// pages/GamesPage.tsx
const [params] = useSearchParams();
return <><BranchPicker /><GameList query={{ branchId: params.get('branch') }} /></>;
```

## 4. Quy tắc cho component
- Mỗi file một component, export tên (không `export default`). Style (Tailwind) và test (`GameCard.test.tsx`) đặt cạnh component.
- Props bắt buộc khai báo type riêng `[Tên]Props`, không dùng `any`.
- Tối đa **150 dòng** mỗi component; dài hơn thì tách component con hoặc đưa logic ra hook.
- Component chỉ hiển thị. Gọi API và logic nằm ở hook/service/util.

## 5. Code pattern (BẮT BUỘC)
**Gọi API**: component → hook → service → `http`. Service trả dữ liệu đã bóc `{ data, meta }`, không trả `AxiosResponse`.
```ts
// services/game.service.ts
export const getGames = (q: GameQuery) => http.get<Game[]>('/games', { params: q });
// hooks/useGames.ts
export const useGames = (q: GameQuery) => useQuery({ queryKey: ['games', q], queryFn: () => getGames(q) });
// hooks/useDeleteGame.ts: sau khi xóa phải làm mới danh sách
useMutation({ mutationFn: deleteGame, onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }) });
```
**State**: ưu tiên local (`useState`). Dữ liệu từ server chỉ để trong TanStack Query, không chép sang Zustand hay `useState`. Zustand chỉ cho token, thông tin admin (`shared/stores/auth.store.ts`) và UI toàn cục (`ui.store.ts`).

**Xử lý lỗi**: `ErrorBoundary` ở mỗi route để chặn màn hình trắng. Lỗi API là `ApiError` (có `code`, `message`, `details`); báo bằng toast qua `ERROR_MESSAGES[code] ?? error.message`. Gặp `AUTH_002/003` thì interceptor xóa token và chuyển về `/admin/login`.

**Loading**: danh sách dùng skeleton (`GameListSkeleton`), nút gửi form dùng spinner và `disabled`. Danh sách rỗng có dòng thông báo riêng, không để trống.
```tsx
// ✅ NÊN
const { data, isPending, error } = useGames(query);
if (isPending) return <GameListSkeleton />;
if (error) return <ErrorMessage error={error} />;
return data.data.map((g) => <GameCard key={g.id} game={g} />);
// ❌ KHÔNG NÊN
useEffect(() => { axios.get('/api/v1/games').then((r) => setGames(r.data.data)); }, []);
```
**Form**: React Hook Form + `zodResolver`, schema trong `types/*.schema.ts`, khớp luật của `API_SPEC.md`. Lỗi `details` từ server gán về từng trường bằng `setError`.
```ts
export const gameSchema = z.object({
  title: z.string().trim().min(1, 'Nhập tên game').max(150),
  gameCategoryId: z.number().int().positive(),
});
export type GameInput = z.infer<typeof gameSchema>;
```
**Tiền, ngày, ảnh**: tiền hiển thị bằng `formatVnd(15000)` → `15.000đ` (bảng giá menu dùng `formatVndShort(35000)` → `35K`, giá lẻ vẫn ghi đủ); `posterUrl`/`imageUrl` rỗng thì hiện tên bằng chữ; mọi `<img>` có `alt` và `loading="lazy"`.

## 6. Anti-pattern (KHÔNG ĐƯỢC làm)
| Vi phạm | ❌ KHÔNG NÊN | ✅ NÊN |
|---|---|---|
| Import file nội bộ feature khác | `from '@/features/game/hooks/useGames'` | `from '@/features/game'` (qua `index.ts`) |
| Gọi API trong component | `axios.get(...)` trong `useEffect` | `useGames()` → `game.service.ts` |
| Logic nghiệp vụ trong component | lọc, nhóm, tính giá ngay trong JSX | hàm thuần ở `utils/`, có test |
| Prop drilling quá 2 tầng | truyền `branchId` qua 4 component | URL param, hoặc component con tự gọi hook |
| Dùng `any` | `catch (e: any)`, `props: any` | `unknown` + kiểm tra kiểu, type riêng |
| Inline style, màu hardcode | `style={{ color: '#ff6a00' }}` | class Tailwind: `text-brand-500` |
| Chép dữ liệu server vào state | `setGames(data)` rồi sửa | dùng thẳng `data` từ TanStack Query |
| Hardcode URL API | `'https://api.fightstation.vn/...'` | `import.meta.env.VITE_API_URL` trong `http.ts` |
| Lưu bí mật ở FE | đưa khóa/secret vào `.env` `VITE_*` | FE chỉ giữ URL công khai, secret ở backend |

## 7. Git workflow
- **Branch**: `<type>/<feature>-<mô-tả-ngắn>`, kebab-case. `type`: `feature`, `fix`, `refactor`, `chore`, `docs`, `test`. Ví dụ `feature/game-filter-by-branch`, `fix/menu-price-format`.
- **Commit** (Conventional Commits, scope là tên feature): `<type>(<feature>): <mô tả>`. Ví dụ `feat(game): thêm lọc theo chi nhánh`, `fix(menu): sửa hiển thị giá`. Không viết `update`, `fix bug`.
- **Pull Request**: một PR một feature hoặc một lỗi, tối đa khoảng 400 dòng; CI xanh (lint, typecheck, test, build); đổi giao diện thì đính kèm ảnh chụp (mobile + desktop); đổi endpoint dùng hoặc cấu trúc feature thì cập nhật `context.md`; ít nhất 1 người approve, không đẩy thẳng lên `main`.

## 8. Testing
- **Vị trí**: cạnh file nguồn, `GameCard.test.tsx`, `groupByCategory.test.ts`. Mock API bằng MSW, không gọi backend thật.
- **Cần test**: hàm `utils/` (nhóm, lọc, `formatVnd`); hook và service (đúng URL, tham số, xử lý lỗi); form (hợp lệ, sai dữ liệu, lỗi `409` từ server); component có 3 trạng thái loading / lỗi / rỗng.
- **Trọng tâm coverage**: `utils`, `services`, `hooks` ≥ 85%; toàn dự án ≥ 70%. Không test chi tiết giao diện (class CSS), test theo hành vi người dùng (`getByRole`, `userEvent`).

## 9. Bổ sung riêng cho React
- Hooks chỉ gọi ở cấp cao nhất của component; `useEffect` chỉ cho việc đồng bộ ngoài React (title trang, sự kiện cửa sổ), **không** dùng để tải dữ liệu.
- `key` trong danh sách là `id` từ API, không dùng index. Ô tìm kiếm debounce 300ms rồi mới ghi vào URL.
- Trang chia nhỏ bằng `React.lazy` theo route; trang quản trị tách chunk riêng, khách không phải tải.
- Chỉ dùng `useMemo`/`useCallback`/`memo` sau khi đo thấy chậm; không thêm "cho chắc".
- Route quản trị bọc `RequireAuth`; ẩn nút theo `role`, nhưng quyền thật luôn do backend quyết định.
