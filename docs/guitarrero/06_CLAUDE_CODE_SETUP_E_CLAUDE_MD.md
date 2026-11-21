# 06 — Claude Code: Preparar o Windows, CLAUDE.md e Prompt da Etapa 3

Documento de execução · 21/11/2026 · Use só depois do portão G0 (decisões do 05 respondidas).

## Caminho automático (recomendado, desde 21/11)

O Claude gravou em F:\Claude Code\Guitarreiro\_instalacao dois arquivos: INSTALAR_GUITARRERO.ps1 (faz as Partes A e C sozinho) e PROMPT_ETAPA_3.txt (o prompt da Etapa 3). Abra o PowerShell normal (sem administrador) e cole esta linha:

`powershell -ExecutionPolicy Bypass -File "F:\Claude Code\Guitarreiro\_instalacao\INSTALAR_GUITARRERO.ps1"`

O script instala e confere Git, Node.js, pnpm, compilador C++, Rust, WebView2 e Claude Code, pulando o que já existir; baixa o repositório na pasta oficial; mostra uma tabela OK/FALHOU; e, se tudo estiver OK, copia o prompt da Etapa 3 e abre o Claude Code. Aí basta Ctrl+V e Enter. As Partes A e C abaixo ficam como caminho manual de reserva.

## Parte A — Preparar o seu PC (seu papel, uma vez só)

### O que vai acontecer e por que é seguro
Você vai instalar 4 ferramentas de desenvolvimento pelo winget, o instalador oficial da Microsoft que já vem no Windows 10 e 11. Nenhuma delas mexe em BIOS, drivers, partições ou arquivos pessoais; elas só adicionam programas, como instalar qualquer app. Risco principal: o Build Tools do Visual Studio ocupa cerca de 6 a 8 GB e demora (20 a 40 minutos). Como desfazer: cada item aparece em Configurações → Aplicativos → Aplicativos instalados e pode ser desinstalado de lá.

### Passo a passo
Abra o PowerShell (menu Iniciar → digite "PowerShell" → Abrir). Cole uma linha por vez e espere terminar antes da próxima.

| # | Comando | Para que serve |
|---|---|---|
| 1 | `winget install --id Git.Git -e` | Controle de versões (guarda cada etapa e permite voltar atrás) |
| 2 | `winget install --id OpenJS.NodeJS.LTS -e` | Roda as ferramentas de JavaScript e TypeScript |
| 3 | `winget install --id Rustlang.Rustup -e` | Compila a parte nativa do app (Tauri) |
| 4 | `winget install --id Microsoft.VisualStudio.2022.BuildTools -e --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"` | Compilador C++ da Microsoft, exigido pelo Rust no Windows |

Feche o PowerShell, abra de novo e rode:

| # | Comando | Resultado esperado |
|---|---|---|
| 5 | `npm install -g pnpm` | Instala o gerenciador de pacotes do projeto |
| 6 | `git --version` | algo como "git version 2.x" |
| 7 | `node -v` | v20 ou maior |
| 8 | `pnpm -v` | um número de versão |
| 9 | `rustc -V` | "rustc 1.x" |

Se algum comando de verificação der erro em vermelho, pare, tire um print e mande no Projeto Guitarrero. O WebView2, que o Tauri usa para desenhar a tela, já vem no Windows 10 e 11 atualizados.

## Parte B — CLAUDE.md do repositório

Este arquivo fica na raiz do repositório. O Claude Code lê ele no começo de toda sessão, então é a memória permanente do lado do código. Ele está gravado no repositório; o texto abaixo é a versão vigente (revisão 2, 21/11, com a Regra 0 e a ADR-006).

````
# Guitarrero — guia para o Claude Code

## Regra 0
O Link é o dono do produto e não é programador. A regra fundamental do projeto é 100% eficiência, 0% esforço para ele. Sempre que ele precisar fazer algo, entregue o comando ou texto completo, pronto para colar, com o caminho exato (qual janela, qual pasta, qual botão) e o que ele deve ver quando der certo. Tudo o que puder ser automatizado, você automatiza; ele só decide, testa e aprova.

