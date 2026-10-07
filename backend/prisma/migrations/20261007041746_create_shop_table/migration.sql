-- CreateTable
CREATE TABLE `shop` (
    `id` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `name` VARCHAR(100) NOT NULL,
    `tagline` VARCHAR(500) NULL,
    `hours_label` VARCHAR(50) NULL,
    `hotline` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `facebook_url` VARCHAR(500) NULL,
    `zalo_url` VARCHAR(500) NULL,
    `tiktok_url` VARCHAR(500) NULL,
    `instagram_url` VARCHAR(500) NULL,
    `youtube_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    -- Thêm tay: quán chỉ có đúng 1 dòng (DATABASE.md)
    CONSTRAINT `chk_shop_single_row` CHECK (`id` = 1)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
