'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PEPINIERES } from '../../lib/graphql-queries';
import PepinieresGlobalesTable from '../../components/PepinieresGlobalesTable';
import CSVImportExportPepiniere from '../../components/CSVImportExportPepiniere';
import { useToast } from '../../lib/useToast';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { Upload, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PepinieresGlobalesPage() {
  const { isLoading, isAuthorized } = useAuthGuard(true);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const { loading, error, data, refetch } = useQuery(GET_ALL_PEPINIERES);

  const pepinieres = data?.allPepinieres ?? [];

  // Sécurisation des compteurs
  const totalPepinieres = Array.isArray(pepinieres) ? pepinieres.length : 0;
  const totalPubliques = Array.isArray(pepinieres) ? pepinieres.filter(p => p.categorie === 'publique').length : 0;
  const totalPrivees = Array.isArray(pepinieres) ? pepinieres.filter(p => p.categorie === 'privee').length : 0;

  const handleCSVSuccess = () => {
    setShowCSVModal(false);
    refetch();
    showToast('Import/Export CSV terminé avec succès', 'success');
  };

  const handleViewOnMap = () => {
    router.push('/map?type=pepinieres');
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Pépinières Globales</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Consultez toutes les pépinières enregistrées par tous les utilisateurs
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleViewOnMap}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            <Map size={16} />
            <span className="hidden sm:inline">Voir sur la carte</span>
            <span className="sm:hidden">Carte</span>
          </button>
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Import/Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Total Pépinières</h3>
            <p className="text-2xl lg:text-3xl font-bold text-indigo-600">{totalPepinieres}</p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Pépinières Publiques</h3>
            <p className="text-2xl lg:text-3xl font-bold text-green-600">
              {totalPubliques}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Pépinières Privées</h3>
            <p className="text-2xl lg:text-3xl font-bold text-purple-600">
              {totalPrivees}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <PepinieresGlobalesTable pepinieres={pepinieres} />
        </div>

        {/* CSV Modal */}
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