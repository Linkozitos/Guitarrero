# Timbrador Profissional — Etapa 1: Concepção e Definição de Escopo

Documento oficial da Etapa 1 · 17/11/2026 · Autor: Claude · Repositório: github.com/Linkozitos/Timbrador-Profissional

Status: aprovado pelo Link. Próxima etapa: Etapa 2 (Arquitetura, DER, Contratos TypeScript e Wireframes). Nenhum código-fonte da aplicação foi gerado nesta etapa.

## 0\. Pilha tecnológica (stack)

- **Natureza do software:** aplicativo desktop nativo e instalável (Windows .msi/.exe e macOS .dmg/.app), 100% local e offline-first, para uso próprio em bancada musical. Zero nuvem, zero servidor remoto, zero login, zero exposição pública e zero dependência de CDN externa em produção.  
- **Front-end, UI e domínio:** Node.js (v20+ LTS) \+ TypeScript (strict mode, zero uso de `any`) \+ React \+ Vite \+ Tailwind CSS (instalado localmente via pacote, sem CDN) \+ Lucide Icons local (`lucide-react`).  
- **Wrapper desktop nativo:** Tauri v2 (empacotamento nativo leve \+ acesso ao sistema de arquivos local).  
- **Motor de áudio e DSP:** Web Audio API nativa \+ processamento matemático em `Float32Array` (síntese polifônica Karplus-Strong de 6 cordas com decaimento real T60(f), 9 estágios de modelagem da cadeia física e extração espectral Goertzel de 5 bandas), somado ao `ffmpeg` no ambiente de desenvolvimento para inspeção, conversão e testes de amostras de áudio locais (.m4a, .wav, .mp3, .ogg, .flac).  
- **Persistência local:** arquivo JSON versionado (`SCHEMA_VERSION = "TONELAB_DESKTOP_V1"`) e/ou SQLite local em disco (slots de sessão v1.0, v1.1, v1.2, biblioteca local de presets e backup/restore em 1 clique).  
- **Qualidade e testes:** ESLint \+ Prettier \+ Vitest (testes unitários da matemática de DSP, conversão de knobs e parser NLP).

## 0.1 Ambiente de nuvem de desenvolvimento (Claude Code)

- **Nome:** timbrador-profissional (pessoal; fica salvo na conta Claude do Link, em Settings → Environments).  
- **Rede:** limitada; registros de pacotes (npm, PyPI, crates.io etc.) e servidores MCP liberados; nenhum host extra.  
- **Segredos e variáveis:** nenhum. O app é 100% local e não chama APIs externas.  
- **Já incluso na imagem:** Node.js 22, npm, pnpm, Rust/Cargo (para o Tauri).  
- **Script de configuração:** instala ffmpeg e as bibliotecas de sistema do Tauri v2 (libwebkit2gtk-4.1-dev, build-essential, libxdo-dev, libssl-dev, libayatana-appindicator3-dev, librsvg2-dev). Quando o repositório tiver package.json, instala as dependências do projeto (pnpm, npm ci ou npm install). TypeScript, Vite, Vitest e o CLI do Tauri entram como devDependencies do projeto.  
- **Observação:** o container é Linux. Ele serve para desenvolver, testar e verificar a compilação do Tauri. Os instaladores finais .msi/.exe e .dmg/.app precisam ser gerados em Windows e macOS (na máquina do Link ou em CI).

## 1\. Contexto de domínio físico (inviolável)

O software modela exclusivamente a bancada física real, nesta ordem de cadeia ativa:

1. **Tagima TW-510:** superstrato HSS cerâmico, escala 25,5", cordas Ernie Ball Power Slinky .011–.048, chave de 5 posições, Volume e Tone RC 850 Hz.  
2. **Hotone Soul Press II:** modos V, W, V/W; alcance Warm/Classic; Q; saída paralela TUNER OUT ligada ao afinador Rowin LT-910.  
3. **Compressor Kokko FCP2:** Sustain, Attack, Level.  
4. **Ammoon Noise Gate:** chave Soft/Light, Threshold de \-70 dB a \+10 dB, posicionado antes do drive.  
5. **Behringer UM300 Ultra Metal:** Dist, High 5 kHz, Low 100 Hz, Mid e Mid Freq logarítmico f \= 200 × 25^(Knob/10) Hz, Level.  
6. **Behringer UC200 Ultra Chorus:** Level, Tone, Rate, Depth (conectado via Output A mono).  
7. **Behringer FX600 Digital Multi-FX 24-bit:** 6 algoritmos (FLG, CHO, PHA, DLY, TRM, PIT); Level, Par 1, Par 2 (conectado via Output A mono).  
8. **Mesa BOMGE BMG-04FDSP:** Gain, High 12 kHz, Low 80 Hz, 24 programas DSP 01–24, Effect, Level de canal e Main Out calibrados pelas Amostras \#01-A Clean Headroom e \#01-B Overdrive Ceiling.  
9. **Amplificador Yamaha GA15II:** 15 W solid state, falante de 6,5", canal Clean, Volume, Treble, Middle, Bass. Respeitar a física do cone de 6,5": evitar subgraves destrutivos em 60–100 Hz no UM300 e construir peso em 80 Hz na BOMGE e médio-graves em 140–280 Hz.

**Nota de reserva futura:** M-Audio M-Track Solo e Flamma FS02 Reverb permanecem mapeados apenas como blueprint futuro, fora da cadeia ativa padrão.

## 2\. Declaração do problema

