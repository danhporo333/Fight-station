# DATABASE.md — Fight Station

Website giới thiệu quán PS5: khách xem game, bảng giá, menu, chi nhánh (nhắn Facebook/Zalo để liên hệ). Chủ quán đăng nhập trang quản trị để thêm, sửa, xóa nội dung.

## Các feature chính
- **Cửa hàng & chi nhánh**: shop, branch
- **Game**: game_category, game, branch_game
- **Bảng giá**: price_plan, price_plan_feature
- **Menu đồ ăn, nước uống**: menu_category, menu_item
- **Khuyến mãi**: promotion
- **Quản trị (đăng nhập, thêm/sửa/xóa)**: admin_user

## 1. Tổng quan
- **Database**: MySQL 8.4, engine InnoDB, charset `utf8mb4`, collation `utf8mb4_0900_ai_ci` (tìm "ao" vẫn ra "áo", tìm "tekken" ra "Tekken")
- **ORM**: Prisma, dùng Prisma Migrate để quản lý schema

| Đối tượng | Quy tắc | Ví dụ |
|---|---|---|
| Tên bảng | Số ít, snake_case | `game`, `menu_item` |
| Tên cột | snake_case | `price_vnd`, `is_active` |
| Khóa chính | `id` | `game.id` |
| Khóa ngoại | `[tên_bảng_liên_quan]_id` | `game.game_category_id` |
| Index | `idx_[tên_bảng]_[tên_cột]`, nhiều cột nối bằng `_`, unique cũng dùng tiền tố này | `idx_game_title`, `idx_game_is_active_sort_order` |

## 2. Entity theo feature
Mọi bảng đều có 3 cột chung, **không lặp lại** ở các bảng dưới: `id` (INT UNSIGNED AUTO_INCREMENT, PK), `created_at`, `updated_at` (xem mục 4). `bool` = TINYINT(1). Cột tùy chọn để `NULL`, không dùng chuỗi rỗng. `sort_order`: số nhỏ hiện trước. `is_active`: 0 = ẩn khỏi web.

### Entity dùng chung
`shop` là thông tin quán, chỉ có đúng 1 dòng (`id = 1`). `branch` là chi nhánh, dùng ở feature Game qua `branch_game`. `admin_user` là tài khoản quản trị, dùng cho mọi thao tác thêm/sửa/xóa.

| Bảng | Cột | Kiểu | Ràng buộc |
|---|---|---|---|
| **shop** | name | VARCHAR(100) | NOT NULL |
| | tagline | VARCHAR(500) | NULL |
| | hours_label | VARCHAR(50) | NULL (vd: 24/7) |
| | hotline | VARCHAR(20) | NULL |
| | email | VARCHAR(255) | NULL |
| | facebook_url, zalo_url, tiktok_url, instagram_url, youtube_url | VARCHAR(500) | NULL |
| | **Index** | — | không cần (chỉ 1 dòng) |
| **branch** | name | VARCHAR(100) | NOT NULL |
| | address | VARCHAR(255) | NOT NULL |
| | phone | VARCHAR(20) | NULL |
| | open_hours | VARCHAR(100) | NULL (vd: 09:00 — 24:00) |
| | ps5_count, vip_room_count, pc_room_count | SMALLINT UNSIGNED | NOT NULL, DEFAULT 0 (`pc_room_count`: số phòng PC, 0 = chi nhánh không có) |
| | area_m2 | SMALLINT UNSIGNED | NULL |
| | map_url, facebook_url, zalo_url | VARCHAR(500) | NULL (trống = tự tìm theo địa chỉ / dùng link của `shop` / tạo từ `phone`) |
| | sort_order | INT | NOT NULL, DEFAULT 0 |
| | is_active | bool | NOT NULL, DEFAULT 1 |
| | **Index** | — | `idx_branch_is_active_sort_order` |
| **admin_user** | username | VARCHAR(50) | NOT NULL, UNIQUE |
| | password_hash | VARCHAR(255) | NOT NULL (argon2id hoặc bcrypt, không lưu mật khẩu thô) |
| | role | ENUM('owner','staff') | NOT NULL, DEFAULT 'staff' |
| | is_active | bool | NOT NULL, DEFAULT 1 |
| | last_login_at | DATETIME(3) | NULL |
| | **Index** | — | `idx_admin_user_username` (UNIQUE) |

