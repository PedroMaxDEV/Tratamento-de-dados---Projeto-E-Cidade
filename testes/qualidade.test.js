import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateConfig, compileQualitySql, parseQualityResults, collectQuality, buildQualityReport, saveQualityReport } from '../src/qualidade.js';

const config = JSON.parse(readFileSync(new URL('../config/qualidade.exemplo.json', import.meta.url), 'utf8'));
const sample = () => config.rules.map((r, i) => ({ id: r.id, type: r.type, checked_rows: '6', affected_rows: ['2', '1', '1', '2'][i] }));
const output = rows => [...rows, { complete: true }].map(r => JSON.stringify(r)).join('\n');
const cli = new URL('../src/qualidade-cli.js', import.meta.url);
import { fileURLToPath } from 'node:url';

test('valida configuração de exemplo e compila quatro consultas agregadas', () => {
  assert.equal(validateConfig(config).rules.length, 4);
  const sql = compileQualitySql(config);
  assert.match(sql, /REPEATABLE READ READ ONLY/);
  assert.match(sql, /sum\(g.n - 1\)/);
  assert.match(sql, /NOT EXISTS/);
  assert.match(sql, /ROLLBACK;/);
  assert.equal((sql.match(/row_to_json/g) || []).length, 4);
});

test('rejeita erros de configuração antes de conectar', () => {
  for (const change of [
    c => { c.rules[0].sql = 'DELETE FROM pessoa'; },
    c => { c.rules[0].id = "x'; DELETE"; },
    c => { c.rules[1].id = c.rules[0].id; },
    c => { c.rules[0].columns = []; },
    c => { c.rules[3].reference.columns = ['a', 'b']; },
    c => { c.rules[0].schema = 'a\nb'; },
    c => { c.rules[0].table = 'ç'.repeat(32); },
    c => { c.rules[0].type = 'delete'; }
  ]) {
    const copy = structuredClone(config); change(copy);
    assert.throws(() => validateConfig(copy));
  }
});

test('identificadores especiais são delimitados, não interpolados como código', () => {
  const copy = structuredClone(config);
  copy.rules[0].table = 'pessoa"; DROP TABLE x; --';
  assert.ok(compileQualitySql(copy).includes('"pessoa""; DROP TABLE x; --"'));
});

test('chaves compostas associam as colunas na ordem e ignoram componentes NULL', () => {
  const copy = structuredClone(config);
  copy.rules[3].columns = ['cidade_id', 'uf'];
  copy.rules[3].reference.columns = ['id', 'uf'];
  const sql = compileQualitySql(copy);
  assert.ok(sql.includes('r."id" = s."cidade_id" AND r."uf" = s."uf"'));
  assert.ok(sql.includes('s."cidade_id" IS NOT NULL AND s."uf" IS NOT NULL'));
});

test('distingue violações, tabela vazia e regra sem violações', () => {
  const rows = sample();
  rows[1].affected_rows = '0';
  rows[2].checked_rows = '0'; rows[2].affected_rows = '0';
  assert.deepEqual(parseQualityResults(output(rows), config).map(r => r.status), ['findings', 'passed', 'empty', 'findings']);
});

test('preserva contagens maiores que o limite numérico seguro do JavaScript', () => {
  const rows = sample(); rows[0].checked_rows = '90071992547409931234'; rows[0].affected_rows = '90071992547409931233';
  assert.equal(parseQualityResults(output(rows), config)[0].affected_rows, '90071992547409931233');
});

test('rejeita resultados incompletos, trocados e contagens impossíveis', () => {
  assert.throws(() => parseQualityResults('{}', config), /incompleta/);
  assert.throws(() => parseQualityResults('não JSON', config), /inválida/);
  const rows = sample(); rows.reverse();
  assert.throws(() => parseQualityResults(output(rows), config), /incompatíveis/);
  for (const value of ['7', '-1', 2, '1.5']) {
    const invalid = sample(); invalid[0].affected_rows = value;
    assert.throws(() => parseQualityResults(output(invalid), config));
  }
});

test('executor propaga falhas e não aceita sucesso parcial', () => {
  assert.throws(() => collectQuality(config, { env: { PGDATABASE: 'teste' }, runner: () => ({ status: 1, stdout: output(sample()) }) }), /código 1/);
  const result = collectQuality(config, { env: { PGDATABASE: 'teste' }, runner: (_command, _args, options) => {
    assert.equal(options.shell, false);
    assert.match(options.input, /READ ONLY/);
    return { status: 0, stdout: output(sample()) };
  } });
  assert.equal(result.length, 4);
});

test('relatórios preservam resultados, configuração e impressão digital do SQL', () => {
  const report = buildQualityReport(config, parseQualityResults(output(sample()), config), { demo: true });
  assert.equal(report.summary.with_findings, 4);
  assert.match(report.sql_sha256, /^[a-f0-9]{64}$/);
  const root = mkdtempSync(join(tmpdir(), 'ecidade-quality-'));
  const first = saveQualityReport(report, root);
  assert.notEqual(first, saveQualityReport(report, root));
  assert.match(readFileSync(join(first, 'qualidade.md'), 'utf8'), /DEMONSTRAÇÃO/);
  assert.equal(JSON.parse(readFileSync(join(first, 'qualidade.json'), 'utf8')).results.length, 4);
});

test('CLI demo gera relatório e retorna código 2 quando solicitado', () => {
  const root = mkdtempSync(join(tmpdir(), 'ecidade-cli-'));
  const result = spawnSync(process.execPath, [fileURLToPath(cli), '--demo', '--fail-on-findings', '--out', root], { encoding: 'utf8' });
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stdout, /4 regras, 4 com violações/);
});

test('CLI exporta SQL sem banco, não sobrescreve e recusa argumentos conflitantes', () => {
  const root = mkdtempSync(join(tmpdir(), 'ecidade-sql-'));
  const args = [fileURLToPath(cli), '--config', fileURLToPath(new URL('../config/qualidade.exemplo.json', import.meta.url)), '--emit-sql', join(root, 'revisao.sql')];
  assert.equal(spawnSync(process.execPath, args).status, 0);
  assert.equal(spawnSync(process.execPath, args).status, 1);
  assert.equal(spawnSync(process.execPath, [fileURLToPath(cli), '--demo', '--config', 'x']).status, 1);
});
