# Migrações

Ainda não há migrações implementadas. O esquema e as regras precisam ser examinados antes de criar correções.

Quando houver um problema validado, criar `NNN_descricao.sql` e seu relatório a partir de `modelos/TRATAMENTO.md`.

Cada arquivo precisa informar propósito, versões suportadas, pré-condições, ordem de execução, comportamento na reexecução e teste associado. Utilizar transação quando a operação permitir; algumas operações exigem execução fora de uma transação e devem ser documentadas.

Executar primeiro em uma cópia de desenvolvimento e interromper ao primeiro erro. Não executar todos os arquivos desta pasta automaticamente sem conferir ordem, dependências e histórico de aplicação.