## O que é
Software desktop para Windows, 100% local, com dois módulos sobre um núcleo comum:
- Módulo Timbre: regulagem 0,0–10,0 dos 9 equipamentos da bancada do Link, simulação DSP e calibração por amostras.
- Módulo TAB: simplificação biomecânica de tablaturas e treino no estilo Yousician.

## Fontes de verdade (leia antes de mudar código)
- docs/guitarrero/05_PLANO_MESTRE_DECISOES_E_RISCOS.md: etapa atual, decisões (G-xx, D-xx, ADR-xxx) e riscos.
- docs/guitarrero/02 e 03: produto, inventário dos protótipos, bancada física e regras musicais.
- docs/timbrador/etapa-1.md e etapa-2.md: escopo, ADRs, contratos TypeScript, wireframes e tokens do Módulo Timbre.
- docs/prototipos/: Tone Lab Pro v7.5 e TAB Simplifier Pro (HTML). São a referência de comportamento: toda fórmula migrada deve bater com eles, salvo decisão registrada no 05.
A pasta docs/ é mantida pelo gestor do projeto (Claude, no Projeto Guitarrero do claude.ai). Leia, mas não edite.

## Stack
Tauri v2 · React · Vite · TypeScript strict (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, sem any) · Tailwind CSS v4 local (@tailwindcss/vite) · lucide-react · zod · zustand · Vitest · Web Audio API. Alvo: só Windows (.msi/.exe). Dependências com versão exata (sem ^ nem ~) e lockfiles commitados.

## Arquitetura (ADR-004 e ADR-006)
```
src/
  main.tsx          bootstrap do React
  app/              shell da janela: navegação entre módulos
  ui-kit/           componentes React compartilhados e theme/tokens.css (Dark Studio)
  core/             TypeScript puro compartilhado
    music/          afinações, MIDI <-> Hz, nomes de notas, Z12
    dsp/            matemática de áudio pura (Karplus-Strong em Float32Array)
    extractor/      leitura de links Songsterr/YouTube, sem rede
    song/           modelo da música em estudo, compartilhado pelos módulos
  audio/            Web Audio compartilhado: AudioContext único e reprodução
  persistence/      arquivos locais: caminhos, escrita atômica, envelopes versionados (zod)
  services/         única saída de rede do app (metadataFetcher, ADR-002)
  modules/
    timbre/         domain/ (puro)  audio/  persistence/  state/ (zustand)  ui/  index.ts (porta pública)
    tab/            domain/ (puro)  audio/  persistence/  state/ (zustand)  ui/  index.ts (porta pública)
tests/              espelha src/ (ex.: tests/core/music/, tests/modules/timbre/domain/)
src-tauri/          casca nativa em Rust (mínima: bootstrap e plugins fs e dialog)
```

