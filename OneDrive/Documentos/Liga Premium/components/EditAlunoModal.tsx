'use client';

import { useState, useEffect } from 'react';
import { updateAluno, deleteAluno } from '@/lib/firebase/alunos';
import toast from 'react-hot-toast';
import { Aluno } from '@/types';
import { Trash2, Save } from 'lucide-react';

interface EditAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  aluno: Aluno | null;
}

export default function EditAlunoModal({ isOpen, onClose, onSuccess, aluno }: EditAlunoModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (aluno) {
      setName(aluno.name);
      setEmail(aluno.email);
    }
  }, [aluno]);

  if (!isOpen || !aluno) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      await updateAluno(aluno.id, {
        name: name.trim(),
        email: email.trim(),
      });
      toast.success('Aluno atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar aluno');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await deleteAluno(aluno.id);
      toast.success('Aluno removido com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao remover aluno');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-gray-100">Editar Aluno</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
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
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'A guardar...' : 'Guardar'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (showDeleteConfirm) {
                  setShowDeleteConfirm(false);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 bg-gray-600 text-gray-100 rounded-md hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              showDeleteConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Trash2 className="h-4 w-4" />
            <span>{showDeleteConfirm ? 'Confirmar Remoção' : 'Remover Aluno'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

