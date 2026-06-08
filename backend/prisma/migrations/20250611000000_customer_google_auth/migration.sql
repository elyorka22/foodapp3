-- Google Sign-In: add enum values only.
-- PostgreSQL forbids using a new enum value in the same transaction it was added.
-- Data migration and columns run in 20250611000001_customer_google_auth_schema.

ALTER TYPE "CustomerAuthProvider" ADD VALUE IF NOT EXISTS 'LOCAL';
ALTER TYPE "CustomerAuthProvider" ADD VALUE IF NOT EXISTS 'GOOGLE';
