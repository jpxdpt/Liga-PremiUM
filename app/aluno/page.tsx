'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { getAlunoByUserId } from '@/lib/firebase/users';
import { getCartasByAluno } from '@/lib/firebase/cartas';
import { calculateRankingByTurma, calculateGlobalRanking } from '@/lib/firebase/rankings-optimized';
import { Aluno, Carta, RankingEntry } from '@/types';
import { Trophy, Award, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AlunoDashboard() {
  const { user, userData } = useAuth();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [turmaRanking, setTurmaRanking] = useState<RankingEntry[]>([]);
  const [globalRanking, setGlobalRanking] = useState<RankingEntry[]>([]);
  const [myPosition, setMyPosition] = useState<number>(0);
  const [myGlobalPosition, setMyGlobalPosition] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userData && userData.role === 'aluno') {
      loadData();
    }
  }, [user, userData]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Carregar dados do aluno primeiro
      const alunoData = await getAlunoByUserId(user.uid);
      
      if (!alunoData) {
        toast.error('Aluno não encontrado');
        setLoading(false);
        return;
      }
      
      setAluno(alunoData);
      
      // Carregar cartas e rankings em paralelo
      const [cartasData, turmaRank, globalRank] = await Promise.all([
        getCartasByAluno(alunoData.id),
        calculateRankingByTurma(alunoData.turmaId),
        calculateGlobalRanking()
      ]);
      
      setCartas(cartasData);
      
      const total = cartasData.reduce((sum, carta) => sum + carta.points, 0);
      setTotalPoints(total);
      
      setTurmaRanking(turmaRank);
      setGlobalRanking(globalRank);
      
      const myTurmaPos = turmaRank.findIndex((entry) => entry.alunoId === alunoData.id);
      setMyPosition(myTurmaPos >= 0 ? myTurmaPos + 1 : 0);
      
      const myGlobalPos = globalRank.findIndex((entry) => entry.alunoId === alunoData.id);
      setMyGlobalPosition(myGlobalPos >= 0 ? myGlobalPos + 1 : 0);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['aluno']}>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-xl text-gray-100">A carregar...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['aluno']}>
      <div className="min-h-screen bg-gray-900">
        <Navbar role="aluno" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Dashboard do Aluno</h2>
            {aluno && (
              <p className="text-gray-400">Bem-vindo, {aluno.name}!</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Pontos</p>
                  <p className="text-2xl font-bold text-gray-100">{totalPoints}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Posição na Turma</p>
                  <p className="text-2xl font-bold text-gray-100">#{myPosition || '-'}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Posição Global</p>
                  <p className="text-2xl font-bold text-gray-100">#{myGlobalPosition || '-'}</p>
                </div>
                <Award className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Cartas</p>
                  <p className="text-2xl font-bold text-gray-100">{cartas.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-100">Histórico de Cartas</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cartas.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Ainda não recebeu cartas</p>
                ) : (
                  cartas.map((carta) => (
                    <div
                      key={carta.id}
                      className={`p-3 border rounded-md transition-colors ${
                        carta.type === 'Branca'
                          ? 'bg-gray-700 border-gray-600'
                          : carta.type === 'Verde'
                          ? 'bg-green-900/30 border-green-600'
                          : carta.type === 'Amarela'
                          ? 'bg-yellow-900/30 border-yellow-600'
                          : 'bg-red-900/30 border-red-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-gray-100">{carta.type}</span>
                          <span className="text-sm text-gray-400 ml-2">
                            {format(carta.date, 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        <span
                          className={`font-bold ${
                            carta.points > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {carta.points > 0 ? '+' : ''}
                          {carta.points} pts
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-100">Ranking da Turma</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {turmaRanking.slice(0, 20).map((entry) => (
                  <div
                    key={entry.alunoId}
                    className={`flex justify-between items-center p-3 rounded-md transition-colors ${
                      entry.alunoId === aluno?.id
                        ? 'bg-primary-900/30 border-primary-500 border font-semibold'
                        : 'bg-gray-700 border border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-primary-400">#{entry.position}</span>
                      <span className="text-gray-100">{entry.alunoName}</span>
                    </div>
                    <span className="font-semibold text-gray-100">{entry.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Ranking Global</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {globalRanking.slice(0, 50).map((entry) => (
                <div
                  key={entry.alunoId}
                  className={`flex justify-between items-center p-3 rounded-md transition-colors ${
                    entry.alunoId === aluno?.id
                      ? 'bg-primary-900/30 border-primary-500 border font-semibold'
                      : 'bg-gray-700 border border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-primary-400">#{entry.position}</span>
                    <span className="text-gray-100">{entry.alunoName}</span>
                    <span className="text-xs text-gray-400">({entry.turmaName})</span>
                  </div>
                  <span className="font-semibold text-gray-100">{entry.totalPoints} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
