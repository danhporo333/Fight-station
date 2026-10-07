---
name: explain
description: >
  Giải thích code, khái niệm, luồng xử lý hoặc các quyết định thiết kế cho người mới bắt đầu,
  và lưu bài giải thích vào thư mục docs riêng của BE hoặc FE.
  Dùng khi người dùng nói "explain", "giải thích", "how does this work",
  "what is", "tại sao", "why", hoặc muốn hiểu code/khái niệm.
argument-hint: "[code|concept|flow|why] [target]"
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
```

## Quy trình

1. **Không hỏi ngôn ngữ**: "Luôn trả lời bằng tiếng việt"

2. **Xác định phía (BE hay FE):**
   - Dựa vào target: feature/khái niệm thuộc backend → **BE**, thuộc frontend → **FE**.
   - Nếu target liên quan cả hai (ví dụ `flow` từ giao diện đến API) → **tách thành 2 bài**: bài BE chỉ nói phần backend, bài FE chỉ nói phần frontend, mỗi bài có liên kết sang bài còn lại.
   - Nếu không rõ → hỏi: "Giải thích cho BE, FE hay cả hai?"

3. **Đọc tài liệu TRƯỚC (không quét source code):**

| Chế độ    | Thứ tự đọc                                     |
| --------- | ---------------------------------------------- |
| `code`    | context.md của feature → BE/FE-ARCHITECTURE.md |
| `concept` | BE/FE-PROJECT-RULES.md → ARCHITECTURE.md       |
| `flow`    | API_SPEC.md → context.md của feature           |
| `why`     | PROJECT-RULES.md → DATABASE.md (nếu liên quan) |

Chỉ đọc tài liệu của phía đang giải thích (BE đọc tài liệu BE, FE đọc tài liệu FE). Tài liệu dùng chung trong `01-share-docs/` thì phía nào cũng được đọc.

4. **Chỉ đọc file source cụ thể** khi người dùng chỉ rõ file chính xác

5. **Dùng template**: `./templates/vi.md`

6. **Lưu bài giải thích** (xem mục "Nơi lưu bài giải thích"), rồi báo cho người dùng đường dẫn file vừa lưu.

## Nơi lưu bài giải thích

```
backend/docs/explain/
├── code/{feature-name}.md
├── concept/{concept-name}.md
├── flow/{feature-name}.md
└── why/{decision}.md

frontend/docs/explain/
├── code/{feature-name}.md
├── concept/{concept-name}.md
├── flow/{feature-name}.md
└── why/{decision}.md
```

- Tên file viết thường bằng tiếng việt không dấu, nối bằng dấu gạch ngang (kebab-case), ví dụ `giai-thich-code-dang-nhap-fe.md`.
- Nếu file đã tồn tại → hỏi người dùng muốn **ghi đè** hay **tạo bản mới** (thêm hậu tố `-v2`, `-v3`…).
- Đầu mỗi file ghi rõ: phía (BE/FE), chế độ, target, ngôn ngữ và các tài liệu đã đọc.
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

src/features/{feature}/context.md   ← Ngữ cảnh riêng của từng feature
```

## Quy tắc

- **KHÔNG BAO GIỜ Glob/quét source code**
- Tài liệu chứa toàn bộ các quyết định kiến trúc
- context.md chứa chi tiết riêng của từng feature
- Chỉ đọc source khi người dùng đưa đường dẫn file chính xác
- **Không trộn BE và FE trong cùng một bài** — mỗi bài chỉ nói về một phía
- Chỉ dùng Write để lưu bài giải thích vào `docs/explain/`, không sửa file nào khác

## Xử lý lỗi

| Lỗi                        | Hành động                            |
| -------------------------- | ------------------------------------ |
| Thiếu chế độ               | Hỏi: code, concept, flow hay why?    |
| Không rõ BE hay FE         | Hỏi: BE, FE hay cả hai?              |
| Không có context.md        | Đọc ARCHITECTURE.md thay thế         |
| Cần chi tiết source        | Hỏi người dùng đường dẫn file cụ thể |
| File giải thích đã tồn tại | Hỏi: ghi đè hay tạo bản mới?         |
