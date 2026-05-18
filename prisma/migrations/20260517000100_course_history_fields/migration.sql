ALTER TABLE `history` MODIFY `image_url` TEXT NULL;
ALTER TABLE `history` ADD COLUMN `course_key` VARCHAR(50) NOT NULL DEFAULT 'shanhaijing';
ALTER TABLE `history` ADD COLUMN `action_key` VARCHAR(50) NOT NULL DEFAULT 'generate';
ALTER TABLE `history` ADD COLUMN `params_json` TEXT NULL;
ALTER TABLE `history` ADD COLUMN `output_images` TEXT NULL;
