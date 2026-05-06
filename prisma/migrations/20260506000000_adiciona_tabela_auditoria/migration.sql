-- CreateEnum
CREATE TYPE "AcaoAuditoria" AS ENUM ('CREATE', 'UPDATE');

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" SERIAL NOT NULL,
    "tabela" TEXT NOT NULL,
    "registroId" INTEGER NOT NULL,
    "coluna" TEXT NOT NULL,
    "valorAntigo" JSONB,
    "valorNovo" JSONB,
    "acao" "AcaoAuditoria" NOT NULL,
    "alteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alteradoPor" INTEGER,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Auditoria_tabela_registroId_idx" ON "Auditoria"("tabela", "registroId");

-- CreateIndex
CREATE INDEX "Auditoria_alteradoEm_idx" ON "Auditoria"("alteradoEm");

-- CreateFunction
CREATE OR REPLACE FUNCTION registrar_auditoria() RETURNS TRIGGER AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    BEGIN
        v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::INTEGER;
    EXCEPTION
        WHEN OTHERS THEN
            v_user_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO "Auditoria" (
            "tabela",
            "registroId",
            "coluna",
            "valorAntigo",
            "valorNovo",
            "acao",
            "alteradoPor"
        )
        SELECT
            TG_TABLE_NAME,
            NEW.id,
            n.key,
            NULL,
            n.value,
            'CREATE'::"AcaoAuditoria",
            v_user_id
        FROM jsonb_each(to_jsonb(NEW)) AS n;

        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        INSERT INTO "Auditoria" (
            "tabela",
            "registroId",
            "coluna",
            "valorAntigo",
            "valorNovo",
            "acao",
            "alteradoPor"
        )
        SELECT
            TG_TABLE_NAME,
            NEW.id,
            n.key,
            o.value,
            n.value,
            'UPDATE'::"AcaoAuditoria",
            v_user_id
        FROM jsonb_each(to_jsonb(NEW)) AS n
        JOIN jsonb_each(to_jsonb(OLD)) AS o ON o.key = n.key
        WHERE n.value IS DISTINCT FROM o.value;

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CreateTriggers
DO $$
BEGIN
    IF to_regclass('public."Funcionario"') IS NOT NULL THEN
        EXECUTE 'CREATE TRIGGER "auditoria_funcionario_trigger" AFTER INSERT OR UPDATE ON "Funcionario" FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();';
    END IF;

    IF to_regclass('public."Empresa"') IS NOT NULL THEN
        EXECUTE 'CREATE TRIGGER "auditoria_empresa_trigger" AFTER INSERT OR UPDATE ON "Empresa" FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();';
    END IF;

    IF to_regclass('public."Endereco"') IS NOT NULL THEN
        EXECUTE 'CREATE TRIGGER "auditoria_endereco_trigger" AFTER INSERT OR UPDATE ON "Endereco" FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();';
    END IF;

    IF to_regclass('public."Usuario"') IS NOT NULL THEN
        EXECUTE 'CREATE TRIGGER "auditoria_usuario_trigger" AFTER INSERT OR UPDATE ON "Usuario" FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();';
    END IF;
END;
$$;
