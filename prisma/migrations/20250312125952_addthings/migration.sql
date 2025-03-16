-- AlterTable
ALTER TABLE `dailytimerecordproblem` MODIFY `status` ENUM('PENDING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `employeedetails` ADD COLUMN `activityStatus` VARCHAR(191) NULL;
