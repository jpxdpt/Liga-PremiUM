'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { getTurmasByProfessor } from '@/lib/firebase/turmas';
import { getAlunosByTurma } from '@/lib/firebase/alunos';
import { createCarta } from '@/lib/firebase/cartas';
import { calculateRankingByTurma, calculateGlobalRanking, clearRankingCache } from '@/lib/firebase/rankings-optimized';
import { Turma, Aluno, CardType, RankingEntry } from '@/types';
import toast from 'react-hot-toast';
import { Trophy, Users, Plus, Award, Download } from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/utils';
import CreateTurmaModal from '@/components/CreateTurmaModal';
import RegisterAlunoModal from '@/components/RegisterAlunoModal';
import EditTurmaModal from '@/components/EditTurmaModal';
import EditAlunoModal from '@/components/EditAlunoModal';

export default function ProfessorDashboard() {
  const { user, userData } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>('');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [globalRanking, setGlobalRanking] = useState<RankingEntry[]>([]);
  const [showCartaModal, setShowCartaModal] = useState(false);
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [showAlunoModal, setShowAlunoModal] = useState(false);
  const [showEditTurmaModal, setShowEditTurmaModal] = useState(false);
  const [showEditAlunoModal, setShowEditAlunoModal] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<string>('');
  const [selectedAlunoForEdit, setSelectedAlunoForEdit] = useState<Aluno | null>(null);
  const [selectedTurmaForEdit, setSelectedTurmaForEdit] = useState<Turma | null>(null);
  const [cartaType, setCartaType] = useState<CardType>('Branca');
  const [loading, setLoading] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);

  useEffect(() => {
    if (userData && userData.role === 'professor' && user) {
      loadTurmas();
      // Carregar ranking global em background (não bloquear)
      loadGlobalRanking().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, user]);

  useEffect(() => {
    if (selectedTurma && userData && userData.role === 'professor') {
      loadAlunos();
      loadRanking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTurma]);

  const loadTurmas = async () => {
    if (!user) return;
    try {
      const turmasData = await getTurmasByProfessor(user.uid);
      setTurmas(turmasData);
      if (turmasData.length > 0 && !selectedTurma) {
        setSelectedTurma(turmasData[0].id);
      }
    } catch (error) {
      toast.error('Erro ao carregar turmas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlunos = async () => {
    if (!selectedTurma) return;
    try {
      const alunosData = await getAlunosByTurma(selectedTurma);
      setAlunos(alunosData);
    } catch (error) {
      toast.error('Erro ao carregar alunos');
      console.error(error);
    }
  };

  const loadRanking = async () => {
    setLoadingRankings(true);
    try {
      const rankingData = await calculateRankingByTurma(selectedTurma);
      setRanking(rankingData);
    } catch (error) {
      toast.error('Erro ao carregar ranking');
      console.error(error);
    } finally {
      setLoadingRankings(false);
    }
  };

  const loadGlobalRanking = async () => {
    try {
      const globalData = await calculateGlobalRanking();
      setGlobalRanking(globalData);
    } catch (error) {
      toast.error('Erro ao carregar ranking global');
      console.error(error);
    }
  };

  const handleAtribuirCarta = async () => {
    if (!selectedAluno || !user || !selectedTurma) return;

    try {
      const cartaId = await createCarta(
        selectedAluno,
        user.uid,
        selectedTurma,
        cartaType
      );
      
      // Buscar os dados para sincronização
      const aluno = alunos.find((a) => a.id === selectedAluno);
      const turma = turmas.find((t) => t.id === selectedTurma);
      
      // Buscar a carta do Firestore para obter os pontos corretos
      let points: number = cartaType === 'Branca' ? 3 : cartaType === 'Verde' ? 2 : cartaType === 'Amarela' ? -2 : -3;
      try {
        const { getDoc, doc, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');
        if (db) {
          const cartaDocRef = doc(collection(db, 'cartas'), cartaId);
          const cartaDoc = await getDoc(cartaDocRef);
          if (cartaDoc.exists()) {
            const data = cartaDoc.data();
            points = data.points || points;
          }
        }
      } catch (error) {
        console.warn('Não foi possível buscar pontos da carta, usando valor padrão:', error);
      }
      
      // Sincronizar com Google Sheets via API route
      if (aluno && turma) {
        try {
          await fetch('/api/google-sheets/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: cartaId,
              alunoId: selectedAluno,
              professorId: user.uid,
              turmaId: selectedTurma,
              type: cartaType,
              points,
              date: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('Erro ao sincronizar com Google Sheets:', error);
          // Não mostrar erro ao utilizador se o Google Sheets não estiver configurado
        }
      }

      toast.success('Carta atribuída com sucesso!');
      setShowCartaModal(false);
      setSelectedAluno('');
      // Limpar cache e recarregar rankings
      clearRankingCache();
      loadRanking();
      loadGlobalRanking();
    } catch (error: any) {
      console.error('Erro ao atribuir carta:', error);
      toast.error(`Erro ao atribuir carta: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleExportRanking = () => {
    if (selectedTurma && ranking.length > 0) {
      exportToCSV(ranking, `ranking-turma-${selectedTurma}`);
      toast.success('Ranking exportado com sucesso!');
    }
  };

  const handleExportGlobal = () => {
    if (globalRanking.length > 0) {
      exportToCSV(globalRanking, 'ranking-global');
      toast.success('Ranking global exportado com sucesso!');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['professor']}>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-xl text-gray-100">A carregar...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['professor']}>
      <div className="min-h-screen bg-gray-900">
        <Navbar role="professor" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Dashboard do Professor</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Turmas</p>
                  <p className="text-2xl font-bold text-gray-100">{turmas.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Alunos</p>
                  <p className="text-2xl font-bold text-gray-100">{alunos.length}</p>
                </div>
                <Award className="h-8 w-8 text-primary-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Ranking Global</p>
                  <p className="text-2xl font-bold text-gray-100">{globalRanking.length} alunos</p>
                </div>
                <Trophy className="h-8 w-8 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Selecionar Turma</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowTurmaModal(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nova Turma</span>
                  </button>
                  <button
                    onClick={() => setShowCartaModal(true)}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Atribuir Carta</span>
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <select
                  value={selectedTurma}
                  onChange={(e) => setSelectedTurma(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.name}
                    </option>
                  ))}
                </select>
                {selectedTurma && (
                  <button
                    onClick={() => {
                      const turma = turmas.find(t => t.id === selectedTurma);
                      if (turma) {
                        setSelectedTurmaForEdit(turma);
                        setShowEditTurmaModal(true);
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Alunos da Turma</h3>
                <button
                  onClick={() => setShowAlunoModal(true)}
                  disabled={!selectedTurma}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registar Aluno</span>
                </button>
              </div>
              <div className="space-y-2">
                {alunos.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhum aluno nesta turma</p>
                ) : (
                  alunos.map((aluno) => (
                    <div
                      key={aluno.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-700 rounded transition-colors group"
                    >
                      <div className="flex-1">
                        <span className="text-gray-100">{aluno.name}</span>
                        <span className="text-sm text-gray-400 ml-2">({aluno.email})</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAlunoForEdit(aluno);
                          setShowEditAlunoModal(true);
                        }}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Editar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Ranking da Turma</h3>
                <button
                  onClick={handleExportRanking}
                  disabled={ranking.length === 0}
                  className="flex items-center space-x-2 px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar CSV</span>
                </button>
              </div>
              <div className="space-y-2">
                {loadingRankings ? (
                  <div className="text-center py-4 text-gray-400">A carregar...</div>
                ) : ranking.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">Nenhum ranking disponível</div>
                ) : (
                  ranking.slice(0, 10).map((entry) => (
                    <div
                      key={entry.alunoId}
                      className="flex justify-between items-center p-3 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-primary-400">#{entry.position}</span>
                        <span className="text-gray-100">{entry.alunoName}</span>
                      </div>
                      <span className="font-semibold text-gray-100">{entry.totalPoints} pts</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Ranking Global</h3>
                <button
                  onClick={handleExportGlobal}
                  disabled={globalRanking.length === 0}
                  className="flex items-center space-x-2 px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar CSV</span>
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {globalRanking.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">Nenhum ranking disponível</div>
                ) : (
                  globalRanking.slice(0, 20).map((entry) => (
                    <div
                      key={entry.alunoId}
                      className="flex justify-between items-center p-3 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-primary-400">#{entry.position}</span>
                        <div>
                          <span className="text-gray-100">{entry.alunoName}</span>
                          <span className="text-xs text-gray-400 ml-2">({entry.turmaName})</span>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-100">{entry.totalPoints} pts</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {showCartaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-gray-100">Atribuir Carta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Aluno
                  </label>
                  <select
                    value={selectedAluno}
                    onChange={(e) => setSelectedAluno(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione um aluno</option>
                    {alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo de Carta
                  </label>
                  <select
                    value={cartaType}
                    onChange={(e) => setCartaType(e.target.value as CardType)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Branca">Branca (+3 pontos)</option>
                    <option value="Verde">Verde (+2 pontos, se não houver outras cartas)</option>
                    <option value="Amarela">Amarela (-2 pontos)</option>
                    <option value="Vermelha">Vermelha (-3 pontos)</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAtribuirCarta}
                    disabled={!selectedAluno}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Atribuir
                  </button>
                  <button
                    onClick={() => {
                      setShowCartaModal(false);
                      setSelectedAluno('');
                    }}
                    className="flex-1 bg-gray-600 text-gray-100 py-2 px-4 rounded-md hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <CreateTurmaModal
          isOpen={showTurmaModal}
          onClose={() => setShowTurmaModal(false)}
          onSuccess={() => {
            loadTurmas();
            clearRankingCache();
            loadGlobalRanking();
          }}
        />

        <RegisterAlunoModal
          isOpen={showAlunoModal}
          onClose={() => setShowAlunoModal(false)}
          onSuccess={() => {
            loadAlunos();
            clearRankingCache();
            loadRanking();
          }}
          turmaId={selectedTurma}
        />

        <EditTurmaModal
          isOpen={showEditTurmaModal}
          onClose={() => {
            setShowEditTurmaModal(false);
            setSelectedTurmaForEdit(null);
          }}
          onSuccess={() => {
            loadTurmas();
            clearRankingCache();
            loadRanking();
            loadGlobalRanking();
          }}
          turma={selectedTurmaForEdit}
        />

        <EditAlunoModal
          isOpen={showEditAlunoModal}
          onClose={() => {
            setShowEditAlunoModal(false);
            setSelectedAlunoForEdit(null);
          }}
          onSuccess={() => {
            loadAlunos();
            clearRankingCache();
            loadRanking();
            loadGlobalRanking();
          }}
          aluno={selectedAlunoForEdit}
        />
      </div>
    </ProtectedRoute>
  );
}

