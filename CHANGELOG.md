# Histórico de atualizações

Registrar entregas reais, indicando separadamente implementação e validação. Não marcar uma correção como concluída antes de executá-la e conferir o resultado.

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
