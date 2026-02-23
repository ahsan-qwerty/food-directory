-- CreateTable
CREATE TABLE `CompanySector` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `sectorId` INTEGER NOT NULL,

    UNIQUE INDEX `CompanySector_companyId_sectorId_key`(`companyId`, `sectorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanySubSector` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `subSectorId` INTEGER NOT NULL,

    UNIQUE INDEX `CompanySubSector_companyId_subSectorId_key`(`companyId`, `subSectorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CompanySector` ADD CONSTRAINT `CompanySector_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanySector` ADD CONSTRAINT `CompanySector_sectorId_fkey` FOREIGN KEY (`sectorId`) REFERENCES `Sector`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanySubSector` ADD CONSTRAINT `CompanySubSector_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanySubSector` ADD CONSTRAINT `CompanySubSector_subSectorId_fkey` FOREIGN KEY (`subSectorId`) REFERENCES `SubSector`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