### Feature Game
`game_category` là thể loại (Đối Kháng, Thể Thao...), `game` là game của quán, `game_game_category` cho biết game thuộc thể loại nào (nhiều-nhiều, 1–5 thể loại mỗi game), `branch_game` cho biết game nào có ở chi nhánh nào (nhiều-nhiều).

| Bảng | Cột | Kiểu | Ràng buộc |
|---|---|---|---|
| **game_category** | name | VARCHAR(50) | NOT NULL, UNIQUE |
| | sort_order | INT | NOT NULL, DEFAULT 0 |
| | is_active | bool | NOT NULL, DEFAULT 1 |
| | **Index** | — | `idx_game_category_name` (UNIQUE) |
| **game** | title | VARCHAR(150) | NOT NULL, UNIQUE |
| | players | VARCHAR(20) | NULL (vd: 1-2P) |
| | poster_url | VARCHAR(500) | NULL (trống = hiện tên game bằng chữ) |
| | accent_color | ENUM('orange','red','amber','gold') | NOT NULL, DEFAULT 'orange' |
| | description | TEXT | NULL |
| | sort_order | INT | NOT NULL, DEFAULT 0 |
| | is_active | bool | NOT NULL, DEFAULT 1 |
| | **Index** | — | `idx_game_title` (UNIQUE, cũng phục vụ tìm theo tiền tố), `idx_game_is_active_sort_order` |
| **game_game_category** | game_id | INT UNSIGNED | NOT NULL, FK → game.id (CASCADE) |
| | game_category_id | INT UNSIGNED | NOT NULL, FK → game_category.id (RESTRICT) |
| | **Index** | — | `idx_game_game_category_game_id_game_category_id` (UNIQUE), `idx_game_game_category_game_category_id` |
| **branch_game** | branch_id | INT UNSIGNED | NOT NULL, FK → branch.id |
| | game_id | INT UNSIGNED | NOT NULL, FK → game.id |
| | **Index** | — | `idx_branch_game_branch_id_game_id` (UNIQUE), `idx_branch_game_game_id` |

### Feature Bảng giá
`price_plan` là gói giá giờ chơi, `price_plan_feature` là quyền lợi của gói (mỗi dòng một ý).

| Bảng | Cột | Kiểu | Ràng buộc |
|---|---|---|---|
| **price_plan** | name | VARCHAR(100) | NOT NULL |
| | price_vnd | INT UNSIGNED | NOT NULL (đơn vị đồng) |
| | unit | VARCHAR(30) | NOT NULL, DEFAULT '/giờ' |
| | description | VARCHAR(255) | NULL |
| | is_hot | bool | NOT NULL, DEFAULT 0 |
| | sort_order | INT | NOT NULL, DEFAULT 0 |
| | is_active | bool | NOT NULL, DEFAULT 1 |
| | **Index** | — | `idx_price_plan_is_active_sort_order` |
| **price_plan_branch** | price_plan_id | INT UNSIGNED | NOT NULL, FK → price_plan.id (CASCADE) |
| | branch_id | INT UNSIGNED | NOT NULL, FK → branch.id (CASCADE) |
| | **Index** | — | `idx_price_plan_branch_price_plan_id_branch_id` (UNIQUE), `idx_price_plan_branch_branch_id` |
| **price_plan_feature** | price_plan_id | INT UNSIGNED | NOT NULL, FK → price_plan.id |
| | content | VARCHAR(255) | NOT NULL |
| | sort_order | INT | NOT NULL, DEFAULT 0 |
| | **Index** | — | `idx_price_plan_feature_price_plan_id` |

### Feature Menu đồ ăn, nước uống
`menu_category` là nhóm menu (Combo, Đồ Ăn, Snack, Nước, Cafe), `menu_item` là món ăn, nước uống.

