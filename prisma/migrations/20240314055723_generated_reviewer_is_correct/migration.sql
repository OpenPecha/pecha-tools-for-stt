-- AlterTable
ALTER TABLE "Task" ADD COLUMN "reviewer_is_correct" BOOLEAN GENERATED ALWAYS AS (reviewed_transcript = final_transcript) STORED;

