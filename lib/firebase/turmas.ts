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
import { Turma } from '@/types';

const TURMAS_COLLECTION = 'turmas';

export const createTurma = async (
  name: string,
  professorId: string
): Promise<string> => {
  if (!db) {
    throw new Error('Firestore não inicializado');
  }
  const turmaRef = doc(collection(db, TURMAS_COLLECTION));
  await setDoc(turmaRef, {
    name,
    professorId,
    createdAt: new Date(),
  });
  return turmaRef.id;
};

export const getTurma = async (turmaId: string): Promise<Turma | null> => {
  if (!db) return null;
  const turmaRef = doc(db, TURMAS_COLLECTION, turmaId);
  const turmaSnap = await getDoc(turmaRef);
  
  if (turmaSnap.exists()) {
    return { id: turmaSnap.id, ...turmaSnap.data() } as Turma;
  }
  return null;
};

export const getTurmasByProfessor = async (professorId: string): Promise<Turma[]> => {
  if (!db) return [];
  const q = query(
    collection(db, TURMAS_COLLECTION),
    where('professorId', '==', professorId)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Turma[];
};

export const updateTurma = async (turmaId: string, name: string) => {
  if (!db) throw new Error('Firestore não inicializado');
  const turmaRef = doc(db, TURMAS_COLLECTION, turmaId);
  await updateDoc(turmaRef, { name });
};

export const deleteTurma = async (turmaId: string) => {
  if (!db) throw new Error('Firestore não inicializado');
  const turmaRef = doc(db, TURMAS_COLLECTION, turmaId);
  await deleteDoc(turmaRef);
};

