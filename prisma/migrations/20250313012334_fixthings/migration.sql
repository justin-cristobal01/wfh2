-- AlterTable
ALTER TABLE `dailytimerecord` MODIFY `date` VARCHAR(191) NOT NULL,
    MODIFY `timeIn` VARCHAR(191) NOT NULL,
    MODIFY `timeOut` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `dailytimerecordproblem` MODIFY `date` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `employeedetails` ADD COLUMN `activityStatus` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `humanactivitylog` MODIFY `start` VARCHAR(191) NOT NULL,
    MODIFY `end` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `leave` MODIFY `startDate` VARCHAR(191) NOT NULL,
    MODIFY `endDate` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `overtime` MODIFY `startDate` VARCHAR(191) NOT NULL,
    MODIFY `endDate` VARCHAR(191) NOT NULL;
