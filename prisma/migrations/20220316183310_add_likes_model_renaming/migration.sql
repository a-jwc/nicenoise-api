/*
  Warnings:

  - You are about to drop the column `likes` on the `Sound` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sound" DROP COLUMN "likes";

-- CreateTable
CREATE TABLE "Likes" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LikesToSound" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LikesToSound_AB_unique" ON "_LikesToSound"("A", "B");

-- CreateIndex
CREATE INDEX "_LikesToSound_B_index" ON "_LikesToSound"("B");

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikesToSound" ADD FOREIGN KEY ("A") REFERENCES "Likes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikesToSound" ADD FOREIGN KEY ("B") REFERENCES "Sound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