Quem pode importar quem (ESLint no-restricted-imports; aliases @app, @ui-kit, @core, @audio, @persistence, @services, @modules):
- core: só core. Sem React, DOM, Web Audio, Tauri, zustand ou rede.
- modules/X/domain: core e o próprio domain.
- audio: core.
- modules/X/audio: core, audio e o próprio domain.
- persistence: core, zod, @tauri-apps/plugin-fs e @tauri-apps/plugin-dialog.
- modules/X/persistence: core, persistence e o próprio domain.
- modules/X/state: core, o próprio domain e a própria persistence.
- services: core.
- ui-kit: core.
- modules/X/ui: ui-kit, core, services e as camadas do próprio módulo.
- app: ui-kit, core e a porta pública de cada módulo (@modules/timbre, @modules/tab).
- Um módulo nunca importa o outro: o que os dois usam mora em core.
- @tauri-apps/* só nas camadas persistence; fetch só em services.
- Entre camadas, use os aliases; caminho relativo só dentro da mesma camada.

## Comandos
- pnpm install: instala as dependências
- pnpm tauri dev: abre o app em modo de desenvolvimento
- pnpm verify: lint + format:check + typecheck + test (precisa ficar verde antes de encerrar qualquer tarefa)
- pnpm tauri build: gera o instalador (.msi/.exe)

## Como trabalhar
- Pasta oficial no PC do Link: F:\Claude Code\Guitarreiro (este repositório). Tudo o que for criado para o software (código, builds, amostras de teste, exportações) fica dentro dela; nada fora.
- Pastas locais não versionadas: _instalacao/ (instalador e registros da instalação; não mexa) e _relatorios/ (onde você grava o relatório de cada etapa).
- Cada etapa trabalha numa branch própria (ex.: etapa-3-base). Nada de push direto na main, force push ou git reset --hard: o gestor confere o CI e incorpora a branch.
- Use só comandos não interativos: o terminal do agente não responde perguntas.
- Toda fórmula nova ou migrada ganha teste com valor de referência do protótipo.
- Mudanças pontuais e pequenas; commits em português no formato tipo: descrição (feat:, fix:, chore:, docs:, test:, refactor:).
- Código e identificadores em inglês; textos da interface em português do Brasil; comentários em português.
- Ao final de cada etapa, grave _relatorios/ETAPA_N_RELATORIO.md e escreva para o Link seguindo a Regra 0.
````

## Parte C — Prompt da Etapa 3, revisão 2 (colar no Claude Code)

Onde colar: na janela do Claude Code aberta na pasta F:\Claude Code\Guitarreiro (o instalador automático já deixa ela aberta; se fechou, abra o PowerShell e rode `cd "F:\Claude Code\Guitarreiro"; claude`). Digite `/effort max` e Enter, depois cole o texto abaixo e aperte Enter. O mesmo texto está em F:\Claude Code\Guitarreiro\_instalacao\PROMPT_ETAPA_3.txt e em tools/prompt-etapa-3.txt no repositório. O prompt é retomável: se a etapa parar no meio (limite de uso, queda de energia), basta colar o mesmo texto de novo.

````
﻿Execute a Etapa 3 do Guitarrero: preparar a base do aplicativo, sem nenhuma funcionalidade musical ainda. Se as habilidades engenharia-de-software-full-stack-e-algoritmos-avancados e arquitetura-ux-ui-e-designer-de-layouts-de-apps estiverem disponíveis nesta sessão, use-as.

<objective>
Ao final, o repositório tem um app Tauri v2 + React + TypeScript que abre no Windows uma janela "Guitarrero" com dois botões, Timbre e TAB, já com a estrutura de pastas definitiva, as regras de qualidade, o primeiro teste e o CI funcionando. Esta base é o alicerce das próximas etapas: camadas, versões e verificação configuradas aqui serão herdadas por todo o código dos módulos.
</objective>

<context_and_legacy>
- Pasta do projeto: F:\Claude Code\Guitarreiro, clone de github.com/Linkozitos/Guitarrero (branch main). Já existem CLAUDE.md, README.md, .gitignore, .gitattributes, .npmrc, docs/ e tools/. A pasta _instalacao/ é local e não versionada.
- O instalador já preparou e conferiu o Windows: Git, Node.js 20+, pnpm, Rust (toolchain MSVC), Build Tools C++ e WebView2.
- O gestor atualizou o CLAUDE.md hoje. Se esta sessão foi aberta antes do git pull da Etapa A, a versão que está na sua memória é antiga: releia o arquivo depois do pull.
- O Link acompanha pelo terminal e não é programador. Ele só age quando você pede algo específico, sempre com o comando pronto e o caminho exato (Regra 0 do CLAUDE.md).
</context_and_legacy>

<execution_workflow>
Etapa A — Conferência inicial, antes de qualquer mudança
1. Confirme que está em F:\Claude Code\Guitarreiro e que `git remote get-url origin` aponta para Linkozitos/Guitarrero (o endereço antigo Timbrador-Profissional também serve, porque o GitHub redireciona).
2. Retomada: SE já existir a branch etapa-3-base (local ou no GitHub) ou o arquivo _relatorios/ETAPA_3_RELATORIO.md, ENTÃO entre nessa branch, veja pelos commits quais itens já estão feitos e continue a partir do próximo. SENÃO rode `git checkout main` e `git pull --ff-only`, confira que `git status` está limpo e crie a branch etapa-3-base a partir da main. SE o `git status` não estiver limpo, não descarte nada: liste as mudanças no relatório e pare.
3. Com `git status` limpo, rode `git checkout-index --force --all`. O .gitattributes do repositório define fim de linha LF, e este comando reescreve com LF os arquivos que o Git do Windows baixou com CRLF; sem isso o Prettier acusaria diferença em relação ao CI.
4. Leia agora: o CLAUDE.md inteiro (Regra 0, Arquitetura e a tabela "Quem pode importar quem", que vale como especificação desta etapa); em docs/guitarrero/05_PLANO_MESTRE_DECISOES_E_RISCOS.md, as decisões G-01 a G-08, ADR-006 e D-01 a D-08; em docs/timbrador/etapa-2.md, só as seções ADR-001 a ADR-005, 1.1 (árvore original), 4.1 (tokens Dark Studio) e 4.2 (shell). Os protótipos HTML não são necessários nesta etapa.
5. Anote as versões de node, pnpm, rustc, cargo e git para o relatório.

Etapa B — Doze itens, nesta ordem, com um commit por item (exceto o item 5)
1. App base. O gerador de template não trabalha numa pasta que já tem arquivos, então gere o template oficial do Tauri v2 (create-tauri-app, template react-ts, gerenciador pnpm, nome do projeto guitarrero) dentro da pasta temporária _scaffold_tmp/ na raiz do projeto, passando nome, gerenciador e template na linha de comando para não haver perguntas. SE o gerador parar esperando resposta, cancele e siga pelo caminho alternativo: projeto Vite com template react-ts em _scaffold_tmp/guitarrero, @tauri-apps/cli e @tauri-apps/api instalados, e `pnpm tauri init --ci` com app-name Guitarrero, window-title Guitarrero, frontend-dist ../dist, dev-url http://localhost:1420, before-dev-command "pnpm dev" e before-build-command "pnpm build" (Vite na porta 1420 fixa). Ainda dentro de _scaffold_tmp/, remova a demonstração do template (comando greet, logos e estilos de exemplo). Depois mova o conteúdo gerado para a raiz sem sobrescrever CLAUDE.md, README.md, docs/, tools/, .gitattributes e .npmrc; junte o .gitignore gerado ao existente, mantendo as linhas atuais; apague _scaffold_tmp/. Em tauri.conf.json: productName "Guitarrero", identifier "com.linkozitos.guitarrero", version "0.1.0" e janela principal com título "Guitarrero", 1440 × 900 e mínimo 1280 × 800. No index.html: `<html lang="pt-BR">` e título Guitarrero. Rode `pnpm install`. Deixe todas as dependências do package.json com versão exata (sem ^ nem ~, a mesma do pnpm-lock.yaml) e acrescente "packageManager" com a versão do pnpm instalada e "engines": {"node": ">=20"}. SE o pnpm avisar "Ignored build scripts", não use o comando interativo approve-builds: liste esses pacotes em "pnpm": {"onlyBuiltDependencies": [...]} no package.json e rode `pnpm install` de novo.
2. TypeScript: tsconfig com strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride, noImplicitReturns e noFallthroughCasesInSwitch. Aliases @app, @ui-kit, @core, @audio, @persistence, @services e @modules, definidos de forma idêntica no tsconfig, no Vite e no Vitest. O typecheck cobre src/, tests/ e os arquivos de configuração.
3. Estrutura de pastas: crie exatamente a árvore src/ e tests/ da seção Arquitetura do CLAUDE.md, movendo o App do template para src/app/ e mantendo src/main.tsx como bootstrap. Cada pasta recebe um index.ts com uma linha de comentário dizendo o que vai morar ali. src/modules/timbre/index.ts e src/modules/tab/index.ts são as portas públicas e exportam a tela provisória de cada módulo, que mora no ui/ do próprio módulo.
4. ESLint e Prettier: ESLint em flat config com typescript-eslint strictTypeChecked, @typescript-eslint/no-explicit-any como erro, regras de hooks do React e no-restricted-imports implementando a tabela "Quem pode importar quem" do CLAUDE.md, tanto pelos aliases quanto por caminhos relativos que saiam da camada. Prettier com endOfLine "lf". O .prettierignore e os ignores do ESLint cobrem docs/, tools/, _instalacao/, _relatorios/, _scaffold_tmp/, dist/, src-tauri/, pnpm-lock.yaml e arquivos .md (docs/ guarda os protótipos de referência e não pode ser reformatado; os .md são mantidos pelo gestor).
5. Prova das regras de camada, sem commit: crie temporariamente src/core/_prova.ts importando react e src/modules/timbre/domain/_prova.ts importando @modules/tab; rode `pnpm exec eslint src` e confirme que cada arquivo falha com a mensagem da regra. Apague os dois arquivos e confirme que o lint volta a passar. Copie as duas mensagens de erro para o relatório.
6. Visual e dependências: Tailwind CSS v4 local (tailwindcss e @tailwindcss/vite, com `@import "tailwindcss"`). Em src/ui-kit/theme/tokens.css, os tokens da seção 4.1 da Etapa 2 com os mesmos valores, declarados no bloco @theme com prefixo de cor (ex.: --color-bg-0: #07090e), para gerar classes como bg-bg-0 e text-fg-1. Espaçamentos da grade de 8 pt (8, 16, 24, 32, 48, 64 px; 4 só dentro de componentes), raios 8, 12 e 16. Fontes do sistema (system-ui e ui-monospace), nada carregado da internet. Instale lucide-react, zod e zustand. Adicione os plugins do Tauri com `pnpm tauri add fs` e `pnpm tauri add dialog` (instalam a parte JavaScript e a parte Rust e registram o plugin no lib.rs).
7. Segurança do Tauri (ADR-005). Em app.security.csp, exatamente esta política:
default-src 'self'; connect-src 'self' ipc: http://ipc.localhost https://noembed.com; frame-src https://www.youtube-nocookie.com; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'
Os destinos ipc: e http://ipc.localhost são o canal interno do Tauri; sem eles os plugins deixam de responder. Em app.security.devCsp, usada só no modo de desenvolvimento, esta política:
default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' ipc: http://ipc.localhost http://localhost:1420 ws://localhost:1420 https://noembed.com; frame-src https://www.youtube-nocookie.com; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'
(o servidor do Vite e o recarregamento automático do React precisam desses acréscimos). Capability padrão só para a janela principal: core:default, dialog:default e sistema de arquivos limitado à pasta de dados do próprio app ($APPDATA e $APPDATA/**/*). Sem shell e sem acesso a outras pastas; arquivos de fora só os que o usuário escolher num diálogo.
8. Shell mínimo em src/app, usando só os tokens: barra superior com o nome Guitarrero e dois botões, Timbre e TAB, com ícones do lucide-react, alvo mínimo de 40 × 40 px e foco visível pelo teclado (anel de 2 px amber com afastamento de 2 px). Ao abrir, a área central mostra "Escolha um módulo" e nenhum botão aparece selecionado; essa abertura neutra é um padrão aprovado pelo Link. Clicar em Timbre mostra "Módulo Timbre — em construção (Etapa 4)"; clicar em TAB mostra "Módulo TAB — em construção (Etapa 6)"; o botão do módulo aberto fica marcado com sublinhado amber. Textos em português do Brasil, com contraste mínimo de 7:1; as cores #94a3b8, #64748b, #fb7185 e #a78bfa não podem ser usadas em texto (seção 4.1).
9. Primeiro código de domínio com teste: em src/core/music, midiToFreqHz(midi) = 440 × 2^((midi − 69) / 12), com precisão total. O protótipo TAB Simplifier arredonda para 1 casa porque só exibe o valor; o arredondamento fica para a interface. Em tests/core/music, teste: 69 → 440; 57 → 220; 45 → 110; 40 → 82,4069 e 64 → 329,6276 (os dois últimos com toBeCloseTo de 4 casas). Vitest com ambiente node.
10. Scripts finais no package.json: dev, build, tauri, lint (eslint . --max-warnings 0), format, format:check, typecheck, test (vitest run) e verify (lint, format:check, typecheck e test, nessa ordem, parando no primeiro erro).
11. CI em .github/workflows/ci.yml, disparado em todo push e manualmente. Job "verificar" em ubuntu-latest: pnpm na versão do packageManager, Node 22, `pnpm install --frozen-lockfile` e `pnpm verify`. Job "instalador-windows" em windows-latest: a mesma base, Rust estável com cache, `pnpm tauri build` e publicação de src-tauri/target/release/bundle/ como artefato "guitarrero-windows". Sem macOS (decisão G-04).
12. README em português: o que é o Guitarrero e como rodar no Windows (pnpm install, pnpm tauri dev, pnpm verify). SE algum comando da seção Comandos do CLAUDE.md mudou, atualize só essa seção.

