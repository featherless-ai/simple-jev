$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
    throw 'WSL is required for the P2.2 LinuxDOOM/Emscripten local build. Install WSL/Ubuntu first.'
}

$WslRepo = (& wsl.exe wslpath -a -u $RepoRoot).Trim()
if (-not $WslRepo) {
    throw "Could not resolve WSL path for $RepoRoot"
}

Write-Host "Building P2.2 bot-capable LinuxDOOM runtime in WSL..."
& wsl.exe bash -lc "cd '$WslRepo' && bash direct-port/build_p22_runtime.sh"
if ($LASTEXITCODE -ne 0) {
    throw "P2.2 runtime build failed with exit code $LASTEXITCODE"
}

$RuntimeDir = Join-Path $RepoRoot 'mcp\.cache\p22-runtime'
if (-not (Test-Path (Join-Path $RuntimeDir 'index.html'))) {
    throw "P2.2 runtime output missing: $RuntimeDir"
}

$env:DOOM_MCP_GAME_DIR = $RuntimeDir
Write-Host ''
Write-Host 'P2.2 runtime is ready for this PowerShell session.'
Write-Host "DOOM_MCP_GAME_DIR=$env:DOOM_MCP_GAME_DIR"
Write-Host ''
Write-Host 'Next:'
Write-Host '  cd mcp'
Write-Host '  npm start'
Write-Host ''
Write-Host 'Then use doom_create_deathmatch_arena and doom_prepare_human_bot_arena from Grok/your MCP host.'
