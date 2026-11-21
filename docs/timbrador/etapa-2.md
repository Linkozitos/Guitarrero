# Timbrador Profissional — Etapa 2: Arquitetura, Modelagem de Dados, Contratos e Wireframes
Documento oficial da Etapa 2 · 17/11/2026 · Autor: Claude · Repositório: github.com/Linkozitos/Timbrador-Profissional
Status: proposta para aprovação do Link. Nenhum código-fonte da aplicação foi gerado nesta etapa. Base: documento da Etapa 1, decisão ADR-002 e especificações enviadas pelo Gemini (17/11/2026), conferidas linha a linha contra o código do protótipo legado "Tone Lab Pro v7.0" (arquivo HTML de 4.272 linhas).
-----
## 0\. Conferência das especificações do Gemini contra o código v7.0
Antes de modelar, cada constante enviada pelo Gemini foi procurada no código-fonte do protótipo. Resultado:
### 0.1 Confirmadas (idênticas no código v7.0)
|  |  |  |
| :- | :- | :- |
| **Unidade** | **Constante** | **Valor no código** |
| Tagima TW-510 | Volume | gain = (volume/10)^1,5 |
| Tagima TW-510 | Tone RC (Biquad lowpass) | fc = 850 × (12000/850)^((tone/10)^1,35); Q = 2,4 se tone ≤ 3,0, senão 0,707 |
| Tagima TW-510 | Curvas HSS | Pos 1: 2400 Hz/Q 1,4/+3,2 dB · Pos 2 e 4: 750 Hz/Q 2,4/−4,5 dB · Pos 3: 1100 Hz/Q 1,0/+1,5 dB · Pos 5: 260 Hz/Q 1,2/+2,8 dB |
| Cordas | Decaimento | T60(f) = 3,65 × (0,36/3,65)^normFreq s (E2 82,41 Hz → E4 329,63 Hz) |
| Hotone Soul Press II | Wah | Warm 290–1400 Hz, Classic 360–1800 Hz, Q = 1,8 + (q/10) × 4,5 |
| Kokko FCP2 | Compressor | threshold −12 − (S/10)×34 dB; ratio 1,5 + (S/10)×10,5; attack 0,002 + ((10−A)/10)×0,045 s; release 0,16 s; make-up 0,55 + (L/10)×0,95 |
| Ammoon | Leitura em dB | round(−70 + (k/10)×80) dB |
| UM300 | Distorção | pré-HPF 75 Hz; WaveShaper oversample '4x'; k = 4 + dist×14; x≥0 → tanh(1,15kx); x\<0 → 0,94·tanh(0,85kx) |
| UM300 | EQ | Low shelf 105 Hz (L−5)×2,4 dB · Mid peaking Q 1,65 (M−5)×2,6 dB em 200×25^(k/10) Hz · High shelf 4300 Hz (H−5)×2,2 dB |
| UC200 | Chorus | atraso base 14 ms; LFO 0,4 + (rate/10)×4,6 Hz; depth até 3,5 ms; tone LPF 1400 + (tone/10)×4600 Hz; mix até 42% |
| FX600 | DLY | T = 30 + (Par1/10)×570 ms; inverso Par1 = clamp((T−30)/570×10); BPM: 1/4 = 60000/BPM, 3/8 pont. ×0,75, 1/8 ×0,5, Slapback 65 ms |
| BOMGE | Catálogo | 01 Voice Changer, 02 Magic Sound, 03 Child's Voice, 04–10 Delay A–G, 11–24 Echo + Delay A–N |
| BOMGE | EQ | Low shelf 85 Hz (L−5)×2,2 dB |
| BOMGE | Amostras | \#01-A gain 5,0/high 3,8/low 6,0/effect 0,0/level 0,7/mainOut 0,6 · \#01-B tudo 5,0 e effect 0,0 (GA15II 5/5/5/5 nas duas) |
| BOMGE | Headroom | G = (gain/5) × (level/3,5) × (mainOut/3); limpo se ≤ 1,05 |
| GA15II | Gabinete | HPF 95 Hz; box 480 Hz Q 1,5 1,8 + (B−5)×0,8 dB; mid 740 Hz Q 1,1 (M−5)×1,8 dB; LPF 4200 + (T/10)×900 Hz |
| Sampler | Goertzel | sondas em 120, 340, 950, 2600 e 5400 Hz |

### 0.2 Divergências e lacunas (exigem decisão do Link)
1.  **D-01 Noise Gate (Ammoon):** o código v7.0 não implementa um gate. Ele só aplica ganho fixo de 0,15 quando threshold \> 8,8 e ganho 1,0 nos demais casos, e a chave Soft/Light não altera nada no áudio. A fórmula de dB é usada apenas para exibir o valor. Proposta: implementar um gate real (detector de envelope em AudioWorklet, com Soft = rampa de 40 ms e Light/Hard = rampa de 4 ms) na Fatia 2, mantendo a paridade com o legado na Fatia 1.
2.  **D-02 Agudo da BOMGE:** a Etapa 1 diz "High 12 kHz"; o código v7.0 usa shelf em **7500 Hz**; o Gemini cita "7,5–12 kHz". Proposta: usar 7500 Hz (valor que o simulador realmente usa e que foi calibrado pelas amostras) e corrigir a Etapa 1 numa revisão.
3.  **D-03 "Datasheets oficiais":** as impedâncias citadas (Hotone 1 MΩ/100 Ω, Kokko 1 MΩ/10 kΩ, UM300 500 kΩ) e o "+4 dBu" da Amostra \#01-B **não aparecem no código** e não foram conferidas em manuais. Ficam como informação de referência, sem uso no DSP, até alguém validar nos manuais.
4.  **D-04 Goertzel:** o código mede **uma única frequência por banda** (sonda Goertzel de bloco 512 nos 16.384 samples centrais), não a energia da faixa inteira. Os rótulos de faixa ("Graves 80–160 Hz" etc.) prometem mais do que a medição entrega. Proposta: manter as 5 sondas na v1.0 e renomear para "Sonda espectral de 5 pontos"; a média de 3 sondas por banda fica como melhoria opcional.
5.  **D-05 Escore A/B fixo:** os textos "87% (Pronto p/ Calibrar)" e "79% (Desvio Detectado)" são fixos no código, não calculados. Proposta: a v1.0 calcula matchScore = 100 − média(|alvo − real|) × 10.
6.  **D-06 FX600:** são 6 algoritmos + a opção OFF (Bypass), totalizando 7 opções no seletor. Na simulação, só DLY usa Par1 como tempo; nos demais, Par1 controla a velocidade do LFO (0,5 + (Par1/10)×5,5 Hz), e PIT é aproximado por um filtro peaking em 520 Hz (não há transposição real de altura).
7.  **D-07 Constantes ausentes no texto do Gemini** (presentes no código e incluídas nos contratos): Hotone em modo V gain = (v/10)^1,4; joelho do Kokko 18 dB; nível do UM300 0,35 + (L/10)×1,15; ganho da BOMGE 0,4 + (G/10)×1,2; volume do GA15II 0,25 + (V/10)×0,95; realimentação do delay min(0,58; (Par2/10)×0,62); mix do delay min(0,45; Level\_FX600×0,035 + Effect\_BOMGE×0,025); saturação de console curva UM300 com dist = (G−1)×3,2 quando o UM300 está desligado e G \> 1,05; escala do Goertzel clamp(2,5 + log10(max(0,0005; mag)×180)×3,1).
8.  **D-08 Compatibilidade com o legado:** o v7.0 guarda os slots na chave TONELAB\_SESSION\_SLOTS\_V5 e exporta backups com schemaVersion: "TONELAB\_V5\_0". O importador da v1.0 deve aceitar esse formato e migrá-lo para TONELAB\_DESKTOP\_V1.
-----
## 1\. Decisões arquiteturais (ADRs) e estrutura de diretórios
### ADR-001 — Pilha: Tauri v2 + React + TypeScript estrito + Tailwind local + Web Audio API
  - **Contexto:** o protótipo é um HTML monolítico de 318 KB que carrega Tailwind por CDN e depende de navegador.
  - **Decisão:** Tauri v2 como casca nativa (instaladores .msi/.exe e .dmg/.app; WebView2 no Windows e WKWebView no macOS); React 18 + Vite; TypeScript com strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes e regra ESLint @typescript-eslint/no-explicit-any: error; Tailwind CSS instalado como pacote (sem CDN); lucide-react; Web Audio API para todo o DSP.
  - **Bibliotecas adicionais propostas:** zod (valida JSON importado e arquivos lidos do disco em tempo de execução, já que tipos TypeScript não existem em runtime) e zustand (store único, sem boilerplate, testável fora do React). Plugins Tauri: @tauri-apps/plugin-fs e @tauri-apps/plugin-dialog.
  - **Consequências:** o código Rust fica mínimo (só o bootstrap do Tauri e os plugins); toda a regra de negócio é TypeScript puro e testável com Vitest. Os instaladores de Windows e macOS precisam ser gerados nas respectivas plataformas (máquina do Link ou CI).
### ADR-002 — Extrator híbrido offline-first com degradação graciosa
  - **Motor primário (100% local, determinístico):** parseSongsterrUrlSlug (limpa o slug, detecta -bass-tab, solo/lead, clean/acoustic/intro, separa artista pela lista de prefixos conhecidos) + extractYoutubeVideoId (watch, embed, shorts, youtu.be) + KNOWN\_SONGS\_AND\_ARTISTS\_DB (21 perfis por expressão regular). Nenhuma requisição de rede.
  - **Adaptador opcional (metadataFetcher.ts):** só é chamado quando há ID do YouTube e o motor primário não encontrou título. Faz fetch a https://noembed.com/embed?url=https://www.youtube.com/watch?v={id} com AbortController de 2500 ms. Qualquer falha (offline, timeout, HTTP ≠ 200, JSON sem title) retorna { kind: 'unavailable' } sem exceção nem aviso de erro; a UI apenas mantém os campos manuais songInput e artistInput editáveis.
  - **Mini-player do YouTube:** oculto por padrão; o \<iframe\> (domínio youtube-nocookie.com) só é criado após clique explícito.
  - **Isolamento:** o domínio (src/domain/\*\*) nunca importa metadataFetcher. Apenas a camada ui o chama, e a CSP do Tauri restringe a rede a esses dois destinos.
### ADR-003 — Persistência em arquivos JSON locais com escrita atômica (proposta do Claude)
  - **Decisão:** v1.0 usa arquivos JSON versionados em appDataDir()/tonelab/ via plugin-fs. SQLite fica para a v2.0 (item "a" do backlog: histórico ilimitado).
  - **Motivo:** os dados da v1.0 são pequenos (3 slots, 25 presets + customizados, histórico curto de amostras), legíveis por humanos e exportáveis sem conversão.
