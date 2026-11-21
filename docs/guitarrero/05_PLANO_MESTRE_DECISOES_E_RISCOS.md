# 05 — Plano Mestre, Decisões e Riscos do Guitarrero

Registro oficial do projeto. Atualizado pelo Claude a cada entrega. Última atualização: 21/11/2026.

## 1. Painel de status

| Campo | Valor |
|---|---|
| Etapa atual | Etapa 4.1A — Timbre · Fatia 1, parte A (motor da bancada, sem telas): prompt pronto, aguardando o Link colar no Claude Code |
| Último portão aprovado | G1 — Base do aplicativo aprovada pelo Link (21/11) |
| Bloqueio | Nenhum |
| Próximo passo | Link: colar o prompt da Etapa 4.1A no Claude Code (texto completo na conversa do Projeto e em F:\Claude Code\Guitarreiro\_instalacao\PROMPT_ETAPA_4_1A.txt). Claude: quando o Link avisar, revisar o relatório e o CI, incorporar a branch etapa-4-1a-motor e escrever o prompt da 4.1B |

## 2. Roadmap com portões

| Etapa | Entrega | Pronto quando (portão) | Esforço relativo |
|---|---|---|---|
| 0 Configuração | Instruções, Contexto, Memória, documentos 00–06 | G0: instruções coladas, decisões respondidas, 05 atualizado | P |
| 3 Setup do repositório | Tauri + React + TS strict, lint, testes, CI Windows, árvore de pastas com núcleo e 2 módulos | G1: pnpm lint, typecheck e test verdes; janela "Guitarrero" abre vazia no PC do Link | M |
| 4.1A Timbre · Fatia 1, parte A | Motor da bancada, sem telas: contratos, catálogos, presets, DSP puro, Delta, gravação segura, slots, backup (V5 e V7_5) e estado; janela maximizada e escura; ferramenta check:window | Revisão do gestor: pnpm verify e CI verdes; paridade com o protótipo medida e registrada; check:window sem erros | M |
| 4.1B Timbre · Fatia 1, parte B | Bancada segura e controle duplo na tela e no som (US-01, US-03, US-06): shell, Bloco 2, Blocos 9 e 10, AudioEngine e diapasão | G2: abre em Standby; atalhos funcionam; knob e barra sincronizados; slots sobrevivem a reiniciar; Delta mostra mudanças; importa backup V5 e V7_5 | M |
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
| G-08 | Pasta oficial do software no PC | F:\Claude Code\Guitarreiro, como clone do repositório Guitarrero | Pedido do Link: tudo o que for criado para o software fica num lugar só; documentos de gestão seguem também no Projeto e no Drive | Aprovada pelo Link (21/11) |
| G-09 | Regra 0 | 100% eficiência, 0% esforço para o Link: todo comando ou prompt vem completo na mensagem, com o caminho exato de onde usar; o resto é automatizado | Regra fundamental definida pelo Link para tudo o que for criado ou feito | Aprovada pelo Link (21/11) |

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
| ADR-006 | Camadas por módulo: core puro compartilhado; audio, persistence e services compartilhados; cada módulo com domain, audio, persistence, state e ui; @tauri-apps só nas camadas persistence; um módulo nunca importa o outro (detalhe no CLAUDE.md) | Decisão técnica do Claude, dentro da arquitetura aprovada (ADR-004); corrige a versão anterior do CLAUDE.md, que punha a persistência no núcleo sem Tauri | Registrada (21/11) |
| D-09 | Onde o app guarda os dados do Link (presets, sessões, amostras): pasta padrão do Windows para apps (%APPDATA%\com.linkozitos.guitarrero) ou dentro de F:\Claude Code\Guitarreiro | Pasta padrão do Windows, com Exportar/Importar para qualquer pasta que o Link escolher | Aprovada pelo Link (21/11) |
| D-10 | Tamanho da janela: a tela do Link tem 1920×1080 com escala de 125% (área útil de 1536×816 px lógicos) e a janela de 1440×900 não cabia; os 66 px de baixo ficavam atrás da barra de tarefas | Abrir maximizada, com mínimo de 1280×720, e desenhar as telas para a área interna da janela maximizada (cerca de 1536×785) | Aprovada pelo Link (21/11) |
| D-11 | Atalhos de bancada da Fatia 1: a Etapa 2 lista 4 (bench_01A, bench_01B, neutral, safe_bedroom), mas o protótipo tem 5 ações diferentes (#01-A, #01-B, Flat 5.0, Ligar Cadeia Padrão, Quarto Seguro) | Decisão técnica do Claude: migrar as 5, com o atalho flat_5 a mais, porque o protótipo é a referência de comportamento | Registrada (21/11) |
| D-12 | Delta (Bloco 10): o protótipo compara a diferença sem arredondar e perde mudanças de 0,1 por erro de ponto flutuante (5,1 − 5,0 = 0,0999…) | Decisão técnica do Claude: seguir a Etapa 2 e arredondar a diferença a 0,1 antes de comparar; o teste de paridade trata esses casos como correção esperada | Registrada (21/11) |

## 4. Matriz de riscos

| Risco | Probabilidade | Impacto | Ação |
|---|---|---|---|
| Escopo crescer antes da v1.0 (dois módulos, IA, publicação) | Alta | Atraso indefinido | Portões por etapa; tudo que não é da etapa vai para o backlog abaixo |
| Regressão ao migrar fórmulas do protótipo | Média | Timbre diferente do aprovado | Tabela de conversões de referência (Etapa 2, seção 3.10) vira teste automático na Fatia 1 |
| Perder valores ao importar backups do protótipo (campos com outro nome ou guardados como texto de tela) | Média | Ajustes do Link somem sem aviso | Migração campo a campo na Etapa 4.1A, com teste que converte os timbres do protótipo e confere cada valor |
| Instalação no Windows falhar (Rust, WebView2, build) | Média | Etapa 3 parada | Lista de pré-requisitos com verificação de cada um (doc 06); o CI gera o instalador mesmo se o PC falhar |
| Fidelidade abaixo de 90 por limite do equipamento | Média | Expectativa frustrada | Mostrar o número real e o equipamento que limita; a meta é validada, não prometida |
| Tom detectado errado no TAB (T-01) | Alta | Dossiê e pacote ao Timbre errados | Corrigir com perfis de tonalidade na Etapa 6, com teste |
| Perder contexto entre sessões | Média | Retrabalho | Este documento + Memória do Projeto + CLAUDE.md no repositório |
| Limite de uso do plano no meio de uma etapa longa (esforço máximo) | Média | Etapa para no meio | Prompts retomáveis: a branch da etapa e o relatório em _relatorios\ dizem onde parou; basta colar o mesmo prompt de novo |
| Versões novas das ferramentas que mudam a configuração ou não funcionam juntas (ex.: pnpm 11/12 só lê o pnpm-workspace.yaml; TypeScript 7 ainda sem suporte no typescript-eslint) | Média | Etapa trava na instalação ou no lint | O gestor confere as versões atuais na documentação oficial antes de cada prompt; o CLAUDE.md manda fixar a combinação mais recente que funciona junta e registrar no relatório |

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
- 21/11/2026 — G-08: pasta oficial do software definida em F:\Claude Code\Guitarreiro (vazia, pronta para receber o clone na Etapa 3). CLAUDE.md, Instruções e guia da Etapa 3 atualizados.
- 21/11/2026 — Instalador automático INSTALAR_GUITARRERO.ps1 e PROMPT_ETAPA_3.txt gravados em F:\Claude Code\Guitarreiro\_instalacao (sintaxe conferida); pasta _instalacao/ no .gitignore do repositório.
- 21/11/2026 — Link conclui a preparação do PC: o instalador automático deu OK nos 9 itens e o repositório foi baixado em F:\Claude Code\Guitarreiro.
- 21/11/2026 — G-09 (Regra 0) registrada nas Instruções, na Memória e no CLAUDE.md. Prompt da Etapa 3 revisado e blindado (revisão 2): retomada automática, pasta temporária para o template, comandos não interativos, CSP com o canal interno do Tauri e política de desenvolvimento, fim de linha LF, versões exatas, prova das regras de camada, branch etapa-3-base, relatório em _relatorios\ e verificação do título da janela. CLAUDE.md reescrito com ADR-006; .gitattributes, .npmrc e .gitignore no repositório. D-09 aberta para a Fatia 1.
- 21/11/2026 — Prompt da Etapa 3 ajustado às versões atuais das ferramentas, conferidas nas documentações oficiais: pnpm 11 e 12 (configuração só no pnpm-workspace.yaml, que substitui o .npmrc no repositório; scripts de instalação autorizados em allowBuilds), TypeScript na série 6.0 enquanto o typescript-eslint não aceitar o 7, Node 22 ou mais novo e conferência automática da janela pelo protocolo de depuração do WebView2, no build de debug e no modo de desenvolvimento. CLAUDE.md: import que sai da própria pasta (../) usa sempre o alias.
- 21/11/2026 — Etapa 3 concluída pelo Claude Code em 14 commits (12 itens; pnpm verify verde; CI verde nas duas rodadas, com instalador .msi e .exe; conferência automática da janela sem nenhum erro no build de debug e no modo de desenvolvimento). Link abriu a janela e aprovou: portão G1. Branch etapa-3-base incorporada na main (PR #9). D-09 aprovada (dados em %APPDATA%\com.linkozitos.guitarrero, com Exportar/Importar) e D-10 aprovada (janela maximizada, mínimo 1280×720). Sugestões do relatório que entram na Fatia 1: fundo escuro antes de o app carregar, tsconfig sem DOM para core e domain, conferência da janela como ferramenta permanente do repositório e CI que cancela rodadas antigas; ícone próprio e formato único de instalador ficam para a v1.0.
- 21/11/2026 — Fatia 1 dividida em duas partes: 4.1A (motor da bancada, sem telas; revisão do gestor) e 4.1B (tela e som; portão G2 com o Link), para rodadas mais curtas, verificáveis por testes e dentro do limite de uso do plano. Prompt da 4.1A escrito e revisado: janela maximizada e escura (D-10), checagem de tipos sem DOM no código puro, CI que cancela rodadas antigas, ferramenta permanente check:window, contratos completos da Etapa 2, paridade medida com o protótipo e importação dos backups V5 e V7_5 campo a campo. D-11 e D-12 registradas; CLAUDE.md ganha a seção "Tela e dados". Prompt gravado em F:\Claude Code\Guitarreiro\_instalacao\PROMPT_ETAPA_4_1A.txt (conferido byte a byte) e em tools/prompt-etapa-4-1a.txt.
