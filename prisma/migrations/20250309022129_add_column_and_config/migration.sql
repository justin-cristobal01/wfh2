/*
  Warnings:

  - Added the required column `scheduleTimeIn` to the `EmployeeDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleTimeOut` to the `EmployeeDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EmployeeDetails` ADD COLUMN `picture` LONGBLOB NULL,
    ADD COLUMN `scheduleTimeIn` VARCHAR(191) NOT NULL,
    ADD COLUMN `scheduleTimeOut` VARCHAR(191) NOT NULL;
