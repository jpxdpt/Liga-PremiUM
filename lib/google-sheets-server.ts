import { google } from 'googleapis';
import { Carta } from '@/types';
import { getAluno } from './firebase/alunos';
import { getTurma } from './firebase/turmas';
import { getProfessorByUserId } from './firebase/users';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Tipo para aceitar tanto Date quanto string na data
type CartaWithFlexibleDate = Omit<Carta, 'date'> & {
  date: Date | string;
};

export const syncCartaToSheet = async (carta: CartaWithFlexibleDate) => {
  try {
    // Verificar se as credenciais do Google Sheets estão configuradas
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SPREADSHEET_ID) {
      console.warn('Google Sheets não configurado');
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    const aluno = await getAluno(carta.alunoId);
    const turma = await getTurma(carta.turmaId);
    const professor = await getProfessorByUserId(carta.professorId);

    // Converter data para string se necessário
    let dateStr: string;
    if (typeof carta.date === 'string') {
      dateStr = carta.date.split('T')[0];
    } else if (carta.date instanceof Date) {
      dateStr = carta.date.toISOString().split('T')[0];
    } else {
      dateStr = new Date(carta.date).toISOString().split('T')[0];
    }
    
    const row = [
      dateStr, // Data
      professor?.name || 'N/A', // Professor
      turma?.name || 'N/A', // Turma
      aluno?.name || 'N/A', // Aluno
      carta.type, // Carta
      carta.points.toString(), // Pontos
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error('Erro ao sincronizar com Google Sheets:', error);
    // Não lançar erro - apenas logar
  }
};

