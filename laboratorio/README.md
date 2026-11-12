# Laboratório de tratamento reversível

Este laboratório contém **somente dados fictícios**. Ele demonstra o ciclo de engenharia: medir, tratar, verificar, comparar e reverter. Não representa tabelas nem uma correção aprovada do e-Cidade real.

## Cenário e resultado esperado

Cinco pessoas fictícias são cadastradas. Três nomes estão ausentes: NULL, texto vazio e espaços. O tratamento atribui nomes artificiais somente a esses três registros e preserva o valor anterior em uma tabela de reversão.

| Momento | Total de linhas | Violações da regra nome_preenchido |
| --- | --- | --- |
| Antes | 5 | 3 |
| Após tratamento | 5 | 0 |
| Após reversão | 5 | 3 |

Esses são os resultados esperados, não uma medição já confirmada nesta máquina. Preencher nomes reais com valores inventados não é um tratamento adequado; aqui isso serve exclusivamente para demonstrar uma mudança controlada sobre dados sintéticos.

## Executar automaticamente no GitHub

Após publicar esta atualização, o workflow executa a etapa **Validar tratamento e reversão no laboratório sintético** nos bancos descartáveis PostgreSQL 14 e 16.

O teste:

1. Cria o schema exclusivo `ecidade_lab`; falha se ele já existir.
2. Coleta o diagnóstico inicial e verifica três violações.
3. Aplica `002_tratar.sql` e verifica zero violações.
4. Gera a comparação antes/depois.
5. Confirma que uma segunda aplicação é recusada sem perder a cópia original.
6. Simula uma edição posterior e verifica que a reversão é interrompida sem sobrescrevê-la.
7. Desfaz a edição simulada, reverte o tratamento e confere o conteúdo original, incluindo NULL e espaços.
8. Salva os relatórios de antes, depois, comparação e reversão.

Na página da execução concluída, baixe o artefato `laboratorio-postgres-14` ou `laboratorio-postgres-16`. Ele contém relatórios agregados e um `LEIA-ME.json` identificando a origem sintética. Os artefatos ficam disponíveis por 14 dias. Não use esse upload automático para relatórios de bases reais sem revisão.

## Executar localmente com Docker

Pré-requisitos: Docker Compose, Node.js 22+ e cliente `psql` no PATH do host. O Compose sobe somente o PostgreSQL; não instala Node ou psql no computador.

Na raiz do repositório:

```powershell
docker compose -p ecidade-laboratorio -f laboratorio/compose.yml up -d --wait
$env:PGHOST = 'localhost'
$env:PGPORT = '15432'
$env:PGDATABASE = 'ecidade_laboratorio'
$env:PGUSER = 'postgres'
$env:PGPASSWORD = 'senha_apenas_laboratorio'
$env:ECIDADE_TEST_DB = '1'
node --test testes/integracao/laboratorio.test.js
Remove-Item Env:PGPASSWORD
Remove-Item Env:ECIDADE_TEST_DB
```

A senha acima é pública e exclusiva do laboratório. A porta 15432 é vinculada apenas ao localhost. Se estiver ocupada, ajuste o Compose e PGPORT juntos.

O teste altera o banco de laboratório e aceita apenas PGDATABASE `ecidade_laboratorio` ou `ecidade_test`. Não aponte esses nomes para uma instância com dados de trabalho. Após a execução, o schema permanece com os dados originais restaurados, para inspeção. A cópia de reversão é removida apenas depois de restaurar os registros.

Para encerrar o container:

```powershell
docker compose -p ecidade-laboratorio -f laboratorio/compose.yml down
```

Não existe volume nomeado de persistência configurado para este laboratório. Não use o container para guardar dados importantes; recriar o ambiente não é um procedimento de backup. Para repetir o teste, use uma instância vazia: o script de preparação intencionalmente não apaga schemas existentes.

## Inspecionar ou executar por etapas

- `001_preparar.sql`: cria exclusivamente o cenário sintético.
- `002_tratar.sql`: verifica a identificação do laboratório, bloqueia concorrência durante a alteração, preserva os valores originais e aplica o tratamento em transação.
- `003_reverter.sql`: verifica conflitos com edições posteriores, restaura os valores e remove a cópia de reversão.
- `regras.json`: define a regra usada pela CLI de qualidade.

Os scripts devem ser executados com `psql -X -w -v ON_ERROR_STOP=1 -f CAMINHO` somente no banco de laboratório. Para diagnosticar em qualquer etapa:

```powershell
node src/qualidade-cli.js --config laboratorio/regras.json
```

Depois de uma aplicação bem-sucedida, reaplicar o tratamento falha enquanto a tabela `reversao_001` existir. Depois da reversão, é possível aplicar novamente. A reversão também falha quando a cópia não existe ou um registro tratado mudou ou foi removido. Esses erros são parte do contrato do exemplo; não foram escondidos para fazer os testes passarem.

## Demonstração em memória

Com Node.js 22+, rode `npm ci --ignore-scripts` na raiz e depois `npm run apresentar`. O PGlite executa os mesmos três scripts SQL em memória, confere a restauração exata e grava as comparações. [Roteiro de apresentação](../docs/APRESENTACAO.md)

## Estado de validação

Em 12/11/2026, a execução local em PGlite confirmou 3 violações antes, 0 depois e 3 após a reversão, com restauração exata das linhas. O cenário com `psql` e servidor PostgreSQL 14/16 segue no workflow do GitHub.
