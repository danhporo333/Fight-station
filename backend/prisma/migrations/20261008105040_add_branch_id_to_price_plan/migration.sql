-- AlterTable
ALTER TABLE `price_plan` ADD COLUMN `branch_id` INTEGER UNSIGNED NULL;

-- CreateIndex
CREATE INDEX `idx_price_plan_branch_id` ON `price_plan`(`branch_id`);

-- AddForeignKey
ALTER TABLE `price_plan` ADD CONSTRAINT `price_plan_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
