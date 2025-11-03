'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && userData) {
      // Aguardar um momento para garantir que tudo está carregado
      const timer = setTimeout(() => {
        if (userData.role === 'professor') {
          router.push('/professor');
        } else if (userData.role === 'aluno') {
          router.push('/aluno');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-gray-100">A carregar...</div>
      </div>
    );
  }

  if (user && userData) {
    // Mostrar loading enquanto redireciona
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-gray-100">A redirecionar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-2 text-primary-400">
          Liga PremiUM
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Sistema de gestão de cartas para escolas
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

