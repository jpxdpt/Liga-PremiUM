# 🔧 Resolver Erro "Firebase API Key não configurada" no Docker

Se está a ver o erro `❌ Firebase API Key não configurada` quando a aplicação roda no Docker/Portainer, este é o guia para resolver.

## 🎯 O Problema

As variáveis de ambiente `NEXT_PUBLIC_*` no Next.js são **embutidas no código JavaScript durante o build**. Isso significa que:

1. ❌ **NÃO funciona** apenas passar as variáveis no runtime (docker-compose environment)
2. ✅ **PRECISA** passar as variáveis como **build arguments** durante o build do Docker

## ✅ Solução

### 1. Verificar Dockerfile

O `Dockerfile` deve ter `ARG` e `ENV` para as variáveis `NEXT_PUBLIC_*`:

```dockerfile
# No stage builder
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

ENV NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
# ... resto das variáveis
```

### 2. Verificar docker-compose.yml

O `docker-compose.yml` deve passar as variáveis como **build args**:

```yaml
services:
  liga-premium:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
        - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
        # ... resto das variáveis
```

### 3. Configurar no Portainer

1. **Criar/Editar Stack**
   - Vá em **Stacks** → sua stack
   - Clique em **Editor**

2. **Adicionar Environment Variables**
   - Clique em **Environment variables**
   - Adicione TODAS as variáveis `NEXT_PUBLIC_*`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQXPg4CKFvaRBMB8ABftAShNPXic5EzKU
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=liga-premium-ba51d.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=liga-premium-ba51d
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=liga-premium-ba51d.firebasestorage.app
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=307129413137
     NEXT_PUBLIC_FIREBASE_APP_ID=1:307129413137:web:7021745ff5c3a55f378bb0
     ```

3. **Fazer Rebuild**
   - ⚠️ **IMPORTANTE**: Após adicionar/modificar as variáveis, precisa fazer **rebuild** da stack
   - No Portainer:
     - Vá em **Stacks** → sua stack
     - Clique em **Editor**
     - Modifique qualquer coisa no `docker-compose.yml` (adicionar um espaço, etc)
     - Clique em **Update the stack**
   - Ou delete e recrie a stack

## 🧪 Verificar se Funciona

1. **Verificar Build Logs**
   - No Portainer, vá em **Containers**
   - Clique no container `liga-premium`
   - Veja os **Logs**
   - Procure por: `✅ Firebase API Key carregada` (não deve aparecer `❌`)

2. **Verificar no Browser**
   - Abra a aplicação (URL do LocalTunnel ou porta 3000)
   - Abra a **Console do Developer** (F12)
   - Não deve aparecer: `❌ Firebase API Key não configurada`

## 🔄 Rebuild Necessário

⚠️ **Lembre-se**: Sempre que modificar variáveis `NEXT_PUBLIC_*`:
1. Pare a stack
2. Faça rebuild (ou delete e recrie)
3. Inicie novamente

As variáveis `NEXT_PUBLIC_*` são embutidas no build, então **mudanças requerem rebuild**!

## 📝 Exemplo de Configuração Completa no Portainer

**Environment variables** (na stack):
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQXPg4CKFvaRBMB8ABftAShNPXic5EzKU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=liga-premium-ba51d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=liga-premium-ba51d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=liga-premium-ba51d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=307129413137
NEXT_PUBLIC_FIREBASE_APP_ID=1:307129413137:web:7021745ff5c3a55f378bb0
LOCALTUNNEL_SUBDOMAIN=liga-premium
```

**docker-compose.yml** (automático, já está correto):
```yaml
build:
  args:
    - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
    # ... etc
```

## ❓ Ainda Não Funciona?

1. **Limpar Build Cache**
   - No Portainer, vá em **Images**
   - Delete as imagens `liga-premium` antigas
   - Faça rebuild

2. **Verificar Logs de Build**
   - Veja os logs do build no Portainer
   - Procure por erros relacionados com variáveis de ambiente

3. **Testar Localmente**
   - Teste com `docker-compose up --build` localmente
   - Se funcionar localmente mas não no Portainer, problema de configuração no Portainer

