-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "inference_transcript" SET DATA TYPE VARCHAR(400),
ALTER COLUMN "transcript" SET DATA TYPE VARCHAR(400),
ALTER COLUMN "reviewed_transcript" SET DATA TYPE VARCHAR(400),
ALTER COLUMN "final_transcript" SET DATA TYPE VARCHAR(400);
