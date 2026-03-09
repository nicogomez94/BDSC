-- Add new role for physical trainers
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PREPARADOR_FISICO';

-- Create trainer type enum
CREATE TYPE "TrainerType" AS ENUM ('ENTRENADOR', 'PREPARADOR_FISICO');

-- Add type column to trainers
ALTER TABLE "trainers"
ADD COLUMN "type" "TrainerType" NOT NULL DEFAULT 'ENTRENADOR';
