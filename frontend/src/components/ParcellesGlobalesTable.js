'use client';

import React from 'react';

const ParcellesGlobalesTable = ({ parcelles, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!parcelles || parcelles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune parcelle trouvée</p>
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
              Culture
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Propriétaire
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Membre
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Superficie (ha)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Variété
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Semis
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Récolte
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type Sol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Irrigation
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Certifications
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Créé le
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {parcelles.map((parcelle) => (
            <tr key={parcelle.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {parcelle.nom}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {parcelle.culture}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {parcelle.proprietaire}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  {parcelle.user?.logo && (
                    <img
                      src={`http://localhost:8000${parcelle.user.logo}`}
                      alt="Logo"
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {parcelle.user?.firstName} {parcelle.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {parcelle.user?.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {parcelle.superficie ? `${parcelle.superficie} ha` : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {parcelle.variete || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {parcelle.dateSemis ? new Date(parcelle.dateSemis).toLocaleDateString('fr-FR') : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {parcelle.dateRecoltePrevue ? new Date(parcelle.dateRecoltePrevue).toLocaleDateString('fr-FR') : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {parcelle.typeSol || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {parcelle.irrigation ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Oui
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Non
                  </span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <div className="flex flex-wrap gap-1">
                  {parcelle.certificationBio && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Bio
                    </span>
                  )}
                  {parcelle.certificationHve && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      HVE
                    </span>
                  )}
                  {!parcelle.certificationBio && !parcelle.certificationHve && (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {new Date(parcelle.createdAt).toLocaleDateString('fr-FR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParcellesGlobalesTable; 