CREATE TABLE `aiPromptLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`userId` int NOT NULL,
	`promptType` varchar(50) NOT NULL,
	`input` longtext NOT NULL,
	`output` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiPromptLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`abn` varchar(11),
	`acn` varchar(9),
	`phone` varchar(20),
	`email` varchar(320),
	`website` varchar(255),
	`address` text,
	`suburb` varchar(100),
	`state` varchar(3),
	`postcode` varchar(4),
	`tradeType` varchar(100),
	`logo` text,
	`bankAccountName` varchar(255),
	`bankAccountNumber` varchar(20),
	`bankBsb` varchar(6),
	`taxFileNumber` varchar(11),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`suburb` varchar(100),
	`state` varchar(3),
	`postcode` varchar(4),
	`notes` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceLineItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceLineItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`customerId` int NOT NULL,
	`jobId` int,
	`quoteId` int,
	`invoiceNumber` varchar(50) NOT NULL,
	`status` enum('draft','sent','viewed','partially_paid','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`totalAmount` decimal(10,2) NOT NULL,
	`taxAmount` decimal(10,2) DEFAULT '0',
	`paidAmount` decimal(10,2) DEFAULT '0',
	`notes` longtext,
	`dueDate` timestamp,
	`sentDate` timestamp,
	`paidDate` timestamp,
	`publicToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`),
	CONSTRAINT `invoices_publicToken_unique` UNIQUE(`publicToken`)
);
--> statement-breakpoint
CREATE TABLE `jobPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`url` text NOT NULL,
	`caption` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`customerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`scheduledDate` timestamp,
	`completedDate` timestamp,
	`location` text,
	`notes` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quoteLineItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quoteLineItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`customerId` int NOT NULL,
	`jobId` int,
	`quoteNumber` varchar(50) NOT NULL,
	`status` enum('draft','sent','viewed','signed','rejected','expired') NOT NULL DEFAULT 'draft',
	`totalAmount` decimal(10,2) NOT NULL,
	`taxAmount` decimal(10,2) DEFAULT '0',
	`notes` longtext,
	`terms` longtext,
	`validUntil` timestamp,
	`signedDate` timestamp,
	`signedByName` varchar(255),
	`signatureUrl` text,
	`publicToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotes_quoteNumber_unique` UNIQUE(`quoteNumber`),
	CONSTRAINT `quotes_publicToken_unique` UNIQUE(`publicToken`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`plan` enum('free','starter','professional','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`monthlyJobs` int DEFAULT 0,
	`monthlyQuotes` int DEFAULT 0,
	`monthlyInvoices` int DEFAULT 0,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`renewalDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