| Bảng | Cột | Kiểu | Ràng buộc |
|---|---|---|---|
| **menu_category** | name | VARCHAR(50) | NOT NULL, UNIQUE |
| | sort_order | INT | NOT NULL, DEFAULT 0 |
| | is_active | bool | NOT NULL, DEFAULT 1 |
| | **Index** | — | `idx_menu_category_name` (UNIQUE) |
| **menu_item** | menu_category_id | INT UNSIGNED | NOT NULL, FK → menu_category.id |
| | name | VARCHAR(150) | NOT NULL |
| | description | VARCHAR(255) | NULL |
| | price_vnd | INT UNSIGNED | NOT NULL (đơn vị đồng) |
| | image_url | VARCHAR(500) | NULL |
| | is_available | bool | NOT NULL, DEFAULT 1 (0 = tạm hết, vẫn hiện trên web) |
| | is_best_seller | bool | NOT NULL, DEFAULT 0 (1 = món bán chạy, hiện huy hiệu "Best seller") |
| | sort_order | INT | NOT NULL, DEFAULT 0 |
| | is_active | bool | NOT NULL, DEFAULT 1 |
| | **Index** | — | `idx_menu_item_menu_category_id_name` (UNIQUE, cũng phục vụ lọc theo nhóm nên không cần index riêng cho FK) |

### Feature Khuyến mãi
| Bảng | Cột | Kiểu | Ràng buộc |
|---|---|---|---|
| **promotion** | title | VARCHAR(150) | NOT NULL |
| | tag | VARCHAR(50) | NULL (nhãn nhỏ: Giải đấu, Sinh viên...) |
| | description | TEXT | NULL |
| | note | VARCHAR(255) | NULL (dòng cuối thẻ: thời gian, địa điểm) |
| | accent_color | ENUM('orange','red','amber','gold') | NOT NULL, DEFAULT 'orange' |
| | is_featured | bool | NOT NULL, DEFAULT 0 |
| | start_date, end_date | DATE | NULL (trống = không giới hạn) |
| | sort_order | INT | NOT NULL, DEFAULT 0 |
| | is_active | bool | NOT NULL, DEFAULT 1 |
| | **Index** | — | `idx_promotion_is_active_end_date` |

## 3. Quan hệ
```mermaid
erDiagram
  game_category ||--o{ game_game_category : "gồm"
  game ||--o{ game_game_category : "thuộc"
  branch ||--o{ branch_game : "có"
  game ||--o{ branch_game : "có ở"
  price_plan ||--o{ price_plan_feature : "gồm"
  branch ||--o{ price_plan_branch : "có"
  price_plan ||--o{ price_plan_branch : "áp dụng ở"
  menu_category ||--o{ menu_item : "gồm"
  shop
  promotion
  admin_user
```
**Quy ước quan hệ**
- 1-n: khóa ngoại nằm ở bảng con, NOT NULL, luôn có index đặt tên theo quy ước.
- n-n: dùng bảng nối khai báo rõ (không dùng bảng ẩn của Prisma), có `id` riêng và UNIQUE trên cặp khóa.
- ON DELETE: bảng cha chứa dữ liệu thật (`game_category`, `menu_category`) dùng `RESTRICT`, phải chuyển hoặc xóa con trước để khỏi mất dữ liệu nhầm. Bảng con thuần phụ thuộc (`price_plan_feature`, `branch_game`, `price_plan_branch`) dùng `CASCADE`. Bảng nối `game_game_category`: phía `game` CASCADE (xóa game thì gỡ thể loại), phía `game_category` RESTRICT (không xóa được thể loại còn game). ON UPDATE giữ mặc định `CASCADE`.

**Quan hệ giữa các feature**
- Game ↔ Cửa hàng & chi nhánh: qua `branch_game`. **Game không có dòng nào trong `branch_game` = có ở mọi chi nhánh** (kể cả chi nhánh mở sau này); chỉ game giới hạn chi nhánh mới có dòng. Xóa chi nhánh mà game chỉ có ở chi nhánh đó thì game thành "mọi chi nhánh" (CASCADE xóa dòng nối).
- Bảng giá ↔ Chi nhánh: qua `price_plan_branch` (nhiều-nhiều, thêm 2026-10-08 vì bảng giá thật hiện chỉ có ở một chi nhánh và nhiều chi nhánh giá giống nhau). **Gói không có dòng nào trong `price_plan_branch` = áp dụng mọi chi nhánh** (kể cả chi nhánh mở sau này), giống `branch_game`. Chi nhánh X thấy gói có dòng của X cộng các gói áp dụng mọi chi nhánh. Xóa chi nhánh mà gói chỉ áp dụng ở chi nhánh đó thì gói thành "mọi chi nhánh" (CASCADE xóa dòng nối).
- Menu, Khuyến mãi độc lập, áp dụng toàn hệ thống. Cần giá riêng từng chi nhánh cho menu thì làm tương tự: thêm `branch_id` (NULL = áp dụng chung) vào `menu_item`.
- `admin_user` chưa có khóa ngoại nào (chưa ghi lại ai đã sửa gì).

