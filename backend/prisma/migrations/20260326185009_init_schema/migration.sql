/*
  Warnings:

  - A unique constraint covering the columns `[userId,moduleName]` on the table `role_permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_userId_moduleName_key" ON "role_permissions"("userId", "moduleName");
