-- Business architecture refactor renamed the Prisma enum to BusinessApprovalStatus.
-- Phase 4 (20250529200000) created PostgreSQL type "RestaurantApprovalStatus".
-- Prisma Client queries "BusinessApprovalStatus"; rename the existing enum in place.
ALTER TYPE "RestaurantApprovalStatus" RENAME TO "BusinessApprovalStatus";
