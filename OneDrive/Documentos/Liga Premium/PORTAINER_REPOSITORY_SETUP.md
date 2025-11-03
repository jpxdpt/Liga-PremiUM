# 🐳 Deploy no Portainer usando Repository Method

Guia passo a passo para fazer deploy usando o método **Repository** no Portainer.

## ⚠️ Erro Comum: "failed to load the compose file"

Se recebeu o erro `failed to load the compose file: open /data/compose/7/docker-compose.yml: no such file or directory`, siga estas instruções:

## 📋 Passo 1: Verificar que o docker-compose.yml está no Git

Certifique-se de que o ficheiro `docker-compose.yml` foi commitado e enviado para o repositório:

```bash
# Verificar se o ficheiro está no repositório
git ls-files | grep docker-compose.yml

# Se não estiver, adicione e faça commit
git add docker-compose.yml
git commit -m "Add docker-compose.yml"
git push origin main
```

## 🔧 Passo 2: Configurar Stack no Portainer

1. **Aceda ao Portainer**
   - Vá ao seu servidor Portainer
   - Faça login

2. **Criar Nova Stack**
   - No menu lateral, clique em **Stacks**
   - Clique em **Add stack**
   - Nome: `liga-premium`

3. **Configurar Repository Method**
   - Método: **Repository** (Git repository)
   - **Repository URL**: `https://github.com/jpxdpt/Liga-PremiUM.git`
   - **Repository reference**: `main` (ou `master` se for esse o nome da branch)
   - **Compose path**: `docker-compose.yml` ⚠️ **IMPORTANTE**: Deve ser exatamente este nome

4. **Configurar Variáveis de Ambiente**
   - Clique em **Environment variables** ou **Environment**
   - Adicione manualmente cada variável:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQXPg4CKFvaRBMB8ABftAShNPXic5EzKU
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=liga-premium-ba51d.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=liga-premium-ba51d
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=liga-premium-ba51d.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=307129413137
   NEXT_PUBLIC_FIREBASE_APP_ID=1:307129413137:web:7021745ff5c3a55f378bb0
   LOCALTUNNEL_SUBDOMAIN=liga-premium
   ```

   **Ou** pode criar um ficheiro `.env` no repositório Git (mas NÃO faça isso com credenciais reais!)

5. **Auto-update (Opcional)**
   - Se quiser atualizações automáticas quando fizer push para o Git:
   - Ative **Auto-update**
   - Configure o webhook se necessário

6. **Deploy**
   - Clique em **Deploy the stack**
   - Aguarde o build e início dos containers

## 🔍 Troubleshooting

### Erro: "failed to load the compose file"

**Causa**: O Portainer não consegue encontrar o ficheiro `docker-compose.yml` no repositório.

**Soluções**:

1. **Verificar o caminho do ficheiro**
   - No campo **Compose path**, certifique-se de que está exatamente: `docker-compose.yml`
   - Se o ficheiro estiver numa subpasta, use: `subfolder/docker-compose.yml`
   - Para este projeto, deve ser apenas: `docker-compose.yml` (na raiz)

2. **Verificar se o ficheiro está no Git**
   ```bash
   # No seu repositório local
   git ls-files | grep docker-compose
   ```
   
   Se não aparecer, adicione:
   ```bash
   git add docker-compose.yml
   git commit -m "Add docker-compose.yml"
   git push origin main
   ```

3. **Verificar permissões do repositório**
   - Certifique-se de que o Portainer tem acesso ao repositório
   - Se for privado, configure as credenciais Git no Portainer

4. **Verificar o nome da branch**
   - O campo **Repository reference** deve corresponder ao nome da branch
   - Tente `main` ou `master` dependendo do seu repositório

### Erro: "Repository not found" ou "Access denied"

**Soluções**:

1. **Repositório Público**: Se o repositório for público, não precisa de credenciais
2. **Repositório Privado**: Configure credenciais Git no Portainer:
   - Vá em **Settings** → **Registries**
   - Adicione credenciais Git se necessário

### Erro: "Build failed"

**Soluções**:

1. Verifique os logs do build no Portainer
2. Certifique-se de que todas as variáveis de ambiente estão configuradas
3. Verifique se o Dockerfile está no repositório

## ✅ Verificação Final

Após o deploy bem-sucedido, deve ver:

1. **Dois containers rodando**:
   - `liga-premium` (aplicação Next.js)
   - `liga-premium-tunnel` (LocalTunnel)

2. **Logs do LocalTunnel**:
   ```bash
   # No Portainer, vá em Containers → liga-premium-tunnel → Logs
   # Deve ver algo como:
   your url is: https://liga-premium.loca.lt
   ```

3. **Aplicação acessível**:
   - Localmente: `http://seu-servidor:3000`
   - Publicamente: URL do LocalTunnel (ex: `https://liga-premium.loca.lt`)

## 📝 Configuração Alternativa: Usar Web Editor

Se o método Repository continuar a dar problemas, pode usar o **Web editor**:

1. Vá em **Stacks** → **Add stack**
2. Método: **Web editor**
3. Copie o conteúdo completo do `docker-compose.yml`
4. Cole no editor
5. Configure as variáveis de ambiente
6. Deploy

Veja [DEPLOY_PORTAINER.md](./DEPLOY_PORTAINER.md) para mais detalhes.

