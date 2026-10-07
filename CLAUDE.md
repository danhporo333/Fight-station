# Fight Station

Website quán PS5, màu chủ đạo cam: khách xem thông tin quán, game, bảng giá, menu, chi nhánh, khuyến mãi; chủ quán và nhân viên đăng nhập trang quản trị để thêm/sửa/xóa.

File này chỉ để **điều hướng**. Thông tin chi tiết nằm ở file được trỏ tới bên dưới; đọc đúng file khi cần.

## Cần gì, đọc ở đâu

| Cần | Đọc |
|---|---|
| Làm việc ở backend: stack, quy tắc, kiến trúc | [backend/CLAUDE.md](backend/CLAUDE.md) |
| Làm việc ở frontend: stack, quy tắc, kiến trúc | [frontend/CLAUDE.md](frontend/CLAUDE.md) |
| Endpoint, định dạng response, mã lỗi, phân quyền | [01-share-docs/API_SPEC.md](01-share-docs/API_SPEC.md) |
| Bảng, cột, quan hệ, migration | [01-share-docs/DATABASE.md](01-share-docs/DATABASE.md) |
| Một tính năng: `auth`, `shop`, `branch`, `game`, `price-plan`, `menu`, `promotion` | `backend/src/features/<tên>/context.md` và `frontend/src/features/<tên>/context.md` |
| Đã setup những gì, lệnh hay dùng | [backend/docs/SETUP-NOTES.md](backend/docs/SETUP-NOTES.md), [frontend/docs/SETUP-NOTES.md](frontend/docs/SETUP-NOTES.md) |

## Available Skills

Skill chung ở `.claude/skills/`; skill backend ở `backend/.claude/skills/`; skill frontend ở `frontend/.claude/skills/`.

- /init-base [backend|frontend]: dựng khung dự án (đã chạy cho cả hai)
- /be-crud [feature]: sinh CRUD backend (Prisma model + migration → routes, nối dây app.ts, cập nhật context.md)
- /fe-crud [feature]: sinh CRUD frontend (types, service, hooks, components, trang, routes lazy, ghép app/routes.tsx, cập nhật context.md)
- /be-test, /fe-test: (chưa có) viết test

### Skill Routing

- "tạo feature", "add entity", "generate crud" → `/be-crud` hoặc `/fe-crud`
- "viết test", "add tests" → `/be-test` hoặc `/fe-test`
- "init project", "setup structure" → `/init-base`
- Skill chưa có thì báo user, không tự làm thay

## Quy tắc giữ file này gọn

- Không viết thông tin chi tiết vào đây. Viết vào đúng nơi: tính năng → `context.md` của tính năng; quy ước backend/frontend → `CLAUDE.md` hoặc `docs/` của phần đó; API và DB → `01-share-docs/`. Ở đây chỉ thêm một dòng trỏ tới.
- Trước khi sửa một tính năng, đọc `context.md` của nó; sửa xong thì cập nhật `context.md` theo code thật.
- Khi tạo, đổi tên hoặc xóa skill trong `.claude/skills/`, cập nhật "Available Skills" và "Skill Routing" (skill dự kiến ghi kèm "(chưa có)").
