-- AlterTable
ALTER TABLE `company` ADD COLUMN `sectorId` INTEGER NULL,
    ADD COLUMN `subSectorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_sectorId_fkey` FOREIGN KEY (`sectorId`) REFERENCES `Sector`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_subSectorId_fkey` FOREIGN KEY (`subSectorId`) REFERENCES `SubSector`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
