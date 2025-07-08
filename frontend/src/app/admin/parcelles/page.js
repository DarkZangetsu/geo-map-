"use client";
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_PARCELLES, DELETE_PARCELLE } from '../../../lib/graphql-queries';
import ParcellesDataTable from '../../../components/ParcellesDataTable';
import AdminSidebar from '../../../components/AdminSidebar';
import { useToast } from '../../../lib/useToast';

export default function AdminParcellesPage() {
  const { data, loading, refetch } = useQuery(GET_ALL_PARCELLES);
  const parcelles = data?.allParcelles || [];
  const [deleteParcelle] = useMutation(DELETE_PARCELLE);
  const { showSuccess, showError } = useToast();

  const handleDeleteParcelle = async (parcelle) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) return;
    try {
      const { data } = await deleteParcelle({ variables: { id: parcelle.id } });
      if (data.deleteParcelle.success) {
        showSuccess('Parcelle supprimée avec succès');
        refetch();
      } else {
        showError(data.deleteParcelle.message);
      }
    } catch (e) {
      showError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestion des parcelles</h1>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <ParcellesDataTable parcelles={parcelles} onDelete={handleDeleteParcelle} />
          )}
        </div>
      </main>
    </div>
  );
} 