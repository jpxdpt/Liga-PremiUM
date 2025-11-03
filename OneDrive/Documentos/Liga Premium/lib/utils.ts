import { RankingEntry, MonthlyRanking } from '@/types';

export const exportToCSV = (data: RankingEntry[] | MonthlyRanking[], filename: string) => {
  const headers = data.length > 0 && 'month' in data[0]
    ? ['Posição', 'Nome do Aluno', 'Turma', 'Pontos', 'Mês', 'Ano']
    : ['Posição', 'Nome do Aluno', 'Turma', 'Pontos'];

  const rows = data.map((entry) => {
    if ('month' in entry) {
      return [
        entry.position.toString(),
        entry.alunoName,
        entry.turmaName,
        entry.totalPoints.toString(),
        entry.month,
        entry.year.toString(),
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

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const sendNotification = async (alunoId: string, message: string) => {
  // Implementação de notificações push ou email
  // Por enquanto, apenas log
  console.log(`Notificação para aluno ${alunoId}: ${message}`);
  
  // Aqui pode ser integrado com Firebase Cloud Messaging ou serviço de email
  // Para implementação completa, seria necessário:
  // 1. Firebase Cloud Messaging para push notifications
  // 2. Ou serviço de email como SendGrid, Resend, etc.
};

