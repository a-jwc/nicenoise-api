/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Sound" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "authorId" INTEGER,
    "sound" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL,
    "coverImage" TEXT,

    CONSTRAINT "Sound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sound" ADD CONSTRAINT "Sound_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