Etapa C — Verificação e entrega
1. `pnpm verify` precisa terminar verde; guarde a saída.
2. Rode `pnpm build` (gera dist/, que o Rust precisa para compilar) e depois `cargo check` dentro de src-tauri, que acusa erro de Rust mais rápido que a compilação completa.
3. `git push -u origin etapa-3-base`. SE o Git abrir o navegador pedindo login no GitHub, avise o Link com esta frase: "Link, abriu uma janela do navegador pedindo login no GitHub: entre com a sua conta e me avise." e espere. SE o push travar pedindo usuário e senha no próprio terminal, interrompa e entregue ao Link este comando, para colar numa janela nova do PowerShell (menu Iniciar → PowerShell → Abrir): cd "F:\Claude Code\Guitarreiro"; git push -u origin etapa-3-base
4. Rode `pnpm tauri build --debug --no-bundle`. Ele usa a mesma configuração do instalador (incluindo a CSP de produção), sem gerar o instalador; a primeira compilação do Rust leva de 5 a 15 minutos. Abra o executável gerado em src-tauri\target\debug\ em segundo plano, deixando a janela aberta para o Link. Depois de 10 segundos, confirme pelo PowerShell que o processo continua rodando e que o título da janela principal é Guitarrero (MainWindowTitle). SE o processo fechar sozinho ou o título não aparecer, investigue a causa antes de encerrar.
5. SE o Link responder depois que a janela abriu vazia, preta ou com erro, comece pela CSP: abra as ferramentas de desenvolvedor do build de debug, encontre o bloqueio e ajuste a política mantendo a versão mais restrita que funcione; registre a mudança no relatório.
</execution_workflow>

