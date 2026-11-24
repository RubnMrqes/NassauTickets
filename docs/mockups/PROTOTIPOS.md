# Protótipos das telas

Os modelos abaixo representam a organização das páginas existentes em `frontend/src/`. Os protótipos são simplificados; os componentes React são as versões funcionais.

## Totem — `/totem`

```text
┌──────────────────────────────────────────────┐
│ NASSAU TICKETS           TOTEM / PAINEL     │
├──────────────────────────────────────────────┤
│                 RETIRAR SENHA                │
│                                              │
│   [ PRIORITÁRIA ]   [ GERAL ]   [ EXAMES ]   │
│                                              │
│              Sua senha: 261124-SP001        │
│              Aguarde a chamada.              │
└──────────────────────────────────────────────┘
```

## Painel público — `/painel`

```text
┌──────────────────────────────────────────────┐
│            PAINEL DE CHAMADAS                │
│        [Ativar áudio] [Atualizar]            │
├──────────────────────────────────────────────┤
│  261124-SP001               GUICHÊ 01       │
│  261124-SE001               GUICHÊ 02       │
│  261124-SG001               GUICHÊ 03       │
│  ... até cinco chamadas                      │
└──────────────────────────────────────────────┘
```

## Área do atendente — `/atendimento`

```text
┌──────────────────────────────────────────────┐
│              CONTROLE DO GUICHÊ              │
├──────────────────────┬───────────────────────┤
│ Guichê [ 01 ▼ ]      │ Fila de espera        │
│ Senha: 261124-SP001  │ 261124-SE002          │
│                      │ 261124-SG003          │
│ [Chamar próxima]     │ ...                   │
│ [Chamar novamente]   │                       │
│ [Iniciar] [Finalizar] │                       │
│ [Registrar ausência] │                       │
└──────────────────────┴───────────────────────┘
```

## Gestão — `/gestao`

Cadastro de atendentes e guichês, escolha de período e tabelas de indicadores, senhas detalhadas e trilha de auditoria. O acesso exige perfil de gestor.
