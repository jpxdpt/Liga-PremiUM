# 🔧 Como Resolver o Erro "API Key Not Valid"

Se está a receber o erro "Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)", siga estes passos:

## ✅ Passo 1: Verificar o Firebase Console

1. Aceda ao [Firebase Console](https://console.firebase.google.com/)
2. Selecione o seu projeto Firebase
3. Vá em **⚙️ Configurações do projeto** → **Os seus apps**
4. Clique na app web
5. **Copie a API Key mostrada** e verifique que corresponde à que está no `.env.local`

## ✅ Passo 2: Verificar Restrições da API Key

1. No Firebase Console, vá em **⚙️ Configurações do projeto**
2. Vá ao separador **"APIs ativas"**
3. Certifique-se de que estas APIs estão ativas:
   - **Identity Toolkit API** (para Authentication)
   - **Cloud Firestore API** (para Firestore)
   - **Cloud Storage API** (se usar Storage)

## ✅ Passo 3: Verificar o Ficheiro .env.local

O ficheiro `.env.local` deve estar na **raiz do projeto** (mesmo nível que `package.json`) e deve ter este formato **EXATO**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

⚠️ **IMPORTANTE**:
- **NÃO** tenha espaços antes ou depois do `=`
- **NÃO** use aspas nos valores
- **NÃO** tenha linhas vazias desnecessárias

## ✅ Passo 4: Reiniciar o Servidor Next.js

Após criar ou modificar o `.env.local`, **SEMPRE reinicie o servidor**:

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   npm run dev
   ```

O Next.js **apenas carrega** as variáveis de ambiente quando inicia!

## ✅ Passo 5: Verificar no Browser

1. Abra o browser em `http://localhost:3000`
2. Abra a **Console do Developer** (F12)
3. Procure por erros ou mensagens de validação
4. Verifique se aparecem as mensagens de validação que adicionámos

## ✅ Passo 6: Verificar Authentication no Firebase

1. No Firebase Console, vá em **Authentication**
2. Se ainda não estiver ativado, clique em **"Get started"**
3. Vá ao separador **"Sign-in method"**
4. Ative **"Email/Password"**
5. Clique em **"Guardar"**

## 🔍 Debug

Se ainda não funcionar, execute no terminal:

```bash
# Verificar se o Next.js está a ler as variáveis
node -e "console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)"
```

Ou verifique no código:

```typescript
// Em lib/firebase/config.ts, adicione temporariamente:
console.log('Firebase Config:', firebaseConfig);
```

## ⚠️ Problemas Comuns

### Erro: "API Key not valid"
- **Causa**: A API key está incorreta ou há espaços extras
- **Solução**: Copie novamente do Firebase Console e certifique-se de que não há espaços

### Erro: "Project not found"
- **Causa**: O Project ID está incorreto
- **Solução**: Verifique o Project ID no Firebase Console

### Variáveis não carregam
- **Causa**: O servidor Next.js não foi reiniciado
- **Solução**: Pare e inicie novamente o servidor

### "Firestore não inicializado"
- **Causa**: As APIs do Firebase não estão ativas
- **Solução**: Ative as APIs necessárias no Firebase Console

