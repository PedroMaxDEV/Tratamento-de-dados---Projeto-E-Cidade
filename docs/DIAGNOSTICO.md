# Diagnóstico inicial

Consulta documental realizada em 27/10/2026. Referência: branch `master` do GitHub; hash ainda não fixado. O conteúdo remoto pode mudar.

## Evidências documentais

- O README informa PHP 5.6 e PostgreSQL.
- O Compose configura `POSTGRES_INITDB_ARGS` com LATIN1 e locale `pt_BR.ISO-8859-1`. Isso descreve a inicialização proposta, não confirma a codificação de uma base já existente.
- O exemplo de volume de dados PostgreSQL está comentado. É necessário conferir a persistência real e testar restauração antes de recriar containers.
- O healthcheck usa `pg_isready -U ecidade`, enquanto `POSTGRES_USER` está configurado como `postgres`. Conferir usuários e logs antes de concluir que isso impede o funcionamento.

Fontes:

- https://github.com/DBSeller/e-cidade
- https://github.com/DBSeller/e-cidade/blob/master/docker-compose.yml

## O que ainda precisa ser medido

| Informação | Resultado |
| --- | --- |
| Hash do código de referência | Pendente |
| Origem e autorização da base | Pendente |
| Versão real do PostgreSQL | Pendente |
| Codificação e locale reais | Pendente |
| Módulo escolhido | Pendente |
| Tabelas e relacionamentos do módulo | Pendente |
| Duplicidades segundo regra de negócio | Não avaliadas |
| Registros órfãos | Não avaliados |
| Backup restaurado com sucesso | Não testado |
| Compatibilidade PHP/Laravel | Não testada |

Não converter automaticamente para UTF-8 nem remover registros duplicados sem confirmar dependências, regras e efeitos sobre a aplicação.
