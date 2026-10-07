-- CreateTable
CREATE TABLE `game` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `game_category_id` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `players` VARCHAR(20) NULL,
    `poster_url` VARCHAR(500) NULL,
    `accent_color` ENUM('orange', 'red', 'amber', 'gold') NOT NULL DEFAULT 'orange',
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `idx_game_title`(`title`),
    INDEX `idx_game_game_category_id`(`game_category_id`),
    INDEX `idx_game_is_active_sort_order`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- AddForeignKey
ALTER TABLE `game` ADD CONSTRAINT `game_game_category_id_fkey` FOREIGN KEY (`game_category_id`) REFERENCES `game_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
