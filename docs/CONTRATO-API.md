# Contrato da API — AV2

Base local: `http://localhost:3001/api`

A comunicação é HTTP com respostas JSON. As operações protegidas recebem o token no cabeçalho `Authorization: Bearer <token>`. O navegador não acessa o MySQL diretamente.

| Método | Caminho | Acesso | O que retorna |
|---|---|---|---|
| GET | `/health` | Público | `{ "status": "ok" }` (consulta o MySQL) |
| POST | `/auth/login` | Público | Token e usuário autenticado |
| GET | `/auth/me` | Autenticado | Usuário da sessão atual |
| POST | `/auth/logout` | Autenticado | HTTP 204 sem corpo |
| POST | `/senhas` | Público | Senha emitida no MySQL |
| GET | `/painel` | Público | Até 5 eventos recentes de chamada |
| GET | `/guiches` | Autenticado | Guichês ativos |
| GET | `/fila` | Autenticado | Até 100 senhas aguardando do dia |
| GET | `/atendimento/atual` | Autenticado | Senha atual do atendente ou `null` |
| POST | `/atendimento/proximo` | Autenticado | Próxima senha chamada |
| POST | `/senhas/:id/rechamar` | Autenticado | Senha com estado `CHAMADA_NOVAMENTE` |
| POST | `/senhas/:id/iniciar` | Autenticado | Senha com estado `EM_ATENDIMENTO` |
| POST | `/senhas/:id/finalizar` | Autenticado | Senha com estado `ATENDIDA` |
| POST | `/senhas/:id/ausente` | Autenticado | Senha com estado `NAO_COMPARECEU` |
| GET | `/relatorios?periodo=AAAA-MM` | Gestor | Resumo e histórico do período |
| GET | `/usuarios` | Gestor | Usuários cadastrados, sem hashes |
| POST | `/usuarios` | Gestor | Atendente criado |
| POST | `/guiches` | Gestor | Guichê criado |

## Exemplos de requisição e resposta

**Login** — `POST /api/auth/login`

```json
{ "email": "gestor@local.test", "senha": "SENHA_GERADA_LOCALMENTE" }
```

Resposta HTTP 200 (token ilustrativo, não válido):

```json
{
  "token": "TOKEN_DE_SESSAO_GERADO_PELO_SERVIDOR",
  "usuario": { "id": 1, "nome": "Gestor", "email": "gestor@local.test", "gestor": true }
}
```

**Restauração** — `GET /api/auth/me`, com `Authorization: Bearer <token>`:

```json
{ "usuario": { "id": 1, "nome": "Gestor", "email": "gestor@local.test", "gestor": 1 } }
```

**Emitir senha** — `POST /api/senhas`:

```json
{ "tipo": "SP" }
```

Resposta HTTP 201 (campos principais):

```json
{
  "id": 1,
  "numero": "261117-SP001",
  "tipo": "SP",
  "sequencia": 1,
  "estado": "AGUARDANDO",
  "atendente_id": null,
  "guiche_id": null
}
```

**Fila** — `GET /api/fila`:

```json
[
  { "id": 1, "numero": "261117-SP001", "tipo": "SP", "estado": "AGUARDANDO", "emitida_em": "2026-11-17T15:00:00.000Z" }
]
```

**Chamar próxima** — `POST /api/atendimento/proximo`:

```json
{ "guicheId": 1 }
```

Resposta HTTP 200: um registro de senha com `estado: "CHAMADA"`, `atendente_id` e `guiche_id` preenchidos.

**Criar atendente** — `POST /api/usuarios`:

```json
{ "nome": "Atendente", "email": "atendente@local.test", "senha": "SENHA_DEFINIDA_PELO_GESTOR" }
```

**Cadastrar guichê** — `POST /api/guiches`:

```json
{ "numero": 4 }
```

**Relatório** — `GET /api/relatorios?periodo=2026-11` retorna `periodo`, `resumo` (emitidas, atendidas, não compareceram, descartadas, tempo médio, agrupamento por tipo), `detalhado` e `auditoria`.

## Respostas de erro

A API devolve `{ "erro": "Mensagem" }` em erros. Os códigos principais são:

- **400** — valores ou JSON inválidos.
- **401** — token ausente, expirado ou inválido; credenciais incorretas.
- **403** — operação restrita ao gestor ou senha vinculada a outro atendente.
- **404** — guichê, senha ou fila inexistente.
- **409** — ação incompatível com o estado, horário encerrado, dados duplicados ou guichê ocupado.
- **413** — corpo acima do limite permitido.
- **503** — falha interna ou indisponibilidade do banco.

## Segurança e dados

- Senhas dos usuários são armazenadas com `scrypt` e salt aleatório.
- O token de sessão é aleatório e apenas seu hash SHA-256 fica no MySQL.
- A sessão expira após 8 horas ou no logout.
- Validação de acesso também é feita no servidor, não apenas nas rotas do React.
- `DEMO_MODE=true` desativa somente o bloqueio de horário para apresentação. Não desativa autenticação ou regras de estado.
- Em operação normal, a emissão e chamada são permitidas das 7h às 17h no horário de São Paulo.
