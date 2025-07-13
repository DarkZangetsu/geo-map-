'use client';

import { useState } from 'react';
import { Edit, Trash, MapPin, Eye } from 'lucide-react';
import PepiniereDetailModal from './PepiniereDetailModal';

export default function PepiniereTable({ pepinieres, onEdit, onDelete }) {
  const [selectedPepiniere, setSelectedPepiniere] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = (pepiniere) => {
    setSelectedPepiniere(pepiniere);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPepiniere(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!pepinieres || pepinieres.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune pépinière</h3>
        <p className="text-gray-600">Vous n'avez pas encore créé de pépinière.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gestionnaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date création
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pepinieres.map((pepiniere) => (
              <tr key={pepiniere.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{pepiniere.nom}</div>
                  {pepiniere.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {pepiniere.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{pepiniere.adresse}</div>
                  <div className="text-sm text-gray-500">
                    {pepiniere.latitude}, {pepiniere.longitude}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{pepiniere.nomGestionnaire || '-'}</div>
                  {pepiniere.posteGestionnaire && (
                    <div className="text-sm text-gray-500">{pepiniere.posteGestionnaire}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pepiniere.capacite ? `${pepiniere.capacite} plants` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(pepiniere.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewDetails(pepiniere)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      title="Voir les détails"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(pepiniere)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(pepiniere.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de détails */}
      {showDetailModal && selectedPepiniere && (
        <PepiniereDetailModal
          pepiniere={selectedPepiniere}
          onClose={handleCloseDetailModal}
        />
      )}
    </>
  );
} 