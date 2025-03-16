-- AlterTable
ALTER TABLE `EmployeeDetails` MODIFY `scheduleTimeIn` VARCHAR(191) NULL,
    MODIFY `scheduleTimeOut` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ConfigSettings` (
    `id` VARCHAR(191) NOT NULL,
    `idleThreshold` INTEGER NOT NULL,
    `sleepingThreshold` INTEGER NOT NULL,
    `screenshotInterval` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