### ADR-004 — Domínio puro + motor de áudio persistente (proposta do Claude)
  - **Problema no legado:** o grafo de áudio é recriado a cada "Play", e os parâmetros são atribuídos com .value = diretamente, o que pode gerar estalos ao girar knobs durante a reprodução.
  - **Decisão:** (a) funções puras em src/domain/dsp/transfer/\*.ts convertem HardwareChainState em AudioGraphParams (números já calculados, cobertos por Vitest); (b) src/audio/AudioEngine.ts cria o grafo de 9 estágios **uma vez** e aplica mudanças com setTargetAtTime(valor, agora, 0,015); (c) curvas do WaveShaper ficam em cache por valor de dist arredondado a 0,1.
### ADR-005 — Segurança e rede (proposta do Claude)
  - **CSP do Tauri:** default-src 'self'; connect-src 'self' https://noembed.com; frame-src https://www.youtube-nocookie.com; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'.
  - **Permissões (capabilities) do Tauri:** fs limitado a $APPDATA/tonelab/\*\* e a arquivos escolhidos pelo usuário via diálogo (import/export/amostras); nenhum shell; nenhum acesso a outros diretórios.
  - **HTML gerado:** os textos do dossiê no legado são strings com \<strong\>/\<code\> inseridas como HTML. Na v1.0 passam a ser estruturas tipadas (RichTextSegment\[\]) renderizadas pelo React, sem dangerouslySetInnerHTML.
### 1.1 Árvore de diretórios do monólito modular
``` Unset
timbrador-profissional/
├── src-tauri/                         # Casca nativa (Rust mínimo)
│   ├── Cargo.toml
│   ├── tauri.conf.json                # Janela, CSP, bundle (msi/nsis/dmg/app)
│   ├── capabilities/default.json      # Permissões fs/dialog restritas
│   ├── icons/
│   └── src/
│       ├── main.rs
│       └── lib.rs                     # Registro de plugin-fs e plugin-dialog
├── src/
│   ├── main.tsx                       # Bootstrap React
│   ├── App.tsx                        # Shell: AppBar + QuickJumper + Blocos + BottomNav
│   ├── domain/                        # TypeScript puro: sem React, sem DOM, sem Tauri
│   │   ├── types/
│   │   │   ├── knob.ts                # KnobValue, PercentValue, conversores
│   │   │   ├── hardware.ts            # 9 estados de unidade + HardwareChainState
│   │   │   ├── preset.ts              # TonePresetDocument, RichTextSegment
│   │   │   ├── catalog.ts             # OperationModeSpec, GenrePresetSpec, chips, sintomas
│   │   │   ├── spectral.ts            # SpectralBandsProfile, SampleAbRecord
│   │   │   ├── diff.ts                # RigDiffEntry
│   │   │   ├── nlp.ts                 # NlpCalibrationResult
│   │   │   ├── extractor.ts           # ExtractedSongMetadata
│   │   │   └── store.ts               # LocalWorkspaceStore e envelopes de persistência
│   │   ├── catalogs/
│   │   │   ├── operationModes.ts      # 8 modos
│   │   │   ├── genreCategories.ts     # 4 categorias
│   │   │   ├── genres.ts              # 25 gêneros
│   │   │   ├── textureChips.ts        # 14 chips
│   │   │   ├── cabinSymptoms.ts       # 12 sintomas
│   │   │   ├── spectralBands.ts       # 5 bandas
│   │   │   ├── bomgePrograms.ts       # 24 programas
│   │   │   ├── fx600Algorithms.ts     # OFF + 6 algoritmos
│   │   │   ├── pickupPositions.ts     # 5 posições
│   │   │   ├── tunings.ts             # 10 afinações
│   │   │   ├── songTracks.ts          # 11 faixas Songsterr + 9 trechos
│   │   │   ├── knownSongs.ts          # KNOWN_SONGS_AND_ARTISTS_DB (21 perfis)
│   │   │   ├── calibrationSamples.ts  # #01-A e #01-B
│   │   │   └── excerpts.ts            # 7 trechos tablaturados do simulador
│   │   ├── presets/
│   │   │   ├── standby.ts             # createZeroedStandbyPreset()
│   │   │   ├── neutral.ts             # createNeutralGuitarPreset()
│   │   │   ├── benchShortcuts.ts      # #01-A, Flat 5/5/5, Ligar Cadeia Padrão, Quarto Seguro
│   │   │   ├── consoleSolver.ts       # recomputeRigFromConsoleSelectors (modo+gênero+chips+afinação…)
│   │   │   └── dossier.ts             # generateDynamicMusicianDossier (Blocos 5 a 9)
│   │   ├── dsp/
│   │   │   ├── transfer/              # Uma função pura por unidade: estado → parâmetros de áudio
│   │   │   │   ├── guitar.ts
│   │   │   │   ├── hotone.ts
│   │   │   │   ├── kokko.ts
│   │   │   │   ├── ammoon.ts
│   │   │   │   ├── um300.ts           # inclui um300MidFreqToHz e makeUM300DistortionCurve
│   │   │   │   ├── uc200.ts
│   │   │   │   ├── fx600.ts           # inclui delayMsToPar1 e bpmToDelayMs
│   │   │   │   ├── bomge.ts           # inclui headroomIndex
│   │   │   │   └── ga15ii.ts
│   │   │   ├── karplusStrong.ts       # síntese de 6 cordas com T60(f)
│   │   │   ├── tuning.ts              # semitons por afinação
│   │   │   └── graphParams.ts         # HardwareChainState → AudioGraphParams
│   │   ├── acoustics/
│   │   │   ├── goertzel.ts            # sonda de 5 pontos sobre Float32Array
│   │   │   ├── expectedProfile.ts     # computeExpectedSpectralProfile
│   │   │   ├── matchScore.ts          # escore A/B calculado (D-05)
│   │   │   ├── symptoms.ts            # applySingleSymptomMutation (12 sintomas)
│   │   │   └── sampleCalibration.ts   # calibrateRigFromSampleComparison
│   │   ├── nlp/
│   │   │   ├── clauses.ts             # divisão em cláusulas (e, mas, porém, com, vírgula)
│   │   │   ├── negationGuard.ts       # preventMud, preventFizz, cláusulas negadas
│   │   │   └── parser.ts              # parseAndExecuteRoomFeedbackNLP
│   │   ├── extractor/
│   │   │   ├── songsterr.ts           # parseSongsterrUrlSlug
│   │   │   ├── youtube.ts             # extractYoutubeVideoId
│   │   │   └── resolve.ts             # combina slug + KNOWN_SONGS → ExtractedSongMetadata
│   │   └── diff/
│   │       └── rigDiff.ts             # computeRigDiffs (limiar 0,1)
│   ├── audio/                         # Única camada que toca a Web Audio API
│   │   ├── AudioEngine.ts             # grafo persistente de 9 estágios
│   │   ├── SimulatorPlayer.ts         # agenda notas, loop, velocidade 100%/75%
│   │   ├── ReferenceTone.ts           # diapasão Rowin
│   │   ├── decodeSample.ts            # File → Float32Array (decodeAudioData)
│   │   └── worklets/noiseGate.worklet.ts   # gate real (Fatia 2, D-01)
│   ├── services/
│   │   └── metadataFetcher.ts         # ADR-002: noembed opcional, 2500 ms
│   ├── persistence/
│   │   ├── paths.ts                   # appDataDir()/tonelab/*.json
│   │   ├── schemas.ts                 # esquemas zod espelhando domain/types
│   │   ├── atomicJson.ts              # leitura/escrita atômica com fallback
│   │   ├── workspaceRepo.ts
│   │   ├── slotsRepo.ts
│   │   ├── presetsRepo.ts
│   │   ├── sampleHistoryRepo.ts
│   │   ├── backup.ts                  # export/import .json (inclui migração V5)
│   │   └── migrations/v5ToDesktopV1.ts
│   ├── state/
│   │   └── workspaceStore.ts          # zustand: estado ativo, revisão, diff, ações
│   └── ui/
│       ├── theme/tokens.css           # paleta Dark Studio e espaçamentos de 8 pt
│       ├── components/                # peças reutilizáveis
│       │   ├── Knob.tsx               # SVG concêntrico −135° a +135°
│       │   ├── LevelBar.tsx           # 0–100% sincronizada com o knob
│       │   ├── DragCallout.tsx        # balão anti-oclusão a 56 px
│       │   ├── Footswitch.tsx
│       │   ├── SegmentedSelect.tsx
│       │   ├── DeltaBadge.tsx
│       │   ├── HeadroomMeter.tsx
│       │   ├── Chip.tsx
│       │   ├── Modal.tsx
│       │   └── Toast.tsx
│       ├── layout/
│       │   ├── TopAppBar.tsx
│       │   ├── QuickJumperBar.tsx
│       │   └── BottomNavBar.tsx
│       ├── blocks/
│       │   ├── B01ReverseEngineeringConsole/   # Etapas internas 0 a 6
│       │   ├── B02PedalboardPanel/              # 9 cards + slots
│       │   ├── B03StudioCabin/                  # 3.1, 3.2, 3.3
│       │   ├── B04DspSimulator/
│       │   ├── B05to09EngineeringDossier/
│       │   └── B10ChangeEvidencer/
│       └── modals/
│           ├── BomgeCatalogModal.tsx
│           ├── RowinTunerModal.tsx
│           └── FutureBlueprintModal.tsx
├── tests/
│   ├── domain/dsp/                    # equações de transferência (tabelas de valores)
│   ├── domain/acoustics/              # Goertzel com senoides sintéticas
│   ├── domain/nlp/                    # frases com negação
│   ├── domain/extractor/              # URLs reais do Songsterr/YouTube
│   ├── domain/presets/                # standby, atalhos, consoleSolver
│   ├── persistence/                   # JSON corrompido, migração V5
│   └── fixtures/legacy-v5-backup.json
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── eslint.config.js
├── .prettierrc
└── README.md
```
**Regras de dependência (verificadas por ESLint no-restricted-imports):**
``` Unset
ui ──► state ──► domain
ui ──► audio ──► domain
ui ──► services          (somente metadataFetcher)
state ──► persistence ──► domain
domain ──► (nada)        domain não importa React, DOM, Tauri, audio, services nem persistence
```
-----
## 2\. Modelagem de dados (DER) e persistência local offline-first
### 2.1 Diagrama entidade-relacionamento (Mermaid)
``` Unset
erDiagram
    LOCAL_WORKSPACE_STORE ||--|| TONE_PRESET_DOCUMENT : "activeTone"
    LOCAL_WORKSPACE_STORE ||--o| TONE_PRESET_DOCUMENT : "previousTone"
    LOCAL_WORKSPACE_STORE ||--|| CONSOLE_SELECTION : "console"
    SESSION_CALIBRATION_SLOTS ||--o| TONE_PRESET_DOCUMENT : "v1_0"
    SESSION_CALIBRATION_SLOTS ||--o| TONE_PRESET_DOCUMENT : "v1_1"
    SESSION_CALIBRATION_SLOTS ||--o| TONE_PRESET_DOCUMENT : "v1_2"
    LOCAL_PRESETS_LIBRARY ||--|{ LIBRARY_PRESET_ENTRY : "contém"
    LIBRARY_PRESET_ENTRY ||--|| TONE_PRESET_DOCUMENT : "document"
    LIBRARY_PRESET_ENTRY }o--o| GENRE_PRESET_SPEC : "genreKey"
    SAMPLE_AB_HISTORY ||--o{ SAMPLE_AB_RECORD : "registros"
    SAMPLE_AB_RECORD ||--|| SPECTRAL_BANDS_PROFILE : "expected"
    SAMPLE_AB_RECORD ||--|| SPECTRAL_BANDS_PROFILE : "measured"
    SAMPLE_AB_RECORD }o--o| TONE_PRESET_DOCUMENT : "rigSnapshot"
    TONE_PRESET_DOCUMENT ||--|| HARDWARE_CHAIN_STATE : "rig"
    HARDWARE_CHAIN_STATE ||--|| UNIT_STATE : "9 unidades"
```
### 2.2 DER em ASCII (mesmo conteúdo)
``` Unset
┌──────────────────────────────┐         ┌──────────────────────────────┐
│ local_workspace_store        │ 1     1 │ tone_preset_document         │
│ (workspace.json)             │────────►│ id, title, subtitle, mode,   │
│ schemaVersion                │ active  │ song, artist, tuning,        │
│ revision (inteiro ≥ 0)       │         │ songsterrTrack, genreKey,    │
│ isRigInZeroStandby           │ 0..1    │ rig ─────────────┐           │
│ activeTone ──────────────────┼────────►│ dossier          │           │
│ previousTone                 │ previous│ createdAt/updatedAt          │
│ console (seleções etapas 0–6)│         └──────────────────┼───────────┘
│ ui (layout, aba, filtro)     │                            │ 1
│ activeSlot                   │                            ▼ 1
│ sessionMeta (abertura etc.)  │         ┌──────────────────────────────┐
└──────────────────────────────┘         │ hardware_chain_state (9)     │
                                         │ guitar, hotone, kokko,       │
┌──────────────────────────────┐ 0..1    │ ammoon, um300, uc200, fx600, │
│ session_calibration_slots    │────────►│ bomge, ga15ii                │
│ (slots.json)                 │ ×3      └──────────────────────────────┘
│ v1_0 Base Teórica            │
│ v1_1 Pós-Sample 1            │
│ v1_2 Calibração Final        │
└──────────────────────────────┘

┌──────────────────────────────┐ 1    N  ┌──────────────────────────────┐
│ local_presets_library        │────────►│ library_preset_entry         │
│ (presets.json)               │         │ id, origin(builtin|custom),  │
└──────────────────────────────┘         │ genreKey?, name, tags,       │
                                         │ document (tone_preset_doc)   │
                                         └──────────────────────────────┘

┌──────────────────────────────┐ 1    N  ┌──────────────────────────────┐
│ sample_ab_history            │────────►│ sample_ab_record             │
│ (sample-history.json, ≤ 50)  │         │ id, fileName, sampleRateHz,  │
└──────────────────────────────┘         │ durationSec, analyzedAt,     │
                                         │ expected: 5 bandas           │
                                         │ measured: 5 bandas           │
                                         │ matchScore, rigSnapshot?     │
                                         └──────────────────────────────┘
```
### 2.3 Arquivos em disco
Pasta: appDataDir()/tonelab/ (Windows: %APPDATA%\\com.linkozitos.timbrador\\tonelab\\; macOS: \~/Library/Application Support/com.linkozitos.timbrador/tonelab/).
|  |  |  |
| :- | :- | :- |
| **Arquivo** | **Entidade** | **Conteúdo** |
| workspace.json | local\_workspace\_store | Estado ativo, revisão, flag de standby, seleções do console, preferências de UI, slot ativo |
| slots.json | session\_calibration\_slots | 3 slots (v1\_0, v1\_1, v1\_2), cada um TonePresetDocument ou null |
| presets.json | local\_presets\_library | Somente presets **customizados**; os 25 de gênero vêm do catálogo embarcado e não são gravados |
| sample-history.json | sample\_ab\_history | Até 50 registros (FIFO), sem o áudio, só os perfis |
| \*.bak | backup automático | Última versão válida de cada arquivo |

