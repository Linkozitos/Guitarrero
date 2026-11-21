# Guitarrero — guia para o Claude Code

## O que é
Software desktop para Windows, 100% local, com dois módulos sobre um núcleo comum:
- Módulo Timbre: regulagem 0,0–10,0 dos 9 equipamentos da bancada do Link, simulação DSP e calibração por amostras.
- Módulo TAB: simplificação biomecânica de tablaturas e treino estilo Yousician.
O dono do produto é o Link (não programador). Gestão, decisões e status ficam em docs/guitarrero/05_PLANO_MESTRE_DECISOES_E_RISCOS.md.

## Fontes de verdade (leia antes de mudar código)
- docs/guitarrero/02 e 03: produto, inventário dos protótipos, bancada e regras musicais.
- docs/timbrador/etapa-1.md e etapa-2.md: escopo, ADRs, contratos TypeScript, wireframes do Módulo Timbre.
- docs/prototipos/: Tone Lab Pro v7.5 e TAB Simplifier Pro (HTML). São a referência de comportamento: toda fórmula migrada deve bater com eles, salvo decisão registrada no 05.

## Stack
Tauri v2 · React · Vite · TypeScript (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, sem any) · Tailwind local · lucide-react · zod · zustand · Vitest · Web Audio API. Alvo: Windows (.msi/.exe).

## Arquitetura
src/core/      núcleo compartilhado: music (afinações, MIDI, Z12), audio (contexto, Karplus-Strong), sources (Songsterr/YouTube), persistence (JSON atômico), song (música em estudo)
src/modules/timbre/  domain (puro), audio (AudioEngine persistente), ui
src/modules/tab/     domain (puro), audio, ui
src/app/       shell, navegação entre módulos
Regras de camada: domain e core não importam React nem Tauri; módulos não importam um ao outro, só o core.

## Comandos
pnpm install · pnpm dev · pnpm tauri dev · pnpm lint · pnpm typecheck · pnpm test · pnpm tauri build

## Como trabalhar
- Pasta oficial no PC do Link: F:\Claude Code\Guitarreiro (este repositório). Tudo o que for criado para o software (código, builds, amostras de teste, exportações) fica dentro dela; nada fora.
- Antes de terminar qualquer tarefa: pnpm lint && pnpm typecheck && pnpm test, todos verdes.
- Toda fórmula nova ou migrada ganha teste com valor de referência do protótipo.
- Mudanças pontuais e pequenas; commits com mensagem em português dizendo o que mudou e por quê.
- Ao final, escreva um resumo para o Link em linguagem simples: o que foi feito, o que ele deve testar e como.