Eliminar a dependência de chats de IA, navegadores web, conexões externas e arquivos HTML monolíticos difíceis de manter na bancada musical, transformando o protótipo "Tone Lab Pro v7.0" em um software desktop nativo, instalável (Windows/macOS), 100% local, modular e auditável, capaz de calcular presets exatos (escala 0.0–10.0 e 0%–100%) para as 9 unidades físicas da cadeia da Tagima TW-510 ao Yamaha GA15II, simular o timbre esperado offline e calibrar ajustes em malha fechada a partir de amostras gravadas e sintomas acústicos do quarto.

## 3\. Histórias de usuário (user stories)

- **US-01 (Standby Seguro Zero-Preselection):** Como músico na bancada, quero que o software inicie com todas as 9 unidades em Standby Real (0.0 / 0% / OFF) e sem nenhum modo ou gênero pré-selecionado, para evitar saltos bruscos de volume ou induções visuais forçadas.  
- **US-02 (Parametrização Inteligente por Música, Link, Modo e Gênero):** Como usuário, quero colar links do Songsterr/YouTube ou selecionar entre 8 modos de operação, 25 gêneros musicais (em 4 categorias), 14 chips de textura, afinação, região do braço (25,5") e BPM (com Tap Tempo e cálculo matemático de Delay T\_ms \= 60000/BPM), para obter instantaneamente a regulagem exata dos 9 equipamentos.  
- **US-03 (Duplo Controle Sincronizado a 60fps):** Como usuário operando os pedais, quero ajustar qualquer parâmetro tanto girando potenciômetros concêntricos SVG (0.0 a 10.0) quanto arrastando barras horizontais (0% a 100%) com tooltip anti-oclusão e chaves diretas nos 9 cards, ouvindo a mudança em tempo real no grafo de áudio.  
- **US-04 (Cabine de Calibração Acústica em Malha Fechada):** Como usuário tocando no quarto, quero marcar os 12 sintomas acústicos acumuláveis, enviar amostras reais gravadas (.m4a/.wav/.mp3) para comparação espectral A/B em 5 bandas (Goertzel) e digitar comandos em linguagem natural com proteção de escopo de negação (ex.: "aumentar ganho no UM300 e peso sem embolar"), para recalibrar os knobs cirurgicamente.  
- **US-05 (Simulador Polifônico de 6 Cordas e Dossiê Técnico):** Como músico, quero ouvir a simulação física do timbre esperado (com cordas soltas/riffs e decaimento T60(f) calibrado pelas amostras \#01-A e \#01-B), consultar o dossiê técnico (estratégia, biomecânica de palhetada, compensação Fletcher-Munson, Plano B e tabela compacta 0–10) e visualizar no Evidenciador Delta (DE ➔ PARA) exatamente quais knobs mudaram.  
- **US-06 (Memória Local de Sessão e Backup):** Como usuário solo, quero salvar e alternar entre os 3 slots de calibração (v1.0 Base Teórica, v1.1 Pós-Sample 1, v1.2 Calibração Final) e exportar/importar backups .json validados no meu disco local.

## 4\. Definição do MVP (essenciais v1.0 vs. desejáveis v2.0+ — combate ao scope creep)

### Essenciais (MVP v1.0 — entram obrigatoriamente na migração modular)

- **a)** Arquitetura monolítica modular local (separação estrita entre domain/types, domain/dsp, domain/acoustics, persistence e ui).  
- **b)** Inicialização em Standby Real (0.0 / OFF) \+ atalhos de bancada (\#01-A Clean Headroom, \#01-B Flat 5/5/5, Ligar Cadeia Padrão, Quarto Seguro).  
- **c)** Console de Engenharia Reversa completo (Extrator Songsterr/YouTube, 8 Modos, Multipista/Afinação/Densidade/Região do Braço/BPM Tap Tempo, 25 Gêneros em 4 categorias, 14 Chips de Textura).  
- **d)** Painel visual das 9 unidades com Knobs SVG concêntricos (0.0–10.0) \+ Niveladores de Barra (0%–100%) \+ Footswitches/Seletores \+ Medidor de Headroom VU da BOMGE.  
- **e)** Cabine de Estúdio Avançado (12 Sintomas acumuláveis \+ Sampler A/B de 5 bandas via Goertzel \+ Parser NLP Multi-Intenção com trava de negação).  
- **f)** Simulador DSP Polifônico de 6 Cordas (Web Audio API com os 9 estágios ativos \+ loop e velocidade 100%/75%) \+ Diapasão Rowin \+ Catálogo BOMGE (01–24) \+ Blueprint M-Track.  
- **g)** Dossiê de Engenharia (Blocos 5 a 9\) \+ Evidenciador de Mudanças Delta DE ➔ PARA (Bloco 10\) \+ Persistência Local resiliente dos slots v1.0, v1.1, v1.2 e Export/Import JSON.

### Desejáveis (backlog v2.0+ — ficam expressamente fora da v1.0)

- **a)** Banco de dados relacional ilimitado com histórico de centenas de versões por música e tags customizadas.  
- **b)** Captura e gravação de áudio multipista em tempo real dentro do próprio app via driver ASIO da interface M-Audio M-Track Solo.  
- **c)** Ativação na cadeia principal do pedal Flamma FS02 Stereo Reverb e reposicionamento físico pós-drive do Ammoon Noise Gate.  
- **d)** Exportação de relatórios de presets em PDF paginado para impressão.

## 5\. Ponto de atenção para a Etapa 2

O Extrator Songsterr/YouTube (essencial c) e o princípio "zero conexão externa" precisam ser conciliados na Etapa 2\. Opções: interpretar só o texto do link colado (ID, título, slug) sem fazer requisições, ou permitir uma consulta opcional e explícita. A decisão fica com o Link.