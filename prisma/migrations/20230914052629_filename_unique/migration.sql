/*
  Warnings:

  - A unique constraint covering the columns `[file_name]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Task_file_name_key" ON "Task"("file_name");

-- CreateIndex
CREATE UNIQUE INDEX "Task_url_key" ON "Task"("url");