Todos os arquivos usam o mesmo envelope:
``` JSON
{
  "schemaVersion": "TONELAB_DESKTOP_V1",
  "kind": "workspace | slots | presets | sampleHistory",
  "revision": 42,
  "savedAt": "2026-11-17T21:30:00.000Z",
  "data": { }
}
```
### 2.4 Estratégia de leitura e escrita atômica
**Escrita (atomicJson.write):**
1.  Validar data com o esquema zod correspondente. Se falhar, não gravar e registrar o erro.
2.  Serializar com JSON.stringify(envelope, null, 2).
3.  Gravar em \<arquivo\>.tmp.
4.  Se \<arquivo\> existe e é válido, copiá-lo para \<arquivo\>.bak.
5.  Renomear \<arquivo\>.tmp → \<arquivo\> (renomeação atômica no mesmo volume).
6.  Tudo dentro de try/catch; uma falha mantém o arquivo anterior intacto.
7.  Gravações do workspace usam *debounce* de 400 ms (o arraste de knob a 60 fps não grava a cada quadro); slots, presets e importações gravam imediatamente.
**Leitura (atomicJson.read) com fallback em cascata:**
1.  Ler \<arquivo\> → JSON.parse → checar schemaVersion → validar com zod.
2.  Se qualquer passo falhar, tentar \<arquivo\>.bak da mesma forma.
3.  Se o .bak também falhar, renomear o arquivo ruim para \<arquivo\>.corrupt-\<timestamp\>.json (para inspeção) e usar o padrão seguro:
      - workspace → createZeroedStandbyPreset() com isRigInZeroStandby = true e revision = 0;
      - slots → { v1\_0: null, v1\_1: null, v1\_2: null };
      - presets → \[\];
      - histórico → \[\].
4.  Mostrar um aviso não bloqueante: "Arquivo X estava corrompido; a bancada voltou ao Standby. Cópia guardada para análise."
5.  **Regra de segurança (US-01):** ao abrir o app, a bancada **sempre** inicia em Standby Real, mesmo que o workspace salvo tenha um timbre ativo. O último timbre fica disponível no botão "Retomar última sessão".
**Export (backup.export):** diálogo "Salvar como" → arquivo tonelab-desktop-\<musica\>-\<AAAAMMDD-HHmm\>.json com:
``` JSON
{
  "schemaVersion": "TONELAB_DESKTOP_V1",
  "kind": "backup",
  "exportedAt": "...",
  "app": { "name": "Timbrador Profissional", "version": "1.0.0" },
  "workspace": { },
  "slots": { },
  "customPresets": [ ],
  "sampleHistory": [ ]
}
```
**Import (backup.import):** diálogo "Abrir" → limite de 5 MB → JSON.parse → detectar formato:
  - TONELAB\_DESKTOP\_V1 → validar com zod;
  - TONELAB\_V5\_0 (legado) ou objeto com rig → migrations/v5ToDesktopV1.ts (mapeia yamaha → ga15ii, preenche campos ausentes com o Standby, normaliza knobs com clampKnob, converte textos HTML do dossiê em RichTextSegment\[\]);
  - qualquer outro → recusar com mensagem clara, sem alterar nada.
