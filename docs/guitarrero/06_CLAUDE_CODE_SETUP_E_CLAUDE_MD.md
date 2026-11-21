# 06 — Claude Code: Preparar o Windows, CLAUDE.md e Prompt da Etapa 3

Documento de execução · 21/11/2026 · Use só depois do portão G0 (decisões do 05 respondidas).

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

Este arquivo fica na raiz do repositório. O Claude Code lê ele no começo de toda sessão, então é a memória permanente do lado do código. Ele já vem pronto no pacote inicial (Guitarrero_pacote_inicial_repositorio.zip); o texto fica aqui como referência.

````
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
- Antes de terminar qualquer tarefa: pnpm lint && pnpm typecheck && pnpm test, todos verdes.
- Toda fórmula nova ou migrada ganha teste com valor de referência do protótipo.
- Mudanças pontuais e pequenas; commits com mensagem em português dizendo o que mudou e por quê.
- Ao final, escreva um resumo para o Link em linguagem simples: o que foi feito, o que ele deve testar e como.
````

## Parte C — Prompt da Etapa 3 (colar no Claude Code)

Pré-condições: Parte A concluída, portão G0 aprovado, e o repositório renomeado para Guitarrero no GitHub (Settings → General → Repository name). Abra o PowerShell, entre na pasta onde quer guardar o projeto (por exemplo `cd $HOME\Documents`), clone o repositório com `git clone https://github.com/Linkozitos/Guitarrero.git` e entre nela com `cd Guitarrero`. Abra essa pasta no Explorador de Arquivos e copie para dentro dela o conteúdo da pasta guitarrero do zip (o arquivo CLAUDE.md e a pasta docs). Volte ao PowerShell, digite `claude` e cole o texto abaixo.

````
Execute a Etapa 3 do Guitarrero: criar a base do repositório, sem nenhuma funcionalidade ainda. Leia antes o CLAUDE.md, docs/guitarrero/05_PLANO_MESTRE_DECISOES_E_RISCOS.md e a seção 5.1 de docs/timbrador/etapa-2.md; esta tarefa segue aquela seção com as adaptações abaixo, que vêm das decisões G-01 a G-04.

Faça, nesta ordem:
1. Crie o app Tauri v2 com o template React + TypeScript + Vite dentro deste repositório, sem apagar CLAUDE.md nem docs/. Antes, se CLAUDE.md e docs/ ainda não estiverem commitados, faça um primeiro commit só com eles ("docs: pacote inicial do Guitarrero"). Nome do produto "Guitarrero", identificador com.linkozitos.guitarrero, janela mínima 1280 × 800.
2. Configure o TypeScript estrito (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes), ESLint com typescript-eslint strict, no-explicit-any como erro e no-restricted-imports aplicando as regras de camada do CLAUDE.md; configure o Prettier.
3. Instale Tailwind como pacote local com os tokens do design system Dark Studio da seção 4.1 da Etapa 2 em src/app/theme/tokens.css; instale lucide-react, zod, zustand, @tauri-apps/plugin-fs e @tauri-apps/plugin-dialog com versões travadas.
4. Configure a CSP e as capabilities do Tauri conforme o ADR-005 da Etapa 2 (rede só para https://noembed.com e frame só para https://www.youtube-nocookie.com; sistema de arquivos só em $APPDATA/guitarrero e em arquivos escolhidos pelo usuário).
5. Crie a árvore src/core, src/modules/timbre, src/modules/tab e src/app descrita no CLAUDE.md. Dentro de src/modules/timbre, reproduza as subpastas da árvore da seção 1.1 da Etapa 2, movendo para src/core o que for comum aos dois módulos (afinações, MIDI, Karplus-Strong, extração de links, persistência). Cada pasta recebe um index.ts vazio com um comentário de uma linha dizendo o que vai morar ali.
6. Crie o shell mínimo: uma janela com título "Guitarrero" e dois botões de navegação, "Timbre" e "TAB", cada um abrindo uma tela vazia com o texto "Em construção — Etapa 4" ou "Etapa 6".
7. Configure o Vitest (ambiente node para core e domain) com um teste de exemplo real: midiToFreqHz(69) = 440 e midiToFreqHz(40) = 82,4 (com a função em src/core/music, igual à do protótipo TAB Simplifier).
8. Crie os scripts lint, typecheck, test, tauri dev e tauri build no package.json.
9. Crie o CI no GitHub Actions: lint + typecheck + test em ubuntu-latest; tauri build em windows-latest, publicando o instalador como artefato. Sem macOS (decisão G-04).
10. Atualize o README com como rodar em modo de desenvolvimento no Windows.

Critério de pronto: pnpm lint, pnpm typecheck e pnpm test passam; pnpm tauri dev abre a janela Guitarrero com os dois botões. Rode os três comandos de verificação e mostre a saída. Faça commits pequenos por item, em português. No fim, envie tudo ao GitHub com git push; se o Git pedir login, avise o Link que uma janela do navegador vai abrir para ele entrar na conta do GitHub, e espere ele confirmar.

Se algo falhar por causa do ambiente do Windows (Rust, compilador C++, WebView2), pare, explique o erro em linguagem simples e diga exatamente qual comando o Link deve rodar para corrigir; não tente contornar mudando a stack.

Ao terminar, escreva para o Link: o que foi criado, o que ele deve ver na tela e o que fazer se não abrir.
````

### O que você deve ver ao final
Uma janela chamada Guitarrero com dois botões, Timbre e TAB. Se abrir, mande um print no Projeto Guitarrero: esse é o portão G1.
