-- AlterTable
ALTER TABLE `EventFeedback` ADD COLUMN `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `EventFeedback` ADD CONSTRAINT `EventFeedback_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
