import { NextRequest, NextResponse } from 'next/server';
import { createCarta } from '@/lib/firebase/cartas';
import { syncCartaToSheet } from '@/lib/google-sheets-server';
import { sendNotification } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { alunoId, professorId, turmaId, type, date } = await request.json();

    if (!alunoId || !professorId || !turmaId || !type) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const cartaDate = date ? new Date(date) : new Date();
    const cartaId = await createCarta(alunoId, professorId, turmaId, type, cartaDate);

    // Sincronizar com Google Sheets
    try {
      const points = type === 'Branca' ? 3 : type === 'Verde' ? 2 : type === 'Amarela' ? -2 : -3;
      await syncCartaToSheet({
        id: cartaId,
        alunoId,
        professorId,
        turmaId,
        type,
        points,
        date: cartaDate,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao sincronizar com Google Sheets:', error);
    }

    // Enviar notificação
    try {
      await sendNotification(
        alunoId,
        `Recebeu uma carta ${type}!`
      );
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }

    return NextResponse.json({ success: true, cartaId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar carta' },
      { status: 500 }
    );
  }
}