Antes de aplicar, o app mostra o resumo ("3 slots, 2 presets, timbre: …") e pede confirmação. A importação aplica tudo de uma vez ou nada.
-----
## 3\. Contratos TypeScript estritos (zero any)
Configuração obrigatória do tsconfig.json: "strict": true, "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": true, "noImplicitOverride": true, "noFallthroughCasesInSwitch": true. ESLint: @typescript-eslint/no-explicit-any: "error" e @typescript-eslint/no-unsafe-\*: "error".
### 3.1 Escalas e valores (domain/types/knob.ts)
``` TypeScript
declare const knobBrand: unique symbol;
declare const percentBrand: unique symbol;

/** Valor de potenciômetro 0,0–10,0 com uma casa decimal. Só nasce via toKnob(). */
export type KnobValue = number & { readonly [knobBrand]: 'KnobValue' };

/** Valor de barra 0–100, inteiro. Derivado: percent = round(knob × 10). */
export type PercentValue = number & { readonly [percentBrand]: 'PercentValue' };

export const KNOB_MIN = 0 as const;
export const KNOB_MAX = 10 as const;
export const KNOB_CENTER = 5 as const;

/** Equivale ao clampKnob do legado: NaN → 5,0; limita a 0–10; arredonda a 0,1. */
export declare function toKnob(raw: unknown): KnobValue;
export declare function knobToPercent(k: KnobValue): PercentValue;
export declare function percentToKnob(p: PercentValue): KnobValue;

/** Ângulo do ponteiro SVG: −135° (0,0) a +135° (10,0). */
export declare function knobToAngleDeg(k: KnobValue): number;

export type Hz = number;
export type Decibel = number;
export type Milliseconds = number;
export type Seconds = number;
export type Bpm = number; // 50–240
```
### 3.2 As 9 unidades (domain/types/hardware.ts)
``` TypeScript
import type { KnobValue } from './knob';

export type UnitKey =
  | 'guitar' | 'hotone' | 'kokko' | 'ammoon' | 'um300'
  | 'uc200' | 'fx600' | 'bomge' | 'ga15ii';

/** Ordem física inviolável da cadeia ativa. */
export const CHAIN_ORDER: readonly UnitKey[] = [
  'guitar', 'hotone', 'kokko', 'ammoon', 'um300', 'uc200', 'fx600', 'bomge', 'ga15ii',
] as const;

interface UnitBase {
  readonly active: boolean;
  /** Observação curta exibida no card (texto puro). */
  readonly note: string;
}

export type PickupPosition = 1 | 2 | 3 | 4 | 5;
// 1 Ponte (Humbucker) · 2 Ponte+Meio (Split) · 3 Meio (Single) · 4 Meio+Braço · 5 Braço (Single)

export interface GuitarTw510State extends UnitBase {
  readonly pickup: PickupPosition;
  readonly volume: KnobValue;
  readonly tone: KnobValue;
}

export type HotoneMode = 'V' | 'W' | 'VW';
export type HotoneRange = 'Warm' | 'Classic';
export interface HotoneSoulPressState extends UnitBase {
  readonly mode: HotoneMode;
  readonly range: HotoneRange;
  readonly q: KnobValue;
  /** Posição do pedal 0–10 (volume ou varredura do wah). */
  readonly pedal: KnobValue;
}

export interface KokkoFcp2State extends UnitBase {
  readonly sustain: KnobValue;
  readonly attack: KnobValue;
  readonly level: KnobValue;
}

export type AmmoonGateMode = 'Soft' | 'Light';
export interface AmmoonGateState extends UnitBase {
  readonly mode: AmmoonGateMode;
  /** 0–10 ↔ −70 a +10 dB. */
  readonly threshold: KnobValue;
}

export interface Um300State extends UnitBase {
  readonly dist: KnobValue;
  readonly low: KnobValue;
  readonly mid: KnobValue;
  /** 0–10 ↔ 200 Hz a 5000 Hz (logarítmico). */
  readonly midFreq: KnobValue;
  readonly high: KnobValue;
  readonly level: KnobValue;
}

export interface Uc200State extends UnitBase {
  readonly level: KnobValue;
  readonly tone: KnobValue;
  readonly rate: KnobValue;
  readonly depth: KnobValue;
}

export type Fx600Algorithm = 'OFF' | 'DLY' | 'CHO' | 'FLG' | 'PHA' | 'TRM' | 'PIT';
export interface Fx600State extends UnitBase {
  readonly algorithm: Fx600Algorithm;
  readonly level: KnobValue;
  readonly par1: KnobValue;
  readonly par2: KnobValue;
}

/** "01" a "24". */
export type BomgeProgramId =
  | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'
  | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24';

export interface BomgeBmg04State extends UnitBase {
  readonly gain: KnobValue;
  readonly high: KnobValue;
  readonly low: KnobValue;
  readonly program: BomgeProgramId;
  readonly effect: KnobValue;
  readonly level: KnobValue;
  readonly mainOut: KnobValue;
}

export type Ga15Channel = 'CLEAN';
export interface YamahaGa15iiState extends UnitBase {
  readonly channel: Ga15Channel;
  readonly volume: KnobValue;
  readonly treble: KnobValue;
  readonly middle: KnobValue;
  readonly bass: KnobValue;
}

export interface HardwareChainState {
  readonly guitar: GuitarTw510State;
  readonly hotone: HotoneSoulPressState;
  readonly kokko: KokkoFcp2State;
  readonly ammoon: AmmoonGateState;
  readonly um300: Um300State;
  readonly uc200: Uc200State;
  readonly fx600: Fx600State;
  readonly bomge: BomgeBmg04State;
  readonly ga15ii: YamahaGa15iiState;
}

/** Caminho tipado de um parâmetro numérico, p.ex. 'um300.midFreq'. */
export type KnobPath = {
  [U in UnitKey]: {
    [P in keyof HardwareChainState[U]]: HardwareChainState[U][P] extends KnobValue
      ? `${U}.${P & string}` : never
  }[keyof HardwareChainState[U]]
}[UnitKey];
```
### 3.3 Catálogos (domain/types/catalog.ts)
``` TypeScript
import type { KnobValue, Bpm } from './knob';
import type { PickupPosition } from './hardware';

export type OperationModeId =
  | 'guitar_fiel' | 'guitar_lead' | 'guitar_adapt' | 'guitar_clean'
  | 'guitar_crunch' | 'guitar_harmony' | 'acoustic_sim' | 'bass_sim';

export type PlayingDensity = 'power_chords' | 'dyads_thirds' | 'open_chords' | 'lead_single';
export type NeckRegion = 'low_frets' | 'mid_frets' | 'high_frets';

export interface OperationModeSpec {
  readonly id: OperationModeId;
  readonly icon: string;          // nome do ícone lucide-react
  readonly label: string;
  readonly track: SongsterrTrack;
  readonly part: SongPart;
  readonly density: PlayingDensity;
  readonly neck: NeckRegion;
}

export type GenreCategoryId = 'cat_classic' | 'cat_grunge' | 'cat_punk' | 'cat_metal';
export interface GenreCategorySpec {
  readonly id: GenreCategoryId;
  readonly title: string;
  readonly accent: 'amber' | 'cyan' | 'rose' | 'violet';
}

export type GenreKey =
  | 'classic_rock' | 'hard_rock' | 'psychedelic_rock' | 'prog_rock'
  | 'grunge' | 'alt_rock' | 'goth_rock' | 'post_punk'
  | 'punk_rock' | 'hardcore' | 'pop_punk' | 'anarcho_punk' | 'street_punk' | 'oi_punk' | 'crossover'
  | 'heavy_metal_trad' | 'thrash_metal' | 'death_metal' | 'black_metal' | 'power_metal'
  | 'doom_metal' | 'prog_metal' | 'nu_metal' | 'metalcore' | 'symphonic_metal';

export interface GenrePresetSpec {
  readonly key: GenreKey;
  readonly category: GenreCategoryId;
  readonly name: string;
  readonly descriptor: string;     // campo "artists" do legado
  readonly scaleMode: string;
  readonly bpm: Bpm;
  readonly mode: OperationModeId;
  readonly tuning: TuningId;
  readonly pickup: PickupPosition;
  readonly guitarTone: KnobValue;  // gTone
  readonly um300: {
    readonly dist: KnobValue; readonly low: KnobValue; readonly mid: KnobValue;
    readonly midFreq: KnobValue; readonly high: KnobValue;
  };
  readonly chorus: boolean;
  readonly delay: boolean;
  readonly bomge: { readonly low: KnobValue; readonly high: KnobValue; readonly effect: KnobValue };
}

export type TuningId =
  | 'E_STD' | 'EB_STD' | 'D_STD' | 'CS_STD' | 'C_STD'
  | 'DROP_D' | 'DROP_CS' | 'DROP_C' | 'DROP_B' | 'DROP_A';
export interface TuningSpec {
  readonly id: TuningId;
  readonly label: string;          // "E Standard (E A D G B E — 440 Hz)"
  readonly semitoneShift: number;  // 0, −1, −2, −3, −4; drops por corda
  readonly perStringShift: readonly [number, number, number, number, number, number];
}

export type TuningStrategy = 'real_tuned' | 'keep_standard' | 'pitch_fx600';
export type DelaySubdivision = 'quarter' | 'dotted_eighth' | 'eighth' | 'slapback';
export type ListeningContext = 'bedroom' | 'night_fletcher_munson' | 'mic_recording' | 'rehearsal';
export type ReferenceMix = 'studio_album' | 'songsterr_backing' | 'live_stadium';

export type SongsterrTrack =
  | 'rhythm_distorted' | 'lead_distorted' | 'crunch_rhythm' | 'crunch_chorus_grunge'
  | 'clean_intro' | 'clean_ambient' | 'lead_wah' | 'twin_harmony'
  | 'acoustic_sim' | 'bass_fingered' | 'bass_picked';

export type SongPart =
  | 'main_riff' | 'clean_intro' | 'verse_soft' | 'chorus_heavy' | 'solo_lead'
  | 'solo_wah' | 'harmony_thirds' | 'breakdown' | 'bass_groove';

export type TextureChipId =
  | 'more_weight' | 'no_fizz' | 'chord_definition' | 'tight_palm_mute'
  | 'liquid_sustain' | 'silent_gate' | 'scooped_mids' | 'british_mids'
  | 'warm_tube' | 'studio_ambience' | 'lush_chorus' | 'use_wah'
  | 'acoustic_shimmer' | 'simulate_4x12';

export type CabinSymptomKey =
  | 'volume_alto' | 'volume_baixo' | 'abafado' | 'estridente' | 'embolado' | 'magro'
  | 'chiado' | 'gate_cortando' | 'som_caixote' | 'dist_seca' | 'muito_efeito' | 'baixo_guitarra';

export interface CabinSymptomSpec {
  readonly key: CabinSymptomKey;
  readonly icon: string;
  readonly label: string;
}

export interface BomgeProgramSpec {
  readonly id: import('./hardware').BomgeProgramId;
  readonly name: string;           // "04 - Delay A"
  readonly family: 'voice' | 'delay' | 'echo_delay';
}

export interface KnownSongProfile {
  readonly match: RegExp;
  readonly artist: string;
  readonly genre: GenreKey;
  readonly bpm: Bpm;
  readonly tuning: TuningId;
  readonly mode: OperationModeId;
  readonly density: PlayingDensity;
  readonly neck: NeckRegion;
  readonly excerpt: ExcerptKey;
}

export type ExcerptKey =
  | 'bench_sample_01_sweep' | 'mop_riff' | 'trooper_riff' | 'teen_spirit_clean'
  | 'teen_spirit_riff' | 'numb_solo' | 'bass_groove' | 'theme';

export interface ExcerptNote {
  readonly f: number;   // Hz
  readonly t: number;   // início em s
  readonly d: number;   // duração em s
  readonly pm?: true;   // palm mute
}
export interface ExcerptSpec {
  readonly key: ExcerptKey;
  readonly label: string;
  readonly tab: string;
  readonly notes: readonly ExcerptNote[];
}
```
### 3.4 Documento de timbre (domain/types/preset.ts)
``` TypeScript
import type { HardwareChainState } from './hardware';
import type { OperationModeId, GenreKey, TuningId, SongsterrTrack } from './catalog';

export type RichTextSegment =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'strong'; readonly value: string }
  | { readonly kind: 'code'; readonly value: string };
export type RichParagraph = readonly RichTextSegment[];

/** Blocos 5 a 9 do dossiê. */
export interface EngineeringDossier {
  readonly strategy: readonly RichParagraph[];        // Bloco 5
  readonly technique: readonly RichParagraph[];       // Bloco 6 — biomecânica de palhetada
  readonly volumeAndLimits: readonly RichParagraph[]; // Bloco 7 — Fletcher-Munson / limites
  readonly planB: readonly RichParagraph[];           // Bloco 8
  /** Bloco 9 — tabela compacta 0–10 (derivada do rig, não armazenada). */
}

export type PresetOrigin =
  | 'standby' | 'neutral' | 'bench_01A' | 'bench_01B' | 'safe_bedroom'
  | 'genre' | 'console' | 'extractor' | 'symptoms' | 'nlp' | 'sample_calibration'
  | 'manual' | 'slot' | 'import';

export interface TonePresetDocument {
  readonly id: string;                 // UUID v4
  readonly title: string;
  readonly subtitle: string;
  readonly origin: PresetOrigin;
  readonly mode: OperationModeId | null;   // null = Standby (zero pré-seleção)
  readonly genreKey: GenreKey | null;
  readonly song: string;
  readonly artist: string;
  readonly songsterrTrack: SongsterrTrack | null;
  readonly tuning: TuningId;
  readonly rig: HardwareChainState;
  readonly dossier: EngineeringDossier;
  readonly createdAt: string;          // ISO-8601
  readonly updatedAt: string;
}
```
### 3.5 Espectro e amostras (domain/types/spectral.ts)
``` TypeScript
import type { KnobValue, Hz } from './knob';

export type SpectralBandId = 'Low' | 'LowMid' | 'Mid' | 'HighMid' | 'High';

export interface SpectralBandSpec {
  readonly id: SpectralBandId;
  readonly label: string;
  readonly probeHz: Hz; // 120 | 340 | 950 | 2600 | 5400
}

/** Perfil em escala 0–10 por banda. */
export interface SpectralBandsProfile {
  readonly low: KnobValue;
  readonly lowMid: KnobValue;
  readonly mid: KnobValue;
  readonly highMid: KnobValue;
  readonly high: KnobValue;
}

export interface SampleAbRecord {
  readonly id: string;
  readonly fileName: string;
  readonly sampleRateHz: number;
  readonly durationSec: number;
  readonly analyzedAt: string;
  readonly source: 'file' | 'synthetic_test';
  readonly expected: SpectralBandsProfile;
  readonly measured: SpectralBandsProfile;
  readonly matchScore: number;                 // 0–100, calculado (D-05)
  readonly rigSnapshotId: string | null;       // TonePresetDocument.id
}

export type HeadroomState =
  | { readonly kind: 'off' }
  | { readonly kind: 'clean'; readonly index: number }      // ≤ 1,05 (#01-A)
  | { readonly kind: 'saturating'; readonly index: number }; // > 1,05 (#01-B)
```
### 3.6 Diferenças, NLP e extrator
``` TypeScript
// domain/types/diff.ts
import type { UnitKey, KnobPath } from './hardware';
import type { KnobValue } from './knob';

export type RigDiffEntry =
  | {
      readonly kind: 'knob';
      readonly unit: UnitKey;
      readonly path: KnobPath;
      readonly from: KnobValue;
      readonly to: KnobValue;
      readonly delta: number;           // to − from, arredondado a 0,1; |delta| ≥ 0,1
    }
  | {
      readonly kind: 'switch';
      readonly unit: UnitKey;
      readonly field: string;           // 'active' | 'pickup' | 'mode' | 'algorithm' | 'program' …
      readonly from: string;
      readonly to: string;
    };

export interface RigDiffReport {
  readonly revision: number;
  readonly entries: readonly RigDiffEntry[];
  readonly byUnit: Readonly<Partial<Record<UnitKey, readonly RigDiffEntry[]>>>;
}

// domain/types/nlp.ts
import type { HardwareChainState } from './hardware';
import type { RichParagraph } from './preset';

export type NlpIntent =
  | 'gain' | 'weight' | 'compression' | 'chorus' | 'delay' | 'fallback_fine_tune';

export type NlpGuard = 'prevent_mud' | 'prevent_fizz';

export interface NlpClauseResult {
  readonly clause: string;
  readonly negated: boolean;
  readonly direction: 'increase' | 'decrease';
  readonly explicitValue: number | null;   // "em 6,5" → 6,5
  readonly intents: readonly NlpIntent[];
}

export interface NlpCalibrationResult {
  readonly input: string;
  readonly clauses: readonly NlpClauseResult[];
  readonly guards: readonly NlpGuard[];
  readonly nextRig: HardwareChainState;
  readonly log: readonly RichParagraph[];
}

// domain/types/extractor.ts
import type { GenreKey, OperationModeId, TuningId, PlayingDensity, NeckRegion, ExcerptKey } from './catalog';
import type { Bpm } from './knob';

export interface ExtractedSongMetadata {
  readonly source: 'songsterr_slug' | 'youtube_id' | 'noembed' | 'manual';
  readonly song: string;
  readonly artist: string;
  readonly youtubeVideoId: string | null;
  readonly flags: { readonly bass: boolean; readonly solo: boolean; readonly clean: boolean };
  readonly matchedProfile: {
    readonly genre: GenreKey; readonly bpm: Bpm; readonly tuning: TuningId;
    readonly mode: OperationModeId; readonly density: PlayingDensity;
    readonly neck: NeckRegion; readonly excerpt: ExcerptKey;
  } | null;
}

/** Resultado do adaptador opcional (ADR-002). Nunca lança exceção. */
export type MetadataFetchResult =
  | { readonly kind: 'ok'; readonly title: string; readonly author: string }
  | { readonly kind: 'unavailable'; readonly reason: 'offline' | 'timeout' | 'http' | 'invalid' };
```
### 3.7 Workspace e persistência (domain/types/store.ts)
``` TypeScript
import type { TonePresetDocument } from './preset';
import type { RigDiffReport } from './diff';
import type { SampleAbRecord, SpectralBandsProfile } from './spectral';
import type {
  OperationModeId, GenreKey, GenreCategoryId, TuningId, TuningStrategy, SongsterrTrack,
  SongPart, PlayingDensity, NeckRegion, DelaySubdivision, ListeningContext, ReferenceMix,
  TextureChipId, CabinSymptomKey,
} from './catalog';
import type { Bpm } from './knob';

export const SCHEMA_VERSION = 'TONELAB_DESKTOP_V1' as const;
export type SchemaVersion = typeof SCHEMA_VERSION;

export type SlotKey = 'v1_0' | 'v1_1' | 'v1_2';
export const SLOT_LABELS: Readonly<Record<SlotKey, string>> = {
  v1_0: 'v1.0 Base Teórica', v1_1: 'v1.1 Pós-Sample 1', v1_2: 'v1.2 Calibração Final',
};

/** Seleções das Etapas internas 0 a 6 do Bloco 1. null = não escolhido. */
export interface ConsoleSelection {
  readonly songsterrUrl: string;
  readonly youtubeUrl: string;
  readonly manualSong: string;
  readonly manualArtist: string;
  readonly mode: OperationModeId | null;
  readonly track: SongsterrTrack | null;
  readonly part: SongPart | null;
  readonly tuning: TuningId | null;
  readonly tuningStrategy: TuningStrategy | null;
  readonly density: PlayingDensity | null;
  readonly neck: NeckRegion | null;
  readonly bpm: Bpm | null;
  readonly subdivision: DelaySubdivision | null;
  readonly listening: ListeningContext | null;
  readonly referenceMix: ReferenceMix | null;
  readonly genre: GenreKey | null;
  readonly textureChips: readonly TextureChipId[];
  readonly customNotes: string;
}

export interface UiPreferences {
  readonly layout: 'expanded' | 'compact_tabs';
  readonly compactStep: 'all' | 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly genreCategoryFilter: 'all' | GenreCategoryId;
  readonly simulator: { readonly loop: boolean; readonly rate: 1 | 0.75 };
}

export interface SessionMeta {
  readonly sessionId: string;
  readonly openedAt: string;
  readonly appVersion: string;
}

export interface LocalWorkspaceStore {
  readonly schemaVersion: SchemaVersion;
  readonly revision: number;                     // +1 a cada mudança confirmada do rig
  readonly isRigInZeroStandby: boolean;
  readonly activeTone: TonePresetDocument;
  readonly previousTone: TonePresetDocument | null;
  readonly lastDiff: RigDiffReport | null;
  readonly console: ConsoleSelection;
  readonly cabin: {
    readonly selectedSymptoms: readonly CabinSymptomKey[];
    readonly lastSample: SampleAbRecord | null;
    readonly expectedProfile: SpectralBandsProfile;
  };
  readonly activeSlot: SlotKey | null;
  readonly ui: UiPreferences;
  readonly session: SessionMeta;
}

export type SessionCalibrationSlots = Readonly<Record<SlotKey, TonePresetDocument | null>>;

export interface LibraryPresetEntry {
  readonly id: string;
  readonly origin: 'custom';
  readonly name: string;
  readonly genreKey: GenreKey | null;
  readonly tags: readonly string[];
  readonly document: TonePresetDocument;
  readonly savedAt: string;
}

export type PersistedKind = 'workspace' | 'slots' | 'presets' | 'sampleHistory';

export interface PersistedEnvelope<K extends PersistedKind, D> {
  readonly schemaVersion: SchemaVersion;
  readonly kind: K;
  readonly revision: number;
  readonly savedAt: string;
  readonly data: D;
}

export interface BackupFileV1 {
  readonly schemaVersion: SchemaVersion;
  readonly kind: 'backup';
  readonly exportedAt: string;
  readonly app: { readonly name: string; readonly version: string };
  readonly workspace: LocalWorkspaceStore;
  readonly slots: SessionCalibrationSlots;
  readonly customPresets: readonly LibraryPresetEntry[];
  readonly sampleHistory: readonly SampleAbRecord[];
}

export type LoadResult<T> =
  | { readonly status: 'ok'; readonly value: T }
  | { readonly status: 'recovered_from_backup'; readonly value: T }
  | { readonly status: 'reset_to_default'; readonly value: T; readonly quarantinedAs: string };
```
### 3.8 Parâmetros de áudio derivados (domain/dsp/graphParams.ts)
``` TypeScript
import type { Hz, Decibel, Seconds } from '../types/knob';

export interface BiquadParams {
  readonly type: BiquadFilterType;
  readonly frequency: Hz;
  readonly q: number;
  readonly gainDb: Decibel;
}

export interface AudioGraphParams {
  readonly guitar: { readonly outGain: number; readonly hss: BiquadParams; readonly tone: BiquadParams };
  readonly hotone: { readonly volGain: number; readonly wah: BiquadParams };
  readonly kokko: {
    readonly thresholdDb: Decibel; readonly ratio: number; readonly attack: Seconds;
    readonly release: Seconds; readonly kneeDb: Decibel; readonly makeupGain: number;
  };
  readonly ammoon: { readonly thresholdDb: Decibel; readonly mode: 'Soft' | 'Light'; readonly legacyGain: number };
  readonly um300: {
    readonly preHpfHz: Hz; readonly driveK: number | null;   // null = sem distorção
    readonly low: BiquadParams; readonly mid: BiquadParams; readonly high: BiquadParams;
    readonly levelGain: number;
  };
  readonly uc200: {
    readonly baseDelay: Seconds; readonly lfoHz: Hz; readonly depth: Seconds;
    readonly toneHz: Hz; readonly wet: number;
  };
  readonly fx600: {
    readonly algorithm: 'OFF' | 'DLY' | 'CHO' | 'FLG' | 'PHA' | 'TRM' | 'PIT';
    readonly lfoHz: Hz; readonly modFilter: BiquadParams; readonly lfoDepth: number;
    readonly delayTime: Seconds; readonly feedback: number;
  };
  readonly bomge: {
    readonly gain: number; readonly low: BiquadParams; readonly high: BiquadParams;
    readonly headroomIndex: number; readonly consoleDriveK: number | null;
  };
  readonly ga15ii: {
    readonly hpf: BiquadParams; readonly box: BiquadParams; readonly mid: BiquadParams;
    readonly lpf: BiquadParams; readonly masterGain: number;
  };
  readonly send: { readonly dry: number; readonly wet: number };
}

export declare function computeAudioGraphParams(
  rig: import('../types/hardware').HardwareChainState,
): AudioGraphParams;
```
### 3.9 Assinaturas das funções do domínio
``` TypeScript
// presets
export declare function createZeroedStandbyPreset(now: Date): TonePresetDocument;
export declare function createNeutralGuitarPreset(now: Date): TonePresetDocument;
export declare function applyBenchShortcut(
  kind: 'bench_01A' | 'bench_01B' | 'neutral' | 'safe_bedroom', current: TonePresetDocument, now: Date,
): TonePresetDocument;
export declare function solveRigFromConsole(sel: ConsoleSelection, now: Date): TonePresetDocument;
export declare function buildDossier(rig: HardwareChainState, sel: ConsoleSelection): EngineeringDossier;

// dsp
export declare function um300MidFreqToHz(k: KnobValue): Hz;              // round(200 × 25^(k/10))
export declare function ammoonThresholdDb(k: KnobValue): Decibel;        // round(−70 + k×8)
export declare function bpmToDelayMs(bpm: Bpm, sub: DelaySubdivision): Milliseconds;
export declare function delayMsToFx600Par1(ms: Milliseconds): KnobValue; // clamp((ms−30)/570×10)
export declare function headroomIndex(b: BomgeBmg04State): HeadroomState;
export declare function makeUm300Curve(dist: KnobValue, size?: 8192): Float32Array;
export declare function stringT60(freqHz: Hz, kokkoSustain: KnobValue | null, gateAtten: number): Seconds;

// acoustics
export declare function goertzelProbe(samples: Float32Array, sampleRate: number, hz: Hz): KnobValue;
export declare function measureFiveBands(samples: Float32Array, sampleRate: number): SpectralBandsProfile;
export declare function expectedProfile(rig: HardwareChainState): SpectralBandsProfile;
export declare function matchScore(a: SpectralBandsProfile, b: SpectralBandsProfile): number;
export declare function applySymptoms(
  rig: HardwareChainState, symptoms: readonly CabinSymptomKey[],
): { readonly rig: HardwareChainState; readonly log: readonly RichParagraph[] };
export declare function calibrateFromSample(
  rig: HardwareChainState, expected: SpectralBandsProfile, measured: SpectralBandsProfile,
): { readonly rig: HardwareChainState; readonly log: readonly RichParagraph[] };

// nlp, extractor, diff
export declare function parseRoomFeedback(text: string, rig: HardwareChainState): NlpCalibrationResult;
export declare function parseSongsterrUrl(url: string): ExtractedSongMetadata | null;
export declare function extractYoutubeVideoId(url: string): string | null;
export declare function computeRigDiff(prev: HardwareChainState, next: HardwareChainState, revision: number): RigDiffReport;

// services (fora do domínio)
export declare function fetchYoutubeMetadata(videoId: string, timeoutMs?: 2500): Promise<MetadataFetchResult>;
```
### 3.10 Tabela de conversões de referência (testes da Fatia 1)
|  |  |  |
| :- | :- | :- |
| **Entrada** | **Função** | **Saída esperada** |
| midFreq 0,0 / 5,0 / 10,0 | um300MidFreqToHz | 200 Hz / 1000 Hz / 5000 Hz |
| threshold 0,0 / 8,75 / 10,0 | ammoonThresholdDb | −70 dB / 0 dB / +10 dB |
| 120 BPM, 1/4 | bpmToDelayMs | 500 ms |
| 120 BPM, 3/8 pontuada | bpmToDelayMs | 375 ms |
| 500 ms | delayMsToFx600Par1 | 8,2 |
| \#01-A (gain 5, level 0,7, mainOut 0,6) | headroomIndex | 0,04 → limpo |
| \#01-B (5/5/5) | headroomIndex | 2,38 → saturando |
| "abc", NaN | toKnob | 5,0 |
| 12,34 | toKnob | 10,0 |

