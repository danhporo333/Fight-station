# Backend: Fight Station
API cho website quán PS5: khách xem game, bảng giá, menu, chi nhánh, khuyến mãi; chủ quán đăng nhập để thêm/sửa/xóa. Frontend là project riêng, BE chỉ cung cấp REST API.

## Tech Stack
- Language: TypeScript
- Framework: Node.js 24 LTS + Express 5
- ORM / Database: Prisma + MySQL 8.4
- Validation: Zod
- Logging: Pino
- Test: Vitest + Supertest

## Tài liệu

### Bắt buộc đọc
- @docs/BE-PROJECT-RULES.md - Conventions, patterns, MUST/MUST NOT
- @docs/BE-ARCHITECTURE.md - Folder structure, layers, feature anatomy

### Tham khảo
- @../01-share-docs/API_SPEC.md - API contract
- @../01-share-docs/DATABASE.md - Schema

## Hướng dẫn nhanh

### Vị trí của feature
src/features/[name]/ - Mỗi feature có một file context.md. Đọc context.md của feature trước khi sửa feature đó. Hạ tầng: src/core/ (database, logger, events). Dùng chung: src/shared/. Cấu hình: src/config/env.ts.

### Tiền tố mã lỗi
`[FEATURE]_[NUMBER]` - e.g., AUTH_001, USER_001

### Quy tắc cần nhớ
- Luồng gọi: routes → controller → service → repository → Prisma. Chỉ repository được dùng Prisma
- Không import file nội bộ của feature khác; chỉ qua index.ts, hoặc inject interface và nối dây ở app.ts
- shared/, core/, config/ không được import features/
- Service ném AppError; controller không try/catch; chỉ một error middleware đổi lỗi thành response
- Validate bằng Zod ở route; đọc biến môi trường chỉ qua config/env.ts
- Không dùng console.log (dùng Pino), không log mật khẩu hay token, không trả password_hash ra response
- Commit: <type>(<feature>): <mô tả>, ví dụ feat(game): thêm API xóa game

## Giải thích sau khi code

- Sau khi hoàn thành code một feature (không áp dụng cho sửa nhỏ, sửa typo, đổi config), luôn chạy skill `/explain code [feature-name]`.
- Code backend → lưu vào `backend/docs/explain/`; code frontend → lưu vào `frontend/docs/explain/`. Nếu feature có cả BE và FE thì tạo hai bài riêng.
- Viết bằng tiếng Việt, không cần hỏi lại ngôn ngữ.