/*
  Warnings:

  - The primary key for the `Queue` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Queue" DROP CONSTRAINT "Queue_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "queuePlace" DROP DEFAULT,
ADD CONSTRAINT "Queue_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Queue_queuePlace_seq";
