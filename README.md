# Guitarrero

Software desktop para Windows, 100% local, para estudar uma música com o próprio equipamento:

- **Módulo Timbre** (ex-Timbrador Profissional / Tone Lab Pro): regulagem de 0,0 a 10,0 dos 9 equipamentos da bancada, simulação do timbre e calibração por amostras gravadas.
- **Módulo TAB** (ex-TAB Simplifier Pro): simplificação de tablaturas e treino no estilo Yousician.

Status: base do aplicativo pronta (Etapa 3): a janela abre com os botões Timbre e TAB, ainda sem funções musicais. Plano, decisões e riscos em `docs/guitarrero/05_PLANO_MESTRE_DECISOES_E_RISCOS.md`.

## Como rodar no Windows

Pré-requisitos (o instalador `tools/instalar-guitarrero.ps1` prepara e confere tudo): Git, Node.js 22 ou mais novo, pnpm, Rust com toolchain MSVC, Build Tools C++ e WebView2.

Abra o PowerShell na pasta do projeto, `F:\Claude Code\Guitarreiro`, e use:

| Comando | O que faz |
|---|---|
| `pnpm install` | Instala as dependências. Rode uma vez e de novo sempre que o `package.json` mudar. |
| `pnpm tauri dev` | Abre o app em modo de desenvolvimento. Na primeira vez o Rust compila tudo e leva de 5 a 15 minutos; depois abre em segundos. |
| `pnpm verify` | Roda lint, formatação, typecheck e testes, nessa ordem, e para no primeiro erro. Precisa ficar verde antes de encerrar qualquer tarefa. |
| `pnpm tauri build` | Gera o instalador (.msi e .exe) em `src-tauri\target\release\bundle\`. |

O CI do GitHub roda `pnpm verify` em todo push e publica o instalador do Windows como o artefato `guitarrero-windows`.

## Estrutura

- `src/`: código do app. Shell da janela em `src/app`, núcleo compartilhado em `src/core` e os módulos em `src/modules/timbre` e `src/modules/tab`. As camadas e quem pode importar quem estão no `CLAUDE.md`.
- `tests/`: testes (Vitest), espelhando `src/`.
- `src-tauri/`: casca nativa em Rust (Tauri v2), com os plugins de arquivos e de diálogo.
- `CLAUDE.md`: guia para o Claude Code.
- `docs/guitarrero/`: documentos de gestão do projeto (00 a 06).
- `docs/timbrador/`: Etapa 1 (escopo) e Etapa 2 (arquitetura) do Módulo Timbre.
- `docs/prototipos/`: protótipos HTML de referência (Tone Lab Pro v7.5 e TAB Simplifier Pro).
- `tools/`: instalador do ambiente Windows e prompts das etapas.
