import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { cell, executeReadOnlySql } from './diagnostico.js';

function object(value, allowed, context) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${context}: objeto obrigatório.`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${context}: campo desconhecido ${key}.`);
}

function identifier(value) {
  if (typeof value !== 'string' || !value.trim() || /[\x00-\x1f\x7f]/.test(value) || Buffer.byteLength(value, 'utf8') > 63) {
    throw new Error('Identificador inválido: use nome não vazio de até 63 bytes, sem caracteres de controle.');
  }
  return value;
}

function columns(value) {
  if (!Array.isArray(value) || !value.length || value.length > 16) throw new Error('columns deve conter entre 1 e 16 nomes.');
  value.forEach(identifier);
  if (new Set(value).size !== value.length) throw new Error('Colunas repetidas na mesma regra.');
}

export function validateConfig(config) {
  object(config, ['version', 'rules'], 'Configuração');
  if (config.version !== 1) throw new Error('Versão de configuração não suportada; use version: 1.');
  if (!Array.isArray(config.rules) || !config.rules.length || config.rules.length > 50) throw new Error('Configure entre 1 e 50 regras.');
  const ids = new Set();
  for (const rule of config.rules) {
    object(rule, ['id', 'type', 'schema', 'table', 'columns', 'reference'], 'Regra');
    if (typeof rule.id !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(rule.id) || ids.has(rule.id)) throw new Error('Cada regra precisa de id único, de até 64 caracteres ASCII (letras, números, _ ou -).');
    ids.add(rule.id);
    if (!['not_null', 'not_blank', 'unique', 'foreign_key'].includes(rule.type)) throw new Error(`Tipo de regra inválido: ${rule.id}.`);
    identifier(rule.schema); identifier(rule.table); columns(rule.columns);
    if (['not_null', 'not_blank'].includes(rule.type) && rule.columns.length !== 1) throw new Error(`${rule.id}: configure uma única coluna.`);
    if (rule.type === 'foreign_key') {
      object(rule.reference, ['schema', 'table', 'columns'], `${rule.id}.reference`);
      identifier(rule.reference.schema); identifier(rule.reference.table); columns(rule.reference.columns);
      if (rule.columns.length !== rule.reference.columns.length) throw new Error(`${rule.id}: origem e destino precisam do mesmo número de colunas.`);
    } else if (rule.reference !== undefined) throw new Error(`${rule.id}: reference só é permitido em foreign_key.`);
  }
  return config;
}

export function quoteIdentifier(value) {
  return '"' + identifier(value).replaceAll('"', '""') + '"';
}

function tableName(rule) { return `${quoteIdentifier(rule.schema)}.${quoteIdentifier(rule.table)}`; }

export function compileQualitySql(input) {
  const config = validateConfig(input);
  const statements = ['BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;',
    "SET LOCAL statement_timeout = '30s';", "SET LOCAL lock_timeout = '3s';"];
  for (const rule of config.rules) {
    const table = tableName(rule);
    const cols = rule.columns.map(c => `s.${quoteIdentifier(c)}`);
    let affected;
    if (rule.type === 'not_null') {
      affected = `SELECT count(*) FROM ${table} s WHERE ${cols[0]} IS NULL`;
    } else if (rule.type === 'not_blank') {
      affected = `SELECT count(*) FROM ${table} s WHERE ${cols[0]} IS NULL OR btrim(${cols[0]}::text) = ''`;
    } else if (rule.type === 'unique') {
      // Conta excedentes por grupo (n - 1); ignora chaves com qualquer NULL.
      affected = `SELECT COALESCE(sum(g.n - 1), 0) FROM (SELECT count(*) AS n FROM ${table} s WHERE ${cols.map(c => `${c} IS NOT NULL`).join(' AND ')} GROUP BY ${cols.join(', ')} HAVING count(*) > 1) g`;
    } else {
      const matches = cols.map((c, i) => `r.${quoteIdentifier(rule.reference.columns[i])} = ${c}`).join(' AND ');
      affected = `SELECT count(*) FROM ${table} s WHERE ${cols.map(c => `${c} IS NOT NULL`).join(' AND ')} AND NOT EXISTS (SELECT 1 FROM ${tableName(rule.reference)} r WHERE ${matches})`;
    }
    // id/type validados por lista/regex; nomes sempre tratados como identificadores.
    statements.push(`SELECT row_to_json(result) FROM (SELECT '${rule.id}' AS id, '${rule.type}' AS type, (SELECT count(*) FROM ${table})::text AS checked_rows, (${affected})::text AS affected_rows) result;`);
  }
  statements.push('SELECT \'{"complete":true}\';', 'ROLLBACK;');
  return statements.join('\n') + '\n';
}

