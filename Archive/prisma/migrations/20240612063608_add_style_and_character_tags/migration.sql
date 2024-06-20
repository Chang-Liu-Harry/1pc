/*
  Warnings:

  - Added the required column `characterTag` to the `Mind` table without a default value. This is not possible if the table is not empty.
  - Added the required column `styleTag` to the `Mind` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mind" ADD COLUMN     "characterTag" TEXT NOT NULL,
ADD COLUMN     "styleTag" TEXT NOT NULL;
