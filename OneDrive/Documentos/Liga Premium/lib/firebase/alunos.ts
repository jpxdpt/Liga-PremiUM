import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Aluno } from '@/types';

const ALUNOS_COLLECTION = 'alunos';

export const createAluno = async (
  userId: string,
  turmaId: string,
  name: string,
  email: string
): Promise<string> => {
  if (!db) {
    throw new Error('Firestore não inicializado');
  }
  const alunoRef = doc(collection(db, ALUNOS_COLLECTION));
  await setDoc(alunoRef, {
    userId,
    turmaId,
    name,
    email,
    createdAt: new Date(),
  });
  return alunoRef.id;
};

export const getAluno = async (alunoId: string): Promise<Aluno | null> => {
  if (!db) return null;
  const alunoRef = doc(db, ALUNOS_COLLECTION, alunoId);
  const alunoSnap = await getDoc(alunoRef);
  
  if (alunoSnap.exists()) {
    return { id: alunoSnap.id, ...alunoSnap.data() } as Aluno;
  }
  return null;
};

export const getAlunosByTurma = async (turmaId: string): Promise<Aluno[]> => {
  if (!db) return [];
  const q = query(
    collection(db, ALUNOS_COLLECTION),
    where('turmaId', '==', turmaId)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Aluno[];
};

export const getAllAlunos = async (): Promise<Aluno[]> => {
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, ALUNOS_COLLECTION));
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Aluno[];
};

export const updateAluno = async (alunoId: string, data: Partial<Aluno>) => {
  if (!db) throw new Error('Firestore não inicializado');
  const alunoRef = doc(db, ALUNOS_COLLECTION, alunoId);
  await updateDoc(alunoRef, data);
};

export const deleteAluno = async (alunoId: string) => {
  if (!db) throw new Error('Firestore não inicializado');
  const alunoRef = doc(db, ALUNOS_COLLECTION, alunoId);
  await deleteDoc(alunoRef);
};

