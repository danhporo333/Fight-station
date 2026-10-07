# Vietnamese Templates — Fight Station

Dự án: website quán PS5. Backend Express 5 + Prisma + MySQL, frontend React + Vite + TanStack Query. Khi giải thích, ưu tiên ví dụ lấy từ chính dự án (game, menu, bảng giá, chi nhánh) thay vì ví dụ chung chung.

## Giải thích Code

````markdown
## 📁 File: {filename}

### Mục đích
[1-2 câu mô tả file này làm gì]

### Vị trí trong dự án
- Feature: {auth|shop|branch|game|price-plan|menu|promotion|shared|core}
- Tầng: {routes|controller|service|repository|dto|entity} hoặc {component|hook|service|store|schema}

### Phân tích

**Imports**
- Import X từ Y để [mục đích]

**Class/function chính** (backend) hoặc **Component/hook chính** (frontend)
- [Giải thích logic]
- [Dùng ví dụ đời thường nếu cần]

**Các methods** (backend) hoặc **Props và state** (frontend)
- `methodX()`: [làm gì, khi nào được gọi]
- `propX`: [kiểu gì, để làm gì]

### 📏 Quy tắc dự án liên quan
- [Ví dụ: chỉ repository được dùng Prisma; component không gọi API trực tiếp]

### 💡 Điểm cần nhớ
- Điểm 1
- Điểm 2

### 🔗 Liên kết
- Được gọi bởi: ...
- Gọi tới: ...
- Tài liệu: [PROJECT-RULES.md / ARCHITECTURE.md / API_SPEC.md / DATABASE.md, phần nào]
````

---

## Giải thích Concept

````markdown
## 🎯 {Tên Concept}

### Là gì?
[Giải thích đơn giản, 2-3 câu]

### Ví dụ đời thường
[So sánh với thứ quen thuộc]

Ví dụ: Repository Pattern giống như **thủ thư** trong thư viện:
- Bạn không tự vào kho tìm sách
- Bạn nhờ thủ thư (Repository) tìm giúp
- Thủ thư biết sách ở đâu, cách tìm nhanh nhất

### Trong code

```typescript
// Ví dụ code ngắn
```

### Trong dự án này
[File nào dùng nó, ví dụ: `game.repository.ts` là nơi duy nhất gọi Prisma cho feature game]

### Tại sao cần?
- Lý do 1
- Lý do 2

### Không dùng thì sao?
[Vấn đề sẽ gặp]

### 📚 Tìm hiểu thêm
- Từ khóa để search
````

---

## Giải thích Flow

Chọn sơ đồ backend hoặc frontend tùy action.

### Backend

````markdown
## 🔄 Flow: {Tên Action, ví dụ: Thêm game mới}

### Tổng quan
[1-2 câu mô tả flow này]

### Sơ đồ

```
[Client] POST /api/v1/games
    │
    ▼
[Middleware] ──── requestId → log → requireAdmin (kiểm tra JWT) → validate (Zod)
    │
    ▼
[Controller] ──── Lấy dữ liệu đã hợp lệ, gọi Service
    │
    ▼
[Service] ──────── Logic nghiệp vụ (trùng tên? thể loại có tồn tại?)
    │
    ▼
[Repository] ───── Truy vấn Prisma (nơi DUY NHẤT dùng Prisma)
    │
    ▼
[MySQL]
    │
    ▼
[Response] ◄────── created(res, data) → 201 { success, data }

Nếu có lỗi ở bất kỳ bước nào: throw AppError → error-handler
  → { success: false, error: { code, message } }
```

### Chi tiết từng bước

**Bước 1: Client gửi request**
- Endpoint: `POST /api/v1/games`, header `Authorization: Bearer ...`
- Body: { title, gameCategoryId, ... }

**Bước 2: Middleware**
- Chưa đăng nhập → `AUTH_002`; sai dữ liệu → `COMMON_001`

**Bước 3: Controller**
- Gọi `service.create(dto)`, không có logic

**Bước 4: Service**
- Trùng tên → `ConflictError` (`GAME_002`)
- Gọi Repository

**Bước 5: Repository**
- Prisma `create`, chỉ `select` các cột cần

**Bước 6: Response**
- `created(res, data)` → 201

### 🔍 Mẹo debug
- Lỗi 401 → xem bước 2 (token, `requireAdmin`)
- Lỗi 400 `COMMON_001` → xem `details` để biết trường nào sai
- Lỗi 409 → dữ liệu trùng, xem mã lỗi trong `API_SPEC.md`
- Lỗi 500 → xem log Pino bằng `requestId` (header `X-Request-Id`)
````

### Frontend

````markdown
## 🔄 Flow: {Tên Action, ví dụ: Xóa game}

### Tổng quan
[1-2 câu mô tả flow này]

### Sơ đồ

```
[Người dùng] bấm "Xóa game"
    │
    ▼
[Component] ──── Gọi mutate(id)
    │
    ▼
[Hook] ───────── useDeleteGame (TanStack Query mutation)
    │
    ▼
[Service] ────── deleteGame(id) → http.delete('/games/:id')
    │
    ▼
[API] ────────── 204 (hoặc ApiError có code)
    │
    ▼
[Hook] ───────── invalidateQueries(['games']) → tải lại danh sách
    │
    ▼
[UI] ◄────────── danh sách cập nhật, toast thông báo
```

### Chi tiết từng bước
[Mỗi bước: file nào, hàm nào, dữ liệu vào/ra]

### 🔍 Mẹo debug
- Danh sách không tự cập nhật → kiểm tra `invalidateQueries` có đúng key chưa
- Báo lỗi sai → kiểm tra `ERROR_MESSAGES[code]` và `code` trả về từ API
- Bị đưa về trang đăng nhập → token hết hạn (`AUTH_002/003`)
````

---

## Giải thích Why

````markdown
## ❓ Tại sao: {Câu hỏi}

### Trả lời ngắn
[1-2 câu, trả lời trực tiếp]

### Giải thích chi tiết

**Lý do 1: ...**
[Giải thích]

**Lý do 2: ...**
[Giải thích]

### Trong dự án này
[Quyết định này thể hiện ở đâu, ví dụ: xóa `game_category` dùng `RESTRICT` để khỏi mất game nhầm]

### Không làm vậy thì sao?
[Vấn đề sẽ gặp]

### Đánh đổi
| Ưu điểm | Nhược điểm |
|---------|------------|
| ... | ... |

### Có cách khác không?
[Các lựa chọn khác và khi nào dùng]

### 📌 Kết luận
[Tóm tắt khuyến nghị]
````

---

## Giải thích Lỗi

````markdown
## 🐞 Lỗi: {thông báo hoặc mã lỗi}

### Nghĩa là gì?
[1-2 câu, từ đơn giản]

### Vì sao xảy ra?
- Nguyên nhân thường gặp 1
- Nguyên nhân thường gặp 2

### Cách sửa
1. Bước 1 (lệnh hoặc file cần xem)
2. Bước 2

### Cách tránh lần sau
- ...

### Mã lỗi liên quan (nếu có)
- `GAME_002` (409): [ý nghĩa, xem `API_SPEC.md`]
````
