-- Gói giá áp dụng được nhiều chi nhánh: thay cột price_plan.branch_id bằng bảng nối price_plan_branch
-- (gói không có dòng nào ở bảng nối = áp dụng mọi chi nhánh).

-- CreateTable
CREATE TABLE `price_plan_branch` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `price_plan_id` INTEGER UNSIGNED NOT NULL,
    `branch_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_price_plan_branch_branch_id`(`branch_id`),
    UNIQUE INDEX `idx_price_plan_branch_price_plan_id_branch_id`(`price_plan_id`, `branch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- AddForeignKey
ALTER TABLE `price_plan_branch` ADD CONSTRAINT `price_plan_branch_price_plan_id_fkey` FOREIGN KEY (`price_plan_id`) REFERENCES `price_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_plan_branch` ADD CONSTRAINT `price_plan_branch_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Giữ dữ liệu: gói đang gắn một chi nhánh (price_plan.branch_id) thành một dòng ở bảng nối
INSERT INTO `price_plan_branch` (`price_plan_id`, `branch_id`, `created_at`, `updated_at`)
SELECT `id`, `branch_id`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3) FROM `price_plan` WHERE `branch_id` IS NOT NULL;

-- DropForeignKey
ALTER TABLE `price_plan` DROP FOREIGN KEY `price_plan_branch_id_fkey`;

-- DropIndex
DROP INDEX `idx_price_plan_branch_id` ON `price_plan`;

-- AlterTable
ALTER TABLE `price_plan` DROP COLUMN `branch_id`;
