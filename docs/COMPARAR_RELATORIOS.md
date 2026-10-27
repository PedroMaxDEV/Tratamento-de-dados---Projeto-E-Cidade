# Comparar qualidade antes e depois

A versão 0.3.0 compara dois arquivos `qualidade.json` gerados pela ferramenta. Não conecta ao banco e não altera os arquivos de origem.

## Demonstração

```powershell
node src/comparacao-cli.js --demo
```

Resultado sintético esperado: duas regras com redução (uma delas zerou), uma com aumento e uma sem mudança. Os arquivos `comparacao.md` e `comparacao.json` são gravados em uma pasta exclusiva dentro de `resultados-locais/`.

## Uso com coletas reais

1. Execute as regras de qualidade antes do tratamento e preserve a pasta gerada.
2. Aplique somente o tratamento previamente validado pela equipe, na base de desenvolvimento.
3. Execute novamente as mesmas regras, com o mesmo usuário e escopo.
4. Substitua os caminhos abaixo pelos relatórios gerados:

```powershell
node src/comparacao-cli.js --antes resultados-locais/coleta-antes/qualidade.json --depois resultados-locais/coleta-depois/qualidade.json
```

Os caminhos são exemplos; use os nomes de pasta mostrados pela ferramenta de qualidade. `--out PASTA` muda a pasta de saída. Os relatórios reais exigem revisão antes da publicação.

## Interpretação

| Estado no JSON | Significado |
| --- | --- |
| resolved | Contagem passou de positiva para zero, com mesmo total não vazio |
| improved | Contagem diminuiu, mas continua positiva, com mesmo total |
| worsened | Contagem aumentou, com mesmo total |
| unchanged | Contagem e total permaneceram iguais |
| volume_changed | Total de linhas mudou; revisar antes de concluir melhora ou piora |
| empty | Uma das coletas tem tabela vazia; resultado inconclusivo |
| rule_changed | Mesmo identificador com definição diferente |
| added / removed | Regra presente somente em um dos relatórios |

A diferença exibida é a contagem depois menos a contagem antes, sem perda de precisão para números grandes. Não são calculadas diferenças entre regras com definições distintas.

## Validação e limites

A ferramenta valida configuração, contagens, ordem das regras, hash do SQL e datas. Recusa comparar uma demonstração com coleta real e recusa um relatório posterior com data anterior à primeira coleta. Recalcula os estados dos resultados, em vez de confiar nos campos de resumo salvos.

Confirme manualmente a origem dos relatórios: o formato atual não registra identidade comprovável da instância, usuário ou conjunto de dados. Até com o mesmo total de linhas os registros podem ser diferentes. Uma redução numérica não comprova causalidade do tratamento nem certifica a qualidade do banco inteiro. O hash não autentica o arquivo.

## Códigos de saída

- 0: comparação gerada ou ajuda exibida.
- 1: erro de argumentos, arquivo, validação ou gravação.
- 2: aumento em regra comparável quando utilizada a opção `--fail-on-regression`.

Resultados inconclusivos não acionam código 2 e precisam de revisão humana. Exemplo para automatizar a sinalização de aumento:

```powershell
node src/comparacao-cli.js --antes antes.json --depois depois.json --fail-on-regression
```

## Testes

```powershell
node --test testes/diagnostico.test.js testes/qualidade.test.js testes/comparacao.test.js
```

Nesta entrega, os 26 testes locais passaram. Sete testes novos cobrem classificação, mudanças de escopo, dados inválidos, precisão numérica, preservação de arquivos e execução da CLI.
