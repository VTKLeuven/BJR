/*
  Warnings:

  - You are about to drop the column `competition` on the `Runner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lap" ADD COLUMN     "competition" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Runner" DROP COLUMN "competition";