export function parseQualityResults(output, input) {
  const config = validateConfig(input);
  let rows;
  try { rows = output.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line)); }
  catch { throw new Error('Saída de qualidade inválida; relatório não gerado.'); }
  if (rows.length !== config.rules.length + 1 || rows.at(-1)?.complete !== true) throw new Error('Coleta de qualidade incompleta.');
  const counts = rows.slice(0, -1);
  return counts.map((row, i) => {
    const rule = config.rules[i];
    if (!row || row.id !== rule.id || row.type !== rule.type) throw new Error('Resultados fora de ordem ou incompatíveis com as regras.');
    for (const key of ['checked_rows', 'affected_rows']) {
      if (typeof row[key] !== 'string' || !/^(0|[1-9][0-9]*)$/.test(row[key])) throw new Error('Contagem inválida: esperado inteiro não negativo em texto.');
    }
    if (BigInt(row.affected_rows) > BigInt(row.checked_rows)) throw new Error('Contagem de violações maior que o total examinado.');
    return { id: row.id, type: row.type, checked_rows: row.checked_rows, affected_rows: row.affected_rows,
      status: row.affected_rows !== '0' ? 'findings' : row.checked_rows === '0' ? 'empty' : 'passed' };
  });
}

export function collectQuality(config, options = {}) {
  return parseQualityResults(executeReadOnlySql(compileQualitySql(config), options), config);
}

export function buildQualityReport(config, results, { demo = false, now = new Date() } = {}) {
  const sql = compileQualitySql(config);
  return { format_version: 1, mode: demo ? 'demo' : 'database', generated_at: now.toISOString(),
    sql_sha256: createHash('sha256').update(sql).digest('hex'), config,
    summary: { rules: results.length, with_findings: results.filter(r => r.status === 'findings').length,
      empty: results.filter(r => r.status === 'empty').length }, results };
}

export function renderQualityMarkdown(report) {
  const lines = ['# Qualidade de dados — e-Cidade', '',
    report.mode === 'demo' ? '**DEMONSTRAÇÃO: resultados sintéticos; nenhuma conexão com banco.**' : '**Consultas agregadas somente leitura. Nenhum registro foi alterado.**', '',
    `Gerado em: ${cell(report.generated_at)}`, '',
    '| Regra | Tipo | Linhas da tabela | Violações/excedentes | Estado |', '| --- | --- | --- | --- | --- |'];
  for (const row of report.results) lines.push(`| ${cell(row.id)} | ${cell(row.type)} | ${row.checked_rows} | ${row.affected_rows} | ${cell(row.status)} |`);
  lines.push('', '## Interpretação', '',
    '- unique conta linhas excedentes por chave repetida (grupo com 3 linhas = 2 excedentes).',
    '- unique e foreign_key ignoram chaves com qualquer componente NULL; use not_null separadamente.',
    '- not_blank conta NULL, texto vazio e texto composto apenas de espaços comuns. Tabs e quebras de linha não são removidos.',
    '- passed indica zero violações daquela regra; empty indica tabela sem linhas visíveis.',
    '- Não some violações de regras diferentes: uma linha pode violar várias regras.',
    '- A conta, permissões e políticas de acesso por linha podem limitar os registros examinados.',
    '- Nenhum valor de registro é exportado; nomes de objetos e regras constam no JSON e precisam de revisão antes de publicação.',
    '- Confirme cada regra com o responsável do módulo antes de interpretar violações como defeitos.', '',
    `SHA-256 do SQL executável: ${report.sql_sha256}`, '');
  return lines.join('\n');
}

export function saveQualityReport(report, outputRoot = 'resultados-locais') {
  const root = resolve(outputRoot);
  mkdirSync(root, { recursive: true });
  const directory = mkdtempSync(join(root, `qualidade-${report.mode}-`));
  writeFileSync(join(directory, 'qualidade.json'), JSON.stringify(report, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
  writeFileSync(join(directory, 'qualidade.md'), renderQualityMarkdown(report), { encoding: 'utf8', flag: 'wx' });
  return directory;
}
