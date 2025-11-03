# 🐳 Deploy no Portainer com LocalTunnel

Guia completo para fazer deploy da aplicação Liga PremiUM no Portainer com LocalTunnel.

## 📋 Pré-requisitos

1. **Portainer** instalado e acessível
2. **Docker** instalado no servidor
3. **Conta LocalTunnel** (opcional, mas recomendado para subdomínios personalizados)
4. **Credenciais do Firebase** configuradas

## 🚀 Passo 1: Preparar o Ambiente

### 1.1 Criar Ficheiro `.env` para Docker

Crie um ficheiro `.env` na raiz do projeto com as variáveis de ambiente:

```env
# Firebase Configuration (obrigatório)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google Sheets Configuration (opcional)
# GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
# GOOGLE_PRIVATE_KEY=your-private-key
# GOOGLE_SPREADSHEET_ID=your-spreadsheet-id

# LocalTunnel Configuration (opcional)
LOCALTUNNEL_SUBDOMAIN=liga-premium
```

⚠️ **IMPORTANTE**: Se não especificar `LOCALTUNNEL_SUBDOMAIN`, o LocalTunnel gerará um URL aleatório.

## 🐳 Passo 2: Deploy no Portainer

### 2.1 Opção A: Usando Docker Compose (Recomendado)

1. **Aceda ao Portainer**
   - Vá ao seu servidor Portainer
   - Faça login

2. **Criar Stack**
   - No menu lateral, clique em **Stacks**
   - Clique em **Add stack**
   - Nome: `liga-premium`
   - Método: **Repository**

3. **Configurar Git Repository** (se usar Git)
   - Repository URL: URL do seu repositório Git
   - Repository reference: `main` ou `master`
   - Compose path: `docker-compose.yml`
   - Auto-update: Ative se quiser atualizações automáticas

4. **Configurar Variáveis de Ambiente**
   - Clique em **Environment variables**
   - Adicione todas as variáveis do ficheiro `.env`
   - Ou use o ficheiro `.env` diretamente

5. **Deploy**
   - Clique em **Deploy the stack**
   - Aguarde o build e início dos containers

### 2.2 Opção B: Build Manual com Dockerfile

1. **Build da Imagem**
   ```bash
   docker build -t liga-premium:latest .
   ```

2. **Criar Container no Portainer**
   - Vá em **Containers** → **Add container**
   - Name: `liga-premium`
   - Image: `liga-premium:latest`
   - Port mapping: `3000:3000`
   - Adicione as variáveis de ambiente

3. **Iniciar Container**
   - Clique em **Deploy the container**

### 2.3 Opção C: Usando Docker Compose no Portainer (Stack)

1. **Criar Stack**
   - Vá em **Stacks** → **Add stack**
   - Nome: `liga-premium`
   - Método: **Web editor**

2. **Copiar docker-compose.yml**
   - Cole o conteúdo do `docker-compose.yml`

3. **Adicionar Variáveis de Ambiente**
   - Clique em **Environment variables**
   - Adicione todas as variáveis do `.env`

4. **Deploy**
   - Clique em **Deploy the stack**

## 🌐 Passo 3: Configurar LocalTunnel

### 3.1 Verificar se LocalTunnel está a funcionar

Após o deploy, verifique os logs do container `liga-premium-tunnel`:

```bash
docker logs liga-premium-tunnel
```

Deve ver algo como:
```
your url is: https://liga-premium.loca.lt
```

### 3.2 Acessar a Aplicação

1. **URL do LocalTunnel**
   - O LocalTunnel gerará um URL como: `https://liga-premium.loca.lt`
   - Este URL estará disponível publicamente

2. **URL Direta (se expor porta)**
   - Se configurou port mapping, pode acessar: `http://seu-servidor:3000`

## 🔧 Configuração Avançada

### Usar Subdomínio Personalizado no LocalTunnel

1. **Instalar LocalTunnel Globalmente** (se não usar container)
   ```bash
   npm install -g localtunnel
   ```

2. **Criar Conta LocalTunnel** (opcional)
   - Aceda a [localtunnel.me](https://localtunnel.github.io/www/)
   - Crie uma conta para subdomínios personalizados

3. **Usar Subdomínio Personalizado**
   ```bash
   lt --port 3000 --subdomain seu-subdominio
   ```

### Configurar SSL/HTTPS

O LocalTunnel já fornece HTTPS automaticamente. Se precisar de HTTPS próprio:

1. **Usar Reverse Proxy (Nginx/Caddy)**
   - Configure um reverse proxy apontando para `http://localhost:3000`
   - Configure SSL com Let's Encrypt

2. **Exemplo Nginx**
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔍 Troubleshooting

### Container não inicia

1. **Verificar Logs**
   ```bash
   docker logs liga-premium
   ```

2. **Verificar Variáveis de Ambiente**
   - Certifique-se de que todas as variáveis `NEXT_PUBLIC_*` estão configuradas

### LocalTunnel não funciona

1. **Verificar se o container da app está a correr**
   ```bash
   docker ps | grep liga-premium
   ```

2. **Verificar Logs do Tunnel**
   ```bash
   docker logs liga-premium-tunnel
   ```

3. **Testar Conexão Local**
   ```bash
   curl http://localhost:3000
   ```

### Erro de Build

1. **Limpar Build Anterior**
   ```bash
   docker system prune -a
   ```

2. **Rebuild**
   ```bash
   docker-compose build --no-cache
   ```

## 📊 Monitorização

### Verificar Status dos Containers

No Portainer:
1. Vá em **Containers**
2. Verifique os containers `liga-premium` e `liga-premium-tunnel`
3. Ambos devem estar com status **Running**

### Ver Logs

No Portainer:
1. Clique no container
2. Vá em **Logs**
3. Verifique se há erros

### Health Check

O container tem health check configurado. Verifique em **Containers** → **Health**.

## 🔒 Segurança

1. **Variáveis de Ambiente**
   - Nunca commite o ficheiro `.env` para o Git
   - Use secrets do Portainer para variáveis sensíveis

2. **Firebase Security Rules**
   - Certifique-se de que as regras do Firestore estão configuradas corretamente

3. **LocalTunnel**
   - O LocalTunnel é público por padrão
   - Considere usar autenticação adicional se necessário

## 📝 Notas Importantes

1. **Build Time vs Runtime**
   - Variáveis `NEXT_PUBLIC_*` são embutidas no build
   - Se mudar variáveis `NEXT_PUBLIC_*`, precisa fazer rebuild

2. **Portas**
   - A aplicação usa a porta 3000 internamente
   - O LocalTunnel expõe esta porta publicamente

3. **Persistência**
   - Os dados são armazenados no Firebase, não há necessidade de volumes

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs dos containers
2. Verifique as variáveis de ambiente
3. Certifique-se de que o Firebase está configurado corretamente
4. Veja [SOLUCAO_ERROS.md](./SOLUCAO_ERROS.md) para mais ajuda