-----
## 4\. Wireframes arquitetônicos e Design System Dark Studio
### 4.1 Tokens
|  |  |  |
| :- | :- | :- |
| **Token** | **Valor** | **Uso** |
| \--bg-0 | \#07090e | fundo da janela |
| \--bg-1 | \#0f141d | superfície de bloco |
| \--bg-2 | \#161d2a | cards, campos, modais |
| \--fg-1 | \#f1f5f9 | texto principal (18,2 : 1 sobre bg-0; 15,4 : 1 sobre bg-2) |
| \--fg-2 | \#cbd5e1 | texto secundário (11,4 : 1 sobre bg-2) |
| \--fg-3 | \#a8b4c6 | legendas e marcas de escala (8,1 : 1 sobre bg-2) |
| \--accent-amber | \#fbbf24 | knobs, ponteiro, seleção (10,1 : 1 sobre bg-2) |
| \--accent-emerald | \#34d399 | ON, aumento no Delta (8,8 : 1) |
| \--accent-cyan | \#22d3ee | categoria Grunge, simulador (9,3 : 1) |
| \--accent-rose | \#fda4af | categoria Punk, alertas (8,9 : 1) |
| \--accent-violet | \#c4b5fd | categoria Metal (9,1 : 1) |
| texto sobre amber | \#07090e | botões preenchidos (9,3 : 1) |

