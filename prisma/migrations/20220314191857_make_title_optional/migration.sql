/*
  Warnings:

  - Made the column `sound` on table `Sound` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Sound" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "sound" SET NOT NULL;
