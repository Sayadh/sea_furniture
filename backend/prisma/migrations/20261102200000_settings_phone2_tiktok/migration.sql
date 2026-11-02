-- AlterTable
ALTER TABLE `SiteSettings` ADD COLUMN `phone2` VARCHAR(191) NULL,
    ADD COLUMN `tiktokUrl` VARCHAR(500) NULL;

-- Data: real contacts instead of the seed placeholders.
-- Each update only touches a value that is still empty or still the seed placeholder,
-- so anything already edited in Admin → Settings is never overwritten.
UPDATE `SiteSettings` SET `phone` = '+37494844474'
  WHERE `key` = 'main' AND (`phone` IS NULL OR `phone` = '+37400000000');
UPDATE `SiteSettings` SET `whatsapp` = '+37494844474'
  WHERE `key` = 'main' AND (`whatsapp` IS NULL OR `whatsapp` = '+37400000000');
UPDATE `SiteSettings` SET `phone2` = '+37498203424'
  WHERE `key` = 'main' AND `phone2` IS NULL;
UPDATE `SiteSettings` SET `instagramUrl` = 'https://www.instagram.com/sea__furniture'
  WHERE `key` = 'main' AND (`instagramUrl` IS NULL OR `instagramUrl` IN ('https://www.instagram.com/', 'https://instagram.com/'));
UPDATE `SiteSettings` SET `tiktokUrl` = 'https://www.tiktok.com/@s.e.a.f.u.r.n.i.t'
  WHERE `key` = 'main' AND `tiktokUrl` IS NULL;
-- Placeholders that should not be shown on the site
UPDATE `SiteSettings` SET `facebookUrl` = NULL
  WHERE `key` = 'main' AND `facebookUrl` IN ('https://www.facebook.com/', 'https://facebook.com/');
UPDATE `SiteSettings` SET `email` = NULL
  WHERE `key` = 'main' AND `email` = 'info@example.com';
