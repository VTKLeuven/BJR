/*
  Warnings:

  - You are about to drop the column `facultyId` on the `Runner` table. All the data in the column will be lost.
  - You are about to drop the `Faculty` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Runner" DROP COLUMN "facultyId",
ADD COLUMN     "kringId" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Faculty";

-- CreateTable
CREATE TABLE "Kring" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Kring_pkey" PRIMARY KEY ("id")
);
