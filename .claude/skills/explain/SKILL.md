---
name: explain
description: >
  Giải thích code, khái niệm, luồng xử lý, quyết định thiết kế hoặc mã lỗi cho người mới bắt đầu,
  và lưu bài giải thích vào thư mục docs riêng của BE hoặc FE.
  Dùng khi người dùng gõ /explain, hoặc nói "explain", "giải thích", "how does this work",
  "what is", "tại sao", "why" VÀ muốn một bài giải thích được lưu lại để học/đọc lại.
  Câu hỏi nhanh trong lúc làm việc (vd "tại sao server không chạy?") thì trả lời trực tiếp, không dùng skill này.
argument-hint: "[code|concept|flow|why|error] [target]"
allowed-tools:
  - Read
  - Write
---

# Giải thích cho người mới bắt đầu

## Cách dùng

```
/explain code [feature-name]        → Code làm gì
/explain concept [concept-name]     → Giải thích pattern/khái niệm
/explain flow [feature-name]        → Luồng request/dữ liệu
/explain why [decision]             → Lý do đằng sau các quyết định
/explain error [mã lỗi|thông báo]   → Lỗi nghĩa là gì, vì sao xảy ra, cách sửa
```

## Quy trình

1. **Không hỏi ngôn ngữ**: "Luôn trả lời bằng tiếng việt"

2. **Xác định phía (BE hay FE):**
   - Dựa vào target: feature/khái niệm thuộc backend → **BE**, thuộc frontend → **FE**.
   - Nếu target liên quan cả hai (ví dụ `flow` từ giao diện đến API) → **tách thành 2 bài**: bài BE chỉ nói phần backend, bài FE chỉ nói phần frontend, mỗi bài có liên kết sang bài còn lại.
   - Nếu không rõ → hỏi: "Giải thích cho BE, FE hay cả hai?"

3. **Đọc tài liệu TRƯỚC (không quét source code):**

| Chế độ    | Thứ tự đọc                                                                 |
| --------- | -------------------------------------------------------------------------- |
| `code`    | context.md của feature → BE/FE-ARCHITECTURE.md                             |
| `concept` | BE/FE-PROJECT-RULES.md → BE/FE-ARCHITECTURE.md                             |
| `flow`    | BE/FE-ARCHITECTURE.md mục 4 (luồng request / luồng dữ liệu) → API_SPEC.md → context.md của feature |
| `why`     | BE/FE-PROJECT-RULES.md → BE/FE-ARCHITECTURE.md → DATABASE.md (nếu liên quan) |
| `error`   | API_SPEC.md mục 2 và 5 (mã lỗi) → context.md của feature liên quan         |

Chỉ đọc tài liệu của phía đang giải thích (BE đọc tài liệu BE, FE đọc tài liệu FE). Tài liệu dùng chung trong `01-share-docs/` thì phía nào cũng được đọc.

   **Kiểm tra trạng thái feature** (chế độ `code`, `flow`): dòng đầu `context.md` ghi "⏳ Chưa cài đặt" nghĩa là feature **chưa có code**. Báo người dùng điều đó; chỉ viết bài về **thiết kế dự kiến** nếu người dùng đồng ý, và ghi rõ "Thiết kế dự kiến, chưa có code" ở đầu bài.

4. **Chỉ đọc file source cụ thể** khi người dùng chỉ rõ file chính xác

5. **Dùng template**: `./templates/vi.md` (mục tương ứng với chế độ; `error` dùng mục "Giải thích Lỗi")

6. **Lưu bài giải thích** (xem mục "Nơi lưu bài giải thích"), rồi báo cho người dùng đường dẫn file vừa lưu.

## Nơi lưu bài giải thích

```
backend/docs/explain/
├── code/{feature-name}.md
├── concept/{concept-name}.md
├── flow/{feature-name}.md
├── why/{decision}.md
└── error/{ma-loi}.md

frontend/docs/explain/
├── code/{feature-name}.md
├── concept/{concept-name}.md
├── flow/{feature-name}.md
├── why/{decision}.md
└── error/{ma-loi}.md
```

- Tên file viết thường, nối bằng dấu gạch ngang (kebab-case):
  - `code/`, `flow/`: đúng tên feature, vd `code/auth.md`, `flow/price-plan.md`
  - `concept/`, `why/`: tiếng Việt không dấu, vd `concept/dependency-injection.md`, `why/khong-dung-refresh-token.md`
  - `error/`: mã lỗi viết thường, vd `error/auth-003.md`; không có mã thì mô tả ngắn không dấu, vd `error/eaddrinuse.md`
- Nếu file đã tồn tại → hỏi người dùng muốn **ghi đè** hay **tạo bản mới** (thêm hậu tố `-v2`, `-v3`…). Mặc định gợi ý ghi đè, vì lịch sử đã có trong git.
- Đầu mỗi file ghi rõ: phía (BE/FE), chế độ, target, **ngày viết** và các tài liệu đã đọc (để biết bài có thể đã cũ khi code thay đổi).
- Với bài tách đôi, cuối bài thêm dòng "Xem phần còn lại:" kèm đường dẫn tương đối sang bài của phía kia.

## Vị trí tài liệu

```
01-share-docs/
├── DATABASE.md
└── API_SPEC.md

backend/docs/
├── BE-PROJECT-RULES.md
└── BE-ARCHITECTURE.md

frontend/docs/
├── FE-PROJECT-RULES.md
└── FE-ARCHITECTURE.md

backend/src/features/{feature}/context.md    ← feature phía BE
frontend/src/features/{feature}/context.md   ← feature phía FE
```

Feature hợp lệ: `auth`, `shop`, `branch`, `game`, `price-plan`, `menu`, `promotion`.

## Quy tắc

- **KHÔNG BAO GIỜ Glob/quét source code**
- Tài liệu chứa toàn bộ các quyết định kiến trúc
- context.md chứa chi tiết riêng của từng feature
- Chỉ đọc source khi người dùng đưa đường dẫn file chính xác
- **Không trộn BE và FE trong cùng một bài** — mỗi bài chỉ nói về một phía
- Chỉ dùng Write để lưu bài giải thích vào `docs/explain/`, không sửa file nào khác

## Xử lý lỗi

| Lỗi                         | Hành động                                              |
| --------------------------- | ------------------------------------------------------ |
| Thiếu chế độ                | Hỏi: code, concept, flow, why hay error?               |
| Không rõ BE hay FE          | Hỏi: BE, FE hay cả hai?                                |
| Feature không có trong danh sách | Hỏi lại tên feature                               |
| Không có context.md         | Đọc ARCHITECTURE.md thay thế                           |
| context.md "⏳ Chưa cài đặt" | Báo feature chưa có code; hỏi có muốn bài thiết kế dự kiến không |
| Cần chi tiết source         | Hỏi người dùng đường dẫn file cụ thể                   |
| File giải thích đã tồn tại  | Hỏi: ghi đè hay tạo bản mới?                           |
