-- CreateTable
CREATE TABLE `nguoi_dung` (
    `nguoi_dung_id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `mat_khau` VARCHAR(255) NOT NULL,
    `ho_ten` VARCHAR(255) NOT NULL,
    `tuoi` INTEGER NULL,
    `anh_dai_dien` VARCHAR(500) NULL,
    `anh_dai_dien_public_id` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nguoi_dung_email_key`(`email`),
    PRIMARY KEY (`nguoi_dung_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hinh_anh` (
    `hinh_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_hinh` VARCHAR(255) NOT NULL,
    `duong_dan` VARCHAR(500) NOT NULL,
    `public_id` VARCHAR(255) NOT NULL,
    `mo_ta` VARCHAR(1000) NULL,
    `chieu_rong` INTEGER NULL,
    `chieu_cao` INTEGER NULL,
    `nguoi_dung_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`hinh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `binh_luan` (
    `binh_luan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nguoi_dung_id` INTEGER NOT NULL,
    `hinh_id` INTEGER NOT NULL,
    `noi_dung` VARCHAR(1000) NOT NULL,
    `ngay_binh_luan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`binh_luan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `luu_anh` (
    `nguoi_dung_id` INTEGER NOT NULL,
    `hinh_id` INTEGER NOT NULL,
    `ngay_luu` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`nguoi_dung_id`, `hinh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hinh_anh` ADD CONSTRAINT `hinh_anh_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `binh_luan` ADD CONSTRAINT `binh_luan_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `binh_luan` ADD CONSTRAINT `binh_luan_hinh_id_fkey` FOREIGN KEY (`hinh_id`) REFERENCES `hinh_anh`(`hinh_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `luu_anh` ADD CONSTRAINT `luu_anh_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `luu_anh` ADD CONSTRAINT `luu_anh_hinh_id_fkey` FOREIGN KEY (`hinh_id`) REFERENCES `hinh_anh`(`hinh_id`) ON DELETE CASCADE ON UPDATE CASCADE;
