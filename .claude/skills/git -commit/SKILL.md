---
name: git-commit
description: >
  Viết commit message hoàn toàn bằng tiếng Việt (loại, mô tả, nội dung) cho dự án Fight Station
  (monorepo gồm backend/ và frontend/).
  Dùng khi người dùng nói "commit", "git commit", "save changes",
  "tạo commit", "viết commit message", "lưu thay đổi", hoặc vừa làm xong một việc và muốn commit.
argument-hint: "[loại] [mô tả]"
allowed-tools:
  - Bash
  - Read
---

# Tạo commit message

## Cách dùng

```
/git-commit                                → Tự nhận diện loại từ thay đổi
/git-commit tính năng thêm trang bảng giá  → Commit nhanh với loại + mô tả
/git-commit --amend                        → Sửa message của commit gần nhất
```

## Quy trình

1. **Kiểm tra thay đổi đã stage**:
   ```bash
   git diff --staged --stat
   ```
   - Nếu chưa stage gì → gợi ý người dùng chạy `git add` trước (không tự add).

2. **Đọc quy ước dự án**: `CLAUDE.md` ở gốc (mục commit nếu có) và `./references/conventions.md`.

3. **Phân tích thay đổi**:
   ```bash
   git diff --staged
   ```

4. **Nhận diện loại và phạm vi** từ file/nội dung thay đổi (xem `./references/conventions.md`).
   - Nếu thay đổi gồm nhiều việc không liên quan (ví dụ vừa thêm feature `game` vừa sửa config ESLint) → gợi ý tách thành nhiều commit.

5. **Sinh message** → hiển thị bản xem trước:

   ```
   📝 XEM TRƯỚC COMMIT

   tính năng(price-plan): thêm API CRUD bảng giá

   - Thêm model PricePlan và migration
   - Thêm route GET/POST/PUT/DELETE /api/price-plans
   - Cập nhật context.md của price-plan

   File đã stage (4):
     M backend/prisma/schema.prisma
     A backend/prisma/migrations/20261007_add_price_plan/migration.sql
     A backend/src/features/price-plan/price-plan.routes.ts
     M backend/src/features/price-plan/context.md

   Commit? (có/không/sửa)
   ```

6. **Thực thi sau khi người dùng xác nhận**:
   - `có` → `git commit` với message đã xem trước (message nhiều dòng thì truyền qua heredoc).
   - `sửa` → người dùng sửa message, rồi mới commit.
   - `không` → hủy.

## Commit nhanh

Bỏ qua bước xem trước khi commit đơn giản và người dùng đã đưa sẵn loại + mô tả:

```
/git-commit sửa lỗi sửa lỗi chính tả trong README
    ↓
git commit -m "sửa lỗi: sửa lỗi chính tả trong README"
```

Nếu người dùng gõ loại bằng tiếng Anh (`feat`, `fix`…) → tự đổi sang loại tiếng Việt tương ứng trong `./references/conventions.md`.

## Quy tắc

- **Chỉ viết tiếng Việt có dấu**: cả loại, mô tả ngắn, nội dung và chân trang. Chỉ giữ nguyên tên riêng trong code (tên feature, file, endpoint, thư viện).
- **Chỉ commit file đã stage**: Không bao giờ tự `git add`.
- **Phạm vi lấy từ đường dẫn**: `backend/src/features/game/` hoặc `frontend/src/features/game/` → `(game)`; chi tiết ở `./references/conventions.md`.
- **Viết thường** loại và phạm vi.
- **Mô tả ngắn bắt đầu bằng động từ**: "thêm", "sửa", "xóa", "cập nhật", "tách"…
- **Không chấm câu** ở cuối mô tả ngắn.
- **Độ dài**: dòng đầu (cả phần `loại(phạm vi): `) ≤ 72 ký tự, nội dung xuống dòng ở khoảng 72 ký tự.
- **Không commit file nhạy cảm**: nếu thấy `.env` (không phải `.env.example`) trong danh sách stage → cảnh báo và dừng lại.
- **Không dùng** `--no-verify` hay bỏ qua hook trừ khi người dùng yêu cầu rõ.
