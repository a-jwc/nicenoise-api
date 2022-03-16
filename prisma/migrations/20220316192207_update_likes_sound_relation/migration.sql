/*
  Warnings:

  - You are about to drop the `_LikesToSound` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LikesToSound" DROP CONSTRAINT "_LikesToSound_A_fkey";

-- DropForeignKey
ALTER TABLE "_LikesToSound" DROP CONSTRAINT "_LikesToSound_B_fkey";

-- DropTable
DROP TABLE "_LikesToSound";

-- RenameForeignKey
ALTER TABLE "Likes" RENAME CONSTRAINT "Likes_id_fkey" TO "userId";

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_id_fkey" FOREIGN KEY ("id") REFERENCES "Sound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
