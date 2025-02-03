/*
  Warnings:

  - You are about to drop the column `faculty` on the `Runner` table. All the data in the column will be lost.
  - Added the required column `facultyId` to the `Runner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Runner" DROP COLUMN "faculty",
ADD COLUMN     "facultyId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Faculty" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);
