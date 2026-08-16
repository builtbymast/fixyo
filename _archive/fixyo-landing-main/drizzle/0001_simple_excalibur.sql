CREATE TABLE `aiPromptLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`promptType` varchar(100) NOT NULL,
	`inputText` text,
	`outputText` text,
	`tokensUsed` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiPromptLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`abn` varchar(20),
	`phone` varchar(30),
	`email` varchar(320),
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`postcode` varchar(10),
	`logoUrl` text,
	`tradeType` varchar(100),
	`licenceNumber` varchar(100),
	`website` varchar(255),
	`taxRate` decimal(5,2) DEFAULT '10.00',
	`invoicePrefix` varchar(20) DEFAULT 'INV',
	`quotePrefix` varchar(20) DEFAULT 'QT',
	`paymentTerms` int DEFAULT 14,
	`bankName` varchar(100),
	`bsb` varchar(10),
	`accountNumber` varchar(20),
	`accountName` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(30),
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`postcode` varchar(10),
	`company` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int,
	`customerId` int,
	`quoteId` int,
	`invoiceNumber` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`status` enum('draft','sent','viewed','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`subtotal` decimal(10,2) DEFAULT '0',
	`taxAmount` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2) DEFAULT '0',
	`taxRate` decimal(5,2) DEFAULT '10.00',
	`amountPaid` decimal(10,2) DEFAULT '0',
	`notes` text,
	`terms` text,
	`dueDate` timestamp,
	`sentAt` timestamp,
	`viewedAt` timestamp,
	`paidAt` timestamp,
	`paymentMethod` varchar(100),
	`publicToken` varchar(64),
	`stripePaymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`userId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` text NOT NULL,
	`caption` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customerId` int,
	`jobNumber` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','active','completed','invoiced','cancelled') NOT NULL DEFAULT 'active',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`tradeType` varchar(100),
	`siteAddress` text,
	`scheduledDate` timestamp,
	`completedDate` timestamp,
	`estimatedHours` decimal(6,2),
	`actualHours` decimal(6,2),
	`notes` text,
	`internalNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lineItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int,
	`invoiceId` int,
	`description` text NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '1',
	`unitPrice` decimal(10,2) NOT NULL,
	`unit` varchar(50) DEFAULT 'ea',
	`taxable` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lineItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int,
	`customerId` int,
	`quoteNumber` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`status` enum('draft','sent','viewed','accepted','declined','expired') NOT NULL DEFAULT 'draft',
	`subtotal` decimal(10,2) DEFAULT '0',
	`taxAmount` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2) DEFAULT '0',
	`taxRate` decimal(5,2) DEFAULT '10.00',
	`notes` text,
	`terms` text,
	`validUntil` timestamp,
	`sentAt` timestamp,
	`viewedAt` timestamp,
	`acceptedAt` timestamp,
	`declinedAt` timestamp,
	`signatureUrl` text,
	`signedAt` timestamp,
	`signedByName` varchar(255),
	`publicToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('active','cancelled','past_due','trialing') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`trialEndsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
