/*
  Warnings:

  - Added the required column `uploadDate` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "uploadDate" TIMESTAMP(3) NOT NULL;
