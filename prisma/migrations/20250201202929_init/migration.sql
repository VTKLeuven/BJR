-- CreateTable
CREATE TABLE "Runner" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "identification" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "registrationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupNumber" INTEGER NOT NULL,
    "testTime" DOUBLE PRECISION,
    "firstYear" BOOLEAN NOT NULL,

    CONSTRAINT "Runner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "groupNumber" INTEGER NOT NULL,
    "groupName" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("groupNumber")
);

-- CreateTable
CREATE TABLE "Lap" (
    "id" SERIAL NOT NULL,
    "runnerId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "time" DOUBLE PRECISION NOT NULL,
    "raining" BOOLEAN NOT NULL,

    CONSTRAINT "Lap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "raining" BOOLEAN NOT NULL,

    CONSTRAINT "GlobalState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Runner_identification_key" ON "Runner"("identification");

-- AddForeignKey
ALTER TABLE "Runner" ADD CONSTRAINT "Runner_groupNumber_fkey" FOREIGN KEY ("groupNumber") REFERENCES "Group"("groupNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lap" ADD CONSTRAINT "Lap_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
