/*
  Warnings:

  - You are about to drop the column `idleThreshold` on the `ConfigSettings` table. All the data in the column will be lost.
  - You are about to drop the column `screenshotInterval` on the `ConfigSettings` table. All the data in the column will be lost.
  - You are about to drop the column `sleepingThreshold` on the `ConfigSettings` table. All the data in the column will be lost.
  - Added the required column `name` to the `ConfigSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threshold` to the `ConfigSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ConfigSettings` DROP COLUMN `idleThreshold`,
    DROP COLUMN `screenshotInterval`,
    DROP COLUMN `sleepingThreshold`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `threshold` INTEGER NOT NULL;
