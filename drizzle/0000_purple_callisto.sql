CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('draft', 'sent', 'viewed', 'signed', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'starter', 'professional', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "aiPromptLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"userId" integer NOT NULL,
	"promptType" varchar(50) NOT NULL,
	"input" text NOT NULL,
	"output" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"businessName" varchar(255) NOT NULL,
	"abn" varchar(11),
	"acn" varchar(9),
	"phone" varchar(20),
	"email" varchar(320),
	"website" varchar(255),
	"address" text,
	"suburb" varchar(100),
	"state" varchar(3),
	"postcode" varchar(4),
	"tradeType" varchar(100),
	"logo" text,
	"bankAccountName" varchar(255),
	"bankAccountNumber" varchar(20),
	"bankBsb" varchar(6),
	"taxFileNumber" varchar(11),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"email" varchar(320),
	"phone" varchar(20),
	"address" text,
	"suburb" varchar(100),
	"state" varchar(3),
	"postcode" varchar(4),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoiceLineItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoiceId" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"jobId" integer,
	"quoteId" integer,
	"invoiceNumber" varchar(50) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"taxAmount" numeric(10, 2) DEFAULT '0',
	"paidAmount" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"dueDate" timestamp,
	"sentDate" timestamp,
	"paidDate" timestamp,
	"publicToken" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber"),
	CONSTRAINT "invoices_publicToken_unique" UNIQUE("publicToken")
);
--> statement-breakpoint
CREATE TABLE "jobPhotos" (
	"id" serial PRIMARY KEY NOT NULL,
	"jobId" integer NOT NULL,
	"url" text NOT NULL,
	"caption" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "job_status" DEFAULT 'scheduled' NOT NULL,
	"scheduledDate" timestamp,
	"completedDate" timestamp,
	"location" text,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quoteLineItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"quoteId" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"jobId" integer,
	"quoteNumber" varchar(50) NOT NULL,
	"status" "quote_status" DEFAULT 'draft' NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"taxAmount" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"terms" text,
	"validUntil" timestamp,
	"signedDate" timestamp,
	"signedByName" varchar(255),
	"signatureUrl" text,
	"publicToken" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_quoteNumber_unique" UNIQUE("quoteNumber"),
	CONSTRAINT "quotes_publicToken_unique" UNIQUE("publicToken")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"monthlyJobs" integer DEFAULT 0,
	"monthlyQuotes" integer DEFAULT 0,
	"monthlyInvoices" integer DEFAULT 0,
	"startDate" timestamp DEFAULT now() NOT NULL,
	"renewalDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"profilePicture" text,
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
