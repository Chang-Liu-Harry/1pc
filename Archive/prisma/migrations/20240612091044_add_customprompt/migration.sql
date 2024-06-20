/*
  Warnings:

  - Added the required column `customPrompt` to the `Mind` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mind" ADD COLUMN     "customPrompt" TEXT NOT NULL;
