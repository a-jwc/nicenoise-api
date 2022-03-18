/*
  Warnings:

  - You are about to drop the `Likes` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `authorId` on table `Sound` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_likedById_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_soundId_fkey";

-- DropForeignKey
ALTER TABLE "Sound" DROP CONSTRAINT "Sound_authorId_fkey";

-- AlterTable
ALTER TABLE "Sound" ALTER COLUMN "published" SET DEFAULT true,
ALTER COLUMN "authorId" SET NOT NULL;

-- DropTable
DROP TABLE "Likes";

-- CreateTable
CREATE TABLE "_Likes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Likes_AB_unique" ON "_Likes"("A", "B");

-- CreateIndex
CREATE INDEX "_Likes_B_index" ON "_Likes"("B");

-- AddForeignKey
ALTER TABLE "Sound" ADD CONSTRAINT "Sound_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Likes" ADD FOREIGN KEY ("A") REFERENCES "Sound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Likes" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
