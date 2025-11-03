import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Carta, CardType, CARD_POINTS } from '@/types';

const CARTAS_COLLECTION = 'cartas';

export const createCarta = async (
  alunoId: string,
  professorId: string,
  turmaId: string,
  type: CardType,
  date: Date = new Date()
): Promise<string> => {
  if (!db) {
    throw new Error('Firestore não inicializado');
  }

  // Verificar se já existem outras cartas no dia (exceto a que vamos criar)
  const hasOtherCards = await checkOtherCardsToday(alunoId, date);
  
  // Calcular pontos: Verde só dá +2 se não houver outras cartas
  let points: number = CARD_POINTS[type];
  if (type === 'Verde' && hasOtherCards) {
    points = 0; // Verde não dá pontos se houver outras cartas
  }
  
  // Garantir que points é um número válido
  if (typeof points !== 'number' || isNaN(points)) {
    points = CARD_POINTS[type];
  }
  
  const cartaRef = doc(collection(db, CARTAS_COLLECTION));
  await setDoc(cartaRef, {
    alunoId,
    professorId,
    turmaId,
    type,
    points,
    date: Timestamp.fromDate(date),
    createdAt: Timestamp.now(),
  });
  
  return cartaRef.id;
};

const checkOtherCardsToday = async (alunoId: string, date: Date): Promise<boolean> => {
  if (!db) {
    return false;
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const q = query(
      collection(db, CARTAS_COLLECTION),
      where('alunoId', '==', alunoId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error: any) {
    // Se falhar por falta de índice, tentar buscar todas as cartas do aluno e filtrar
    if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
      console.warn('Índice composto não encontrado para verificação de cartas do dia, usando método alternativo');
      try {
        const q = query(
          collection(db, CARTAS_COLLECTION),
          where('alunoId', '==', alunoId)
        );
        const querySnapshot = await getDocs(q);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const cartasNoDia = querySnapshot.docs.filter(doc => {
          const cartaData = doc.data();
          if (!cartaData.date) return false;
          const cartaDate = cartaData.date.toDate();
          return cartaDate >= startOfDay && cartaDate <= endOfDay;
        });
        
        return cartasNoDia.length > 0;
      } catch (fallbackError) {
        console.error('Erro ao verificar cartas do dia:', fallbackError);
        return false; // Em caso de erro, assumir que não há outras cartas
      }
    }
    console.error('Erro ao verificar cartas do dia:', error);
    return false; // Em caso de erro, assumir que não há outras cartas
  }
};

export const getCartasByAluno = async (alunoId: string): Promise<Carta[]> => {
  if (!db) {
    return [];
  }

  try {
    const q = query(
      collection(db, CARTAS_COLLECTION),
      where('alunoId', '==', alunoId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
      } as Carta;
    });
  } catch (error: any) {
    // Se falhar por falta de índice, tentar sem orderBy
    if (error.code === 'failed-precondition') {
      console.warn('Índice composto não encontrado, carregando sem ordenação');
      const q = query(
        collection(db, CARTAS_COLLECTION),
        where('alunoId', '==', alunoId)
      );
      const querySnapshot = await getDocs(q);
      const cartas = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
        } as Carta;
      });
      // Ordenar em memória
      return cartas.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    throw error;
  }
};

export const getCartasByTurma = async (turmaId: string): Promise<Carta[]> => {
  if (!db) {
    return [];
  }

  try {
    const q = query(
      collection(db, CARTAS_COLLECTION),
      where('turmaId', '==', turmaId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
      } as Carta;
    });
  } catch (error: any) {
    // Se falhar por falta de índice, tentar sem orderBy
    if (error.code === 'failed-precondition') {
      console.warn('Índice composto não encontrado, carregando sem ordenação');
      const q = query(
        collection(db, CARTAS_COLLECTION),
        where('turmaId', '==', turmaId)
      );
      const querySnapshot = await getDocs(q);
      const cartas = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
        } as Carta;
      });
      // Ordenar em memória
      return cartas.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    throw error;
  }
};

export const getAllCartas = async (): Promise<Carta[]> => {
  if (!db) {
    return [];
  }

  const q = query(collection(db, CARTAS_COLLECTION), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
    } as Carta;
  });
};
