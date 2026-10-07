# Frontend: Fight Station
Website quán PS5: khách xem game, bảng giá, menu, chi nhánh, khuyến mãi; chủ quán đăng nhập trang quản trị để thêm/sửa/xóa. Backend là API riêng (Express), FE chỉ gọi API.

## Công nghệ sử dụng
  - React 19 + Vite: dev server nhanh, các tính năng React hiện đại
  - TypeScript: an toàn kiểu dữ liệu, trải nghiệm lập trình (DX) tốt hơn, phát hiện lỗi sớm
  - TanStack Query: quản lý state từ server, caching, tự động refetch
  - Zustand: global state tối giản, chỉ dùng cho auth và UI toàn cục (sidebar admin)
  - Tailwind CSS: utility-first, viết style nhanh, thiết kế nhất quán
  - Axios: interceptor để xử lý xác thực và lỗi
  - React Router v7: routing hiện đại, route an toàn kiểu, cải thiện việc tải dữ liệu

## Tài liệu

### Bắt buộc đọc
- @docs/FE-PROJECT-RULES.md - Quy ước, pattern, những điều BẮT BUỘC/KHÔNG ĐƯỢC làm
- @docs/FE-ARCHITECTURE.md - Cấu trúc thư mục, component, state

### Tham khảo
- @../01-share-docs/API_SPEC.md - Hợp đồng API (API contract) cần tuân theo khi gọi

## Tra cứu nhanh

### Vị trí các feature
`src/features/[name]/` - Mỗi feature có một file `context.md`. Đọc `context.md` của feature tước khi sửa feature đó. Trang ghép nhiều feature: src/pages/. Code dùng chung: src/shared/ (không được import features).

### Export công khai
Luôn export qua file `index` (barrel export).Import feature khác chỉ dạng @/features/game, không import sâu @/features/game/hooks/...
