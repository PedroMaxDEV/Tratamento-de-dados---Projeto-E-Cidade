import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const sqlPath = new URL('../sql/diagnostico/002_coleta_json.sql', import.meta.url);
const fields = {
  metadata: { database: 'string', server_version: 'string', encoding: 'string', collate: 'string', ctype: 'string' },
  table: { schema: 'string', name: 'string', relation_kind: 'string', has_primary_key: 'boolean' },
  column: { schema: 'string', table_name: 'string', name: 'string', position: 'number', data_type: 'string', nullable: 'boolean' },
  constraint: { schema: 'string', table_name: 'string', name: 'string', constraint_type: 'string', validated: 'boolean' },
  index: { schema: 'string', table_name: 'string', name: 'string', valid: 'boolean', is_unique: 'boolean' },
  complete: {}
};

export function parseCollection(output) {
  const lines = output.split(/\r?\n/).filter(line => line.trim());
  const records = lines.map((line, index) => {
    let record;
    try { record = JSON.parse(line); }
    catch { throw new Error(`Saída inválida do psql na linha ${index + 1}.`); }
    if (!record || !Object.hasOwn(fields, record.kind)) {
      throw new Error(`Tipo de registro desconhecido na linha ${index + 1}.`);
    }
    for (const [field, type] of Object.entries(fields[record.kind])) {
      if (typeof record[field] !== type) throw new Error(`Campo ${field} inválido na linha ${index + 1}.`);
    }
    return record;
  });
  if (records[0]?.kind !== 'metadata' || records.at(-1)?.kind !== 'complete'
      || records.filter(r => r.kind === 'metadata').length !== 1
      || records.filter(r => r.kind === 'complete').length !== 1) {
    throw new Error('Coleta incompleta: metadados ou marcador final ausentes/duplicados.');
  }
  return records;
}

export function executeReadOnlySql(sql, { psql = 'psql', env = process.env, runner = spawnSync } = {}) {
  if (!env.PGDATABASE) throw new Error('Defina PGDATABASE explicitamente antes de consultar a base.');
  const result = runner(psql, ['-X', '-q', '-A', '-t', '-w', '-v', 'ON_ERROR_STOP=1', '-f', '-'], {
    input: sql,
    encoding: 'utf8', shell: false, windowsHide: true,
    timeout: 180_000, maxBuffer: 32 * 1024 * 1024,
    env: { ...env, PGCLIENTENCODING: 'UTF8', PGCONNECT_TIMEOUT: '10' }
  });
  if (result.error?.code === 'ENOENT') throw new Error('psql não encontrado. Instale o cliente PostgreSQL ou use --psql CAMINHO.');
  if (result.error) throw new Error('Falha ao executar psql: verifique tempo limite, tamanho da coleta e caminho do cliente.');
  if (result.status !== 0) {
    // Nao imprimir stderr: mensagens de conexao podem conter parametros privados.
    throw new Error(`psql encerrou com código ${result.status ?? 'indisponível'}. Confira conexão, autenticação, permissões e compatibilidade SQL. Nenhum relatório foi gerado.`);
  }
  return result.stdout;
}

export function collectDatabase(options = {}) {
  return parseCollection(executeReadOnlySql(readFileSync(sqlPath, 'utf8'), options));
}

