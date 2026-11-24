# Modelo entidade-relacionamento

O script executável está em [`schema.sql`](schema.sql). As entidades abaixo representam as tabelas existentes no MySQL.

```mermaid
erDiagram
    USUARIOS ||--o{ SESSOES : possui
    USUARIOS |o--o{ SENHAS : atende
    USUARIOS |o--o{ EVENTOS : registra
    GUICHES |o--o{ SENHAS : atende
    SENHAS ||--o{ EVENTOS : gera
    USUARIOS {
        int id PK
        varchar nome
        varchar email UK
        varchar senha_hash
        tinyint gestor
        tinyint ativo
    }
    GUICHES {
        int id PK
        smallint numero UK
        tinyint ativo
    }
    SENHAS {
        int id PK
        char numero UK
        date data_operacao
        enum tipo
        smallint sequencia
        enum estado
        int atendente_id FK
        int guiche_id FK
        datetime emitida_em
        datetime primeira_chamada_em
        datetime segunda_chamada_em
        datetime inicio_em
        datetime fim_em
    }
    EVENTOS {
        int id PK
        int senha_id FK
        enum estado
        int usuario_id FK
        datetime ocorrido_em
    }
    SESSOES {
        char token_hash PK
        int usuario_id FK
        datetime expira_em
    }
    SEQUENCIAS {
        date data_operacao PK
        enum tipo PK
        smallint valor
    }
    ALTERNANCIA {
        date data_operacao PK
        enum ultimo_tipo
    }
    CONTROLE_FILA {
        tinyint id PK
    }
```

`sequencias` permite reiniciar a numeração diariamente por tipo de senha. `alternancia` registra a última prioridade chamada. `controle_fila` possui uma única linha usada para serializar as operações concorrentes de emissão/chamada. O histórico de estados fica em `eventos`.

O tipo do último atendimento não prioritário é apurado a partir de `senhas` no momento da escolha, garantindo oportunidades para SG e SE sem mudar a estrutura já instalada.
