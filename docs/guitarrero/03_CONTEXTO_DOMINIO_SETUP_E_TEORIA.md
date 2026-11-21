# 03 — Contexto: Domínio, Bancada Física e Regras Musicais

Documento de contexto · 21/11/2026 · Fonte: Etapa 1, Etapa 2 e protótipos v7.5 / TAB Simplifier de 21/11/2026

## 1. Bancada física do Link (cadeia ativa, nesta ordem)

| # | Unidade | Controles modelados | Notas de modelagem |
|---|---|---|---|
| 1 | Guitarra Tagima TW-510 | Volume, Tone (RC 850 Hz), chave de 5 posições HSS | Superstrato, escala 25,5", cordas Ernie Ball Power Slinky .011–.048, humbucker na ponte |
| 2 | Hotone Soul Press II | Modo V / W / V-W, Warm / Classic, Q | Saída TUNER OUT paralela para o afinador Rowin LT-910 |
| 3 | Kokko FCP2 (compressor) | Sustain, Attack, Level | |
| 4 | Ammoon Noise Gate | Soft / Light, Threshold −70 a +10 dB | Antes do drive. No protótipo não é um gate real (D-01) |
| 5 | Behringer UM300 Ultra Metal | Dist, High (5 kHz), Low (100 Hz), Mid, Mid Freq, Level | Mid Freq f = 200 × 25^(knob/10) Hz |
| 6 | Behringer UC200 Ultra Chorus | Level, Tone, Rate, Depth | Output A mono |
| 7 | Behringer FX600 | 6 algoritmos (FLG, CHO, PHA, DLY, TRM, PIT) + OFF; Level, Par 1, Par 2 | Output A mono; delay T = 60000/BPM ms |
| 8 | Mesa BOMGE BMG-04FDSP | Gain, High, Low (80 Hz), 24 programas DSP, Effect, Level, Main | Agudo modelado em 7.500 Hz (D-02) |
| 9 | Yamaha GA15II | Volume, Treble, Middle, Bass (canal Clean) | 15 W, falante 6,5": evitar subgrave em 60–100 Hz no UM300; construir peso em 80 Hz na BOMGE e em 140–280 Hz |

Fora da cadeia ativa (reserva): interface M-Audio M-Track Solo, pedal Flamma FS02 Reverb (testado com sucesso pelo Link em 20/11), cabo Rocksmith Real Tone.

Amostras de calibração: #01-A Clean Headroom e #01-B Overdrive Ceiling. Slots de sessão: v1.0 Base Teórica, v1.1 Pós-Amostra 1, v1.2 Calibração Final.

Princípios do Módulo Timbre: o app abre em Standby Real (tudo 0,0 / OFF, nenhum modo ou gênero pré-selecionado); todo knob tem controle duplo sincronizado (giro 0,0–10,0 e barra 0–100%).

## 2. Regras musicais do Módulo TAB

### 2.1 Alturas e afinações
- Altura de uma nota: N_MIDI(s, c) = N_aberta(s) + c + Δ, onde s é a corda, c a casa e Δ a compensação de afinação em semitons.
- Frequência: f = 440 × 2^((N_MIDI − 69)/12) Hz.
- Corda única: c_destino = N_MIDI − N_aberta(corda alvo), aceito só se 0 ≤ c_destino ≤ limite de casas (12 por padrão).
- Afinações (MIDI da 6ª para a 1ª corda): E Standard 40 45 50 55 59 64 · Eb 39 44 49 54 58 63 · D 38 43 48 53 57 62 · C# 37 42 47 52 56 61 · C 36 41 46 51 55 60 · Drop D 38 45 50 55 59 64 · Drop C# 37 44 49 54 58 63 · Drop C 36 43 48 53 57 62 · Drop B 35 42 47 52 56 61 · Drop A 33 40 45 50 54 59 · Personalizada.

### 2.2 Dedos (padrão visual Yousician)
| Código | Dedo | Cor |
|---|---|---|
| 0 | Corda solta | Cinza #94A3B8 |
| D1 | Indicador | Amarelo #FACC15 |
| D2 | Médio | Roxo #C084FC |
| D3 | Anelar | Azul #60A5FA |
| D4 | Mindinho | Laranja #FB923C |
Acessibilidade: a cor nunca aparece sozinha; sempre cor + rótulo + código.

### 2.3 Modos de simplificação (8) e filtros acumuláveis (8)
Modos: Arpejado guiado 4 dedos · Box multi-cordas (Viterbi) · Corda única 0→12 · Riffs rápidos em cabeça de tempo · Power chord → tônica · Solos com bend → casa alvo · Dedilhado com cordas soltas como pivô · Linha de baixo nas 4 cordas graves.
Filtros: desmontar acordes · proibir saltos > 4 casas · evitar D4 · limitar casas 0–10 · priorizar soltas · bend → casa fixa · eliminar pestanas · só tônica nos graves.
Nenhum modo vem pré-selecionado ao abrir.

### 2.4 Otimização do dedilhado (Viterbi)
Cada nota gera candidatos (corda, casa). O custo total soma: distância ao box da mão, penalidade de mindinho (0,65; 5,0 com "evitar D4"), salto de casa (×1,15; ×4,5 acima de 4 casas com o filtro), troca de corda (×0,85). O caminho de menor custo é recuperado por retrocesso. Estes pesos são o comportamento de referência; mudanças entram como decisão no 05, com teste antes e depois.

## 3. Repertório de referência do Link
Gêneros preferidos: Heavy Metal, Hard Rock, Grunge e Sertanejo Clássico. Bandas centrais: Black Sabbath, Iron Maiden, Motörhead; também Metallica, AC/DC, Sepultura, Alice in Chains, Nirvana. Metas de estudo: estilo de Randy Rhoads, "Tainted Love" na versão do Sepultura (timbre de Andreas Kisser). Biblioteca do TAB inclui "Into the Void" (Black Sabbath, C#, 104 BPM) como clássico de teste.
