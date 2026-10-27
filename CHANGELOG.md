# Histórico de atualizações

Registrar entregas reais, indicando separadamente implementação e validação. Não marcar uma correção como concluída antes de executá-la e conferir o resultado.

## 2026-10-27 — 0.3.0 — Comparação antes e depois

- Implementada comparação entre relatórios de qualidade com classificação de variações e resultados inconclusivos.
- Incluídas validação dos arquivos, contagens exatas, proteção contra mistura de demo/coleta real e conferência de ordem temporal.
- Adicionados relatórios Markdown/JSON, CLI demonstrativa e código de saída opcional para regressões.
- Adicionados sete testes locais e documentação em `docs/COMPARAR_RELATORIOS.md`.

Validação: 26 testes locais passaram e demonstração executada. Nenhuma base foi alterada. Publicação descrita em `updates/005-comparacao-relatorios.md`.

## 2026-10-27 — Correção de compatibilidade com PostgreSQL 16

- Substituída leitura das variáveis removidas lc_collate/lc_ctype pelo catálogo pg_database nos dois inventários.
- Reforçada conferência dos valores de locale no teste de integração.
- Desativado fail-fast na matriz PostgreSQL para obter resultados independentes nas versões 14 e 16.

Validação: 19 testes locais passaram. A correção de integração aguarda novo push e execução no GitHub. Consulta às etapas da execução anterior confirmou falha na etapa de testes do PostgreSQL 16 e sucesso na etapa equivalente do 14; log SQL completo não acessível pela API sem autenticação.

## 2026-10-27 — 0.2.0 — Regras de qualidade

- Implementadas regras not_null, not_blank, unique e foreign_key configuradas por JSON.
- Adicionados suporte a chaves compostas, exportação de SQL para revisão e relatórios de contagens sem amostras de registros.
- Validadas configurações e preservada a precisão de contagens grandes.
- Incluídos modo demonstrativo, 11 testes adicionais locais e cinco testes de integração opt-in com massa sintética.
- Configurado GitHub Actions com PostgreSQL 14 e 16 para validar consultas reais após o push.
- Adicionado texto de publicação em `updates/003-qualidade-dados.md`.

Validação local: 19 testes passaram; demonstração de qualidade executada. Cinco testes de integração pulados por ausência do banco local. GitHub Actions e base real do e-Cidade ainda não validados. Nenhum tratamento foi aplicado à base real.

## 2026-10-27 — 0.1.0 — Diagnóstico executável

- Implementada CLI Node.js sem dependências externas, com modo demonstrativo.
- Adicionada coleta de metadados PostgreSQL via psql em transação somente leitura.
- Gerados relatórios JSON e Markdown em pasta exclusiva por execução.
- Implementados indicadores de codificação, ausência de PK, restrições não validadas e índices inválidos.
- Tratados erros de conexão/execução e coleta incompleta sem publicar relatório de sucesso.
- Adicionados 8 testes automatizados e workflow para executá-los no GitHub em Linux e Windows.
- Registrados instruções de uso e texto da atualização em `updates/002-diagnostico.md`.

Validação local: 8 testes passaram em Node.js 22.14.0; CLI demonstrativa executada e relatórios conferidos. PostgreSQL/psql indisponíveis no ambiente; coleta real não testada. Workflow será validado após envio ao GitHub.

## 2026-10-27 — Estrutura inicial

- Criado plano de trabalho da equipe de banco de dados.
- Adicionado inventário PostgreSQL somente leitura.
- Documentados pontos de investigação e integração com PHP/Laravel.
- Preparados guia de publicação, modelos de tarefas, tratamento e testes.
- Preparadas pastas para migrações, reversão e relatórios.

Validação: estrutura local preparada. Inventário não executado em PostgreSQL; nenhuma base restaurada ou modificada. Repositório remoto ainda não configurado nesta entrega.

## Próximas entregas previstas

- Registrar ambiente reproduzível e revisão do e-Cidade.
- Executar inventário e documentar um módulo piloto.
- Medir e tratar um problema comprovado.
- Testar a integração com as demais frentes.
