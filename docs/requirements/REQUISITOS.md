# Requisitos do sistema nassauTickets

Referência: documentos da disciplina *Sistema para controle de atendimento* e *Atividade — Sistema para controle de atendimento*.

## Atores

- **AC (cliente):** utiliza o totem anonimamente e acompanha chamadas no painel.
- **AA (atendente):** faz login, chama senhas e registra o atendimento no guichê.
- **Gestor:** perfil adicional de atendente que gerencia guichês, usuários e relatórios.
- **AS (sistema):** numera senhas, controla fila, atualiza painel e banco de dados.

## Requisitos funcionais

| ID | Requisito | Implementação |
|---|---|---|
| RF01 | Emitir SP, SG ou SE no totem, sem login | `POST /api/senhas` |
| RF02 | Numerar por `YYMMDD-PPSQ`, reiniciando diariamente por tipo | `ticketNumber` e `sequencias` |
| RF03 | Escolher próxima senha com prioridade e alternância | `priorityOrder` e `callNext` |
| RF04 | Permitir chamada por qualquer guichê disponível | `POST /api/atendimento/proximo` |
| RF05 | Permitir segunda chamada e registrar ausência | `POST /api/senhas/:id/rechamar` e `/ausente` |
| RF06 | Iniciar e finalizar atendimento | `POST /api/senhas/:id/iniciar` e `/finalizar` |
| RF07 | Exibir cinco últimas chamadas sem antecipar próximas | `GET /api/painel` |
| RF08 | Oferecer áudio de chamada | `Panel.jsx` (síntese de voz do navegador) |
| RF09 | Autenticar atendentes, restaurar e encerrar sessão | rotas `/auth` e `AuthContext` |
| RF10 | Exigir perfil gestor para cadastros e relatórios | middleware `manager` |
| RF11 | Cadastrar atendentes e guichês | `POST /api/usuarios` e `/api/guiches` |
| RF12 | Consultar fila de espera e senha ativa | `GET /api/fila` e `/api/atendimento/atual` |
| RF13 | Relatórios diários e mensais, inclusive detalhamento/auditoria | `GET /api/relatorios` |
| RF14 | Registrar horários e transições de estado | tabelas `senhas` e `eventos` |
| RF15 | Encerrar fila e descartar pendências às 17h | serviço `expireQueue` |
| RF16 | Informar falha, vazio, carregamento e permitir nova tentativa | front-end e camada de serviços |

## Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Expediente normal das 7h às 17h, horário local do laboratório. |
| RN02 | SP é prioritária. Quando SP, SE e SG aguardam, o ciclo é SP → SE → SP → SG. |
| RN03 | Se não houver senhas de determinado tipo, a fila continua com os tipos disponíveis. Cada tipo segue sua ordem de emissão. |
| RN04 | Qualquer guichê ativo atende qualquer tipo de senha. Um guichê/atendente não pode assumir dois atendimentos ativos. |
| RN05 | Numerar `YYMMDD-PPSQ`, com sequência 001 a 999 e reinício por dia e tipo. |
| RN06 | Atendente pode iniciar após a primeira chamada; se o cliente não comparecer após a segunda, confirma a ausência. |
| RN07 | Ao final do expediente, descartar senhas pendentes e permitir a finalização de serviços já iniciados. |
| RN08 | O painel mostra as últimas cinco chamadas, nunca uma previsão de próxima senha. |
| RN09 | Apenas um atendente tem perfil adicional de gestor. |
| RN10 | A observação histórica de ~5% de não comparecimento não justifica descarte aleatório de pacientes reais. |
| RN11 | Referência de tempo médio: SP 15 minutos (±5), SG 5 minutos (±3), SE geralmente inferior a 2 minutos; o relatório apura o tempo real. |

`DEMO_MODE=true` desativa a restrição de horário apenas para uma apresentação fora do expediente, devendo ser identificado como demonstração. A ausência é confirmada pelo atendente, pois o software não tem meio automático de verificar se um paciente chegou ao guichê.

## Requisitos não funcionais

| ID | Aspecto | Requisito |
|---|---|---|
| RNF01 | Segurança | Armazenar senhas com hash e proteger operações com sessão autenticada. |
| RNF02 | Autorização | Responder 401/403 para sessões inválidas e perfis insuficientes. |
| RNF03 | Concorrência | Transações de fila com bloqueio de linha para evitar atribuição duplicada. |
| RNF04 | Auditoria | Registrar usuário, guichê, senha e horários das ações. |
| RNF05 | Disponibilidade | Informar indisponibilidade da API/BD e oferecer tentativa de recuperação. |
| RNF06 | Integridade | Manter estados consistentes e não simular persistência com dados locais. |
| RNF07 | Acessibilidade | Formulários rotulados, leitura por teclado e avisos via `role=status`/`role=alert`. |
| RNF08 | LGPD | Não coletar dados clínicos do paciente sem necessidade; limitar acesso e retenção. |
| RNF09 | Desempenho | Consultas indexadas para fila, histórico e sessão. |
| RNF10 | Portabilidade | Executar com React 19, Node.js 22, Express e MySQL 8. |

## Verificações para apresentação

1. Gerar SP, SE, SG e comprovar sequência alternada, sem deixar SG sem vez.
2. Fazer dois atendentes chamarem ao mesmo tempo e conferir que não recebem a mesma senha.
3. Demonstrar a restrição horária com `DEMO_MODE=false`.
4. Exibir relatórios completos, com duração real e trilha de auditoria.
5. Simular parada da API e mostrar aviso e demonstração de contingência.

O aplicativo não simula duração de atendimento; o TM é calculado pelos horários efetivamente registrados.