**Regra AAA:** todo texto respeita 7 : 1. As cores \#94a3b8, \#64748b, \#fb7185 e \#a78bfa do legado ficam proibidas para texto, pois não atingem 7 : 1 sobre \#161d2a (6,6; 3,5; 6,3; 6,2). Podem aparecer só em traços decorativos.
**Grade de 8 pt:** espaçamentos 4 (meio passo, só dentro de componentes), 8, 16, 24, 32, 48, 64. Raio 8/12/16. Alvo mínimo de toque e clique 40 × 40 px. Fonte: pilha do sistema (system-ui) e ui-monospace para valores; nada carregado da internet. Corpo 14/20, legenda 12/16, valores 13/16 mono, título de bloco 20/28.
**Foco e acessibilidade:** anel de foco 2 px --accent-amber com afastamento de 2 px; knobs e barras são role="slider" com aria-valuemin=0, aria-valuemax=10, aria-valuenow e aria-valuetext="6,5 de 10 (65%)"; setas ±0,1, PageUp/PageDown ±1,0, Home 0,0, End 10,0, duplo clique volta a 5,0; prefers-reduced-motion desliga as animações dos knobs.
### 4.2 Shell da aplicação (janela mínima 1280 × 800)
``` Unset
┌────────────────────────────────────────────────────────────────────────────────── 1280 ─┐
│ TOP CONTEXTUAL APP BAR                                                       altura 64 │
│ ┌──┐ Timbrador Profissional   ● STANDBY  Bancada em Standby (9 unidades em 0.0 / OFF) │
│ │◎ │ E Standard • 120 BPM     [Headroom: —]  [Slot: —]  [⚡ Ligar Cadeia]  [⏻ Standby]│
│ └──┘                                                                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ QUICK JUMPER BAR                                                           altura 40   │
│ [B1 Console] [B2 Pedaleira] [B3 Cabine] [B4 Simulador] [B5 Estratégia] [B6 Técnica]    │
│ [B7 Volume] [B8 Plano B] [B9 Tabela 0–10] [B10 Delta]          (ativo = sublinhado amber)│
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ÁREA ROLÁVEL DOS BLOCOS (largura útil 1216 = 1280 − 2×32)                            │
│   Cada bloco: bg-1, raio 16, padding 24, gap vertical 32 entre blocos                  │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ BOTTOM NAVIGATION BAR                                                      altura 56   │
│ [◀ Bloco anterior]  [💾 Salvar no slot ▾]  [⤓ Exportar] [⤒ Importar]  [Próximo bloco ▶]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```
### 4.3 Bloco 1 — Console de Engenharia Reversa (Etapas internas 0 a 6)
**Modo expandido (padrão):**
``` Unset
┌ B1 · CONSOLE DE ENGENHARIA REVERSA ─────────────────── [⇆ Modo enxuto por abas] ┐
│                                                                                 │
│ ETAPA 0 · FONTES DIRETAS                                                        │
│ ┌ Songsterr ─────────────────────────────────────────────┐ [✕]                  │
│ │ https://www.songsterr.com/a/wsa/metallica-master-of-…  │  Extração local ✓    │
│ └────────────────────────────────────────────────────────┘                      │
│ ┌ YouTube ───────────────────────────────────────────────┐ [✕]  [▶ Mini-player] │
│ │ https://youtu.be/xxxxxxxxxxx                           │  (oculto até clicar) │
│ └────────────────────────────────────────────────────────┘                      │
│ Status: ✓ Local: Metallica — Master Of Puppets (thrash_metal, 212 BPM)          │
│         ○ Título do YouTube: indisponível offline — use os campos manuais        │
│ [✎ Editar manualmente]  Música [_____________]  Artista [_____________]         │
│                                                                                 │
│ ETAPA 1 · MODO DE OPERAÇÃO (8, nenhum pré-selecionado)            grade 4 × 2   │
│ [Riff Fiel] [Solo/Lead] [Adaptada GA15II] [Clean]                               │
│ [Crunch]    [Dueto]     [Sim. Violão]     [Sim. Baixo]                          │
│                                                                                 │
│ ETAPA 2 · MULTIPISTA, TRECHO, AFINAÇÃO, DENSIDADE, BRAÇO, BPM                   │
│ Faixa [▾ — selecione —]   Trecho [▾ — selecione —]   Afinação [▾ —]             │
│ Estratégia de afinação (•) Afinar real  ( ) Manter E  ( ) Pitch FX600           │
│ Densidade [▾ —]   Região do braço (25,5") [▾ —]                                 │
│ BPM [−5][−1] ( 120 ) [+1][+5]  [👆 Tap Tempo]  Subdivisão [▾ 1/4]               │
│ Delay calculado: 500 ms → FX600 Par1 8,2   [⟳ Sincronizar FX600]                │
│                                                                                 │
│ ETAPA 3 · 25 GÊNEROS EM 4 CATEGORIAS                                            │
│ [Todos] [1 Classic/Hard/Prog] [2 Grunge/Alt/Goth] [3 Punk/HC] [4 Metal]  🔍[___]│
│ ┌ 1. Classic, Hard, Prog & Psicodélico ───────────────────────────────────────┐ │
│ │ [Classic Rock 118] [Hard Rock 126] [Psicodélico 92] [Progressivo 132]      │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ (… categorias 2, 3 e 4 no mesmo formato; card 272 × 72, gap 16)                 │
│                                                                                 │
│ ETAPA 4 · 14 CHIPS DE TEXTURA (acordeão)                    [3 ativos] [Limpar] │
│ (+ Peso e Corpo) (Zero Agudo Abelhudo) (+ Definição nos Acordes) …              │
│                                                                                 │
│ ETAPA 5 · CONTEXTO DE ESCUTA E REFERÊNCIA                                       │
│ Ambiente [▾ —]   Mixagem de referência [▾ —]   [→ Ir para a Cabine (B3)]        │
│                                                                                 │
│ ETAPA 6 · OBSERVAÇÕES + EXECUÇÃO                                                │
│ [ Observações livres ......................................................... ] │
│ [🎯 Projetar Timbre]  [🎯▶ Projetar e Tocar]  [↺ Limpar seleções]               │
└─────────────────────────────────────────────────────────────────────────────────┘
```
**Modo enxuto por abas** (mesmo conteúdo, uma etapa por vez):
``` Unset
┌ B1 · CONSOLE ─────────────────────────────────────────────── [⇆ Modo expandido] ┐
│ [Todas] [0 Fontes] [1 Modo] [2 Faixa/BPM] [3 Gêneros] [4 Chips] [5 Escuta] [6 ▶] │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ (conteúdo da etapa ativa)                                                       │
│                                       [◀ Etapa anterior]   [Próxima etapa ▶]    │
└─────────────────────────────────────────────────────────────────────────────────┘
```
### 4.4 Bloco 2 — Pedaleira / Painel Visual 0–10 e 0%–100%
``` Unset
┌ B2 · PEDALEIRA ─────────────────────────────────────────────────────────────────┐
│ Cadeia: TW510 ─► SoulPress ─► Kokko ─► Ammoon ─► UM300 ─► UC200 ─► FX600 ─►     │
│         BOMGE ─► GA15II        (nó aceso = ativo; apagado = bypass)              │
│ Atalhos: [🎸 #01-A Clean Headroom] [⚖ #01-B Flat 5/5/5] [⚡ Ligar Cadeia Padrão] │
│          [🏠 Quarto Seguro]                                                     │
│ Slots:   [v1.0 Base Teórica] [✓ v1.1 Pós-Sample 1] [v1.2 Calibração Final]      │
│          Destino [▾ v1.1]  [💾 Salvar no slot]                                  │
│                                                                                 │
│ Grade de 3 colunas · card 384 × auto · gap 16                                   │
│ ┌ 1 TAGIMA TW-510 ────────── (ON)┐ ┌ 2 SOUL PRESS II ─────── (OFF)┐ ┌ 3 KOKKO ─┐│
│ │ Captador [1 2 3 4 5]           │ │ Modo [V][W][V/W]             │ │  …       ││
│ │  ╭───╮  ╭───╮                  │ │ Faixa [Warm][Classic]        │ │          ││
│ │ │ ◜10│ │ ◜8,5│                 │ │  ╭───╮  ╭───╮                │ │          ││
│ │  ╰───╯  ╰───╯                  │ │ │ Q │  │PDL│                 │ │          ││
│ │  VOLUME   TONE                 │ │ Tuner Out ─► Rowin LT-910    │ │          ││
│ │ ▕██████████▏100%               │ │                              │ │          ││
│ │ ▕████████▌ ▏ 85%  fc ≈ 7,1 kHz │ │                              │ │          ││
│ └────────────────────────────────┘ └──────────────────────────────┘ └──────────┘│
│ (cards 4 a 9: Ammoon [Soft|Light] e dB; UM300 com 6 knobs e Hz do Mid Freq;     │
│  UC200; FX600 [OFF DLY CHO FLG PHA TRM PIT] com legenda dinâmica de Par1/Par2;  │
│  BOMGE com programa [▾ 04 - Delay A] [📖 Catálogo] e medidor VU; GA15II CLEAN)  │
│                                                                                 │
│ Medidor de headroom BOMGE:  ▕▁▂▃▄▅▆▇│░░░░▏ 0,92× Limpo (#01-A)  | 1,05 = limite │
└─────────────────────────────────────────────────────────────────────────────────┘
```
**Anatomia do controle duplo (knob + barra), cotas em px:**
``` Unset
          ┌───────────── 56 px acima do knob ─────────────┐
          │  UM300 · MID FREQ   6,5 / 10 · 65% · 1,62 kHz │  ← balão anti-oclusão
          └───────────────────────┬───────────────────────┘    (vira para baixo se
                                  ▼                             faltar espaço acima)
                        ╭───────────────────╮
                     ╱  4    5    6           ╲      knob 80 × 80
                   3       ╲  ponteiro          7    arco de fundo r = 24
                  2         ●──────               8  arco ativo amber r = 24
                   1     −135°   +135°          9    marcas r 27,5–30,8, rótulos r 35,8
                     ╲ 0                   10 ╱
                        ╰───────────────────╯
                          6,5   (+0,8 ▲ badge Delta)
      ▕██████████████████████████▌           ▏ 65%      barra 0–100%, altura 16
```
  - **Arraste vertical no knob:** 16 px = 1,0; Shift = passo fino 0,1 por 16 px.
  - **Arraste horizontal na barra:** posição absoluta.
  - **Sincronia:** os dois controles leem o mesmo estado do store. Durante o arraste, o React só atualiza o elemento em foco via requestAnimationFrame (60 fps), e o áudio recebe setTargetAtTime. Ao soltar, a mudança é confirmada (revision + 1, diff, gravação com debounce).
