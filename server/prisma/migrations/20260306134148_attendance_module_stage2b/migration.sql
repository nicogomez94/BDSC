-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENTE', 'AUSENTE', 'JUSTIFICADA', 'TARDE');

-- CreateTable
CREATE TABLE "divisions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "divisionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" SERIAL NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "trainingSessionId" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "observation" TEXT,
    "createdByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_division_access" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_division_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisions_name_seasonYear_key" ON "divisions"("name", "seasonYear");

-- CreateIndex
CREATE INDEX "players_divisionId_idx" ON "players"("divisionId");

-- CreateIndex
CREATE INDEX "training_sessions_divisionId_month_idx" ON "training_sessions"("divisionId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "training_sessions_divisionId_date_key" ON "training_sessions"("divisionId", "date");

-- CreateIndex
CREATE INDEX "attendance_trainingSessionId_idx" ON "attendance"("trainingSessionId");

-- CreateIndex
CREATE INDEX "attendance_playerId_idx" ON "attendance"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_playerId_trainingSessionId_key" ON "attendance"("playerId", "trainingSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_division_access_trainerId_divisionId_key" ON "trainer_division_access"("trainerId", "divisionId");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_division_access" ADD CONSTRAINT "trainer_division_access_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_division_access" ADD CONSTRAINT "trainer_division_access_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
