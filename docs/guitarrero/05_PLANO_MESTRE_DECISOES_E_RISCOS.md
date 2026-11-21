# 05 — Plano Mestre, Decisões e Riscos do Guitarrero

Registro oficial do projeto. Atualizado pelo Claude a cada entrega. Última atualização: 21/11/2026.

## 1. Painel de status

| Campo | Valor |
|---|---|
| Etapa atual | Etapa 3 — Setup do repositório (aguardando a preparação do PC) |
| Último portão aprovado | G0 — Configuração concluída (21/11) |
| Bloqueio | Nenhuma decisão pendente. Falta 1 ação do Link: instalar os pré-requisitos do 06 (Parte A) |
| Próximo passo | Link: a ação acima e mandar o print das verificações. Depois: prompt da Etapa 3 no Claude Code (doc 06, Parte C) |

## 2. Roadmap com portões

| Etapa | Entrega | Pronto quando (portão) | Esforço relativo |
|---|---|---|---|
| 0 Configuração | Instruções, Contexto, Memória, documentos 00–06 | G0: instruções coladas, decisões respondidas, 05 atualizado | P |
| 3 Setup do repositório | Tauri + React + TS strict, lint, testes, CI Windows, árvore de pastas com núcleo e 2 módulos | G1: pnpm lint, typecheck e test verdes; janela "Guitarrero" abre vazia no PC do Link | M |
| 4.1 Timbre · Fatia 1 | Bancada segura e controle duplo (US-01, US-03, US-06) | G2: abre em Standby; atalhos funcionam; knob e barra sincronizados; slots sobrevivem a reiniciar; Delta mostra mudanças; importa backup V5 e V7_5 | G |
| 4.2 Timbre · Fatia 2 | Console, gêneros, simulador (US-02, US-05) | G3: 25 gêneros resolvem; URLs reais de Songsterr/YouTube reconhecidas; T60 de E2 e E4 conferidos; teste na bancada | G |
| 4.3 Timbre · Fatia 3 | Cabine de calibração (US-04) | G4: Goertzel validado com senoides puras; matchScore calculado; frases com negação interpretadas certo; teste com amostra real | G |
| 5 TAB · Especificação | Etapa 1 e 2 do Módulo TAB (escopo, contratos, wireframes) | G5: documento aprovado pelo Link | M |
| 6 TAB · Código | Fatias do Módulo TAB | G6: critérios do documento da Etapa 5 + testes de altura e de jogabilidade (doc 02, seção 5) | G |
| 7 Integração | Música em estudo compartilhada entre os módulos | G7: escolher a música no TAB preenche o Timbre sem copiar texto | P |
| v1.0 | Instalador .msi/.exe | Instala e roda offline no PC do Link | P |

P = pequeno (1 sessão), M = médio (2 a 3 sessões), G = grande (4 ou mais sessões). Não há datas fixas: o ritmo é o do Link, e o portão só abre com aprovação dele.

### Definição de Pronto (vale para toda entrega de código)
1. Lint, typecheck e testes passam no CI.
2. Nenhum teste que passava antes passou a falhar.
3. Toda fórmula nova tem teste com valor de referência.
4. O Link testou e aprovou o que é audível ou visível.
5. Este documento foi atualizado.

### Definição de Pronto para começar (antes de abrir uma etapa)
1. O portão anterior está aprovado.
2. As decisões que a etapa exige estão respondidas.
3. O prompt para o Claude Code está escrito e revisado.

## 3. Registro de decisões

### 3.1 Decisões novas do Guitarrero (21/11/2026)

| ID | Decisão | Recomendação do Claude | Motivo | Status |
|---|---|---|---|---|
| G-01 | Juntar Timbrador e TAB Simplifier num app só, com núcleo compartilhado | Sim | Os dois repetem afinações, síntese, links e persistência; juntos, a música em estudo passa de um módulo ao outro sem copiar texto | Aprovada pelo Link (21/11: "duas funções principais" no mesmo software) |
| G-02 | Nome do repositório | Renomear "Timbrador-Profissional" para "Guitarrero" no GitHub | O repositório ainda não tem código; o GitHub redireciona o nome antigo, então nada quebra | Aprovada pelo Link (21/11) |
| G-03 | Ordem dos módulos | Timbre primeiro, TAB depois | A especificação do Timbre já está pronta (Etapa 2); a do TAB ainda não existe | Aprovada pelo Link (21/11) |
| G-04 | Plataforma da v1.0 | Só Windows | O Link usa Windows; tirar o macOS corta pela metade o trabalho de empacotamento e de CI | Aprovada pelo Link (21/11) |
| G-05 | Gemini fora do projeto; Claude faz gestão e código | Sim | Pedido do Link em 21/11; elimina retrabalho de cópia entre IAs | Aprovada pelo Link |
| G-06 | Significado de "IA" na v1.0 | Motores determinísticos locais; modelo de linguagem só na v2.0, se aprovado | Mantém o princípio da Etapa 1: offline, sem chave de API, sem custo mensal | Proposta |
| G-07 | Meta de fidelidade de timbre | matchScore ≥ 90, medido e exibido | "90%" passa a ser um número verificável, não uma promessa | Proposta |

