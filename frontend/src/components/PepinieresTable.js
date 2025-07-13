import React from 'react';
import { Map, Edit, Trash } from 'lucide-react';

const PepinieresTable = ({ pepinieres = [], onShowOnMap, onEdit, onDelete, visibleColumns = [] }) => {
  if (!pepinieres || pepinieres.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune pépinière trouvée</p>
      </div>
    );
  }

  return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
            {visibleColumns.includes('nom') && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
            )}
            {visibleColumns.includes('adresse') && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
            )}
            {visibleColumns.includes('nomGestionnaire') && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gestionnaire
                </th>
            )}
            {visibleColumns.includes('especesProduites') && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Espèces produites
              </th>
            )}
            {visibleColumns.includes('capacite') && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacité
                </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pepinieres.map((pepiniere) => (
                <tr key={pepiniere.id} className="hover:bg-gray-50">
              {visibleColumns.includes('nom') && (
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                  {pepiniere.nom}
                </td>
              )}
              {visibleColumns.includes('adresse') && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {pepiniere.adresse}
                </td>
              )}
              {visibleColumns.includes('nomGestionnaire') && (
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{pepiniere.nomGestionnaire || '-'}</div>
                    <div className="text-xs text-gray-500">{pepiniere.posteGestionnaire || '-'}</div>
                  </div>
                  </td>
              )}
              {visibleColumns.includes('especesProduites') && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {pepiniere.especesProduites ? (
                    <div className="max-w-xs truncate" title={pepiniere.especesProduites}>
                      {pepiniere.especesProduites}
                    </div>
                  ) : '-'}
                  </td>
              )}
              {visibleColumns.includes('capacite') && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {pepiniere.capacite ? `${pepiniere.capacite}` : '-'}
                  </td>
              )}
              <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                <button
                  className="inline-flex items-center px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-bold transition shadow-sm"
                  onClick={() => onShowOnMap && onShowOnMap(pepiniere)}
                  title="Voir la pépinière sur la carte"
                >
                  <Map size={14} className="mr-1" />
                  <span className="hidden sm:inline">Carte</span>
                </button>
                    <button
                  className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition shadow-sm"
                  onClick={() => onEdit && onEdit(pepiniere)}
                  title="Modifier la pépinière"
                    >
                  <Edit size={14} className="mr-1" />
                  <span className="hidden sm:inline">Modifier</span>
                    </button>
                    <button
                  className="inline-flex items-center px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition shadow-sm"
                  onClick={() => onDelete && onDelete(pepiniere)}
                  title="Supprimer la pépinière"
                    >
                  <Trash size={14} className="mr-1" />
                  <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    </div>
  );
};

export default PepinieresTable; 