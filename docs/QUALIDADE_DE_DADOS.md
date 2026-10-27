# Verificações de qualidade — versão 0.2.0

## Executar agora

Requer Node.js 22 ou superior. Não há dependências npm para instalar.

```powershell
node src/qualidade-cli.js --demo
```

A demonstração utiliza contagens sintéticas fixas, correspondentes à massa de testes, sem abrir conexão. O relatório indica explicitamente esse modo. As tabelas e regras do exemplo não são o esquema real do e-Cidade.

## Regras disponíveis

| Tipo | O que conta | Tratamento de NULL |
| --- | --- | --- |
| not_null | Linhas com NULL em uma coluna | Conta como violação |
| not_blank | NULL, texto vazio ou apenas espaços comuns em uma coluna | Conta como violação |
| unique | Excedentes por grupo repetido: três linhas iguais contam como dois excedentes | Ignora chaves com qualquer componente NULL |
| foreign_key | Linhas sem correspondência na tabela de referência | Ignora chaves com qualquer componente NULL, como MATCH SIMPLE |

`not_blank` converte a coluna para texto e remove espaços comuns das extremidades. Tabs, quebras de linha, espaços Unicode e regras de maiúsculas/minúsculas não são normalizados. Configure apenas colunas para as quais essa interpretação faz sentido.

`unique` e `foreign_key` aceitam chaves compostas. As colunas de origem e destino de uma referência correspondem pela posição nas listas. Para campos obrigatórios, combine a regra de relacionamento com `not_null`.

O exemplo de unicidade de nome é exclusivamente didático: nomes de pessoas podem se repetir legitimamente. Não aplique essa regra ao cadastro real.

## Configurar um módulo real

1. Execute o inventário e identifique os objetos reais.
2. Confirme cada regra com o responsável pelo módulo.
3. Copie `config/qualidade.exemplo.json` para `config/qualidade.local.json`.
4. Substitua schemas, tabelas, colunas e referências pelos nomes confirmados.
5. Gere o SQL para revisão antes de executar:

```powershell
node src/qualidade-cli.js --config config/qualidade.local.json --emit-sql resultados-locais/revisao.sql
```

O diretório de destino precisa existir. O comando não sobrescreve arquivo existente e não conecta ao banco. O JSON não aceita SQL arbitrário, filtros livres ou campos desconhecidos. Identificadores são delimitados para preservar nomes especiais e impedir que sejam interpretados como comandos.

Após configurar PGHOST, PGPORT, PGDATABASE, PGUSER e autenticação, como descrito em `FERRAMENTA_DIAGNOSTICO.md`:

```powershell
node src/qualidade-cli.js --config config/qualidade.local.json
```

Use uma cópia de desenvolvimento e uma conta com SELECT nos objetos necessários. As consultas examinam os dados, mas exportam somente contagens e a definição das regras. Não há amostras de registros no relatório.

## Relatórios e limites

Cada execução cria uma pasta exclusiva em `resultados-locais/`, com `qualidade.json` e `qualidade.md`. O JSON registra a configuração e um SHA-256 do SQL para rastrear exatamente as consultas geradas. O hash não identifica o conteúdo ou a versão do banco: registre a base e a revisão no relatório da equipe.

Contagens são armazenadas como texto decimal para preservar precisão. Não some violações de regras diferentes, pois a mesma linha pode ser contada mais de uma vez.

- `findings`: houve violações da regra configurada.
- `passed`: nenhuma violação encontrada naquela regra e no conjunto visível.
- `empty`: nenhuma linha visível na tabela; não equivale a validação de dados existentes.

O conjunto visível depende das permissões e das políticas de segurança por linha do banco. A tabela de origem inteira é contada para cada regra; em bancos grandes, essa operação pode ser custosa. Esta versão não implementa amostragem nem filtros por período.

Todas as regras de uma execução usam uma transação REPEATABLE READ READ ONLY. O limite é 30 segundos por comando, 3 segundos para esperar locks e 180 segundos para o processo inteiro. Configurações aceitam até 50 regras. Se qualquer consulta falhar ou exceder o limite, não é publicado um relatório de sucesso parcial; divida conjuntos grandes em arquivos menores.

Código de saída padrão: 0 quando gera o relatório, 1 em erro. Acrescente `--fail-on-findings` para retornar 2 quando houver violações, mantendo o relatório disponível. Tabelas vazias não acionam código 2. A opção `--psql CAMINHO` permite indicar o cliente instalado.

## Testes locais

```powershell
node --test testes/diagnostico.test.js testes/qualidade.test.js
```

Resultado nesta entrega: 19 testes aprovados. Eles cobrem a lógica e a interface local, mas simulam a comunicação com PostgreSQL.

## Testes com PostgreSQL de verdade

O workflow `.github/workflows/testes.yml` prepara bancos descartáveis PostgreSQL 14 e 16, carrega `testes/fixtures/base-sintetica.sql` e executa cinco testes. A criação da massa altera exclusivamente o banco de teste. A ferramenta de diagnóstico continua somente leitura.

Para repetir manualmente, crie primeiro um banco vazio e descartável, configure as variáveis PG* apontando para ele e então execute:

```powershell
psql -X -w -v ON_ERROR_STOP=1 -f testes/fixtures/base-sintetica.sql
$env:ECIDADE_TEST_DB = '1'
node --test testes/integracao/postgres.test.js
Remove-Item Env:ECIDADE_TEST_DB
```

Não use a base real nessa preparação. O fixture não apaga objetos existentes e falha se o schema de teste já existir. Os testes conferem contagens, inventário, chaves compostas, tabela vazia, erro por objeto inexistente e bloqueio de escrita em transação de leitura.

Sem `ECIDADE_TEST_DB=1`, os cinco testes são pulados explicitamente. Isso não significa que passaram. Nesta máquina eles foram pulados; o workflow remoto ainda precisa executar após a publicação. A compatibilidade com a versão legada efetiva do e-Cidade permanece pendente, independentemente dos testes nas versões 14 e 16.
