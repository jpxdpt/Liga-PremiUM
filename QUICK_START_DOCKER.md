# 🚀 Quick Start - Docker & Portainer

Guia rápido para fazer deploy no Portainer com LocalTunnel.

## ⚡ Passos Rápidos

### 1. Preparar Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
LOCALTUNNEL_SUBDOMAIN=liga-premium
```

### 2. Deploy no Portainer

#### Opção A: Usando Stack (Recomendado)

1. **Portainer** → **Stacks** → **Add stack**
2. Nome: `liga-premium`
3. Método: **Web editor**
4. Cole o conteúdo de `docker-compose.yml`
5. Adicione as variáveis de ambiente em **Environment variables**
6. Clique em **Deploy the stack**

#### Opção B: Build Manual

```bash
# Build da imagem
docker build -t liga-premium:latest .

# Criar container no Portainer
# Containers → Add container
# Image: liga-premium:latest
# Port mapping: 3000:3000
# Adicione variáveis de ambiente
```

### 3. Verificar Deploy

1. Verifique os logs:
   ```bash
   docker logs liga-premium
   docker logs liga-premium-tunnel
   ```

2. Acesse a aplicação:
   - Local: `http://localhost:3000`
   - Public: Ver URL no log do LocalTunnel (ex: `https://liga-premium.loca.lt`)

## 📋 Checklist

- [ ] Ficheiro `.env` criado com todas as variáveis
- [ ] Docker instalado e funcionando
- [ ] Portainer acessível
- [ ] Stack criada e rodando
- [ ] Containers com status "Running"
- [ ] URL do LocalTunnel obtido

## 🔍 Troubleshooting Rápido

### Container não inicia
```bash
docker logs liga-premium
# Verifique variáveis de ambiente
```

### LocalTunnel não funciona
```bash
docker logs liga-premium-tunnel
# Verifique se o container da app está rodando
```

### Erro de build
```bash
docker-compose build --no-cache
```

## 📚 Documentação Completa

Para mais detalhes, veja [DEPLOY_PORTAINER.md](./DEPLOY_PORTAINER.md)

