# Liga PremiUM

Sistema de gestão de cartas para escolas, desenvolvido com Next.js, React e Firebase.

## 📋 Funcionalidades

- **Autenticação de Utilizadores**
  - Sistema de login/registo para Professores e Alunos
  - Professores podem registar alunos
  - Controlo de acesso baseado em roles

- **Gestão de Turmas e Alunos**
  - Professores podem criar e gerir turmas
  - Registar alunos em turmas
  - Visualizar alunos por turma

- **Sistema de Cartas**
  - Tipos de cartas:
    - **Branca**: +3 pontos
    - **Verde**: +2 pontos (apenas se não houver outras cartas no dia)
    - **Amarela**: -2 pontos
    - **Vermelha**: -3 pontos
  - Professores podem atribuir cartas aos alunos
  - Histórico completo de cartas

- **Rankings**
  - Ranking por turma
  - Ranking global da escola
  - Ranking mensal
  - Exportação para CSV

- **Integração com Google Sheets**
  - Sincronização automática de atribuições de cartas
  - Colunas: Data, Professor, Turma, Aluno, Carta, Pontos

- **Dashboards**
  - Dashboard do Professor: gestão completa de turmas, alunos e cartas
  - Dashboard do Aluno: histórico pessoal e posições nos rankings

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **Integração**: Google Sheets API
- **UI**: Lucide React, React Hot Toast

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd liga-premium
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um ficheiro `.env.local` na raiz do projeto:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google Sheets (Opcional)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY=your-private-key
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

4. **Configure o Firebase**

- Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
- Ative Authentication (Email/Password)
- Crie uma base de dados Firestore
- Configure as regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /turmas/{turmaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.professorId == request.auth.uid;
    }
    match /alunos/{alunoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /cartas/{cartaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

5. **Configure o Google Sheets (Opcional)**

- Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
- Ative a API Google Sheets
- Crie uma conta de serviço e baixe o ficheiro JSON
- Partilhe a Google Sheet com o email da conta de serviço

6. **Execute a aplicação**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📱 Utilização

### Para Professores

1. **Registo/Login**: Crie uma conta como Professor
2. **Criar Turma**: Use o dashboard para criar turmas
3. **Registar Alunos**: Registe alunos nas turmas
4. **Atribuir Cartas**: Selecione um aluno e atribua uma carta
5. **Ver Rankings**: Consulte rankings por turma e global
6. **Exportar**: Exporte rankings para CSV

### Para Alunos

1. **Registo/Login**: Crie uma conta como Aluno (ou seja registado por um professor)
2. **Ver Histórico**: Consulte todas as cartas recebidas
3. **Ver Rankings**: Veja a sua posição na turma e globalmente
4. **Estatísticas**: Veja o total de pontos e número de cartas

## 🏗️ Estrutura do Projeto

```
liga-premium/
├── app/
│   ├── aluno/
│   │   └── page.tsx          # Dashboard do aluno
│   ├── professor/
│   │   └── page.tsx          # Dashboard do professor
│   ├── api/                  # API routes
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página de login
│   └── globals.css          # Estilos globais
├── components/
│   ├── LoginForm.tsx        # Formulário de login
│   ├── Navbar.tsx           # Barra de navegação
│   ├── ProtectedRoute.tsx   # Componente de proteção de rotas
│   ├── CreateTurmaModal.tsx # Modal para criar turma
│   └── RegisterAlunoModal.tsx # Modal para registar aluno
├── contexts/
│   └── AuthContext.tsx      # Context de autenticação
├── lib/
│   ├── firebase/
│   │   ├── config.ts        # Configuração Firebase
│   │   ├── auth.ts          # Funções de autenticação
│   │   ├── users.ts         # Gestão de utilizadores
│   │   ├── turmas.ts        # Gestão de turmas
│   │   ├── alunos.ts        # Gestão de alunos
│   │   ├── cartas.ts        # Gestão de cartas
│   │   └── rankings.ts      # Cálculo de rankings
│   ├── google-sheets.ts     # Integração Google Sheets
│   └── utils.ts             # Utilidades
├── types/
│   └── index.ts             # Tipos TypeScript
└── package.json
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 📝 Notas

- As notificações estão preparadas para integração com Firebase Cloud Messaging
- A sincronização com Google Sheets requer configuração adicional
- As cartas Verdes só dão pontos se não houver outras cartas no mesmo dia

## 🐛 Problemas Conhecidos

- A verificação de cartas no mesmo dia para cartas Verdes pode precisar de ajustes
- As notificações precisam de configuração adicional do Firebase Cloud Messaging

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

