import { getAllCartas, getCartasByTurma } from './cartas';
import { getAllAlunos, getAlunosByTurma } from './alunos';
import { getTurma } from './turmas';
import { RankingEntry, MonthlyRanking } from '@/types';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Cache simples para rankings
const rankingCache = new Map<string, { data: RankingEntry[]; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

const getCachedRanking = (key: string): RankingEntry[] | null => {
  const cached = rankingCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedRanking = (key: string, data: RankingEntry[]) => {
  rankingCache.set(key, { data, timestamp: Date.now() });
};

export const calculateRankingByTurma = async (turmaId: string): Promise<RankingEntry[]> => {
  const cacheKey = `turma-${turmaId}`;
  const cached = getCachedRanking(cacheKey);
  if (cached) return cached;

  try {
    // Executar queries em paralelo
    const [alunos, cartas, turma] = await Promise.all([
      getAlunosByTurma(turmaId),
      getCartasByTurma(turmaId),
      getTurma(turmaId),
    ]);
    
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
    
    setCachedRanking(cacheKey, ranking);
    return ranking;
  } catch (error) {
    console.error('Erro ao calcular ranking da turma:', error);
    throw error;
  }
};

export const calculateGlobalRanking = async (): Promise<RankingEntry[]> => {
  const cacheKey = 'global';
  const cached = getCachedRanking(cacheKey);
  if (cached) return cached;

  try {
    // Executar queries em paralelo
    const [alunos, cartas] = await Promise.all([
      getAllAlunos(),
      getAllCartas(),
    ]);
    
    const pointsMap = new Map<string, number>();
    const turmaIds = new Set<string>();
    
    alunos.forEach((aluno) => {
      pointsMap.set(aluno.id, 0);
      turmaIds.add(aluno.turmaId);
    });
    
    cartas.forEach((carta) => {
      const currentPoints = pointsMap.get(carta.alunoId) || 0;
      pointsMap.set(carta.alunoId, currentPoints + carta.points);
    });
    
    // Buscar todas as turmas de uma vez
    const turmaPromises = Array.from(turmaIds).map(id => getTurma(id));
    const turmas = await Promise.all(turmaPromises);
    const turmaMap = new Map<string, string>();
    turmas.forEach((turma) => {
      if (turma) {
        turmaMap.set(turma.id, turma.name);
      }
    });
    
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
    
    setCachedRanking(cacheKey, ranking);
    return ranking;
  } catch (error) {
    console.error('Erro ao calcular ranking global:', error);
    throw error;
  }
};

export const calculateMonthlyRanking = async (
  month: Date
): Promise<MonthlyRanking[]> => {
  const cacheKey = `monthly-${format(month, 'yyyy-MM')}`;
  const cached = getCachedRanking(cacheKey);
  if (cached) return cached as MonthlyRanking[];

  try {
    const [alunos, cartas] = await Promise.all([
      getAllAlunos(),
      getAllCartas(),
    ]);
    
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    const monthlyCartas = cartas.filter((carta) =>
      isWithinInterval(carta.date, { start, end })
    );
    
    const pointsMap = new Map<string, number>();
    const turmaIds = new Set<string>();
    
    alunos.forEach((aluno) => {
      pointsMap.set(aluno.id, 0);
      turmaIds.add(aluno.turmaId);
    });
    
    monthlyCartas.forEach((carta) => {
      const currentPoints = pointsMap.get(carta.alunoId) || 0;
      pointsMap.set(carta.alunoId, currentPoints + carta.points);
    });
    
    // Buscar todas as turmas de uma vez
    const turmaPromises = Array.from(turmaIds).map(id => getTurma(id));
    const turmas = await Promise.all(turmaPromises);
    const turmaMap = new Map<string, string>();
    turmas.forEach((turma) => {
      if (turma) {
        turmaMap.set(turma.id, turma.name);
      }
    });
    
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
    
    setCachedRanking(cacheKey, ranking);
    return ranking;
  } catch (error) {
    console.error('Erro ao calcular ranking mensal:', error);
    throw error;
  }
};

// Limpar cache quando necessário
export const clearRankingCache = (key?: string) => {
  if (key) {
    rankingCache.delete(key);
  } else {
    rankingCache.clear();
  }
};

