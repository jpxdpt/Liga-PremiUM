import { NextRequest, NextResponse } from 'next/server';
import { syncCartaToSheet } from '@/lib/google-sheets-server';
import { Carta } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const carta: Carta = await request.json();

    await syncCartaToSheet(carta);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao sincronizar com Google Sheets:', error);
    // Não falhar se o Google Sheets não estiver configurado
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao sincronizar' },
      { status: 500 }
    );
  }
}

