'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_PEPINIERES, DELETE_PEPINIERE } from '../../lib/graphql-queries';
import PepiniereModal from '../../components/PepiniereModal';
import PepiniereTable from '../../components/PepiniereTable';
import CSVImportExportPepiniere from '../../components/CSVImportExportPepiniere';
import { useToast } from '../../lib/useToast';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { Plus, Upload, Download } from 'lucide-react';

export default function PepinierePage() {
  const { isLoading, isAuthorized } = useAuthGuard(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPepiniere, setEditingPepiniere] = useState(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const { showToast } = useToast();

  const { loading, error, data, refetch } = useQuery(GET_MY_PEPINIERES);
  const [deletePepiniere] = useMutation(DELETE_PEPINIERE);

  const pepinieres = data?.myPepinieres || [];

  const handleCreatePepiniere = () => {
    setEditingPepiniere(null);
    setShowModal(true);
  };

  const handleEditPepiniere = (pepiniere) => {
    setEditingPepiniere(pepiniere);
    setShowModal(true);
  };

  const handleDeletePepiniere = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pépinière ?')) {
      try {
        await deletePepiniere({
          variables: { id },
          update: (cache) => {
            const existingPepinieres = cache.readQuery({ query: GET_MY_PEPINIERES });
            if (existingPepinieres) {
              cache.writeQuery({
                query: GET_MY_PEPINIERES,
                data: {
                  myPepinieres: existingPepinieres.myPepinieres.filter(p => p.id !== id)
                }
              });
            }
          }
        });
        showToast('Pépinière supprimée avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showToast('Erreur lors de la suppression de la pépinière', 'error');
      }
    }
  };

  const handlePepiniereSuccess = () => {
    setShowModal(false);
    setEditingPepiniere(null);
    refetch();
    showToast(
      editingPepiniere 
        ? 'Pépinière modifiée avec succès' 
        : 'Pépinière créée avec succès', 
      'success'
    );
  };

  const handleCSVSuccess = () => {
    setShowCSVModal(false);
    refetch();
    showToast('Import/Export CSV terminé avec succès', 'success');
  };

  // Afficher un loader pendant la vérification d'authentification
  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Vérification de l\'authentification...' : 'Redirection vers la page de connexion...'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des pépinières...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des pépinières</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Pépinières</h1>
          <p className="text-gray-600">
            Gérez vos pépinières et vos informations de production de plants
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={handleCreatePepiniere}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-sm transition flex items-center gap-2"
          >
            <Plus size={20} />
            Ajouter une pépinière
          </button>
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm transition flex items-center gap-2"
          >
            <Upload size={20} />
            Import/Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <PepiniereTable
            pepinieres={pepinieres}
            onEdit={handleEditPepiniere}
            onDelete={handleDeletePepiniere}
          />
        </div>

        {/* Modals */}
        {showModal && (
          <PepiniereModal
            isOpen={showModal}
            initialData={editingPepiniere}
            mode={editingPepiniere ? 'edit' : 'add'}
            onClose={() => {
              setShowModal(false);
              setEditingPepiniere(null);
            }}
            onSuccess={handlePepiniereSuccess}
          />
        )}

        {showCSVModal && (
          <CSVImportExportPepiniere
            onClose={() => setShowCSVModal(false)}
            onSuccess={handleCSVSuccess}
          />
        )}
      </div>
    </div>
  );
} 