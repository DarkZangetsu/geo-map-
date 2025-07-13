import React from 'react';

const ParcellesTable = ({ parcelles, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Culture</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Propriétaire</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Personne Référente</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Superficie</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {parcelles.map((parcelle) => (
            <tr key={parcelle.id}>
              <td className="px-4 py-2 whitespace-nowrap">{parcelle.nom}</td>
              <td className="px-4 py-2 whitespace-nowrap">{parcelle.culture}</td>
              <td className="px-4 py-2 whitespace-nowrap">{parcelle.proprietaire}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium">{parcelle.nomPersonneReferente || '-'}</div>
                  <div className="text-xs text-gray-500">{parcelle.poste || '-'}</div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{parcelle.superficie}</td>
              <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => onEdit && onEdit(parcelle)}
                >
                  Éditer
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => onDelete && onDelete(parcelle)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParcellesTable; 