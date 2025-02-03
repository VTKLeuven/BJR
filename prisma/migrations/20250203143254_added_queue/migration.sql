-- CreateTable
CREATE TABLE "Queue" (
    "queuePlace" SERIAL NOT NULL,
    "runnerId" INTEGER NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("queuePlace")
);
