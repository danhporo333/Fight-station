-- AlterTable
ALTER TABLE `admin_user` ADD COLUMN `email` VARCHAR(255) NULL,
    ADD COLUMN `token_version` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `password_reset_token` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin_user_id` INTEGER UNSIGNED NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `idx_password_reset_token_hash`(`token_hash`),
    INDEX `idx_password_reset_token_admin_user_id`(`admin_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateIndex
CREATE UNIQUE INDEX `idx_admin_user_email` ON `admin_user`(`email`);

-- AddForeignKey
ALTER TABLE `password_reset_token` ADD CONSTRAINT `password_reset_token_admin_user_id_fkey` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
