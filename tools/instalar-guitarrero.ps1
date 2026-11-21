# =====================================================================
#  GUITARRERO - Instalador automatico do ambiente (Windows)
#  Pasta oficial: F:\Claude Code\Guitarreiro
#  O que faz: instala e confere Git, Node.js, pnpm, Rust, compilador C++,
#  WebView2 e Claude Code; baixa o repositorio Guitarrero na pasta oficial;
#  copia o prompt da Etapa 3 para a area de transferencia e abre o Claude Code.
#  Pode rodar quantas vezes quiser: o que ja estiver instalado e pulado.
# =====================================================================

$ErrorActionPreference = 'Continue'
$Pasta      = 'F:\Claude Code\Guitarreiro'
$PastaInst  = Join-Path $Pasta '_instalacao'
$Repo       = 'https://github.com/Linkozitos/Guitarrero.git'
$Prompt     = Join-Path $PastaInst 'PROMPT_ETAPA_3.txt'
$Log        = Join-Path $PastaInst ("log_instalacao_" + (Get-Date -Format 'yyyy-MM-dd_HH-mm') + ".txt")
$Resultado  = [ordered]@{}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
New-Item -ItemType Directory -Force -Path $PastaInst | Out-Null
Start-Transcript -Path $Log -Append | Out-Null

function Titulo($n, $texto) {
    Write-Host ""
    Write-Host ("[$n/9] " + $texto) -ForegroundColor Cyan
}
function Ok($t)    { Write-Host ("   OK  - " + $t) -ForegroundColor Green }
function Aviso($t) { Write-Host ("   ... - " + $t) -ForegroundColor Yellow }
function Erro($t)  { Write-Host ("   ERRO - " + $t) -ForegroundColor Red }

