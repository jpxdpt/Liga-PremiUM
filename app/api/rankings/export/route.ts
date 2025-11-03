import { NextRequest, NextResponse } from 'next/server';
import { calculateRankingByTurma, calculateGlobalRanking, calculateMonthlyRanking } from '@/lib/firebase/rankings';
import { RankingEntry, MonthlyRanking } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'turma', 'global', 'monthly'
    const turmaId = searchParams.get('turmaId');
    const month = searchParams.get('month');

    let data: (RankingEntry | MonthlyRanking)[];

    if (type === 'turma' && turmaId) {
      data = await calculateRankingByTurma(turmaId);
    } else if (type === 'global') {
      data = await calculateGlobalRanking();
    } else if (type === 'monthly' && month) {
      data = await calculateMonthlyRanking(new Date(month));
    } else {
      return NextResponse.json(
        { error: 'Tipo de ranking inválido' },
        { status: 400 }
      );
    }

    // Criar CSV
    const headers = type === 'monthly'
      ? ['Posição', 'Nome do Aluno', 'Turma', 'Pontos', 'Mês', 'Ano']
      : ['Posição', 'Nome do Aluno', 'Turma', 'Pontos'];

    const rows = data.map((entry: RankingEntry | MonthlyRanking) => {
      if (type === 'monthly' && 'month' in entry && 'year' in entry) {
        const monthlyEntry = entry as MonthlyRanking;
        return [
          monthlyEntry.position.toString(),
          monthlyEntry.alunoName,
          monthlyEntry.turmaName,
          monthlyEntry.totalPoints.toString(),
          monthlyEntry.month,
          monthlyEntry.year.toString(),
        ];
      } else {
        return [
          entry.position.toString(),
          entry.alunoName,
          entry.turmaName,
          entry.totalPoints.toString(),
        ];
      }
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ranking-${type}-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao exportar ranking' },
      { status: 500 }
    );
  }
}

