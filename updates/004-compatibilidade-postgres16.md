# Atualização 004

## Título

fix: corrige leitura de locale no PostgreSQL 16

## Descrição

Substitui as consultas às variáveis lc_collate e lc_ctype por leitura de datcollate e datctype em pg_catalog.pg_database, filtrando pelo banco atual. As variáveis antigas foram removidas no PostgreSQL 16.

Ajusta os dois scripts de inventário, reforça o teste de integração para conferir os valores de locale e desativa fail-fast na matriz PostgreSQL, permitindo que as versões 14 e 16 terminem independentemente.

Validação: 19 testes locais passaram. A execução corrigida no GitHub ainda precisa ser realizada após o envio; não há PostgreSQL instalado localmente para confirmar a integração.

## Evidências

Na execução 40571000998, a etapa de consultas do PostgreSQL 16 falhou e a etapa equivalente do PostgreSQL 14 passou, embora o job 14 tenha terminado com estado cancelado. O download do log completo exigiu autenticação; a API pública mostrou somente o código de saída 1. A incompatibilidade das consultas foi confirmada no código e nas notas oficiais, mas não foi possível ler a mensagem SQL específica daquela execução.

- Execução: https://github.com/PedroMaxDEV/Tratamento-de-dados---Projeto-E-Cidade/actions/runs/40571000998
- Mudança oficial: https://www.postgresql.org/docs/16/release-16.html

## Publicar

```powershell
git add sql/diagnostico/001_inventario.sql sql/diagnostico/002_coleta_json.sql testes/integracao/postgres.test.js .github/workflows/testes.yml CHANGELOG.md updates/004-compatibilidade-postgres16.md
git diff --cached
git commit -m "fix: corrige leitura de locale no PostgreSQL 16"
```

Envie a branch pelo fluxo habitual. O novo push executará os testes com os arquivos corrigidos. Reexecutar apenas o job antigo usará o código antigo e não aplicará esta correção.
