import React from 'react';

const SiegeTable = ({ sieges, onShowOnMap }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Latitude</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Longitude</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sieges.map((siege) => (
            <tr key={siege.id}>
              <td className="px-4 py-2 whitespace-nowrap">{siege.nom}</td>
              <td className="px-4 py-2 whitespace-nowrap">{siege.adresse}</td>
              <td className="px-4 py-2 whitespace-nowrap">{siege.latitude}</td>
              <td className="px-4 py-2 whitespace-nowrap">{siege.longitude}</td>
              <td className="px-4 py-2 whitespace-nowrap">{siege.description}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => onShowOnMap(siege)}
                >
                  Voir sur la carte
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SiegeTable; 