function Atualizar-Path {
    $maquina = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $usuario = [Environment]::GetEnvironmentVariable('Path', 'User')
    $extras  = @("$env:USERPROFILE\.cargo\bin", "$env:USERPROFILE\.local\bin", "$env:APPDATA\npm")
    $env:Path = ($maquina + ';' + $usuario + ';' + ($extras -join ';'))
}
function Existe($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

function Instalar-Winget($id, $extra) {
    $parametros = @('install', '--id', $id, '-e', '--accept-package-agreements', '--accept-source-agreements')
    if ($extra) { $parametros += $extra }
    & winget @parametros
    Atualizar-Path
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Magenta
Write-Host "  GUITARRERO - preparando o seu PC. Pode deixar rodando." -ForegroundColor Magenta
Write-Host "  Se o Windows perguntar 'Deseja permitir...?', clique em SIM." -ForegroundColor Magenta
Write-Host "  Tempo estimado: 20 a 50 minutos (o compilador C++ e o mais lento)." -ForegroundColor Magenta
Write-Host "==============================================================" -ForegroundColor Magenta

Atualizar-Path

# ---------------------------------------------------------------------
Titulo 1 "Conferindo o winget (instalador oficial do Windows)"
if (Existe 'winget') { Ok "winget encontrado"; $Resultado['winget'] = $true }
else {
    Erro "winget nao encontrado. Abra a Microsoft Store, procure 'Instalador de Aplicativo' (App Installer), atualize e rode este script de novo."
    $Resultado['winget'] = $false
    Stop-Transcript | Out-Null
    Read-Host "Pressione Enter para fechar"
    exit 1
}

# ---------------------------------------------------------------------
Titulo 2 "Git (controle de versoes)"
if (Existe 'git') { Ok ("ja instalado: " + (git --version)) }
else { Aviso "instalando Git..."; Instalar-Winget 'Git.Git' }
$Resultado['Git'] = Existe 'git'

# ---------------------------------------------------------------------
Titulo 3 "Node.js LTS (roda as ferramentas do projeto)"
$nodeOk = $false
if (Existe 'node') {
    $v = (node -v) -replace 'v', ''
    if ([int]($v.Split('.')[0]) -ge 20) { $nodeOk = $true; Ok ("ja instalado: v" + $v) }
    else { Aviso ("versao antiga (v" + $v + "), atualizando...") }
}
if (-not $nodeOk) {
    Aviso "instalando Node.js LTS..."
    Instalar-Winget 'OpenJS.NodeJS.LTS'
    if (Existe 'node') { $v = (node -v) -replace 'v', ''; $nodeOk = ([int]($v.Split('.')[0]) -ge 20) }
}
$Resultado['Node.js 20+'] = $nodeOk

# ---------------------------------------------------------------------
Titulo 4 "pnpm (gerenciador de pacotes do projeto)"
if (Existe 'pnpm') { Ok ("ja instalado: " + (pnpm -v)) }
elseif (Existe 'npm') { Aviso "instalando pnpm..."; npm install -g pnpm; Atualizar-Path }
$Resultado['pnpm'] = Existe 'pnpm'

# ---------------------------------------------------------------------
Titulo 5 "Compilador C++ da Microsoft (Build Tools) - a etapa mais demorada"
$vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
function Tem-MSVC {
    if (-not (Test-Path $vswhere)) { return $false }
    $p = & $vswhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    return [bool]$p
}
if (Tem-MSVC) { Ok "ja instalado" }
else {
    Aviso "instalando Build Tools com C++ (6 a 8 GB, 20 a 40 min). Uma janela de progresso vai aparecer; nao feche."
    Instalar-Winget 'Microsoft.VisualStudio.2022.BuildTools' @('--override', '--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended')
}
$Resultado['Compilador C++'] = Tem-MSVC

# ---------------------------------------------------------------------
Titulo 6 "Rust (parte nativa do app, Tauri)"
if (-not (Existe 'rustup')) { Aviso "instalando Rustup..."; Instalar-Winget 'Rustlang.Rustup' }
if ((Existe 'rustup') -and -not (Existe 'rustc')) { Aviso "baixando o compilador Rust estavel..."; rustup default stable; Atualizar-Path }
if (Existe 'rustc') { Ok ("pronto: " + (rustc -V)) }
$Resultado['Rust'] = Existe 'rustc'

# ---------------------------------------------------------------------
Titulo 7 "WebView2 (motor que desenha a tela do app)"
function Tem-WebView2 {
    $chaves = @('HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}',
                'HKCU:\Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}')
    foreach ($c in $chaves) { if (Test-Path $c) { $pv = (Get-ItemProperty $c -ErrorAction SilentlyContinue).pv; if ($pv -and $pv -ne '0.0.0.0') { return $true } } }
    return $false
}
if (Tem-WebView2) { Ok "ja instalado" }
else { Aviso "instalando WebView2..."; Instalar-Winget 'Microsoft.EdgeWebView2Runtime' }
$Resultado['WebView2'] = Tem-WebView2

# ---------------------------------------------------------------------
Titulo 8 "Claude Code"
if (Existe 'claude') { Ok ("ja instalado: " + (claude --version)) }
else {
    Aviso "instalando Claude Code pelo instalador oficial (claude.ai/install.ps1)..."
    Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
    Atualizar-Path
}
$Resultado['Claude Code'] = Existe 'claude'

# ---------------------------------------------------------------------
Titulo 9 "Repositorio Guitarrero na pasta oficial"
if ($Resultado['Git']) {
    if (-not (git config --global user.name))  { git config --global user.name  'Lincoln Pavan' }
    if (-not (git config --global user.email)) { git config --global user.email 'lincoln.pavan.eq@gmail.com' }
    Set-Location $Pasta
    if (Test-Path (Join-Path $Pasta '.git')) {
        Aviso "repositorio ja existe, atualizando..."
        git pull --ff-only
    } else {
        Aviso "baixando o repositorio para $Pasta ..."
        git init | Out-Null
        git remote add origin $Repo
        git fetch origin
        git checkout -t origin/main 2>$null
        if (-not (Test-Path (Join-Path $Pasta 'CLAUDE.md'))) { git checkout -f -B main --track origin/main }
    }
}
$Resultado['Repositorio na pasta'] = Test-Path (Join-Path $Pasta 'CLAUDE.md')

# ---------------------------------------------------------------------
Write-Host ""
Write-Host "==============================================================" -ForegroundColor Magenta
Write-Host "  RESULTADO" -ForegroundColor Magenta
Write-Host "==============================================================" -ForegroundColor Magenta
$tudoOk = $true
foreach ($k in $Resultado.Keys) {
    if ($Resultado[$k]) { Write-Host ("   [OK]     " + $k) -ForegroundColor Green }
    else { Write-Host ("   [FALHOU] " + $k) -ForegroundColor Red; $tudoOk = $false }
}
Write-Host ""
Write-Host ("Registro completo salvo em: " + $Log)
Stop-Transcript | Out-Null

if (-not $tudoOk) {
    Write-Host ""
    Write-Host "Algum item falhou. NAO continue. Tire um print desta tela e mande no Projeto Guitarrero." -ForegroundColor Red
    Write-Host "Dica: as vezes basta fechar o PowerShell, abrir de novo e rodar o mesmo comando." -ForegroundColor Yellow
    Read-Host "Pressione Enter para fechar"
    exit 1
}

Get-Content -Path $Prompt -Raw -Encoding UTF8 | Set-Clipboard
Write-Host ""
Write-Host "TUDO PRONTO." -ForegroundColor Green
Write-Host "O prompt da Etapa 3 ja esta copiado (area de transferencia)." -ForegroundColor Green
Write-Host "O Claude Code vai abrir agora nesta janela:" -ForegroundColor Green
Write-Host "   1) Se pedir login, entre com a sua conta Claude no navegador." -ForegroundColor Green
Write-Host "   2) Quando aparecer a caixa de texto, aperte Ctrl+V e depois Enter." -ForegroundColor Green
Write-Host ""
Read-Host "Pressione Enter para abrir o Claude Code"
Set-Location $Pasta
claude
