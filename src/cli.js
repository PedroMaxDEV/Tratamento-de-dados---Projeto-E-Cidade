import { parseArgs } from 'node:util';
import { collectDatabase, parseCollection, buildReport, saveReport } from './diagnostico.js';
import { demoRecords } from './demo.js';

try {
  const { values } = parseArgs({ options: {
    demo: { type: 'boolean', default: false },
    out: { type: 'string', default: 'resultados-locais' },
    psql: { type: 'string', default: 'psql' },
    help: { type: 'boolean', default: false }
  }, allowPositionals: false });
  if (values.help) {
    console.log('Uso: node src/cli.js [--demo] [--out PASTA] [--psql CAMINHO]\nSem --demo: usa PGHOST, PGPORT, PGDATABASE (obrigatório), PGUSER e autenticação do libpq.\n--demo: usa apenas metadados sintéticos; não conecta ao banco.');
  } else {
    const records = values.demo ? parseCollection(demoRecords.map(r => JSON.stringify(r)).join('\n')) : collectDatabase({ psql: values.psql });
    const report = buildReport(records, { demo: values.demo });
    const directory = saveReport(report, values.out);
    console.log(`${values.demo ? 'DEMONSTRAÇÃO SINTÉTICA' : 'DIAGNÓSTICO'}: ${report.summary.tables} tabelas, ${report.summary.findings} pontos para revisão.\nRelatórios JSON e Markdown: ${directory}`);
  }
} catch (error) {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
}
