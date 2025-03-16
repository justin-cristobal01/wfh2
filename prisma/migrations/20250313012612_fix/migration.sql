/*
  Warnings:

  - You are about to alter the column `date` on the `dailytimerecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `timeIn` on the `dailytimerecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `timeOut` on the `dailytimerecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `date` on the `dailytimerecordproblem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `start` on the `humanactivitylog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `end` on the `humanactivitylog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `startDate` on the `leave` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `endDate` on the `leave` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `startDate` on the `overtime` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `endDate` on the `overtime` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `dailytimerecord` MODIFY `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `timeIn` DATETIME(3) NOT NULL,
    MODIFY `timeOut` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `dailytimerecordproblem` MODIFY `date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `humanactivitylog` MODIFY `start` DATETIME(3) NOT NULL,
    MODIFY `end` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `leave` MODIFY `startDate` DATETIME(3) NOT NULL,
    MODIFY `endDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `overtime` MODIFY `startDate` DATETIME(3) NOT NULL,
    MODIFY `endDate` DATETIME(3) NOT NULL;
