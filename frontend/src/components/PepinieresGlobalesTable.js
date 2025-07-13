import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PEPINIERES } from '../lib/graphql-queries';
import MemberFilter from './MemberFilter';

const PepinieresGlobalesTable = () => {
  const [selectedUser, setSelectedUser] = useState('');
  const { data, loading, error } = useQuery(GET_ALL_PEPINIERES);

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="text-center py-4 text-red-600">Erreur: {error.message}</div>;

  const pepinieres = data?.allPepinieres || [];
  
  // Filtrer par utilisateur si sélectionné
  const filteredPepinieres = selectedUser 
    ? pepinieres.filter(pepiniere => pepiniere.user.id === selectedUser)
    : pepinieres;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Toutes les Pépinières</h2>
        <MemberFilter
          selectedUser={selectedUser}
          onUserChange={setSelectedUser}
          placeholder="Filtrer par membre..."
        />
      </div>

      {filteredPepinieres.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {selectedUser ? 'Aucune pépinière trouvée pour ce membre.' : 'Aucune pépinière trouvée.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gestionnaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date création
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPepinieres.map((pepiniere) => (
                <tr key={pepiniere.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pepiniere.nom}</div>
                    <div className="text-sm text-gray-500">{pepiniere.adresse}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pepiniere.categorie === 'national' ? 'bg-blue-100 text-blue-800' :
                      pepiniere.categorie === 'régional' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {pepiniere.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pepiniere.nomGestionnaire || '-'}</div>
                    <div className="text-sm text-gray-500">{pepiniere.posteGestionnaire || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pepiniere.capacite ? `${pepiniere.capacite}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {pepiniere.user.logo && (
                        <img
                          src={pepiniere.user.logo}
                          alt="Logo"
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {pepiniere.user.nomInstitution || pepiniere.user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pepiniere.user.nomProjet || pepiniere.user.abreviation}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pepiniere.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Total: {filteredPepinieres.length} pépinière{filteredPepinieres.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default PepinieresGlobalesTable; 