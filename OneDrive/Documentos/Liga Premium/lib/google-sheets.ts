import { google } from 'googleapis';
import { Carta } from '@/types';
import { getAluno } from './firebase/alunos';
import { getTurma } from './firebase/turmas';
import { getProfessorByUserId } from './firebase/users';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export const getAuthClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  
  return auth;
};

export const syncCartaToSheet = async (carta: Carta) => {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      console.warn('GOOGLE_SPREADSHEET_ID não configurado');
      return;
    }
    
    const aluno = await getAluno(carta.alunoId);
    const turma = await getTurma(carta.turmaId);
    const professor = await getProfessorByUserId(carta.professorId);
    
    const row = [
      carta.date.toISOString().split('T')[0], // Data
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
    throw error;
  }
};

export const initializeSheet = async () => {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return;
    }
    
    // Verificar se já existe cabeçalho
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1:F1',
    });
    
    if (!response.data.values || response.data.values.length === 0) {
      // Criar cabeçalho
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'A1:F1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Data', 'Professor', 'Turma', 'Aluno', 'Carta', 'Pontos']],
        },
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar Google Sheets:', error);
  }
};

