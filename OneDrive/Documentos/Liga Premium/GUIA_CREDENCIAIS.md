# 📋 Guia para Obter Credenciais do Firebase

Este guia explica passo a passo como obter as credenciais do Firebase para a aplicação Liga PremiUM.

## 🔥 Passo 1: Criar Projeto no Firebase

1. Aceda ao [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Introduza o nome do projeto (ex: "Liga PremiUM")
4. Desative o Google Analytics (ou ative se preferir)
5. Clique em **"Criar projeto"**
6. Aguarde a criação do projeto

## 🔐 Passo 2: Obter as Credenciais da Web App

1. No painel do projeto Firebase, clique no ícone **⚙️** (Configurações do projeto) no canto superior esquerdo
2. Desça até à secção **"Os seus apps"**
3. Se ainda não criou uma app web, clique no ícone **`</>`** (Web)
4. Introduza um nome para a app (ex: "Liga PremiUM Web")
5. Marque a opção **"Também configure o Firebase Hosting"** (opcional)
6. Clique em **"Registar app"**
7. **IMPORTANTE**: Copie as credenciais que aparecem. Elas têm este formato:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

## 🔑 Passo 3: Configurar Authentication

1. No menu lateral esquerdo do Firebase Console, clique em **"Authentication"**
2. Clique em **"Get started"** (Começar)
3. Vá ao separador **"Sign-in method"**
4. Clique em **"Email/Password"**
5. Ative a opção **"Email/Password"**
6. Clique em **"Guardar"**

## 💾 Passo 4: Configurar Firestore Database

1. No menu lateral esquerdo, clique em **"Firestore Database"**
2. Clique em **"Create database"** (Criar base de dados)
3. Escolha **"Start in test mode"** (modo de teste) ou **"Start in production mode"** (modo produção)
4. Escolha a localização (ex: europe-west)
5. Clique em **"Enable"** (Ativar)

### ⚠️ Configurar Regras de Segurança do Firestore

1. Na Firestore Database, vá ao separador **"Rules"**
2. Cole as seguintes regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para utilizadores
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para turmas
    match /turmas/{turmaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.professorId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/turmas/$(turmaId)).data.professorId == request.auth.uid;
    }
    
    // Regras para alunos
    match /alunos/{alunoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Regras para cartas
    match /cartas/{cartaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Regras para professores
    match /professores/{professorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Clique em **"Publish"** (Publicar)

## 📝 Passo 5: Criar Ficheiro .env.local

1. Na raiz do projeto (onde está o `package.json`), crie um ficheiro chamado `.env.local`
2. Cole o seguinte conteúdo e substitua pelos seus valores:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

### 📌 Onde encontrar cada credencial:

- **API Key**: `apiKey` no objeto firebaseConfig
- **Auth Domain**: `authDomain` no objeto firebaseConfig (geralmente `[projeto-id].firebaseapp.com`)
- **Project ID**: `projectId` no objeto firebaseConfig
- **Storage Bucket**: `storageBucket` no objeto firebaseConfig (geralmente `[projeto-id].appspot.com`)
- **Messaging Sender ID**: `messagingSenderId` no objeto firebaseConfig
- **App ID**: `appId` no objeto firebaseConfig

## 📸 Exemplo Visual

As credenciais aparecem assim no Firebase Console:

```
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8Yl1B2d3E4f5G6h7I8j9K0l1M2n3O4p5Q",
  authDomain: "liga-premium-abc123.firebaseapp.com",
  projectId: "liga-premium-abc123",
  storageBucket: "liga-premium-abc123.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:a1b2c3d4e5f6g7h8i9j0k"
};
```

E no `.env.local` seria:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC8Yl1B2d3E4f5G6h7I8j9K0l1M2n3O4p5Q
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=liga-premium-abc123.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=liga-premium-abc123
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=liga-premium-abc123.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321098
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321098:web:a1b2c3d4e5f6g7h8i9j0k
```

## ✅ Verificar se está correto

1. Certifique-se de que o ficheiro `.env.local` está na raiz do projeto
2. Certifique-se de que não há espaços extras ou aspas nas variáveis
3. Reinicie o servidor de desenvolvimento após criar/modificar o `.env.local`:
   ```bash
   npm run dev
   ```

## 🔒 Segurança

- ⚠️ **NUNCA** commite o ficheiro `.env.local` para o Git
- O ficheiro já está no `.gitignore`
- As credenciais com `NEXT_PUBLIC_` são expostas no cliente (seguro para Firebase)
- Não partilhe as credenciais publicamente

## 🆘 Problemas Comuns

### "Firestore não inicializado"
- Verifique se todas as variáveis de ambiente estão definidas
- Certifique-se de que não há erros de escrita nos nomes das variáveis

### "Permission denied" no Firestore
- Verifique se as regras de segurança estão corretas
- Certifique-se de que o utilizador está autenticado

### "Firebase: Error (auth/network-request-failed)"
- Verifique a sua ligação à internet
- Verifique se as credenciais estão corretas