export function buildReport(records, { demo = false, now = new Date() } = {}) {
  const metadata = records.find(r => r.kind === 'metadata');
  const tables = records.filter(r => r.kind === 'table');
  const columns = records.filter(r => r.kind === 'column');
  const constraints = records.filter(r => r.kind === 'constraint');
  const indexes = records.filter(r => r.kind === 'index');
  const findings = [];
  if (metadata.encoding !== 'UTF8') findings.push({ code: 'ENCODING_REVIEW', object: metadata.database,
    message: `Codificação ${metadata.encoding}: validar compatibilidade com aplicação e conexões; não converter automaticamente.` });
  if (!tables.length) findings.push({ code: 'NO_VISIBLE_TABLES', object: metadata.database,
    message: 'Nenhuma tabela acessível encontrada. Conferir base selecionada e permissões antes de concluir que ela está vazia.' });
  for (const table of tables) if (!table.has_primary_key) findings.push({ code: 'NO_PRIMARY_KEY', object: `${table.schema}.${table.name}`,
    message: 'Tabela sem chave primária declarada. Confirmar finalidade e regra de negócio antes de propor alteração.' });
  for (const item of constraints) if (!item.validated) findings.push({ code: 'UNVALIDATED_CONSTRAINT', object: `${item.schema}.${item.table_name}.${item.name}`,
    message: 'Restrição marcada como não validada no catálogo. Investigar dados existentes e histórico da migração.' });
  for (const item of indexes) if (!item.valid) findings.push({ code: 'INVALID_INDEX', object: `${item.schema}.${item.name}`,
    message: 'Índice marcado como inválido. Investigar criação/manutenção antes de reconstruir ou remover.' });
  return { format_version: 1, mode: demo ? 'demo' : 'database', generated_at: now.toISOString(), metadata,
    summary: { tables: tables.length, columns: columns.length, constraints: constraints.length, indexes: indexes.length, findings: findings.length },
    findings, tables, columns, constraints, indexes };
}

export function cell(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('|', '&#124;').replaceAll('`', '&#96;').replaceAll('*', '&#42;')
    .replaceAll('_', '&#95;').replaceAll('[', '&#91;').replaceAll(']', '&#93;')
    .replace(/[\r\n]+/g, ' ');
}

export function renderMarkdown(report) {
  const lines = ['# Diagnóstico PostgreSQL — e-Cidade', '',
    report.mode === 'demo' ? '**DEMONSTRAÇÃO: dados sintéticos; nenhuma conexão com banco foi realizada.**' : '**Coleta de metadados somente leitura.**', '',
    `Gerado em: ${cell(report.generated_at)}`, '',
    `Banco: ${cell(report.metadata.database)} | PostgreSQL: ${cell(report.metadata.server_version)} | Codificação: ${cell(report.metadata.encoding)}`, '',
    '| Tabelas | Colunas | Restrições | Índices | Pontos para revisão |', '| --- | --- | --- | --- | --- |',
    `| ${report.summary.tables} | ${report.summary.columns} | ${report.summary.constraints} | ${report.summary.indexes} | ${report.summary.findings} |`, '',
    '## Pontos para revisão', '',
    'Indicadores não comprovam inconsistência nos registros. Nenhuma correção foi aplicada.', ''];
  if (report.findings.length) {
    lines.push('| Código | Objeto | Observação |', '| --- | --- | --- |');
    for (const f of report.findings) lines.push(`| ${cell(f.code)} | ${cell(f.object)} | ${cell(f.message)} |`);
  } else lines.push('Nenhum indicador detectado pelas regras desta versão. Isso não certifica a qualidade da base.');
  lines.push('', '## Tabelas acessíveis', '', '| Schema | Tabela | Tem chave primária? |', '| --- | --- | --- |');
  for (const t of report.tables) lines.push(`| ${cell(t.schema)} | ${cell(t.name)} | ${t.has_primary_key ? 'Sim' : 'Não'} |`);
  lines.push('', '## Limitações', '',
    '- Coleta apenas tabelas comuns/particionadas com USAGE no schema e SELECT na tabela para a conta utilizada.',
    '- Não examina registros, duplicidades, órfãos, desempenho, views, funções ou triggers.',
    '- Nomes de objetos e metadados podem ser internos; revise antes de publicar.',
    '- O inventário detalhado de colunas, restrições e índices está no arquivo JSON ao lado deste relatório.', '');
  return lines.join('\n');
}

export function saveReport(report, outputRoot = 'resultados-locais') {
  const root = resolve(outputRoot);
  mkdirSync(root, { recursive: true });
  // Uma pasta exclusiva por execucao preserva relatorios anteriores.
  const directory = mkdtempSync(join(root, `${report.mode}-`));
  writeFileSync(join(directory, 'diagnostico.json'), JSON.stringify(report, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
  writeFileSync(join(directory, 'diagnostico.md'), renderMarkdown(report), { encoding: 'utf8', flag: 'wx' });
  return directory;
}
