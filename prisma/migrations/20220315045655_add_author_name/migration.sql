/*
  Warnings:

  - Added the required column `authorName` to the `Sound` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sound" ADD COLUMN     "authorName" TEXT NOT NULL;
