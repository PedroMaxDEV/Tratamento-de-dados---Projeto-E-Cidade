# Demonstração da equipe de dados

## O que já foi entregue

| Parte do projeto | Situação |
| --- | --- |
| Inventário do PostgreSQL | Código que lista tabelas, colunas, restrições e índices e gera relatórios. |
| Diagnóstico de qualidade | Regras configuráveis para campos ausentes, duplicidades e referências sem correspondência. |
| Evidência antes e depois | Comparação por regra, com sinalização quando o volume ou a regra muda. |
| Tratamento e reversão | Executados localmente em PostgreSQL em memória com cinco registros fictícios. |
| Validação no banco do e-Cidade | Pendente de restaurar uma cópia de desenvolvimento e escolher uma regra do módulo piloto. |
| Integração com PHP e Laravel | Pendente de executar a ferramenta no fork da turma e validar um fluxo do módulo escolhido. |

## Demonstração em três minutos

Antes da aula, na raiz deste repositório, execute `npm ci --ignore-scripts` para instalar a dependência de desenvolvimento. Durante a aula, execute:

```powershell
npm run apresentar
```

1. **Objetivo.** “A nossa parte verifica a qualidade dos dados e mede o efeito de uma correção antes de integrá-la ao sistema.”
2. **Execução.** “O laboratório começa com cinco registros fictícios, três com nome ausente. Os scripts SQL aplicam uma correção didática, e a mesma regra passa a apontar zero problemas. A reversão restaura os valores originais, incluindo `NULL`, texto vazio e espaços.”
3. **Evidência.** Abra `comparacao.md` na pasta indicada como relatório do tratamento. Mostre a contagem **3 → 0** com as mesmas cinco linhas. O terminal e o segundo relatório mostram a reversão **0 → 3**.
4. **Integração.** “Vamos levar a ferramenta como utilitário do repositório final. O próximo marco é executar o inventário na cópia de desenvolvimento do e-Cidade, escolher uma regra real e validar o fluxo correspondente com PHP e Laravel.”

Os resultados acima foram medidos em 12/11/2026 no motor PostgreSQL em memória do PGlite. A execução local verificou a restauração de cada linha e a suíte de 26 testes passou. A regra e o tratamento exibidos usam o esquema `ecidade_lab`, criado para a apresentação. No banco da aplicação, os objetos e as regras precisam ser confirmados com a equipe.

## Como incorporar no projeto final

| Arquivos | Destino sugerido |
| --- | --- |
| `src/`, `sql/diagnostico/`, `config/` e os guias de diagnóstico | Copiar para `contrib/academico/banco/` no fork final, mantendo a estrutura relativa. As CLIs operam separadamente via Node.js e `psql`. |
| `laboratorio/` e seus testes | Manter como demonstração separada. Os scripts escrevem no esquema sintético `ecidade_lab`. |
| Futuras correções confirmadas | Integrar pela sequência de migrações escolhida pela turma, com validação, reversão e teste do fluxo da aplicação. |

Façam a cópia em uma branch do fork final e abram o pull request nesse mesmo fork. O guia de integração explica a divisão entre as equipes. [Integração com PHP e Laravel](INTEGRACAO.md)

## Próximo marco com o e-Cidade

O módulo piloto já tem uma configuração de qualidade para a tabela `protocolo.cgm`, baseada no dump de referência e na classe de cadastro. Na apresentação, mostre esse arquivo depois da demonstração para explicar como a mesma ferramenta vai ser usada no e-Cidade. [Piloto CGM e comandos para rodar](PILOTO_CGM.md)

Na revisão `e640eb485bf9a29f1fcda9c289c4ab23cffefe1d` do repositório original, o Dockerfile usa PostgreSQL 16 e o Compose configura a inicialização com LATIN1 e locale brasileiro. Confirmem a versão e a codificação **da base restaurada** com `sql/diagnostico/001_inventario.sql` antes de definir regras ou propor mudanças. [Dockerfile da revisão](https://github.com/DBSeller/e-cidade/blob/e640eb485bf9a29f1fcda9c289c4ab23cffefe1d/docker/database/Dockerfile) · [Compose da revisão](https://github.com/DBSeller/e-cidade/blob/e640eb485bf9a29f1fcda9c289c4ab23cffefe1d/docker-compose.yml)

O próximo marco estará pronto quando o grupo tiver um relatório da base de desenvolvimento, uma regra de negócio confirmada e um teste do fluxo da aplicação que usa os dados analisados. Se a regra apontar violações, documentem a contagem, a correção proposta e a reversão antes de enviar o pull request.
