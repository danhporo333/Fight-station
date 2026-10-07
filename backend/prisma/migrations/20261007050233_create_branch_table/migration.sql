-- CreateTable
CREATE TABLE `branch` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `open_hours` VARCHAR(100) NULL,
    `ps5_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `vip_room_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `area_m2` SMALLINT UNSIGNED NULL,
    `map_url` VARCHAR(500) NULL,
    `facebook_url` VARCHAR(500) NULL,
    `zalo_url` VARCHAR(500) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_branch_is_active_sort_order`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
