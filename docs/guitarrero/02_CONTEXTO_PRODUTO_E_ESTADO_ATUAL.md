# 02 — Contexto: Produto e Estado Atual do Guitarrero

Documento de contexto · 21/11/2026 · Autor: Claude (gestão)

## 1. O produto

**Guitarrero** (de "Guitar Hero" + "guitarreiro") é um software desktop nativo para Windows, 100% local, para o músico estudar uma música específica com o próprio equipamento. Primeiro para uso do Link; publicação gratuita ou comercial fica para depois da v1.0, se o resultado justificar.

Duas funções principais:

| Módulo | Pergunta que responde | Origem |
|---|---|---|
| Timbre | "Como regulo os meus 9 equipamentos para chegar perto do timbre desta música?" | Timbrador Profissional / Tone Lab Pro v7.5 |
| TAB | "Como toco esta parte de um jeito que eu consiga, e como treino até conseguir?" | TAB Simplifier Pro (Yousician Arpeggiator & Single String Trainer) |

O que une os dois é a música em estudo: música, artista, trecho, afinação, BPM e tom. Hoje o TAB Simplifier passa isso ao Tone Lab copiando um texto ("Pacote de Sincronia", função copyPackageForToneLabPro). No Guitarrero, os dois módulos leem o mesmo registro de música, sem copiar e colar.

Limite físico declarado pelo Link: o software sugere a melhor regulagem para o equipamento que o músico tem. Ele não transforma um violão acústico num stack Marshall; a ficha de equipamento do usuário define o teto de fidelidade.

## 2. Ativos existentes (inventário em 21/11/2026)

### 2.1 Tone Lab Pro v7.5 (protótipo do Módulo Timbre)
- Arquivo HTML único: 4.259 linhas, 317 KB, Tailwind e Lucide por CDN.
- 10 blocos: (1) Console de Engenharia Reversa, etapas 0 a 6; (2) Pedaleira com 9 unidades, knobs 0–10; (3) Cabine de Estúdio (12 sintomas, NLP com trava de negação, sampler A/B); (4) Simulador DSP polifônico de 6 cordas; (5–9) Dossiê técnico e tabela compacta; (10) Evidenciador Delta DE ➔ PARA. Modais: catálogo BOMGE 01–24, diapasão Rowin, blueprint M-Track.
- Dados: 8 modos, 25 gêneros em 4 categorias, 14 chips de textura, 12 sintomas, 21 perfis de músicas conhecidas (KNOWN_SONGS_AND_ARTISTS_DB).
- Persistência: localStorage, slots v1.0/v1.1/v1.2, backup com schemaVersion "TONELAB_V7_5" (lê também a chave antiga TONELAB_SESSION_SLOTS_V5).
- Rede: uma única consulta opcional ao noembed.com para título de vídeo do YouTube.
- Conferido hoje no código v7.5: as divergências D-01 (gate falso: ganho fixo 0,15 acima de 8,8), D-02 (agudo da BOMGE em 7.500 Hz), D-04 (Goertzel mede 1 frequência por banda: 120, 340, 950, 2.600 e 5.400 Hz) e D-05 (escore A/B fixo "87%") registradas na Etapa 2 sobre a v7.0 continuam presentes na v7.5. A Etapa 2 segue válida.

### 2.2 TAB Simplifier Pro (protótipo do Módulo TAB)
- Arquivo HTML único: 4.668 linhas, 290 KB, Tailwind e Lucide por CDN.
- 5 blocos: (1) Console universal de ingestão, transposição e simplificação, etapas 0 a 6; (2) Palco Yousician (pista "highway" com cores por dedo, comparador original × simplificado, YouTube embutido); (3) Braço interativo 0–20 casas com modo editor; (4) Dossiê musicológico e escada de 3 sprints de velocidade; (5) Quiz de notas, 5 etapas pedagógicas, projetos salvos.
- Motores: parser universal de tablatura ASCII com articulações; 8 modos biomecânicos (Arpejado 4 dedos, Box Viterbi, Corda única 0→12, Riffs em cabeça de tempo, Power chord → tônica, Bends → casa alvo, Cordas soltas como pivô, Linha de baixo na guitarra); 8 filtros acumuláveis; otimização de dedilhado por programação dinâmica (Viterbi) com custos de salto de casa, troca de corda e uso do mindinho; detector de tom/modo em Z12; síntese Karplus-Strong com 4 timbres; metrônomo, loop A-B, contagem e velocidades 50–100%.
- 10 afinações + personalizada; paleta de dedos Yousician: Solta cinza #94A3B8, D1 amarelo #FACC15, D2 roxo #C084FC, D3 azul #60A5FA, D4 laranja #FB923C.
- Persistência: localStorage, chave tab_simplifier_pro_yousician_v4; export/import JSON.

