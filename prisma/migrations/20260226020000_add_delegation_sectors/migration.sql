-- CreateTable: Delegation ↔ Sector many-to-many junction
CREATE TABLE `DelegationSector` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `delegationId` INT NOT NULL,
  `sectorId`     INT NOT NULL,

  UNIQUE INDEX `DelegationSector_delegationId_sectorId_key`(`delegationId`, `sectorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DelegationSector` ADD CONSTRAINT `DelegationSector_delegationId_fkey`
  FOREIGN KEY (`delegationId`) REFERENCES `Delegation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DelegationSector` ADD CONSTRAINT `DelegationSector_sectorId_fkey`
  FOREIGN KEY (`sectorId`) REFERENCES `Sector`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
