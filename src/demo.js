// Objetos ficticios. Nao representam o esquema real do e-Cidade.
export const demoRecords = [
  { kind: 'metadata', database: 'ecidade_demo_sintetica', server_version: 'sintético', encoding: 'LATIN1', collate: 'pt_BR.ISO-8859-1', ctype: 'pt_BR.ISO-8859-1' },
  { kind: 'table', schema: 'demo', name: 'cadastro_exemplo', relation_kind: 'r', has_primary_key: true },
  { kind: 'table', schema: 'demo', name: 'importacao_exemplo', relation_kind: 'r', has_primary_key: false },
  { kind: 'column', schema: 'demo', table_name: 'cadastro_exemplo', name: 'id', position: 1, data_type: 'integer', nullable: false },
  { kind: 'column', schema: 'demo', table_name: 'importacao_exemplo', name: 'descricao', position: 1, data_type: 'text', nullable: true },
  { kind: 'constraint', schema: 'demo', table_name: 'cadastro_exemplo', name: 'cadastro_pk', constraint_type: 'p', validated: true },
  { kind: 'constraint', schema: 'demo', table_name: 'importacao_exemplo', name: 'descricao_check', constraint_type: 'c', validated: false },
  { kind: 'index', schema: 'demo', table_name: 'cadastro_exemplo', name: 'cadastro_pk', valid: true, is_unique: true },
  { kind: 'index', schema: 'demo', table_name: 'importacao_exemplo', name: 'descricao_idx', valid: false, is_unique: false },
  { kind: 'complete' }
];
