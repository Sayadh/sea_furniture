-- CreateTable
CREATE TABLE `AdminUser` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` CHAR(36) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `familyId` CHAR(36) NOT NULL,
    `adminUserId` CHAR(36) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `replacedById` CHAR(36) NULL,
    `userAgent` VARCHAR(255) NULL,
    `ip` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RefreshToken_tokenHash_key`(`tokenHash`),
    INDEX `RefreshToken_adminUserId_idx`(`adminUserId`),
    INDEX `RefreshToken_familyId_idx`(`familyId`),
    INDEX `RefreshToken_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(1000) NULL,
    `imagePath` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `categoryId` CHAR(36) NOT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `price` INTEGER NOT NULL,
    `oldPrice` INTEGER NULL,
    `dimensions` VARCHAR(200) NULL,
    `material` VARCHAR(200) NULL,
    `color` VARCHAR(200) NULL,
    `availability` ENUM('IN_STOCK', 'MADE_TO_ORDER', 'OUT_OF_STOCK') NOT NULL DEFAULT 'IN_STOCK',
    `stockQuantity` INTEGER NOT NULL DEFAULT 0,
    `productionTime` VARCHAR(191) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isNew` BOOLEAN NOT NULL DEFAULT false,
    `isOnSale` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    UNIQUE INDEX `Product_sku_key`(`sku`),
    INDEX `Product_categoryId_idx`(`categoryId`),
    INDEX `Product_isActive_deletedAt_idx`(`isActive`, `deletedAt`),
    INDEX `Product_createdAt_idx`(`createdAt`),
    INDEX `Product_price_idx`(`price`),
    INDEX `Product_isFeatured_idx`(`isFeatured`),
    INDEX `Product_isNew_idx`(`isNew`),
    INDEX `Product_viewCount_idx`(`viewCount`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` CHAR(36) NOT NULL,
    `productId` CHAR(36) NOT NULL,
    `url` VARCHAR(1000) NOT NULL,
    `path` VARCHAR(500) NULL,
    `alt` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_sortOrder_idx`(`productId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `priceFrom` INTEGER NULL,
    `duration` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_slug_key`(`slug`),
    INDEX `Service_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceImage` (
    `id` CHAR(36) NOT NULL,
    `serviceId` CHAR(36) NOT NULL,
    `url` VARCHAR(1000) NOT NULL,
    `path` VARCHAR(500) NULL,
    `alt` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ServiceImage_serviceId_sortOrder_idx`(`serviceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PortfolioItem` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `serviceId` CHAR(36) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PortfolioItem_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    INDEX `PortfolioItem_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PortfolioImage` (
    `id` CHAR(36) NOT NULL,
    `portfolioItemId` CHAR(36) NOT NULL,
    `url` VARCHAR(1000) NOT NULL,
    `path` VARCHAR(500) NULL,
    `alt` VARCHAR(255) NULL,
    `kind` ENUM('BEFORE', 'AFTER', 'GALLERY') NOT NULL DEFAULT 'GALLERY',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PortfolioImage_portfolioItemId_sortOrder_idx`(`portfolioItemId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` CHAR(36) NOT NULL,
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Faq_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` CHAR(36) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `altPhone` VARCHAR(191) NULL,
    `region` VARCHAR(191) NOT NULL,
    `address` VARCHAR(300) NOT NULL,
    `deliveryNotes` VARCHAR(1000) NULL,
    `comment` TEXT NULL,
    `status` ENUM('NEW', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    `totalAmount` INTEGER NOT NULL,
    `itemsCount` INTEGER NOT NULL,
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_createdAt_idx`(`createdAt`),
    INDEX `Order_phone_idx`(`phone`),
    INDEX `Order_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` CHAR(36) NOT NULL,
    `orderId` CHAR(36) NOT NULL,
    `productId` CHAR(36) NULL,
    `productName` VARCHAR(200) NOT NULL,
    `productSlug` VARCHAR(200) NOT NULL,
    `productSku` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(1000) NULL,
    `unitPrice` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `lineTotal` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepairRequest` (
    `id` CHAR(36) NOT NULL,
    `requestNumber` VARCHAR(191) NOT NULL,
    `source` ENUM('REPAIR', 'CONTACT', 'CONSULTATION') NOT NULL DEFAULT 'REPAIR',
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `serviceId` CHAR(36) NULL,
    `serviceTitle` VARCHAR(200) NULL,
    `address` VARCHAR(300) NULL,
    `description` TEXT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `RepairRequest_requestNumber_key`(`requestNumber`),
    INDEX `RepairRequest_status_idx`(`status`),
    INDEX `RepairRequest_source_idx`(`source`),
    INDEX `RepairRequest_createdAt_idx`(`createdAt`),
    INDEX `RepairRequest_phone_idx`(`phone`),
    INDEX `RepairRequest_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepairRequestImage` (
    `id` CHAR(36) NOT NULL,
    `repairRequestId` CHAR(36) NOT NULL,
    `url` VARCHAR(1000) NOT NULL,
    `path` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RepairRequestImage_repairRequestId_idx`(`repairRequestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` CHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL DEFAULT 'main',
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'Sea Furniture',
    `logoUrl` VARCHAR(1000) NULL,
    `logoPath` VARCHAR(500) NULL,
    `phone` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(300) NULL,
    `workingHours` VARCHAR(300) NULL,
    `instagramUrl` VARCHAR(500) NULL,
    `facebookUrl` VARCHAR(500) NULL,
    `mapEmbedUrl` TEXT NULL,
    `heroTitle` VARCHAR(200) NULL,
    `heroSubtitle` VARCHAR(500) NULL,
    `heroImageUrl` VARCHAR(1000) NULL,
    `heroImagePath` VARCHAR(500) NULL,
    `deliveryInfo` TEXT NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SiteSettings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceImage` ADD CONSTRAINT `ServiceImage_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PortfolioItem` ADD CONSTRAINT `PortfolioItem_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PortfolioImage` ADD CONSTRAINT `PortfolioImage_portfolioItemId_fkey` FOREIGN KEY (`portfolioItemId`) REFERENCES `PortfolioItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepairRequest` ADD CONSTRAINT `RepairRequest_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepairRequestImage` ADD CONSTRAINT `RepairRequestImage_repairRequestId_fkey` FOREIGN KEY (`repairRequestId`) REFERENCES `RepairRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
