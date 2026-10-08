# Feature: price-plan (frontend)

> ✅ **Đã cài đặt** (2026-10-08). Đã chạy typecheck, lint, test, build và gọi thử API qua proxy; chưa thử thêm/sửa/xóa trên trình duyệt với tài khoản owner, chưa xem giao diện thẻ bằng mắt.

## Mục đích
Bảng giá giờ chơi: các gói giá, kèm danh sách quyền lợi và nhãn "HOT". Owner thêm, sửa, xóa, ẩn/hiện gói.

## Endpoint dùng (backend `price-plan` đã xong)
| Method | Path | Dùng ở |
|---|---|---|
| GET | `/price-plans?limit=100&branchId=` | `PricePlanList` (trang `/pricing` lọc theo `?branch=`, `PricePlanCarousel` ở trang chủ lấy mọi gói) |
| GET | `/branches?limit=100&includeInactive=true` | Mục "Áp dụng cho chi nhánh" trong form gói giá (`hooks/useBranchOptions.ts`) |
| GET | `/price-plans?includeInactive=true&limit=100` | Bảng gói ở `AdminPricePlansPage` |
| GET | `/price-plans/:id?includeInactive=true` | Form sửa (mở được cả gói đang ẩn) |
| POST / PUT / DELETE | `/price-plans`, `/price-plans/:id` | Trang quản trị (Owner) |

## Route và trang
| Path | Trang | Quyền |
|---|---|---|
| `/pricing` | `PricingPage` ở **`src/pages`** (ghép `BranchPicker` + `PricePlanList` qua `?branch=`), lazy | Công khai |
| `/admin/price-plans` | `AdminPricePlansPage`: bảng gói, nút đổi nhanh ẩn/hiện, xóa có hộp xác nhận | Owner |
| `/admin/price-plans/new` | `AdminPricePlanNewPage` | Owner |
| `/admin/price-plans/:id/edit` | `AdminPricePlanEditPage` | Owner |

Menu khách (`PUBLIC_NAV`) có mục "Bảng giá"; menu quản trị (`ADMIN_NAV`) có mục "Bảng giá" chỉ owner thấy. Trang chủ có mục `#pricing` đặt giữa kho game và menu.

## Public API (`index.ts`)
- `PricePlanList` (props `headingLevel`, `branchId`, `emptyMessage`), `PricePlanCarousel` (trang chủ), `pricePlanOwnerRoutes`. Không còn `pricePlanPublicRoutes`: `/pricing` là trang ghép nên route khai báo trong `app/routes.tsx`.

## File chính
| File | Vai trò |
|---|---|
| `types/price-plan.types.ts` | `PricePlan`, `PricePlanFeature`, `PricePlanQuery`, `PricePlanPayload` (`features: string[]`) |
| `types/price-plan.schema.ts` | `pricePlanFormSchema` (có `.refine` kiểm tra chi nhánh; test `price-plan.schema.test.ts`) khớp `price-plan.dto.ts` backend; ô nhập là chuỗi, đổi sang số/null ở `toPricePlanPayload`; quyền lợi là `{ content }` để dùng `useFieldArray` |
| `services/price-plan.service.ts` | 5 hàm gọi API qua `http` |
| `hooks/` | `price-plan.keys.ts`, `usePricePlans`, `usePricePlan`, `useCreate/Update/DeletePricePlan`, `useInvalidatePricePlans` |
| `components/` | `PricePlanBranchesField`, `PricePlanCard`, `PricePlanCarousel`, `PricePlanComboRow`, `PricePlanList`, `PricePlanListSkeleton`, `PricePlanNotes`, `PricePlanTable`, `PricePlanForm`, `PricePlanFeaturesField` |
| `utils/price-plan.utils.ts` | `PRICE_PLAN_GRID_CLASS`, `splitPricePlanLines`, `EMPTY_PRICE_PLAN_FORM`, `toPricePlanFormValues`, `toPricePlanPayload` (test: `price-plan.utils.test.ts`) |
| `utils/price-plan-form-errors.ts` | `applyPricePlanErrors`: `details.field` dạng `features.N` gán vào đúng ô quyền lợi thứ N |

## Query key
- `['price-plans', query]` (danh sách), `['price-plan', id, { includeInactive }]` (chi tiết).
- Mọi thao tác ghi invalidate cả hai key gốc (`['price-plans']`, `['price-plan']`).

