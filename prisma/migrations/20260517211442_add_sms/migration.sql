-- AlterTable
ALTER TABLE `campaigns` MODIFY `channel` ENUM('email', 'whatsapp', 'sms', 'both') NOT NULL DEFAULT 'both';

-- AlterTable
ALTER TABLE `deliveries` MODIFY `channel` ENUM('email', 'whatsapp', 'sms') NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `preferred_channel` ENUM('email', 'whatsapp', 'sms', 'both') NOT NULL DEFAULT 'both';
