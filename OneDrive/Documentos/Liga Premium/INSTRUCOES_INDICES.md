# 📋 Instruções para Criar Índices do Firestore

Os rankings estão otimizados, mas para melhor performance, você precisa criar índices compostos no Firestore.

## ⚠️ Importante

**A aplicação funciona sem os índices!** Mas será mais lenta ao carregar rankings. O código usa um fallback automático que:
1. Tenta usar o índice
2. Se falhar, carrega sem ordenação
3. Ordena os resultados em memória

## 🔧 Como Criar os Índices

### Opção 1: Via Firebase Console (Recomendado)

1. Aceda ao [Firebase Console](https://console.firebase.google.com/)
2. Selecione o seu projeto Firebase
3. Vá em **Firestore Database** → **Índices**
4. Clique em **"Criar índice"** ou **"Add Index"**

#### Criar os seguintes índices:

**Índice 1: Cartas por Aluno ordenadas por Data**
- **Coleção:** `cartas`
- **Campos de consulta:**
  1. `alunoId` - **Tipo:** Campo, **Ordenação:** Ascendente
  2. `date` - **Tipo:** Campo, **Ordenação:** Descendente
- Clique em **"Criar"** ou **"Create"**

**Índice 2: Cartas por Turma ordenadas por Data**
- **Coleção:** `cartas`
- **Campos de consulta:**
  1. `turmaId` - **Tipo:** Campo, **Ordenação:** Ascendente
  2. `date` - **Tipo:** Campo, **Ordenação:** Descendente
- Clique em **"Criar"** ou **"Create"**

**Índice 3: Cartas por Aluno no mesmo dia (para verificação)**
- **Coleção:** `cartas`
- **Campos de consulta:**
  1. `alunoId` - **Tipo:** Campo, **Ordenação:** Ascendente
  2. `date` - **Tipo:** Campo, **Ordenação:** Ascendente
- Clique em **"Criar"** ou **"Create"**

**Tempo de criação:** Os índices podem demorar alguns minutos a serem criados. Verifique o estado em **Firestore Database** → **Índices**.

### Opção 2: Usando Firebase CLI

Se tiver o Firebase CLI instalado:

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar Firestore (se ainda não tiver)
firebase init firestore

# Fazer deploy dos índices
firebase deploy --only firestore:indexes
```

O ficheiro `firestore.indexes.json` já está configurado com todos os índices necessários.

## 🔍 Verificar se os Índices foram Criados

1. Aceda ao [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Firestore Database** → **Índices**
3. Deve ver 3 índices com estado **"Ativo"** ou **"Enabled"**

## 📊 Benefícios

Com os índices criados:
- ✅ Rankings carregam muito mais rápido
- ✅ Menos uso de recursos do Firestore
- ✅ Melhor experiência do utilizador
- ✅ Redução de custos (menos leituras do Firestore)

Sem os índices:
- ⚠️ Rankings ainda funcionam, mas mais lentos
- ⚠️ O código usa fallback automático
- ⚠️ Pode ver warnings no console do navegador

## 🆘 Problemas?

Se tiver problemas ao criar os índices:
1. Certifique-se de que o Firestore está ativo
2. Verifique se tem permissões de administrador no projeto
3. Os índices podem demorar alguns minutos a serem criados
4. Veja [SOLUCAO_ERROS.md](./SOLUCAO_ERROS.md) para mais ajuda