## Bảng giá theo chi nhánh (2026-10-08)
Một gói áp dụng được **nhiều chi nhánh** (nhiều-nhiều, bảng nối `price_plan_branch` ở backend): chi nhánh nào giá giống nhau thì tick chung một gói, khỏi nhập lặp. Response có `branches: [{ id, name }]` (mảng rỗng = áp dụng mọi chi nhánh); khi ghi gửi `branchIds: number[] | null` (`null` = mọi chi nhánh). Bảng giá thật hiện chỉ có ở **chi nhánh 4 (Quận 7)**, chi nhánh duy nhất có phòng PC.
- `/pricing`: `BranchPicker` ghi `?branch=<id>`; chọn chi nhánh thì hiện gói có chi nhánh đó cộng gói áp dụng mọi chi nhánh; chi nhánh chưa có gói thì hiện "Chi nhánh này chưa có bảng giá riêng. Vui lòng liên hệ chi nhánh để được báo giá."; không chọn thì hiện mọi gói.
- Thẻ ghi `Chi nhánh <tên 1>, <tên 2>` (icon ghim) khi gói chỉ áp dụng một số chi nhánh, không ghi gì khi áp dụng mọi chi nhánh; bảng quản trị có cột "Chi nhánh" ("Mọi chi nhánh" khi mảng rỗng).
- Form: mục "Áp dụng cho chi nhánh" (`PricePlanBranchesField`, giống `GameBranchesField`): ô "Áp dụng mọi chi nhánh" (mặc định bật) hoặc tick từng chi nhánh (kể cả chi nhánh đang ẩn). Bỏ "mọi chi nhánh" mà không tick chi nhánh nào thì báo lỗi ở mục này (schema `.refine`). `PRICE_002` (có chi nhánh vừa bị xóa) cũng gán vào mục này.
- Ghi chú dưới bảng giá (`PricePlanNotes`) hiện chung cho mọi chi nhánh vì chưa có chỗ lưu theo chi nhánh; viết theo tờ giá của chi nhánh 4.

## Quy ước dòng quyền lợi (combo và dịch vụ trong phòng)
Mỗi **loại phòng là một gói** (VIP, VVIP, Luxury PS5, Luxury PC, Dorm), `priceVnd` là giá **Giờ lẻ**, `description` là nhãn nhỏ phía trên giá (vd "Giờ lẻ"). API chỉ có mảng chuỗi `features` nên giao diện tách theo quy ước (`splitPricePlanLines` trong `utils/price-plan.utils.ts`, có test):
- Dòng kết thúc bằng `: <số>K` (vd `Combo sáng (8h30–13h): 199K`) là **combo**, vẽ thành bảng giá nhỏ "tên ······ giá".
- Dòng khác (vd `Điều hòa`, `TV 65 inch`) là **dịch vụ trong phòng**, hiện ở mục "Trong phòng" với dấu tick.
- Tối đa 10 dòng/gói (giới hạn của backend) gồm cả combo lẫn dịch vụ. VIP đã dùng 5 dòng cho combo.
- Lưu ý và phụ thu (tối thiểu 2 tiếng, không camera, Nintendo/tay cầm thêm +10K/giờ, người thứ 5, đồ ăn mang vào) viết cố định trong `components/PricePlanNotes.tsx`, chưa có trong database.
- Dữ liệu seed gắn vào chi nhánh thứ 4 (theo thứ tự hiển thị) và là bảng giá thật (tờ giá 2026-10-08) kèm dịch vụ trong phòng (tờ ROOM LIST). Mỗi gói VIP/VVIP/Luxury gồm 5 combo + 5 dòng dịch vụ (đúng giới hạn 10 dòng); Dorm chưa có dịch vụ vì chưa có thông tin.

## Dải trượt ở trang chủ (2026-10-08)
`PricePlanCarousel` làm giống `GameCarousel` (cùng dùng `shared/components/ui/Marquee`, `direction="right"`) nhưng chạy **ngược hướng (sang phải)**: keyframes `marquee-reverse` (`translateX(-50% → 0)`, 60s) trong `styles/index.css`, class `animate-marquee-reverse`. Muốn đổi sang trái thì dùng `animate-marquee`; nhanh/chậm thì đổi `60s`. Danh sách lặp 2 lần, khoảng cách bằng `mr-6` (không dùng `gap`), thẻ rộng `w-80`, rê chuột/focus thì dừng, `prefers-reduced-motion` thì cuộn ngang. **Dưới 5 gói** (một bản lặp ngắn hơn màn hình) hoặc đang tải/lỗi thì hiện `PricePlanList` (lưới). Trang `/pricing` vẫn dùng lưới để đọc kỹ.

## Ghi chú UI
- Giá chính hiển thị bằng `formatVndShort(priceVnd)` + `unit`, vd `69K/giờ`; `description` là nhãn nhỏ phía trên giá. Lưới 3 cột từ `lg`.
- `isHot` thì thẻ có viền sáng và nhãn "Hot"; bảng quản trị có nhãn HOT cạnh tên gói.
- `features` đã được API xếp đúng thứ tự, không cần sắp xếp lại.
- Form: quyền lợi thêm/xóa/đổi chỗ bằng nút lên/xuống (không kéo-thả, để khỏi thêm thư viện); tối đa 10 dòng, mỗi dòng 1–255 ký tự. Gửi lên là `string[]`, thứ tự trong mảng chính là thứ tự hiển thị. Sửa gói luôn gửi đủ `features` (thay toàn bộ); nút ẩn/hiện nhanh chỉ gửi `{ isActive }` nên quyền lợi giữ nguyên.
- `priceVnd` là số nguyên 0–100.000.000, gõ không dấu chấm. Không cho nhập số thập phân.
- Chỉ owner được ghi (staff gọi sẽ nhận `AUTH_005`); nút ẩn theo role chỉ là che giao diện, quyền thật do backend quyết định.

## Mã lỗi xử lý
- `PRICE_001` (404): gói vừa bị xóa, hiện ở khung lỗi đầu form hoặc toast.
- `COMMON_001` có `details`: gán vào từng ô, kể cả `features.N`.
