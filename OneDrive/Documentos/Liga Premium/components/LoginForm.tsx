'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, login } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserRole } from '@/types';

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('aluno');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userData } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Login realizado com sucesso!');
        // Não fazer setLoading(false) aqui - o AuthContext vai atualizar e redirecionar
      } else {
        await signUp(email, password, name, role);
        toast.success('Registo realizado com sucesso!');
        // Não fazer setLoading(false) aqui - o AuthContext vai atualizar e redirecionar
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login/registo');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tipo de Utilizador
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required={!isLogin}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
            </select>
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'A processar...' : isLogin ? 'Entrar' : 'Registar'}
      </button>
      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="w-full text-sm text-primary-400 hover:text-primary-300 transition-colors"
      >
        {isLogin ? 'Não tem conta? Registe-se' : 'Já tem conta? Faça login'}
      </button>
    </form>
  );
}
