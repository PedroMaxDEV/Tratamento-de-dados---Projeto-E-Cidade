import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { buildQualityReport, compileQualitySql, parseQualityResults } from '../src/qualidade.js';
import { compareReports, saveComparison } from '../src/comparacao.js';

const config = JSON.parse(readFileSync(new URL('./regras.json', import.meta.url), 'utf8'));
const qualitySql = compileQualitySql(config);

async function runScript(db, file) {
  const sql = readFileSync(new URL(file, import.meta.url), 'utf8');
  // PGlite executes SQL directly. This first line is a psql client directive.
  await db.exec(sql.replace(/^\\set ON_ERROR_STOP on\r?\n/, ''));
}

async function collect(db) {
  const statements = await db.exec(qualitySql);
  const lines = statements.flatMap(statement => statement.rows.map(row => {
    const value = Object.values(row)[0];
    return typeof value === 'string' ? value : JSON.stringify(value);
  }));
  return buildQualityReport(config, parseQualityResults(lines.join('\n'), config), { demo: true });
}

const db = await PGlite.create();
try {
  console.log('e-Cidade | Laboratório com dados fictícios em PostgreSQL em memória');
  await runScript(db, './001_preparar.sql');
  const snapshot = () => db.query('SELECT id, nome FROM ecidade_lab.pessoa ORDER BY id');
  const original = await snapshot();
  const before = await collect(db);
  console.log(`1. Diagnóstico: ${before.results[0].affected_rows} de ${before.results[0].checked_rows} nomes ausentes.`);

  await runScript(db, './002_tratar.sql');
  const after = await collect(db);
  console.log(`2. Após o tratamento SQL: ${after.results[0].affected_rows} nomes ausentes.`);

  await runScript(db, './003_reverter.sql');
  const restored = await collect(db);
  assert.deepEqual((await snapshot()).rows, original.rows);
  assert.deepEqual([before, after, restored].map(report => report.results[0].affected_rows), ['3', '0', '3']);
  console.log(`3. Após a reversão: ${restored.results[0].affected_rows} nomes ausentes. Valores originais conferidos linha por linha.`);

  const applied = saveComparison(compareReports(before, after));
  const reversed = saveComparison(compareReports(after, restored));
  console.log(`Relatório do tratamento: ${applied}`);
  console.log(`Relatório da reversão: ${reversed}`);
} finally {
  await db.close();
}