## 4. Quy ước
| Chủ đề | Quy ước |
|---|---|
| Khóa chính | `INT UNSIGNED AUTO_INCREMENT` (Prisma: `Int @id @default(autoincrement()) @db.UnsignedInt`). Dữ liệu công khai, một database duy nhất nên không cần UUID. Ngoại lệ: `shop.id` là `INT UNSIGNED DEFAULT 1` (không AUTO_INCREMENT) vì MySQL không cho CHECK trên cột AUTO_INCREMENT |
| Soft delete | Không dùng `deleted_at`. Muốn ẩn tạm thì đặt `is_active = 0`; xóa là xóa thật sau khi chủ quán xác nhận |
| Timestamp | `created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)`; `updated_at DATETIME(3)` do Prisma `@updatedAt` cập nhật. Lưu UTC, đổi sang giờ Việt Nam ở giao diện |
| Enum / Status | Tập nhỏ, cố định (`accent_color`, `role`) dùng Prisma `enum` (MySQL ENUM), giá trị chữ thường snake_case. Bật/tắt dùng cột bool tiền tố `is_` (`is_active`, `is_available`, `is_hot`, `is_featured`), không dùng mã số |
| Tiền | `INT UNSIGNED`, đơn vị đồng (15000 = 15.000đ), không dùng FLOAT/DECIMAL |

## 5. Quy tắc migration
- **Đặt tên**: `prisma migrate dev --name <động_từ>_<đối_tượng>` snake_case, ví dụ `create_game_table`, `add_phone_to_branch`. Thư mục tự sinh dạng `YYYYMMDDHHMMSS_<tên>`.
- **Versioning**: commit `prisma/migrations` vào git, lịch sử tuyến tính, mỗi migration chỉ một thay đổi. Không sửa migration đã áp dụng (muốn đổi thì tạo migration mới). Production chỉ chạy `prisma migrate deploy`, không dùng `migrate dev` hay `db push`.
- **Rollback**: Prisma không có migration lùi tự động, nên rollback bằng migration mới đảo ngược thay đổi. Migration rủi ro thì viết sẵn `down.sql` cạnh file (chạy tay). Luôn `mysqldump` trước khi migrate production. Migration lỗi giữa chừng: sửa tay rồi `prisma migrate resolve --rolled-back <tên>`. Xóa cột/bảng làm 2 bước: ngừng dùng trong code trước, release sau mới xóa.

## Bổ sung riêng cho Prisma và MySQL 8.4
- Model viết PascalCase số ít, dùng `@@map`/`@map` để code là camelCase còn database là snake_case. Phải khai báo `map:` cho mọi index vì Prisma tự đặt tên khác quy ước.
- CHECK constraint có hiệu lực từ MySQL 8.0.16 nhưng Prisma không tạo được, nên thêm tay trong file migration: `CHECK (price_vnd >= 0)`, `shop` có `CHECK (id = 1)`.
- InnoDB tự tạo index cho khóa ngoại, nên khai báo index có tên chuẩn hoặc composite có cột đầu là FK để không bị tạo thêm index trùng.
- Kết nối: `DATABASE_URL="mysql://user:pass@host:3306/fightstation"`, đặt time zone phiên là UTC.

```prisma
model Game {                       // rút gọn
  id             Int          @id @default(autoincrement()) @db.UnsignedInt
  gameCategoryId Int          @map("game_category_id") @db.UnsignedInt
  title          String       @unique(map: "idx_game_title") @db.VarChar(150)
  accentColor    AccentColor  @default(orange) @map("accent_color")
  sortOrder      Int          @default(0) @map("sort_order")
  isActive       Boolean      @default(true) @map("is_active")
  createdAt      DateTime     @default(now()) @map("created_at") @db.DateTime(3)
  updatedAt      DateTime     @updatedAt @map("updated_at") @db.DateTime(3)
  gameCategory   GameCategory @relation(fields: [gameCategoryId], references: [id], onDelete: Restrict)
  @@index([gameCategoryId], map: "idx_game_game_category_id")
  @@index([isActive, sortOrder], map: "idx_game_is_active_sort_order")
  @@map("game")
}
enum AccentColor { orange red amber gold }
```
