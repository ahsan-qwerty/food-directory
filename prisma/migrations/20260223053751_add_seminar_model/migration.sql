-- CreateTable
CREATE TABLE `Seminar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productSector` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `cityVenue` VARCHAR(191) NULL,
    `tentativeDate` VARCHAR(191) NULL,
    `proposedBudget` DECIMAL(15, 2) NULL,
    `division` VARCHAR(191) NULL,
    `regionalCollaboration` VARCHAR(191) NULL,
    `rationaleObjective` TEXT NULL,
    `status` ENUM('PLANNED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `deskOfficer` VARCHAR(191) NULL,
    `finalRemarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
