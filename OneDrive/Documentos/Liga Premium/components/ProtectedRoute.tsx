'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !userData) {
        router.push('/');
      } else if (!allowedRoles.includes(userData.role)) {
        if (userData.role === 'professor') {
          router.push('/professor');
        } else {
          router.push('/aluno');
        }
      }
    }
  }, [user, userData, loading, allowedRoles, router]);

  if (loading || !user || !userData || !allowedRoles.includes(userData.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">A carregar...</div>
      </div>
    );
  }

  return <>{children}</>;
}

