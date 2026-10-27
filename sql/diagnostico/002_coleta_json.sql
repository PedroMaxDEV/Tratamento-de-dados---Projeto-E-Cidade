-- Saida JSONL consumida por src/diagnostico.js. Nao executar migracoes aqui.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '60s';

SELECT row_to_json(r) FROM (
  SELECT 'metadata' AS kind, current_database() AS database,
         current_setting('server_version') AS server_version,
         current_setting('server_encoding') AS encoding,
         d.datcollate AS collate,
         d.datctype AS ctype
  FROM pg_catalog.pg_database d
  WHERE d.datname = current_database()
) r;

SELECT row_to_json(r) FROM (
  SELECT 'table' AS kind, n.nspname AS schema, c.relname AS name,
         c.relkind::text AS relation_kind,
         EXISTS (SELECT 1 FROM pg_constraint k
                 WHERE k.conrelid = c.oid AND k.contype = 'p') AS has_primary_key
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p')
    AND n.nspname <> 'information_schema'
    AND n.nspname !~ '^pg_'
    AND has_schema_privilege(n.oid, 'USAGE')
    AND has_table_privilege(c.oid, 'SELECT')
  ORDER BY n.nspname, c.relname
) r;

SELECT row_to_json(r) FROM (
  SELECT 'column' AS kind, n.nspname AS schema, c.relname AS table_name,
         a.attname AS name, a.attnum AS position,
         format_type(a.atttypid, a.atttypmod) AS data_type,
         NOT a.attnotnull AS nullable
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped
    AND n.nspname <> 'information_schema' AND n.nspname !~ '^pg_'
    AND has_schema_privilege(n.oid, 'USAGE')
    AND has_table_privilege(c.oid, 'SELECT')
  ORDER BY n.nspname, c.relname, a.attnum
) r;

SELECT row_to_json(r) FROM (
  SELECT 'constraint' AS kind, n.nspname AS schema, c.relname AS table_name,
         k.conname AS name, k.contype::text AS constraint_type,
         k.convalidated AS validated
  FROM pg_constraint k
  JOIN pg_class c ON c.oid = k.conrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p')
    AND n.nspname <> 'information_schema' AND n.nspname !~ '^pg_'
    AND has_schema_privilege(n.oid, 'USAGE')
    AND has_table_privilege(c.oid, 'SELECT')
  ORDER BY n.nspname, c.relname, k.conname
) r;

SELECT row_to_json(r) FROM (
  SELECT 'index' AS kind, n.nspname AS schema, c.relname AS table_name,
         ix.relname AS name, i.indisvalid AS valid, i.indisunique AS is_unique
  FROM pg_index i
  JOIN pg_class c ON c.oid = i.indrelid
  JOIN pg_class ix ON ix.oid = i.indexrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p')
    AND n.nspname <> 'information_schema' AND n.nspname !~ '^pg_'
    AND has_schema_privilege(n.oid, 'USAGE')
    AND has_table_privilege(c.oid, 'SELECT')
  ORDER BY n.nspname, c.relname, ix.relname
) r;

-- Marcador permite rejeitar uma coleta incompleta mesmo com JSON valido.
SELECT '{"kind":"complete"}';
ROLLBACK;
