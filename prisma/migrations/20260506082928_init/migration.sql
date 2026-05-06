-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `display_name` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `class_name` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `origin` VARCHAR(100) NOT NULL,
    `mood` VARCHAR(50) NOT NULL,
    `patterns` VARCHAR(500) NOT NULL DEFAULT '[]',
    `notes` TEXT NOT NULL,
    `prompt` TEXT NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `ai_available` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `history_user_id_idx`(`user_id`),
    INDEX `history_user_id_created_at_idx`(`user_id`, `created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `history` ADD CONSTRAINT `history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
