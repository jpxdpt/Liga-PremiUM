# Script PowerShell para iniciar a aplicação com LocalTunnel (Windows)

Write-Host "🚀 Iniciando Liga PremiUM..." -ForegroundColor Green

# Verificar se a porta 3000 está disponível
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "⚠️  Porta 3000 já está em uso" -ForegroundColor Yellow
    exit 1
}

# Iniciar aplicação em background
Write-Host "📦 Iniciando aplicação Next.js..." -ForegroundColor Cyan
Start-Process -NoNewWindow npm -ArgumentList "start"

# Aguardar aplicação iniciar
Start-Sleep -Seconds 10

# Verificar se a aplicação está rodando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Aplicação iniciada em http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao iniciar aplicação: $_" -ForegroundColor Red
    exit 1
}

# Iniciar LocalTunnel
Write-Host "🌐 Iniciando LocalTunnel..." -ForegroundColor Cyan
$subdomain = $env:LOCALTUNNEL_SUBDOMAIN

if ($subdomain) {
    Write-Host "✅ Tunnel será criado: https://${subdomain}.loca.lt" -ForegroundColor Green
    Start-Process -NoNewWindow npx -ArgumentList "localtunnel --port 3000 --subdomain $subdomain"
} else {
    Write-Host "✅ Tunnel será criado (URL será exibido)" -ForegroundColor Green
    Start-Process -NoNewWindow npx -ArgumentList "localtunnel --port 3000"
}

Write-Host ""
Write-Host "📝 A aplicação está rodando!" -ForegroundColor Green
Write-Host "   - Local: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Verifique o output do LocalTunnel para o URL público" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow

# Manter script rodando
Wait-Process npm

