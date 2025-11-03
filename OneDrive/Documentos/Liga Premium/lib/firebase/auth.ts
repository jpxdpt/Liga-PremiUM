import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';
import { UserRole } from '@/types';
import { createUserData } from './users';

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: UserRole
) => {
  if (!auth) {
    throw new Error('Firebase Auth não inicializado');
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    await createUserData(user.uid, email, name, role);
    
    return user;
  } catch (error: any) {
    // Traduzir erros do Firebase para português
    let errorMessage = 'Erro ao criar conta';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Este email já está em uso';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Operação não permitida. Verifique as configurações do Firebase';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password muito fraca. Use pelo menos 6 caracteres';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Erro de rede. Verifique a sua ligação à internet';
        break;
      default:
        errorMessage = error.message || 'Erro ao criar conta';
    }
    throw new Error(errorMessage);
  }
};

export const login = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase Auth não inicializado');
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // Traduzir erros do Firebase para português
    let errorMessage = 'Erro ao fazer login';
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Utilizador não encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Password incorreta';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Esta conta foi desativada';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Muitas tentativas falhadas. Tente novamente mais tarde';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Erro de rede. Verifique a sua ligação à internet';
        break;
      default:
        errorMessage = error.message || 'Erro ao fazer login';
    }
    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  if (!auth) {
    return;
  }
  await signOut(auth);
};

// Re-exportar auth de config
export { auth } from './config';

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  if (!auth) {
    return Promise.resolve(null);
  }
  const authInstance = auth; // Guardar referência para TypeScript
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

