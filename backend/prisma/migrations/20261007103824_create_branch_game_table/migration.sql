-- CreateTable
CREATE TABLE `branch_game` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `branch_id` INTEGER UNSIGNED NOT NULL,
    `game_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_branch_game_game_id`(`game_id`),
    UNIQUE INDEX `idx_branch_game_branch_id_game_id`(`branch_id`, `game_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- AddForeignKey
ALTER TABLE `branch_game` ADD CONSTRAINT `branch_game_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_game` ADD CONSTRAINT `branch_game_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
