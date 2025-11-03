# 🔧 Solução de Erros Comuns

## 📋 Problemas Identificados e Soluções

### 1. ✅ Índices Compostos do Firestore

**Problema:** 
```
Índice composto não encontrado, carregando sem ordenação
```

**Solução:** 
A aplicação funciona sem os índices, mas será mais lenta. Para melhor performance:

1. Aceda ao [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Firestore Database** → **Índices**
3. Clique em **"Criar índice"**
4. Crie os seguintes índices:

#### Índice 1: Cartas por Aluno ordenadas por Data
- **Coleção:** `cartas`
- **Campos:**
  - `alunoId` (Ascendente)
  - `date` (Descendente)

#### Índice 2: Cartas por Turma ordenadas por Data
- **Coleção:** `cartas`
- **Campos:**
  - `turmaId` (Ascendente)
  - `date` (Descendente)

#### Índice 3: Cartas por Aluno no mesmo dia (para verificação)
- **Coleção:** `cartas`
- **Campos:**
  - `alunoId` (Ascendente)
  - `date` (Ascendente)

**Nota:** A aplicação funciona sem estes índices, mas pode demorar mais a carregar. O código usa um fallback automático.

---

### 2. ✅ Erros 400 na Autenticação

**Problema:**
```
identitytoolkit.googleapis.com/v1/accounts:signUp?key=...:1  Failed to load resource: the server responded with a status of 400 ()
```

**Solução:** 
Os erros 400 geralmente indicam:
- Email já em uso (ao registar)
- Password incorreta (ao fazer login)
- Email inválido
- Password muito fraca (menos de 6 caracteres)

**Correção implementada:**
- Mensagens de erro traduzidas para português
- Feedback claro sobre o problema específico

**Verifique:**
1. Se o email já está registado (tente fazer login em vez de registar)
2. Se a password tem pelo menos 6 caracteres
3. Se o email está no formato correto (exemplo@email.com)

---

### 3. ⚠️ ERR_BLOCKED_BY_CLIENT

**Problema:**
```
firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?...:1  Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
```

**Solução:** 
Este erro é causado por **bloqueadores de anúncios** ou extensões do navegador (AdBlock, uBlock Origin, etc.) que bloqueiam as conexões do Firestore.

**Solução rápida:**
1. Desative temporariamente o bloqueador de anúncios para este site
2. Ou adicione o domínio `firestore.googleapis.com` à lista de permissões

**Nota:** Este erro não impede a aplicação de funcionar completamente, mas pode afetar atualizações em tempo real.

---

## ✅ Checklist de Verificação

### Firebase Auth
- [ ] Authentication está ativado no Firebase Console
- [ ] Email/Password está habilitado como método de autenticação
- [ ] As regras de segurança do Firestore permitem leitura/escrita

### Firestore
- [ ] Firestore está criado e ativo
- [ ] As regras de segurança estão configuradas
- [ ] Os índices compostos foram criados (opcional, mas recomendado)

### Configuração
- [ ] Ficheiro `.env.local` existe com as credenciais corretas
- [ ] Todas as variáveis `NEXT_PUBLIC_FIREBASE_*` estão configuradas
- [ ] O servidor foi reiniciado após alterar `.env.local`

---

## 🆘 Ainda tem problemas?

Se os erros persistirem:

1. **Verifique o console do navegador** para mensagens específicas
2. **Verifique o Firebase Console** para ver se há erros nas regras
3. **Teste com um navegador diferente** ou modo anónimo
4. **Limpe o cache do navegador** (Ctrl+Shift+Del)

Para mais ajuda, consulte:
- [GUIA_CREDENCIAIS.md](./GUIA_CREDENCIAIS.md) - Como configurar Firebase
- [INSTRUCOES_INDICES.md](./INSTRUCOES_INDICES.md) - Como criar índices