### 2.3 Documentos aprovados
- "Timbrador Profissional — Etapa 1: Concepção e Definição de Escopo" (aprovado): stack, cadeia física, US-01 a US-06, MVP v1.0 e backlog v2.0.
- "Timbrador Profissional — Etapa 2: Arquitetura, Modelagem de Dados, Contratos e Wireframes" (proposta; 6 decisões pendentes): ADR-001 a 005, árvore de diretórios, DER, contratos TypeScript, wireframes, design system Dark Studio, plano das Etapas 3 e 4.
- Ambiente de nuvem do Claude Code "timbrador-profissional" (Node 22, pnpm, Rust, ffmpeg, bibliotecas do Tauri v2).
- Repositório github.com/Linkozitos/Timbrador-Profissional (público; sem código da aplicação ainda).

## 3. O que os dois protótipos repetem (vira núcleo compartilhado)

| Componente | Tone Lab v7.5 | TAB Simplifier | No Guitarrero |
|---|---|---|---|
| Afinações e MIDI ↔ frequência | sim | sim (10 + custom) | core/music (uma tabela só) |
| Síntese Karplus-Strong de cordas | 6 cordas, T60(f) calibrado | 4 timbres | core/audio/karplusStrong (o modelo calibrado do Timbre, com os perfis do TAB) |
| Extração de ID do YouTube e slug do Songsterr | sim (+ noembed) | sim | core/sources |
| Persistência e backup JSON | localStorage | localStorage | core/persistence (arquivos locais, ADR-003) |
| Registro da música em estudo | campos próprios | campos próprios | core/song (SongContext único) |

Ganho direto: menos código para manter e o fim do copiar e colar entre os apps.

## 4. Dívidas técnicas encontradas no TAB Simplifier (análise de 21/11)

| ID | Onde | Problema | Tratamento proposto |
|---|---|---|---|
| T-01 | detectMusicalKeyAndScaleZ12 | Assume que a primeira nota é a tônica; um riff que começa na 5ª recebe o tom errado | Correlação com perfis de tonalidade (Krumhansl-Schmuckler) sobre o histograma de classes Z12, com teste unitário |
| T-02 | optimizeSequenceWithViterbi | No retrocesso, um índice inválido vira 0 em silêncio; o box da mão é fixo para a sequência inteira | Tornar o erro explícito; permitir troca de posição da mão com custo próprio (estado = corda, casa, âncora) |
| T-03 | assignYousicianFingerForFret | O dedo sai só da distância até a âncora; com "evitar mindinho" a casa +3 vai para o D3 sem checar alcance | Regra de dedo testada contra casos de referência |
| T-04 | copiar TAB / pacote | document.execCommand('copy') está obsoleto | API de área de transferência do Tauri |
| T-05 | renderização | 22 usos de innerHTML em cada protótipo, inclusive com texto colado pelo usuário | Componentes React, sem HTML montado em texto (ADR-005) |
| T-06 | dependências | Tailwind por CDN e lucide@latest sem versão fixa: o app pode mudar sozinho de um dia para o outro | Pacotes locais com versão travada (ADR-001) |

As divergências do Tone Lab (D-01 a D-08) estão na Etapa 2 e no documento 05.

## 5. Indicadores de sucesso (como saber que deu certo)

| Indicador | Meta v1.0 | Como medir |
|---|---|---|
| Fidelidade de timbre | matchScore ≥ 90 entre a referência e a gravação do Link | Fórmula D-05 sobre a sonda espectral de 5 pontos; o número aparece na tela |
| Simplificação jogável | 100% das notas da versão simplificada dentro do box escolhido e sem salto > 4 casas quando o filtro estiver ativo | Teste automatizado sobre os 4 clássicos da biblioteca |
| Fidelidade de alturas | 0 notas com altura errada após transposição | Teste N_MIDI(s, c) = N_aberta(s) + c + Δ para todas as afinações |
| Estabilidade | 0 regressões entre fatias | Suíte Vitest verde no CI a cada entrega |
| Uso offline | App abre e funciona sem internet | Teste manual com Wi-Fi desligado |

Observação honesta sobre os títulos dos protótipos: "95%+ DSP" e "90% de fidelidade" ainda não são medidos em lugar nenhum do código. Na v1.0 a fidelidade passa a ser um número calculado e exibido, e a meta de 90 é um alvo a validar na bancada, não uma garantia.
