# 00 — LEIA PRIMEIRO: Mapa do Projeto Guitarrero

Documento de gestão · 21/11/2026 · Gerente do projeto: Claude · Dono do produto: Link

## O que mudou hoje

1. O Gemini saiu do projeto. O Claude assume as duas frentes: gestão do projeto (aqui no Projeto "Guitarrero" do claude.ai) e código (no Claude Code). Uma IA só, uma fonte de verdade só, sem cópia e cola entre ferramentas.
2. O Timbrador Profissional e o TAB Simplifier Pro passam a ser dois módulos de um único software: o **Guitarrero**.
3. Nada do que já foi feito se perde. A Etapa 1 e a Etapa 2 do Timbrador (já gravadas nesta pasta) continuam valendo e viram a especificação do Módulo Timbre.

## Onde o projeto parou (diagnóstico)

O projeto não está atrasado por falta de código. Está parado num portão de decisão: a Etapa 2 terminou em 17/11 com 6 decisões pendentes (seção 5.3 daquele documento), e sem elas a Etapa 3 (criar o repositório) não pode começar. A tentativa de dividir a gestão com o Gemini consumiu os últimos dias sem avançar esse portão. O documento 05 traz as decisões, cada uma com a recomendação. Aprovar é o único bloqueio real.

## Fluxo das etapas

```
[ETAPA 0 · HOJE] Configuração do Claude
   Link: cola o 01 em "Instruções" + aprova as decisões do 05
   Claude: arquivos desta pasta + Contexto e Memória do Projeto
        │
        ▼  PORTÃO G0: instruções coladas e decisões aprovadas?  ── não ──► volta para o 05
        │ sim
        ▼
[ETAPA 3] Setup do repositório "Guitarrero" (Claude Code)
   Link: instala os pré-requisitos no Windows (doc 06) e cola 1 prompt
   Claude Code: cria a estrutura, testes, CI
        │
        ▼  PORTÃO G1: lint + typecheck + test verdes e a janela abre vazia no Windows?
        │ sim
        ▼
[ETAPA 4] Módulo Timbre — Fatia 1 → Fatia 2 → Fatia 3
   (cada fatia termina com teste na bancada real: Tagima → pedais → GA15II)
        │
        ▼  PORTÃO G2..G4: critério "pronto quando" de cada fatia
        │
        ▼
[ETAPA 5] Módulo TAB — Etapa 1 e 2 (especificação, sem código)
        │
        ▼
[ETAPA 6] Módulo TAB — fatias de código
        │
        ▼
[ETAPA 7] Integração: música escolhida no TAB alimenta o Timbre direto (sem copiar texto)
        │
        ▼
[v1.0] Instalador .msi/.exe do Guitarrero no seu PC
```

## Quem faz o quê

| Etapa | Você (Link) faz | O Claude faz |
|---|---|---|
| 0 | Colar o texto do 01 em Instruções do Projeto; responder as caixas de decisão | Escrever e manter todos os documentos; gravar Contexto e Memória |
| 3 | Instalar Node, pnpm, Rust e Git no Windows (lista no 06); colar o prompt no Claude Code; olhar se a janela abre | Escrever todo o código de setup, testes e CI |
| 4 a 7 | Testar na bancada e dizer o que soou errado; aprovar cada portão | Escrever o código, os testes e o registro de cada entrega |

Regra de ouro: você nunca precisa editar código. Seu trabalho é decidir, testar e aprovar.

## Arquivos desta pasta

| Arquivo | Para que serve | Onde vai |
|---|---|---|
| 00_LEIA_PRIMEIRO_MAPA_DO_PROJETO | Este mapa | Só leitura |
| 01_INSTRUCOES_PROJETO_CLAUDE | Texto a colar no campo Instruções | Projeto Guitarrero → Instruções |
| 02_CONTEXTO_PRODUTO_E_ESTADO_ATUAL | Visão do produto, inventário do código, dívidas técnicas | Projeto → Contexto (já gravado pelo Claude) |
| 03_CONTEXTO_DOMINIO_SETUP_E_TEORIA | Bancada física e regras musicais | Projeto → Contexto (já gravado pelo Claude) |
| 04_SEMENTE_MEMORIA_CLAUDE | Fatos permanentes do projeto | Já gravado na Memória pelo Claude; o prompt fica de reserva |
| 05_PLANO_MESTRE_DECISOES_E_RISCOS | Roadmap, portões, decisões, riscos | Projeto → Contexto (já gravado pelo Claude) |
| 06_CLAUDE_CODE_SETUP_E_CLAUDE_MD | Pré-requisitos do Windows, CLAUDE.md do repositório e o prompt da Etapa 3 | Claude Code (depois do portão G0) |

Documentos anteriores, na pasta acima: "Timbrador Profissional — Etapa 1" e "Etapa 2" (continuam válidos) e "Handoff Claude + Gemini" (arquivado; não é mais usado).
