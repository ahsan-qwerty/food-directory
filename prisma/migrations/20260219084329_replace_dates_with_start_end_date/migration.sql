/*
  Warnings:

  - You are about to drop the column `dates` on the `Delegation` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Delegation` DROP COLUMN `dates`,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL;

-- DropTable
DROP TABLE `User`;
