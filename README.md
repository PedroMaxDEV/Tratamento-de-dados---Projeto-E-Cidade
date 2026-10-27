# e-Cidade — Tratamento do Banco de Dados

Projeto acadêmico de Engenharia de Software — T01, 2026.2.

Objetivo da equipe: diagnosticar a base PostgreSQL do e-Cidade, propor tratamentos fundamentados e entregar alterações reproduzíveis que possam ser integradas às frentes de atualização do PHP e migração para Laravel.

## Estado desta entrega

Já existe uma ferramenta executável de diagnóstico em Node.js, com geração de relatórios JSON/Markdown, modo demonstrativo e testes automatizados. Nenhuma base real foi restaurada ou alterada. A coleta SQL ainda precisa ser validada na cópia de desenvolvimento do e-Cidade.

## Executar o código agora

Com Node.js 22 ou superior, na pasta do projeto:

```powershell
node src/cli.js --demo
node --test testes/diagnostico.test.js
```

Não é necessário instalar pacotes. O primeiro comando gera relatórios com **metadados sintéticos**, em uma subpasta exclusiva de `resultados-locais/`. O segundo executa os testes automatizados.

Para conectar a uma base PostgreSQL, siga [o guia da ferramenta](docs/FERRAMENTA_DIAGNOSTICO.md). Ela consulta metadados em transação somente leitura e não executa correções.

- [Plano de trabalho e critérios de aceite](docs/PLANO.md)
- [Integração das três equipes](docs/INTEGRACAO.md)
- [Diagnóstico inicial e evidências](docs/DIAGNOSTICO.md)
- [Inventário SQL somente leitura](sql/diagnostico/001_inventario.sql)
- [Como publicar cada atualização no GitHub](docs/PUBLICAR_NO_GITHUB.md)
- [Registro de atualizações](CHANGELOG.md)
- [Ambiente e versão de referência](docs/AMBIENTE.md)
- [Dicionário de dados para preencher](docs/DICIONARIO_DE_DADOS.md)
- [Regras para contribuir](CONTRIBUTING.md)
- [Título e descrição desta atualização](updates/002-diagnostico.md)

## Comece por aqui

Esta pasta pode ser publicada como o repositório auxiliar da equipe. A segunda entrega acrescenta o diagnóstico executável; não representa uma correção aplicada ao e-Cidade.

Leia `docs/PUBLICAR_NO_GITHUB.md` para fazer o primeiro envio e os próximos commits. Depois, preencha `docs/AMBIENTE.md`, escolha o módulo piloto e execute o diagnóstico em uma base de desenvolvimento.

```text
.github/              Modelos de issues e pull requests
src/                  Ferramenta executável de diagnóstico
docs/                 Plano, ambiente, dicionário e integração
modelos/              Fichas para documentar cada tratamento
relatorios/           Evidências revisadas, sem dados pessoais
sql/diagnostico/      Consultas de inspeção
sql/migracoes/        Futuras alterações versionadas
sql/reversao/         Futuros procedimentos de reversão
testes/               Critérios e casos de teste
updates/              Título e descrição de cada atualização
CHANGELOG.md          Histórico das entregas
```

## Primeira execução

1. As equipes escolhem juntas a mesma revisão do e-Cidade e registram o hash do commit.
2. Restauram uma base autorizada em ambiente de desenvolvimento e registram o procedimento e as versões.
3. Executam o inventário usando o cliente `psql` e uma conta com acesso de leitura ao catálogo e ao esquema estudado:

```sh
psql -X -h localhost -p 5432 -U SEU_USUARIO -d SEU_BANCO -v ON_ERROR_STOP=1 -f sql/diagnostico/001_inventario.sql -o inventario-local.txt
```

O endereço e a porta dependem do ambiente. O Compose consultado não publica a porta do PostgreSQL no host; nesse caso, execute o cliente dentro da rede Docker ou ajuste o ambiente local em acordo com as equipes. O comando acima pressupõe um PostgreSQL acessível pelo host. Não inclua senha na linha de comando.

4. Preenchem o diagnóstico e escolhem um módulo pequeno para a primeira melhoria.
5. Para cada alteração, entregam evidências antes/depois, teste e procedimento de reversão.

## Organização

`sql/diagnostico/` contém consultas de inspeção. As pastas `sql/migracoes/` e `sql/reversao/` estão preparadas com instruções; ainda não contêm correções executáveis. Não adicionar scripts de atualização sem conhecer o esquema e a regra de negócio.

Não versionar dumps, credenciais nem dados pessoais. Para demonstrações, usar dados sintéticos. Resultados locais devem ser revisados antes de entrar em um relatório público.

Fonte do sistema: https://github.com/DBSeller/e-cidade
