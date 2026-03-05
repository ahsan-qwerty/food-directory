-- CreateTable
CREATE TABLE `EventCompanyEmailStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `lastEmailAddress` VARCHAR(191) NULL,
    `lastEmailSource` VARCHAR(191) NULL,
    `lastSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EventCompanyEmailStatus_eventId_companyId_key`(`eventId`, `companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EventCompanyEmailStatus` ADD CONSTRAINT `EventCompanyEmailStatus_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventCompanyEmailStatus` ADD CONSTRAINT `EventCompanyEmailStatus_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