### 4.5 Bloco 3 — Cabine de Estúdio Avançado
``` Unset
┌ B3 · CABINE DE ESTÚDIO AVANÇADO ────────────────────────────────────────────────┐
│ 3.1 SINTOMAS ACUMULÁVEIS (todos neutros ao abrir)                 [Limpar]      │
│ [📢 Volume alto na sala] [🔉 Sumindo no Songsterr] [🌫 Fechado/sem brilho]       │
│ [🐝 Agudo abelhudo]      [💣 Graves embolando]     [🦴 Som magro]               │
│ [🐍 Chiado]              [✂ Gate cortando sustain] [📦 Som de caixote]          │
│ [🧊 Distorção dura]      [🌊 Excesso de eco]       [🎸 Baixo parece guitarra]   │
│ 2 selecionados  [🛠 Aplicar sintomas]                                           │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ 3.2 SONDA ESPECTRAL A/B (5 pontos Goertzel)                                     │
│ [📂 Abrir amostra .m4a/.wav/.mp3/.ogg/.flac]  [🧪 Amostra de teste]  [⟳ Reanalisar]│
│ arquivo: amostra-quarto-01.m4a · 48,0 kHz · 12,4 s      ▶ ───●────── 00:04      │
│                                                                                 │
│              Alvo (simulado)        Real (amostra)        Δ                     │
│ 120 Hz  Low  ▕██████▌   ▏ 6,5       ▕████████  ▏ 8,0      +1,5 ▲                │
│ 340 Hz  LMid ▕█████▌    ▏ 5,5       ▕███████▏  ▏ 7,1      +1,6 ▲                │
│ 950 Hz  Mid  ▕██████▌   ▏ 6,5       ▕█████▍    ▏ 5,4      −1,1 ▼                │
│ 2,6 kHz HMid ▕██████    ▏ 6,0       ▕█████▏    ▏ 5,2      −0,8 ▼                │
│ 5,4 kHz High ▕████▌     ▏ 4,5       ▕█████▊    ▏ 5,8      +1,3 ▲                │
│ Escore A/B (calculado): 87%    Headroom: Limpo #01-A                            │
│ [🎯 Calibrar rig pela amostra]   (gera v1.1 sugerido; salvar no slot é manual)  │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ 3.3 DESCRITOR NLP MULTI-INTENÇÃO (com trava de negação)                         │
│ ┌──────────────────────────────────────────────────────────────────────────┐    │
│ │ aumentar ganho no UM300 e peso sem embolar                               │    │
│ └──────────────────────────────────────────────────────────────────────────┘    │
│ Atalhos 1 clique: (mais peso sem embolar) (menos agudo) (ligar chorus) …        │
│ Prévia da interpretação:                                                        │
│   cláusula 1 "aumentar ganho no UM300"   → ganho ▲                              │
│   cláusula 2 "peso"                      → peso ▲                               │
│   cláusula 3 "sem embolar"               → 🛡 trava anti-embolo (negada)        │
│ [🧠 Executar ajuste]                                                            │
│ Log: 🔥 UM300 Dist 4,5 → 5,9 · ⚖ BOMGE Low 6,0 → 6,8 · 🛡 UM300 Low ≤ 5,2       │
└─────────────────────────────────────────────────────────────────────────────────┘
```
### 4.6 Bloco 4 — Simulador DSP Polifônico de 6 Cordas
``` Unset
┌ B4 · SIMULADOR DSP (Karplus-Strong 6 cordas · T60(f) real · 9 estágios) ───────┐
│ Trecho [▾ Automático pela música]  (Bancada #01 · MoP · Trooper · Teen Spirit…)│
│ ┌ Tablatura ───────────────────────────────────────────────────────────────┐    │
│ │ E4|--0--------0--|                                                       │    │
│ │ B3|----0------0--|                                                       │    │
│ │ …                                                                         │    │
│ └───────────────────────────────────────────────────────────────────────────┘    │
│ [▶ Tocar]  [■ Parar]  [🔁 Loop: ON]  [Velocidade: 100% | 75%]                   │
│ ┌ RTA (canvas 1168 × 160, analyser fftSize 256) ───────────────────────────┐    │
│ │ ▁▂▃▅▇█▇▆▅▄▃▃▂▂▁▁▁▁                                                       │    │
│ │ 80   160   320   640   1,2k   2,5k   5k   10k  Hz                        │    │
│ └───────────────────────────────────────────────────────────────────────────┘    │
│ T60: E2 3,65 s → E4 0,36 s · Afinação: −2 st (D Standard) · Gate: Soft          │
│ Estágios ativos: ●TW510 ●Kokko ●Ammoon ●UM300 ○UC200 ○FX600 ●BOMGE ●GA15II       │
└─────────────────────────────────────────────────────────────────────────────────┘
```
### 4.7 Blocos 5 a 9 — Dossiê de Engenharia
``` Unset
┌ B5 · ESTRATÉGIA ─────────────────────────────────────────────────────────────────┐
│ • Arquitetura de ganho calibrada (#01-A e #01-B): Main Out 2,8 e LVL-CH 4,5 …     │
│ • Deconvolução do cone de 6,5": grave do UM300 controlado; peso construído em 80 Hz│
├ B6 · BIOMECÂNICA DE EXECUÇÃO ────────────────────────────────────────────────────┤
│ • Palhetada: ataque firme a ~3 cm da ponte; downpicking em riffs de 200 BPM …     │
│ • Mão esquerda: abafar nas pausas para o gate fechar                              │
├ B7 · COMPENSAÇÃO ACÚSTICA (Fletcher-Munson) E LIMITES ───────────────────────────┤
│ • Quarto: Main Out da BOMGE entre 1,5 e 3,2; GA15II em 3,0                        │
│ • Limite mecânico: não somar Low do UM300 e da BOMGE acima de 7,5 em volume alto  │
├ B8 · PLANO B ────────────────────────────────────────────────────────────────────┤
│ ✕ Som abelhudo → High do UM300 −0,8 ou Tone da Tagima 7,0                         │
│ ✕ Embolando nos bordões → Low da BOMGE −1,0 e Mid do UM300 +0,6                   │
├ B9 · TABELA COMPACTA 0–10 ──────────────────────────────────── [📋 Copiar resumo] ┤
│ Unidade          │ Estado │ Parâmetros                                           │
│ 1 Tagima TW-510  │ ON     │ Pos 1 · Vol 10,0 · Tone 8,5                          │
│ 2 Soul Press II  │ OFF    │ V · Warm · Q 3,0 · Pedal 10,0                        │
│ 3 Kokko FCP2     │ ON     │ Sus 4,0 · Atk 7,0 · Lvl 5,5                          │
│ 4 Ammoon         │ ON     │ Soft · Thr 3,5 (−42 dB)                              │
│ 5 UM300          │ ON     │ Dist 4,5 · Low 5,5 · Mid 6,0 · MF 4,5 (851 Hz) …     │
│ 6 UC200          │ OFF    │ …                                                    │
│ 7 FX600          │ OFF    │ OFF                                                  │
│ 8 BOMGE          │ ON     │ Gain 3,5 · Hi 4,8 · Lo 6,0 · 04 Delay A · Main 2,8   │
│ 9 GA15II         │ ON     │ CLEAN · Vol 3,0 · Tre 4,8 · Mid 5,8 · Bass 5,5       │
└──────────────────────────────────────────────────────────────────────────────────┘
```
### 4.8 Bloco 10 — Evidenciador de Mudanças Delta
``` Unset
┌ B10 · EVIDENCIADOR DE MUDANÇAS · Revisão 14 · origem: NLP ─────── [Ocultar sem Δ]┐
│ Unidade          Parâmetro      DE        ➔   PARA       Δ                        │
│ 5 UM300          DIST           4,5/10    ➔   5,9/10     +1,4 ▲ (verde)           │
│ 5 UM300          LOW            5,5/10    ➔   5,2/10     −0,3 ▼ (âmbar)           │
│ 8 BOMGE          LOW            6,0/10    ➔   6,8/10     +0,8 ▲                   │
│ 9 GA15II         BASS           5,5/10    ➔   6,0/10     +0,5 ▲                   │
│ 7 FX600          ALGORITMO      OFF       ➔   DLY        chave                    │
│ ──────────────────────────────────────────────────────────────────────────────── │
│ 5 mudanças em 4 unidades   [↶ Desfazer (volta à revisão 13)]  [Ir ao card ▸]      │
└──────────────────────────────────────────────────────────────────────────────────┘
```
Os knobs alterados no Bloco 2 recebem anel colorido e o selo "+1,4 ▲" até a próxima mudança.
### 4.9 Modais de apoio
``` Unset
┌ CATÁLOGO BOMGE BMG-04FDSP (01–24) ─────────────────────── [✕] ┐
│ Voz          01 Voice Changer · 02 Magic Sound · 03 Child's Voice│
│ Delay        04 A · 05 B · 06 C · 07 D · 08 E · 09 F · 10 G      │
│ Echo + Delay 11 A · 12 B · … · 24 N                              │
│ Programa atual: 04 - Delay A   [Usar programa selecionado]       │
└──────────────────────────────────────────────────────────────────┘

┌ DIAPASÃO ROWIN LT-910 (referência 440 Hz) ────────────── [✕] ┐
│ [E2 82,41] [A2 110,00] [D3 146,83] [G3 196,00] [B3 246,94]     │
│ [E4 329,63]          (afinação ativa desloca as notas)         │
│ Tocando: A2 110,00 Hz   [■ Parar]                              │
└────────────────────────────────────────────────────────────────┘

┌ BLUEPRINT FUTURO (fora da cadeia ativa) ──────────────── [✕] ┐
│ M-Audio M-Track Solo: gravação via ASIO → backlog v2.0 (b)     │
│ Flamma FS02 Stereo Reverb + gate pós-drive → backlog v2.0 (c)  │
│ Estado: somente leitura, sem efeito no áudio                    │
└────────────────────────────────────────────────────────────────┘
```
-----
## 5\. Plano de transição para a Etapa 3 (Setup) e a Etapa 4 (Vertical Slicing)
### 5.1 Etapa 3 — Setup do repositório (ordem exata)
1.  pnpm create tauri-app (template React + TypeScript + Vite), identificador com.linkozitos.timbrador, nome "Timbrador Profissional".
2.  Ajustar tsconfig.json com as flags estritas da seção 3; criar eslint.config.js (typescript-eslint em modo strict, no-explicit-any, no-restricted-imports com as regras de camada) e .prettierrc.
3.  Instalar e configurar Tailwind local com os tokens da seção 4.1 em src/ui/theme/tokens.css; instalar lucide-react, zod, zustand, @tauri-apps/plugin-fs, @tauri-apps/plugin-dialog.
4.  Configurar CSP e capabilities do Tauri (ADR-005).
5.  Criar a árvore de pastas da seção 1.1 com arquivos index.ts vazios.
6.  Configurar Vitest (environment: 'node' para domain) e scripts lint, typecheck, test, tauri dev e tauri build.
7.  CI no GitHub Actions: lint + typecheck + test em Linux; tauri build em windows-latest e macos-latest gerando os instaladores como artefatos.
8.  README com instruções de desenvolvimento.
9.  Critério de pronto: pnpm lint && pnpm typecheck && pnpm test passam no ambiente timbrador-profissional, e tauri build compila no Linux.
### 5.2 Etapa 4 — Três fatias verticais
**Fatia 1 — Bancada segura e controle duplo (US-01, US-03, US-06)**
  - Domínio: knob.ts, hardware.ts, preset.ts, store.ts; catálogos de pickups, FX600, BOMGE e amostras; standby.ts, neutral.ts, benchShortcuts.ts; rigDiff.ts; todas as funções de dsp/transfer e graphParams.ts.
  - Persistência: atomicJson.ts, workspaceRepo.ts, slotsRepo.ts, backup.ts com migração V5.
  - UI: shell (AppBar, QuickJumper, BottomNav), Bloco 2 completo (9 cards, Knob, LevelBar, DragCallout, Footswitch, HeadroomMeter, slots), Bloco 10, Bloco 9.
  - Áudio: AudioEngine persistente com paridade com o legado (gate legado, D-01) + ReferenceTone (modal Rowin).
  - Testes: tabela da seção 3.10, JSON corrompido → Standby, importação de backup V5.
  - Pronto quando: o app abre em Standby, os atalhos funcionam, knob e barra ficam sincronizados, os slots sobrevivem a reiniciar o app e o Delta mostra as mudanças.