### 3.2 Pendências herdadas da Etapa 2 (seção 5.3)

| ID | Decisão | Recomendação | Status |
|---|---|---|---|
| D-01 | Gate real do Ammoon na Fatia 2 (Fatia 1 mantém o comportamento do protótipo) | Sim | Aprovada pelo Link (21/11) |
| D-02 | Agudo da BOMGE em 7.500 Hz e correção da Etapa 1 | Sim | Aprovada pelo Link (21/11) |
| D-04 | Renomear para "Sonda espectral de 5 pontos" | Sim | Aprovada pelo Link (21/11) |
| D-05 | Escore A/B calculado: matchScore = 100 − média(abs(alvo − real)) × 10 | Sim | Aprovada pelo Link (21/11) |
| ADR-001 | zod e zustand como dependências | Sim | Aprovada pelo Link (21/11) |
| ADR-003 | JSON em arquivos na v1.0; SQLite na v2.0 | Sim | Aprovada pelo Link (21/11) |
| D-03 | Impedâncias e +4 dBu sem uso no DSP até conferir nos manuais | Manter como está | Registrada |
| D-06 | FX600: 6 algoritmos + OFF; PIT aproximado por filtro em 520 Hz | Manter como está | Registrada |
| D-07 | Constantes do código incluídas nos contratos | Manter como está | Registrada |
| D-08 | Importador aceita backups antigos e migra para o formato novo | Ampliar: aceitar TONELAB_V5_0, TONELAB_V7_5 e projetos do TAB (tab_simplifier_pro_yousician_v4) | Proposta (ampliação de 21/11) |

## 4. Matriz de riscos

| Risco | Probabilidade | Impacto | Ação |
|---|---|---|---|
| Escopo crescer antes da v1.0 (dois módulos, IA, publicação) | Alta | Atraso indefinido | Portões por etapa; tudo que não é da etapa vai para o backlog abaixo |
| Regressão ao migrar fórmulas do protótipo | Média | Timbre diferente do aprovado | Tabela de conversões de referência (Etapa 2, seção 3.10) vira teste automático na Fatia 1 |
| Instalação no Windows falhar (Rust, WebView2, build) | Média | Etapa 3 parada | Lista de pré-requisitos com verificação de cada um (doc 06); o CI gera o instalador mesmo se o PC falhar |
| Fidelidade abaixo de 90 por limite do equipamento | Média | Expectativa frustrada | Mostrar o número real e o equipamento que limita; a meta é validada, não prometida |
| Tom detectado errado no TAB (T-01) | Alta | Dossiê e pacote ao Timbre errados | Corrigir com perfis de tonalidade na Etapa 6, com teste |
| Perder contexto entre sessões | Média | Retrabalho | Este documento + Memória do Projeto + CLAUDE.md no repositório |

## 5. Backlog fora da v1.0

- Integração com modelo de linguagem (G-06).
- Gravação multipista via ASIO da M-Track Solo; Flamma FS02 na cadeia; relatórios em PDF; histórico ilimitado em SQLite (backlog v2.0 da Etapa 1).
- Versão macOS.
- Publicação (gratuita ou paga), conta de usuário, ficha de equipamento de outros músicos.

## 6. Histórico

- 15/11/2026 — Ponte Claude + Gemini criada.
- 17/11/2026 — Etapa 1 do Timbrador aprovada; Etapa 2 entregue com 6 pendências.
- 20/11/2026 — Teste do Flamma Reverb na bancada com sucesso.
- 21/11/2026 — Gemini sai do projeto (G-05). Produto passa a se chamar Guitarrero e une os dois apps. Claude assume a gestão. Documentos 00 a 06 criados. Confirmado que D-01, D-02, D-04 e D-05 seguem presentes no Tone Lab v7.5.
- 21/11/2026 — Link aprova G-02, G-03, G-04 e as 6 pendências da Etapa 2. Com D-02 aprovada, o agudo da BOMGE passa a 7.500 Hz (a Etapa 1 original fica como registro histórico). Gravação direta no GitHub recusada (o Claude não tem acesso de escrita à conta Linkozitos); arquivos entregues no pacote Guitarrero_pacote_inicial_repositorio.zip.
- 21/11/2026 — Repositório renomeado para Guitarrero; app do Claude instalado no GitHub só para esse repositório; CLAUDE.md, docs e protótipos gravados na branch main (PR #1). O zip passa a ser só uma cópia de reserva.
- 21/11/2026 — Instruções coladas e salvas pelo Claude no Projeto Guitarrero. Portão G0 concluído: Instruções, Contexto (5 arquivos), Memória e GitHub configurados.
