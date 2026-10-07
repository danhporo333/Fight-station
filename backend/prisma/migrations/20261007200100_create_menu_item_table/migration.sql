-- CreateTable
CREATE TABLE `menu_item` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `menu_category_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(255) NULL,
    `price_vnd` INTEGER UNSIGNED NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `idx_menu_item_menu_category_id_name`(`menu_category_id`, `name`),
    PRIMARY KEY (`id`),
    -- Thêm tay (DATABASE.md): giá không âm
    CONSTRAINT `chk_menu_item_price_vnd` CHECK (`price_vnd` >= 0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- AddForeignKey
ALTER TABLE `menu_item` ADD CONSTRAINT `menu_item_menu_category_id_fkey` FOREIGN KEY (`menu_category_id`) REFERENCES `menu_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
