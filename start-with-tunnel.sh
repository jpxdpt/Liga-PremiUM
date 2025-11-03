#!/bin/sh
# Script para iniciar a aplicação com LocalTunnel

echo "🚀 Iniciando Liga PremiUM..."

# Verificar se a porta 3000 está disponível
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta 3000 já está em uso"
    exit 1
fi

# Iniciar aplicação em background
echo "📦 Iniciando aplicação Next.js..."
npm start &

# Aguardar aplicação iniciar
sleep 10

# Verificar se a aplicação está rodando
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Erro ao iniciar aplicação"
    exit 1
fi

echo "✅ Aplicação iniciada em http://localhost:3000"

# Iniciar LocalTunnel
echo "🌐 Iniciando LocalTunnel..."
if [ -n "$LOCALTUNNEL_SUBDOMAIN" ]; then
    npx localtunnel --port 3000 --subdomain "$LOCALTUNNEL_SUBDOMAIN" &
    echo "✅ Tunnel criado: https://${LOCALTUNNEL_SUBDOMAIN}.loca.lt"
else
    npx localtunnel --port 3000 &
    echo "✅ Tunnel criado (URL será exibido abaixo)"
fi

# Manter script rodando
wait

