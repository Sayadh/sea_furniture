-- AlterTable
ALTER TABLE `Product` ADD COLUMN `heroSlideAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Product_heroSlideAt_idx` ON `Product`(`heroSlideAt`);
