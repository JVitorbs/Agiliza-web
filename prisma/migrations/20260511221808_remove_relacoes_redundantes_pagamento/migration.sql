/*
  Warnings:

  - You are about to drop the column `agendamentoId` on the `Pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `entregaId` on the `Pagamento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_entregaId_fkey";

-- AlterTable
ALTER TABLE "Pagamento" DROP COLUMN "agendamentoId",
DROP COLUMN "entregaId";
