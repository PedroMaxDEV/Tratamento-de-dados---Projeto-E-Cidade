# Ferramenta de diagnóstico — versão 0.1.0

## O que ela faz

A ferramenta usa Node.js para executar o cliente PostgreSQL `psql`, processar os metadados e produzir dois arquivos: `diagnostico.json` e `diagnostico.md`. Não há pacotes externos para instalar.

O SQL lista tabelas comuns/particionadas, colunas, restrições e índices aos quais a conta tem acesso. Não lê registros das tabelas de negócio. A transação é somente leitura, com timeout de 60 segundos por comando e limite total de 180 segundos no processo cliente.

Indicadores disponíveis:

| Código | Significado |
| --- | --- |
| ENCODING_REVIEW | Codificação diferente de UTF8; requer avaliação de compatibilidade |
| NO_PRIMARY_KEY | Tabela sem chave primária declarada |
| UNVALIDATED_CONSTRAINT | Restrição ainda não validada no catálogo |
| INVALID_INDEX | Índice marcado como inválido |
| NO_VISIBLE_TABLES | Nenhuma tabela acessível; conferir banco e permissões |

Esses indicadores são pontos para investigação. Não autorizam exclusão de registros, conversão de codificação ou mudanças automáticas no esquema.

## Demonstração sem banco

Pré-requisito: Node.js 22 ou superior.

```powershell
node src/cli.js --demo
```

O resultado esperado é duas tabelas fictícias e quatro pontos de revisão. Os relatórios deixam explícito que se trata de demonstração. As tabelas de exemplo não representam o esquema do e-Cidade.

## Conectar à base de desenvolvimento

Pré-requisitos adicionais: `psql` instalado, uma base restaurada acessível e credenciais de leitura configuradas. O SQL utiliza catálogos PostgreSQL e `row_to_json`; a compatibilidade com a versão legada do e-Cidade precisa ser confirmada no ambiente real, ainda não testado nesta entrega.

No PowerShell, substitua os valores de exemplo:

```powershell
$env:PGHOST = 'localhost'
$env:PGPORT = '5432'
$env:PGDATABASE = 'ecidade'
$env:PGUSER = 'usuario_leitura'
node src/cli.js
```

O cliente utiliza a autenticação padrão do libpq. Se precisar de senha, configure o arquivo de senhas PostgreSQL da sua conta: no Windows, `%APPDATA%\postgresql\pgpass.conf`. Não publique esse arquivo. A ferramenta usa `-w`, portanto falha em vez de ficar aguardando senha no terminal.

Se o executável não estiver no PATH, informe o caminho real instalado:

```powershell
node src/cli.js --psql 'C:\Program Files\PostgreSQL\16\bin\psql.exe'
```

O número 16 acima é apenas um exemplo de caminho, não uma definição da versão que a turma deverá usar. O banco precisa estar acessível pelo endereço configurado; este comando não cria nem inicia containers.

## Saídas e códigos de retorno

Por padrão, cada execução cria uma pasta exclusiva `resultados-locais/database-...` ou `resultados-locais/demo-...`. A pasta é ignorada pelo Git e execuções anteriores são preservadas. Use `--out CAMINHO` para escolher outra pasta; revise os arquivos antes de publicar e confira se o novo caminho está ignorado pelo Git.

- Código 0: relatório gerado, mesmo quando há pontos de revisão, ou ajuda exibida.
- Código 1: argumentos inválidos, falha na coleta, resultado incompleto ou falha de gravação.

Conexões sem `PGDATABASE` explícito são recusadas. A coleta força UTF8 na conexão de saída para preservar acentos no JSON; isso não altera a codificação armazenada no banco. Se o PostgreSQL não conseguir converter os caracteres, a execução falha. Mensagens brutas do cliente não são copiadas para o relatório para evitar exposição de parâmetros privados.

## Testes e limites

```powershell
node --test testes/diagnostico.test.js
```

Os oito testes verificam lógica e tratamento de falhas com coleta simulada. O modo demonstrativo também foi executado localmente. Ainda falta executar a coleta contra PostgreSQL e testar o banco restaurado do e-Cidade. O workflow GitHub testa a lógica em Linux e Windows; não provisiona PostgreSQL.

A ferramenta não encontra duplicidades de negócio, registros órfãos nem consultas lentas nesta versão. O relatório completo não é uma certificação de integridade. Contagens incluem somente objetos visíveis à conta e podem incluir tabelas pai e partições separadamente.

Referências técnicas: [opções do psql](https://www.postgresql.org/docs/current/app-psql.html), [funções JSON](https://www.postgresql.org/docs/current/functions-json.html) e [arquivo de senhas PostgreSQL](https://www.postgresql.org/docs/current/libpq-pgpass.html).