**Fatia 2 — Console, gêneros e simulador (US-02, US-05)**
  - Domínio: catálogos de modos, gêneros, chips, afinações, faixas, trechos e knownSongs; extractor/\*; consoleSolver.ts; dossier.ts; karplusStrong.ts; tuning.ts.
  - Serviço: metadataFetcher.ts (ADR-002).
  - UI: Bloco 1 (expandido e por abas), Bloco 4 com RTA, Blocos 5 a 8, modal BOMGE.
  - Áudio: SimulatorPlayer (loop, 100%/75%) e gate real em AudioWorklet (se D-01 aprovado).
  - Testes: URLs reais de Songsterr e YouTube, resolução das 25 configurações de gênero, T60 de E2 e E4, BPM → Par1.
**Fatia 3 — Cabine de calibração em malha fechada (US-04)**
  - Domínio: goertzel.ts, expectedProfile.ts, matchScore.ts, symptoms.ts, sampleCalibration.ts, nlp/\*.
  - Persistência: sampleHistoryRepo.ts, presetsRepo.ts (presets customizados).
  - UI: Bloco 3 completo (3.1, 3.2, 3.3) com prévia da interpretação NLP; modal Blueprint Futuro.
  - Áudio: decodeSample.ts (decodificação local; o ffmpeg só é usado no ambiente de desenvolvimento para gerar amostras de teste).
  - Testes: Goertzel com senoides puras em 120/340/950/2600/5400 Hz; frases com negação ("peso sem embolar", "para não ficar abelhudo"); 12 sintomas isolados e combinados.
### 5.3 Decisões pendentes para o Link antes da Etapa 3
1.  D-01: implementar o gate real na Fatia 2? (proposta: sim)
2.  D-02: agudo da BOMGE em 7500 Hz e correção da Etapa 1? (proposta: sim)
3.  D-04: renomear para "Sonda espectral de 5 pontos" na v1.0? (proposta: sim)
4.  D-05: escore A/B calculado em vez de fixo? (proposta: sim)
5.  ADR-001: aprovar zod e zustand como dependências locais.
6.  ADR-003: aprovar JSON em arquivos para a v1.0 e SQLite apenas na v2.0.
