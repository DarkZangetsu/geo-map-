import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_PEPINIERES, DELETE_PEPINIERE } from '../lib/graphql-queries';
import { useToast } from '../lib/useToast';
import PepiniereModal from './PepiniereModal';
import ConfirmationDialog from './ConfirmationDialog';

const PepinieresTable = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingPepiniere, setEditingPepiniere] = useState(null);
  const [deletePepiniere, setDeletePepiniere] = useState(null);
  const { showSuccess, showError } = useToast();

  const { data, loading, error, refetch } = useQuery(GET_MY_PEPINIERES);
  const [deletePepiniereMutation] = useMutation(DELETE_PEPINIERE);

  const handleEdit = (pepiniere) => {
    setEditingPepiniere(pepiniere);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletePepiniere) return;

    try {
      const { data } = await deletePepiniereMutation({
        variables: { id: deletePepiniere.id }
      });

      if (data.deletePepiniere.success) {
        showSuccess('Pépinière supprimée avec succès');
        refetch();
      } else {
        showError(data.deletePepiniere.message);
      }
    } catch (error) {
      showError('Erreur lors de la suppression');
    } finally {
      setDeletePepiniere(null);
    }
  };

  const handleSuccess = () => {
    refetch();
    setEditingPepiniere(null);
  };

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="text-center py-4 text-red-600">Erreur: {error.message}</div>;

  const pepinieres = data?.myPepinieres || [];

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Mes Pépinières</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Ajouter une pépinière
        </button>
      </div>

      {pepinieres.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune pépinière trouvée. Ajoutez votre première pépinière !
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pepiniere.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(pepiniere)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeletePepiniere(pepiniere)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PepiniereModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPepiniere(null);
        }}
        onSuccess={handleSuccess}
        initialData={editingPepiniere}
        mode={editingPepiniere ? 'edit' : 'add'}
      />

      <ConfirmationDialog
        isOpen={!!deletePepiniere}
        onClose={() => setDeletePepiniere(null)}
        onConfirm={handleDelete}
        title="Supprimer la pépinière"
        message={`Êtes-vous sûr de vouloir supprimer la pépinière "${deletePepiniere?.nom}" ? Cette action est irréversible.`}
      />
    </div>
  );
};

export default PepinieresTable; 