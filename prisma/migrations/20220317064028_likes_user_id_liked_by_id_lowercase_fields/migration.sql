/*
  Warnings:

  - You are about to drop the column `userId` on the `Likes` table. All the data in the column will be lost.
  - Added the required column `likedById` to the `Likes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_userId_fkey";

-- AlterTable
ALTER TABLE "Likes" DROP COLUMN "userId",
ADD COLUMN     "likedById" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
