-- AlterTable
ALTER TABLE "Task" ADD COLUMN "transcriber_is_correct" BOOLEAN GENERATED ALWAYS AS (transcript = reviewed_transcript) STORED;
