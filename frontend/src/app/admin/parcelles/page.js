"use client";
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_PARCELLES, DELETE_PARCELLE, GET_ALL_USERS } from '../../../lib/graphql-queries';
import ParcellesDataTable from '../../../components/ParcellesDataTable';
import { useToast } from '../../../lib/useToast';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import MemberFilter from '../../../components/MemberFilter';

export default function AdminParcellesPage() {
  const { data, loading, error } = useQuery(GET_ALL_PARCELLES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);
  const parcelles = Array.isArray(data?.allParcelles) ? data.allParcelles : [];
  const users = Array.isArray(usersData?.allUsers) ? usersData.allUsers : [];
  const [deleteParcelle] = useMutation(DELETE_PARCELLE);
  const { showSuccess, showError } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const filteredParcelles = useMemo(() => {
    if (!selectedUser) return parcelles;
    return parcelles.filter(p => p.user && p.user.id === selectedUser);
  }, [parcelles, selectedUser]);

  const handleDeleteParcelle = async (parcelle) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) return;
    try {
      const { data } = await deleteParcelle({ variables: { id: parcelle.id } });
      if (data.deleteParcelle.success) {
        showSuccess('Parcelle supprimée avec succès');
        // refetch();
        window.location.reload(); // Pour garder la simplicité, sinon utiliser refetch
      } else {
        showError(data.deleteParcelle.message);
      }
    } catch (e) {
      showError('Erreur lors de la suppression');
    }
  };

  if (loading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <span className="ml-4 text-gray-600">Chargement des sites de reference...</span>
      </div>
    );
  }

  if (error || usersError) {
    return (
      <div className="text-center text-red-600 py-8">Erreur lors du chargement des sites de référence ou des membres.</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Gestion des sites de référence</h1>
          <p className="text-gray-600 text-sm mt-1">Liste de toutes les sites de référence enregistrées</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus size={16} /> Ajouter une site de référence
        </Button>
      </div>
      <div className="mb-4 max-w-xs">
        <MemberFilter
          users={users}
          selectedMembers={selectedUser ? [selectedUser] : []}
          onFilterChange={arr => setSelectedUser(arr[0] || '')}
        />
      </div>
      <ParcellesDataTable parcelles={filteredParcelles} onDelete={handleDeleteParcelle} />
      {/* Modal d'ajout à venir ici si besoin */}
    </div>
  );
} 