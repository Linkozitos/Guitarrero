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
- TypeScript: a versão mais recente que o typescript-eslint aceita (em novembro de 2026, a série 6.0; o TypeScript 7 entra quando ele suportar).
- pnpm 11 ou mais novo: a configuração do projeto fica no pnpm-workspace.yaml (saveExact e allowBuilds, a lista de pacotes autorizados a rodar script de instalação). O .npmrc serve só para registro e login, e o campo "pnpm" do package.json é ignorado.
- Versões que não funcionam juntas: fixe a combinação mais recente que funciona e registre o motivo no relatório da etapa. Isso não é trocar a stack.

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
- Import que sai da própria pasta (../) usa sempre o alias; caminho relativo só com ./, dentro da mesma pasta. Assim as regras acima valem só para aliases e pacotes.

## Comandos
- pnpm install: instala as dependências
- pnpm tauri dev: abre o app em modo de desenvolvimento
- pnpm verify: lint + format:check + typecheck + test (precisa ficar verde antes de encerrar qualquer tarefa)
- pnpm tauri build: gera o instalador (.msi/.exe)

## Como trabalhar
- Pasta oficial no PC do Link: F:\Claude Code\Guitarreiro (este repositório). Tudo o que for criado para o software (código, builds, amostras de teste, exportações) fica dentro dela; nada fora.
- Pastas locais não versionadas: _instalacao/ (instalador e registros da instalação; não mexa), _relatorios/ (onde você grava o relatório de cada etapa) e _scaffold_tmp/ (arquivos temporários; apague a pasta ao terminar a tarefa).
- Cada etapa trabalha numa branch própria (ex.: etapa-3-base). Nada de push direto na main, force push ou git reset --hard: o gestor confere o CI e incorpora a branch.
- Use só comandos não interativos: o terminal do agente não responde perguntas.
- Toda fórmula nova ou migrada ganha teste com valor de referência do protótipo.
- Mudanças pontuais e pequenas; commits em português no formato tipo: descrição (feat:, fix:, chore:, docs:, test:, refactor:).
- Código e identificadores em inglês; textos da interface em português do Brasil; comentários em português.
- Ao final de cada etapa, grave _relatorios/ETAPA_N_RELATORIO.md e escreva para o Link seguindo a Regra 0.
