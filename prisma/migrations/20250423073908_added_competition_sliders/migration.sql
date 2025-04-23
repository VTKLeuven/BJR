/*
  Warnings:

  - You are about to drop the column `raining` on the `GlobalState` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GlobalState" DROP COLUMN "raining",
ADD COLUMN     "competition" INTEGER NOT NULL DEFAULT 0;
