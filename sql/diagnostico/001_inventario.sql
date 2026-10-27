-- Executar com psql. Somente metadados; nao altera dados nem esquema.
\set ON_ERROR_STOP on
\pset pager off
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '60s';

SELECT current_database() AS banco, version() AS versao;
SHOW server_encoding;
SHOW client_encoding;
SHOW lc_collate;
SHOW lc_ctype;

-- Tabelas visiveis para a conta utilizada.
SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

SELECT table_schema, table_name, ordinal_position, column_name,
       data_type, udt_schema, udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, ordinal_position;

-- PK, FK, UNIQUE, CHECK e demais restricoes registradas no catalogo.
SELECT n.nspname AS esquema, c.relname AS tabela,
       con.conname AS restricao, con.contype AS tipo,
       pg_get_constraintdef(con.oid) AS definicao
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname NOT LIKE 'pg_toast%'
ORDER BY n.nspname, c.relname, con.conname;

-- Ausencia de PK e um indicador para revisao, nao uma falha confirmada.
SELECT n.nspname AS esquema, c.relname AS tabela
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname NOT LIKE 'pg_%'
  AND NOT EXISTS (
      SELECT 1 FROM pg_constraint con
      WHERE con.conrelid = c.oid AND con.contype = 'p'
  )
ORDER BY n.nspname, c.relname;

SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  AND schemaname NOT LIKE 'pg_toast%'
ORDER BY schemaname, tablename, indexname;

-- Estimativas estatisticas: nao sao contagens exatas nem prova de qualidade.
SELECT schemaname, relname, n_live_tup AS linhas_estimadas,
       n_dead_tup AS tuplas_mortas_estimadas, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY schemaname, relname;

ROLLBACK;
