import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/firebase/auth';
import { createAluno } from '@/lib/firebase/alunos';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, turmaId } = await request.json();

    if (!email || !password || !name || !turmaId) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Criar utilizador
    const user = await signUp(email, password, name, 'aluno');

    // Criar aluno
    await createAluno(user.uid, turmaId, name, email);

    return NextResponse.json({ success: true, userId: user.uid });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao registar aluno' },
      { status: 500 }
    );
  }
}