<constraints>
- Trabalhe só dentro de F:\Claude Code\Guitarreiro (decisão G-08 do Link: nada do projeto fica fora dessa pasta).
- Não edite docs/ nem _instalacao/. docs/ é mantido pelo gestor e guarda a referência; _instalacao/ guarda o instalador e os registros dele.
- Use só comandos não interativos e com tempo-limite, porque o terminal do agente não responde perguntas. SE um comando parar esperando resposta, cancele e siga por um caminho não interativo.
- Nada de push direto na main, force push ou git reset --hard, e nada de apagar arquivos além de _scaffold_tmp/ e dos dois arquivos de prova. A main precisa ficar sempre íntegra; o gestor confere o CI e incorpora a branch.
- Não instale nada global nem mude configurações do Windows; tudo é dependência do projeto.
- Não troque a stack para contornar um erro. SE algo falhar por causa do ambiente do Windows (Rust, compilador C++, WebView2 ou o espaço no caminho "Claude Code"), pare, explique em linguagem simples e entregue ao Link o comando exato para corrigir, com a janela onde ele deve rodar.
- Fora do escopo desta etapa: knobs, áudio, persistência real e telas dos módulos. Ideias de melhoria vão para o relatório, na seção Sugestões, sem ser implementadas.
</constraints>

