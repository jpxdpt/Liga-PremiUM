import { getAllCartas, getCartasByTurma } from './cartas';
import { getAllAlunos, getAlunosByTurma } from './alunos';
import { getTurma } from './turmas';
import { RankingEntry, MonthlyRanking } from '@/types';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const calculateRankingByTurma = async (turmaId: string): Promise<RankingEntry[]> => {
  const alunos = await getAlunosByTurma(turmaId);
  const cartas = await getCartasByTurma(turmaId);
  const turma = await getTurma(turmaId);
  
  const pointsMap = new Map<string, number>();
  
  alunos.forEach((aluno) => {
    pointsMap.set(aluno.id, 0);
  });
  
  cartas.forEach((carta) => {
    const currentPoints = pointsMap.get(carta.alunoId) || 0;
    pointsMap.set(carta.alunoId, currentPoints + carta.points);
  });
  
  const ranking: RankingEntry[] = alunos.map((aluno) => ({
    alunoId: aluno.id,
    alunoName: aluno.name,
    turmaId: aluno.turmaId,
    turmaName: turma?.name || '',
    totalPoints: pointsMap.get(aluno.id) || 0,
    position: 0,
  }));
  
  ranking.sort((a, b) => b.totalPoints - a.totalPoints);
  ranking.forEach((entry, index) => {
    entry.position = index + 1;
  });
  
  return ranking;
};

export const calculateGlobalRanking = async (): Promise<RankingEntry[]> => {
  const alunos = await getAllAlunos();
  const cartas = await getAllCartas();
  
  const pointsMap = new Map<string, number>();
  const alunoMap = new Map<string, { name: string; turmaId: string }>();
  const turmaMap = new Map<string, string>();
  
  alunos.forEach((aluno) => {
    pointsMap.set(aluno.id, 0);
    alunoMap.set(aluno.id, { name: aluno.name, turmaId: aluno.turmaId });
  });
  
  cartas.forEach((carta) => {
    const currentPoints = pointsMap.get(carta.alunoId) || 0;
    pointsMap.set(carta.alunoId, currentPoints + carta.points);
  });
  
  // Buscar nomes das turmas
  for (const aluno of alunos) {
    if (!turmaMap.has(aluno.turmaId)) {
      const turma = await getTurma(aluno.turmaId);
      if (turma) {
        turmaMap.set(aluno.turmaId, turma.name);
      }
    }
  }
  
  const ranking: RankingEntry[] = alunos.map((aluno) => ({
    alunoId: aluno.id,
    alunoName: aluno.name,
    turmaId: aluno.turmaId,
    turmaName: turmaMap.get(aluno.turmaId) || '',
    totalPoints: pointsMap.get(aluno.id) || 0,
    position: 0,
  }));
  
  ranking.sort((a, b) => b.totalPoints - a.totalPoints);
  ranking.forEach((entry, index) => {
    entry.position = index + 1;
  });
  
  return ranking;
};

export const calculateMonthlyRanking = async (
  month: Date
): Promise<MonthlyRanking[]> => {
  const alunos = await getAllAlunos();
  const cartas = await getAllCartas();
  
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  
  const monthlyCartas = cartas.filter((carta) =>
    isWithinInterval(carta.date, { start, end })
  );
  
  const pointsMap = new Map<string, number>();
  const turmaMap = new Map<string, string>();
  
  alunos.forEach((aluno) => {
    pointsMap.set(aluno.id, 0);
  });
  
  monthlyCartas.forEach((carta) => {
    const currentPoints = pointsMap.get(carta.alunoId) || 0;
    pointsMap.set(carta.alunoId, currentPoints + carta.points);
  });
  
  // Buscar nomes das turmas
  for (const aluno of alunos) {
    if (!turmaMap.has(aluno.turmaId)) {
      const turma = await getTurma(aluno.turmaId);
      if (turma) {
        turmaMap.set(aluno.turmaId, turma.name);
      }
    }
  }
  
  const ranking: MonthlyRanking[] = alunos
    .filter((aluno) => (pointsMap.get(aluno.id) || 0) > 0)
    .map((aluno) => ({
      alunoId: aluno.id,
      alunoName: aluno.name,
      turmaId: aluno.turmaId,
      turmaName: turmaMap.get(aluno.turmaId) || '',
      totalPoints: pointsMap.get(aluno.id) || 0,
      position: 0,
      month: format(month, 'MMMM'),
      year: month.getFullYear(),
    }));
  
  ranking.sort((a, b) => b.totalPoints - a.totalPoints);
  ranking.forEach((entry, index) => {
    entry.position = index + 1;
  });
  
  return ranking;
};
