/*
  Warnings:

  - Added the required column `soundId` to the `Likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Likes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "userId";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_id_fkey";

-- AlterTable
ALTER TABLE "Likes" ADD COLUMN     "soundId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "Sound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
