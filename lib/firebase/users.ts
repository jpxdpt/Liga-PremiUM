import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import { User, UserRole, Aluno, Professor } from '@/types';

const USERS_COLLECTION = 'users';
const ALUNOS_COLLECTION = 'alunos';
const PROFESSORES_COLLECTION = 'professores';

export const createUserData = async (
  userId: string,
  email: string,
  name: string,
  role: UserRole
) => {
  if (!db) {
    throw new Error('Firestore não inicializado');
  }
  const userRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(userRef, {
    email,
    name,
    role,
    createdAt: new Date(),
  });
};

export const getUserData = async (userId: string): Promise<User | null> => {
  if (!db) return null;
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User;
  }
  return null;
};

export const getAlunoByUserId = async (userId: string): Promise<Aluno | null> => {
  if (!db) return null;
  const q = query(collection(db, ALUNOS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Aluno;
  }
  return null;
};

export const getProfessorByUserId = async (userId: string): Promise<Professor | null> => {
  if (!db) return null;
  const q = query(collection(db, PROFESSORES_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Professor;
  }
  return null;
};

