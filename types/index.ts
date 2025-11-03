export type UserRole = 'professor' | 'aluno';

export type CardType = 'Branca' | 'Verde' | 'Amarela' | 'Vermelha';

export interface CardPoints {
  Branca: 3;
  Verde: 2;
  Amarela: -2;
  Vermelha: -3;
}

export const CARD_POINTS: CardPoints = {
  Branca: 3,
  Verde: 2,
  Amarela: -2,
  Vermelha: -3,
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface Turma {
  id: string;
  name: string;
  professorId: string;
  createdAt: Date;
}

export interface Aluno {
  id: string;
  userId: string;
  turmaId: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Professor {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Carta {
  id: string;
  alunoId: string;
  professorId: string;
  turmaId: string;
  type: CardType;
  points: number;
  date: Date;
  createdAt: Date;
}

export interface RankingEntry {
  alunoId: string;
  alunoName: string;
  turmaId: string;
  turmaName: string;
  totalPoints: number;
  position: number;
}

export interface MonthlyRanking extends RankingEntry {
  month: string;
  year: number;
}

