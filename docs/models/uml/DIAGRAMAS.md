# Diagramas de comportamento

## Máquina de estados da senha

```mermaid
stateDiagram-v2
  [*] --> EMITIDA
  EMITIDA --> AGUARDANDO: Entrada na fila
  AGUARDANDO --> CHAMADA: Próxima senha
  CHAMADA --> CHAMADA_NOVAMENTE: Segunda chamada
  CHAMADA --> EM_ATENDIMENTO: Cliente compareceu
  CHAMADA_NOVAMENTE --> EM_ATENDIMENTO: Cliente compareceu
  CHAMADA_NOVAMENTE --> NAO_COMPARECEU: Confirmar ausência
  EM_ATENDIMENTO --> ATENDIDA: Finalizar
  EMITIDA --> DESCARTADA: Encerrar expediente
  AGUARDANDO --> DESCARTADA: Encerrar expediente
  CHAMADA --> DESCARTADA: Encerrar expediente
  CHAMADA_NOVAMENTE --> DESCARTADA: Encerrar expediente
  ATENDIDA --> [*]
  NAO_COMPARECEU --> [*]
  DESCARTADA --> [*]
```

`DESCARTADA` é um estado administrativo adicional utilizado no fechamento do expediente.

## Sequência: atendimento com chamadas concorrentes

```mermaid
sequenceDiagram
    actor AA as Atendente
    participant React
    participant API as API Express
    participant MySQL
    AA->>React: Escolhe guichê e solicita próxima senha
    React->>API: POST /atendimento/proximo (Bearer)
    API->>MySQL: BEGIN + SELECT controle_fila FOR UPDATE
    MySQL-->>API: Trava exclusiva da fila
    API->>MySQL: Consulta senhas e regra de alternância
    API->>MySQL: Atualiza senha e registra evento
    API->>MySQL: COMMIT
    API-->>React: Senha e guichê atribuídos
    React-->>AA: Exibe senha atual
```

## Fluxo da operação

```mermaid
flowchart TD
  A[Atendente autenticado] --> B{Já possui senha ativa?}
  B -- Sim --> C[Continuar atendimento atual]
  B -- Não --> D[Solicitar próxima senha]
  D --> E{Há senha aguardando?}
  E -- Não --> F[Informar fila vazia]
  E -- Sim --> G[Chamar e atualizar painel]
  G --> H{Cliente compareceu?}
  H -- Sim --> I[Iniciar atendimento]
  I --> J[Finalizar atendimento]
  H -- Não --> K[Chamar novamente]
  K --> L{Compareceu após segunda chamada?}
  L -- Sim --> I
  L -- Não --> M[Registrar não comparecimento]
```
