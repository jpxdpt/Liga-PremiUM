'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Trophy } from 'lucide-react';

interface NavbarProps {
  role: 'professor' | 'aluno';
}

export default function Navbar({ role }: NavbarProps) {
  const { signOut, userData } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-gray-800 text-gray-100 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Trophy className="h-6 w-6 text-primary-400" />
            <h1 className="text-xl font-bold">Liga PremiUM</h1>
          </div>
          <div className="flex items-center space-x-4">
            {userData && (
              <span className="text-sm text-gray-300">
                {userData.name} ({role === 'professor' ? 'Professor' : 'Aluno'})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
