-- CreateTable
CREATE TABLE `Delegation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('INCOMING', 'OUTGOING') NOT NULL,
    `status` ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    `division` VARCHAR(191) NULL,
    `productSector` VARCHAR(191) NULL,
    `expectedDelegates` VARCHAR(191) NULL,
    `rationale` VARCHAR(191) NULL,
    `fromCountry` VARCHAR(191) NULL,
    `toCountry` VARCHAR(191) NULL,
    `dates` VARCHAR(191) NULL,
    `allocatedBudget` DECIMAL(15, 2) NULL,
    `utilizedBudget` DECIMAL(15, 2) NULL,
    `closedAt` DATETIME(3) NULL,
    `closingRemarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DelegationCompany` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `delegationId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DelegationCompany_delegationId_companyId_key`(`delegationId`, `companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DelegationCompany` ADD CONSTRAINT `DelegationCompany_delegationId_fkey` FOREIGN KEY (`delegationId`) REFERENCES `Delegation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DelegationCompany` ADD CONSTRAINT `DelegationCompany_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
