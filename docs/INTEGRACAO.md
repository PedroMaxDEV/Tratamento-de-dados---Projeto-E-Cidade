# Integração com PHP e Laravel

## Fluxo recomendado

Criar um fork compartilhado do e-Cidade para a turma. As três equipes trabalham em branches derivadas do mesmo commit: por exemplo, `equipe/banco`, `equipe/php` e `equipe/laravel`. Cada entrega pequena entra por pull request na branch de integração definida pelo grupo.

Também é possível cada equipe ter seu próprio fork, desde que preserve a origem e o histórico em comum. Um repositório independente contendo somente scripts pode funcionar como ferramenta auxiliar, mas não se une automaticamente ao sistema por um merge simples de históricos sem relação.

Esta pasta é um kit independente. Para integrá-lo, copiar os arquivos para uma pasta acordada no fork compartilhado, por exemplo `contrib/academico/banco/`, e abrir um pull request a partir de uma branch desse fork. Ajustar os caminhos dos comandos depois da cópia. Não substituir o README principal do e-Cidade pelo README deste kit.

## Acordos antes de alterar o banco

- Versão atual e versão alvo do PostgreSQL, com teste de compatibilidade.
- Codificação e configuração regional do banco e das conexões.
- Responsável pelo esquema compartilhado e pelo mecanismo de migrações.
- Contrato das tabelas utilizadas por mais de uma equipe: nomes, tipos, chaves e nulabilidade.
- Ordem de execução das migrações e compatibilidade com o código existente.
- Base sintética comum para testar os mesmos fluxos.

Não manter duas migrações diferentes para a mesma alteração, uma SQL e outra Laravel, sem definir qual será executada. A integração deve ter uma única sequência de mudanças do esquema.

## Checklist do pull request

- Descreve o problema e inclui evidência reproduzível.
- Documenta a versão e as pré-condições necessárias.
- Informa impacto em consultas PHP e modelos Laravel.
- Foi executado primeiro em uma cópia de desenvolvimento.
- Inclui validação antes/depois e estratégia de reversão testada.
- Não contém dados reais nem credenciais.
- Foi revisado por alguém da equipe e, quando necessário, pelas frentes afetadas.
