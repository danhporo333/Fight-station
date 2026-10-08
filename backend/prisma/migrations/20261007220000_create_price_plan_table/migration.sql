-- CreateTable
CREATE TABLE `price_plan` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `price_vnd` INTEGER UNSIGNED NOT NULL,
    `unit` VARCHAR(30) NOT NULL DEFAULT '/giờ',
    `description` VARCHAR(255) NULL,
    `is_hot` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_price_plan_is_active_sort_order`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`),
    -- Thêm tay (DATABASE.md): giá không âm
    CONSTRAINT `chk_price_plan_price_vnd` CHECK (`price_vnd` >= 0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