<output_contract>
1. Grave _relatorios/ETAPA_3_RELATORIO.md com: resumo em linguagem simples; tabela dos 12 itens (feito ou não feito, e o motivo); saída do pnpm verify e do cargo check; as duas mensagens da prova das regras de camada; versões das ferramentas; commits (hash curto e mensagem); caminho do executável aberto e o título de janela confirmado; desvios em relação a este pedido, com o motivo; sugestões.
2. Encerre com esta mensagem para o Link, preenchendo os colchetes:
"Etapa 3 concluída. [resumo em até 3 linhas]
O que você faz agora:
1. Olhe a janela Guitarrero que abriu na tela (se não estiver na frente, clique nela na barra de tarefas do Windows). Clique em Timbre e depois em TAB.
2. Se a janela aparecer vazia, preta ou com erro, escreva aqui: a janela abriu com problema. Se estiver tudo certo, feche a janela pelo X.
3. Volte ao app Claude → Projeto Guitarrero → conversa "Configuração de projeto com IA" e escreva: Etapa 3 concluída.
O gestor lê o relatório direto na pasta e confere o CI no GitHub."
</output_contract>
````

### O que você deve ver ao final
Uma janela chamada Guitarrero com dois botões, Timbre e TAB. Se abrir, mande um print no Projeto Guitarrero: esse é o portão G1.
