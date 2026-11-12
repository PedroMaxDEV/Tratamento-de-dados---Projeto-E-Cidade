# Piloto de qualidade no Cadastro Geral do Município

O piloto aplica a ferramenta à tabela `protocolo.cgm` do e-Cidade. A estrutura foi conferida no dump distribuído com a revisão `e640eb485bf9a29f1fcda9c289c4ab23cffefe1d`. A definição traz `z01_numcgm integer NOT NULL` e `z01_nome character varying(40)`. A classe PHP chama esses campos de Numcgm e Nome/Razão Social e verifica o preenchimento do nome na inclusão. [Dump de referência](https://github.com/DBSeller/e-cidade/blob/e640eb485bf9a29f1fcda9c289c4ab23cffefe1d/ecidade/docker/ecidade_base.sql.gz) · [Classe PHP](https://github.com/DBSeller/e-cidade/blob/e640eb485bf9a29f1fcda9c289c4ab23cffefe1d/ecidade/classes/db_cgm_classe.php)

| Verificação | Interpretação |
| --- | --- |
| Nome/Razão Social preenchido | Conta nulos, texto vazio e texto composto só de espaços. A regra traduz o requisito de preenchimento para a auditoria. |
| Identificador presente | Confere a condição `NOT NULL` observada no dump de referência. |
| Identificador único | Confere a expectativa de que o número identifique um único cadastro. Conta excedentes por número repetido. |

Nomes iguais podem identificar pessoas diferentes. A verificação de unicidade usa somente o número do cadastro.

## Executar na cópia de desenvolvimento

Com uma base restaurada e acessível pelo `psql`, configure as variáveis PG* e a autenticação conforme o guia. Na raiz do kit, rode a ferramenta. [Configuração da conexão](FERRAMENTA_DIAGNOSTICO.md)

```powershell
node src/qualidade-cli.js --config config/qualidade.cgm.json
```

A saída em `resultados-locais/` contém as contagens das três verificações. As consultas usam uma transação de leitura e o relatório não lista nomes nem identificadores individuais. Se o objeto não existir ou a conta não tiver acesso, a execução retorna erro. Se a tabela estiver vazia, o resultado indica `empty`.

### Se o banco estiver acessível apenas dentro do Docker

Gere o SQL pelo kit e envie-o ao `psql` do contêiner. O exemplo usa o nome de contêiner e de banco do Compose original. Ajuste o usuário para a conta de leitura disponível no ambiente. Use um nome novo para o arquivo a cada exportação, pois a ferramenta preserva o arquivo anterior.

```powershell
New-Item -ItemType Directory -Force resultados-locais | Out-Null
node src/qualidade-cli.js --config config/qualidade.cgm.json --emit-sql resultados-locais/cgm-piloto.sql
if ($LASTEXITCODE -eq 0) {
    Get-Content -Raw resultados-locais/cgm-piloto.sql | docker exec -i ecidade_database psql -X -qAt -w -v ON_ERROR_STOP=1 -U usuario_leitura -d ecidade -f -
}
```

Esse caminho imprime as contagens em JSON no terminal. Para gerar Markdown automaticamente, use a CLI com uma conexão acessível pelo host.

## Critério de entrega

Guarde o relatório com a revisão e a origem da base de desenvolvimento, o total de cadastros visíveis e o resultado de cada regra. Confirme a interpretação com a equipe do cadastro. Se houver violações, investigue a origem e valide um tratamento com o grupo antes de preparar uma migração. Se todas as regras passarem, registre a evidência e escolha outra hipótese com o módulo.

A configuração foi exercitada com linhas fictícias em PostgreSQL em memória, usando os nomes e tipos do dump. A execução sobre os dados da aplicação e o teste de inclusão do CGM no fork da turma seguem pendentes.
