-- AlterTable: add type column to Seminar
ALTER TABLE `Seminar` ADD COLUMN `type` ENUM('SEMINAR', 'WEBINAR', 'VIRTUAL_B2B') NOT NULL DEFAULT 'SEMINAR';
