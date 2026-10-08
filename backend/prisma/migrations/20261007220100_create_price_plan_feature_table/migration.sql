-- CreateTable
CREATE TABLE `price_plan_feature` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `price_plan_id` INTEGER UNSIGNED NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_price_plan_feature_price_plan_id`(`price_plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- AddForeignKey
ALTER TABLE `price_plan_feature` ADD CONSTRAINT `price_plan_feature_price_plan_id_fkey` FOREIGN KEY (`price_plan_id`) REFERENCES `price_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
