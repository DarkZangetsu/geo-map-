'use client';

import React, { useState } from 'react';
import SiegeDetailModal from './SiegeDetailModal';

const SiegesGlobauxTable = ({ sieges, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSiege, setSelectedSiege] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!sieges || sieges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun siège trouvé</p>
      </div>
    );
  }

  // Calcul de la pagination
  const totalPages = Math.ceil(sieges.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentSieges = sieges.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Retour à la première page
  };

  const handleViewDetails = (siege) => {
    console.log('SiegesGlobauxTable - handleViewDetails called with:', siege);
    setSelectedSiege(siege);
    setShowDetailModal(true);
  };

  return (
    <div>
      {/* Contrôles de pagination et filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Lignes par page:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-700">
          Affichage de {startIndex + 1} à {Math.min(endIndex, sieges.length)} sur {sieges.length} sièges
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Abréviation
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latitude
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Longitude
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créé le
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSieges.map((siege) => (
              <tr key={siege.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {siege.nom}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {siege.adresse}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {siege.user?.logo && (
                      <img
                        src={`http://localhost:8000${siege.user.logo}`}
                        alt="Logo"
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {siege.user?.firstName} {siege.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {siege.user?.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {siege.user?.abreviation || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {siege.latitude}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {siege.longitude}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {siege.description || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(siege.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => {
                        // Ouvrir Google Maps avec les coordonnées
                        const url = `https://www.google.com/maps?q=${siege.latitude},${siege.longitude}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Voir carte
                    </button>
                    <button
                      onClick={() => handleViewDetails(siege)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Détails
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedSiege && (
        <SiegeDetailModal
          siege={selectedSiege}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSiege(null);
          }}
        />
      )}
    </div>
  );
};

export default SiegesGlobauxTable; 