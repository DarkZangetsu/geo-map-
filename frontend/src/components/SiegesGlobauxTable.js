'use client';

import React from 'react';

const SiegesGlobauxTable = ({ sieges, loading }) => {
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

  return (
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
          {sieges.map((siege) => (
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
                <button
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                  onClick={() => {
                    // Ouvrir Google Maps avec les coordonnées
                    const url = `https://www.google.com/maps?q=${siege.latitude},${siege.longitude}`;
                    window.open(url, '_blank');
                  }}
                >
                  Voir sur carte
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SiegesGlobauxTable; 