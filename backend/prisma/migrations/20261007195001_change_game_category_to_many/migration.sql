-- Game có nhiều thể loại: chuyển game.game_category_id sang bảng nối game_game_category.
-- Viết tay (Prisma sinh "xóa cột trước, tạo bảng sau" sẽ làm mất thể loại của game hiện có):
-- 1) tạo bảng nối, 2) chép thể loại hiện tại của từng game sang, 3) mới xóa cột cũ.

-- 1) CreateTable
CREATE TABLE `game_game_category` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `game_id` INTEGER UNSIGNED NOT NULL,
    `game_category_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_game_game_category_game_category_id`(`game_category_id`),
    UNIQUE INDEX `idx_game_game_category_game_id_game_category_id`(`game_id`, `game_category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- 2) Chép dữ liệu: mỗi game giữ thể loại hiện tại
INSERT INTO `game_game_category` (`game_id`, `game_category_id`, `created_at`, `updated_at`)
SELECT `id`, `game_category_id`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3) FROM `game`;

-- AddForeignKey
ALTER TABLE `game_game_category` ADD CONSTRAINT `game_game_category_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `game_game_category` ADD CONSTRAINT `game_game_category_game_category_id_fkey` FOREIGN KEY (`game_category_id`) REFERENCES `game_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3) Bỏ cột cũ
ALTER TABLE `game` DROP FOREIGN KEY `game_game_category_id_fkey`;
DROP INDEX `idx_game_game_category_id` ON `game`;
ALTER TABLE `game` DROP COLUMN `game_category_id`;
