/*
  Warnings:

  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Event` ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `datesText` VARCHAR(191) NULL,
    ADD COLUMN `division` VARCHAR(191) NULL,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `exhibitorCost` DECIMAL(15, 2) NULL,
    ADD COLUMN `recommendedByJustification` VARCHAR(191) NULL,
    ADD COLUMN `region` VARCHAR(191) NULL,
    ADD COLUMN `sectorProducts` VARCHAR(191) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `subsidyPercentage` DECIMAL(5, 2) NULL,
    ADD COLUMN `tdapCost` DECIMAL(15, 2) NULL,
    ADD COLUMN `totalEstimatedBudget` DECIMAL(15, 2) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
