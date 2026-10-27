import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseCollection, collectDatabase, buildReport, renderMarkdown, saveReport } from '../src/diagnostico.js';
import { demoRecords } from '../src/demo.js';

const jsonl = demoRecords.map(r => JSON.stringify(r)).join('\n');

test('detecta os quatro indicadores esperados sem classificar dados como corrompidos', () => {
  const report = buildReport(parseCollection(jsonl), { demo: true });
  assert.deepEqual(report.summary, { tables: 2, columns: 2, constraints: 2, indexes: 2, findings: 4 });
  assert.deepEqual(report.findings.map(f => f.code), ['ENCODING_REVIEW', 'NO_PRIMARY_KEY', 'UNVALIDATED_CONSTRAINT', 'INVALID_INDEX']);
  assert.match(renderMarkdown(report), /DEMONSTRAÇÃO/);
});

test('rejeita coleta truncada, JSON inválido e tipos incorretos', () => {
  assert.throws(() => parseCollection(jsonl.replace('{"kind":"complete"}', '')), /incompleta/);
  assert.throws(() => parseCollection('erro de conexão'), /inválida/);
  assert.throws(() => parseCollection(jsonl.replace('"has_primary_key":true', '"has_primary_key":"true"')), /inválido/);
  assert.throws(() => parseCollection(jsonl + '\n{"kind":"complete"}'), /incompleta/);
});

test('UTF8 e objetos válidos não produzem alertas indevidos', () => {
  const records = structuredClone(demoRecords);
  records[0].encoding = 'UTF8';
  for (const r of records) {
    if (r.kind === 'table') r.has_primary_key = true;
    if (r.kind === 'constraint') r.validated = true;
    if (r.kind === 'index') r.valid = true;
  }
  assert.equal(buildReport(records).findings.length, 0);
});

test('nenhuma tabela acessível gera aviso sobre permissões', () => {
  const report = buildReport([demoRecords[0], { kind: 'complete' }]);
  assert.ok(report.findings.some(f => f.code === 'NO_VISIBLE_TABLES'));
});

test('metadados não injetam HTML ou novas linhas de tabela no Markdown', () => {
  const records = structuredClone(demoRecords);
  records[1].name = '<script>\n| [link](url)';
  const md = renderMarkdown(buildReport(records));
  assert.ok(!md.includes('<script>'));
  assert.ok(md.includes('&lt;script&gt; &#124; &#91;link&#93;(url)'));
});

test('psql recebe SQL somente leitura, sem shell, com UTF8 e parada em erros', () => {
  const records = collectDatabase({ env: { PGDATABASE: 'teste' }, runner: (command, args, options) => {
    assert.equal(command, 'psql');
    assert.ok(args.includes('ON_ERROR_STOP=1'));
    assert.ok(args.includes('-X'));
    assert.equal(options.shell, false);
    assert.equal(options.env.PGCLIENTENCODING, 'UTF8');
    assert.match(options.input, /REPEATABLE READ READ ONLY/);
    return { status: 0, stdout: jsonl };
  } });
  assert.equal(records.length, demoRecords.length);
});

test('recusa base implícita, cliente ausente e erro SQL sem expor stderr', () => {
  assert.throws(() => collectDatabase({ env: {} }), /PGDATABASE/);
  assert.throws(() => collectDatabase({ env: { PGDATABASE: 'teste' }, runner: () => ({ error: { code: 'ENOENT' } }) }), /não encontrado/);
  assert.throws(() => collectDatabase({ env: { PGDATABASE: 'teste' }, runner: () => ({ status: 3, stdout: jsonl, stderr: 'senha-secreta' }) }), error => {
    assert.ok(!error.message.includes('senha-secreta'));
    return /código 3/.test(error.message);
  });
});

test('grava relatórios legíveis e preserva execuções anteriores', () => {
  const root = mkdtempSync(join(tmpdir(), 'ecidade-test-'));
  try {
    const report = buildReport(parseCollection(jsonl), { demo: true });
    const first = saveReport(report, root);
    const second = saveReport(report, root);
    assert.notEqual(first, second);
    assert.equal(JSON.parse(readFileSync(join(first, 'diagnostico.json'), 'utf8')).mode, 'demo');
    assert.match(readFileSync(join(second, 'diagnostico.md'), 'utf8'), /DEMONSTRAÇÃO/);
  } finally {
    // Apenas o diretorio temporario criado acima para este teste.
    rmSync(root, { recursive: true, force: true });
  }
});
