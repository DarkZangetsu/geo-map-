'use client';

import { useQuery } from '@apollo/client';
import { GET_ALL_PEPINIERES, GET_ALL_USERS } from '../../../lib/graphql-queries';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import MemberFilter from '../../../components/MemberFilter';
import { DataTable } from '../../../components/ui/table-data-table';
import React, { useState, useMemo } from 'react';
import { getLogoUrl } from '../../../lib/utils';

export default function AdminPepinieresPage() {
  const { data, loading, error } = useQuery(GET_ALL_PEPINIERES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);
  const pepinieres = Array.isArray(data?.allPepinieres) ? data.allPepinieres : [];
  const users = Array.isArray(usersData?.allUsers) ? usersData.allUsers : [];
  const [selectedUser, setSelectedUser] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filteredPepinieres = useMemo(() => {
    if (!selectedUser) return pepinieres;
    return pepinieres.filter(p => p.user && p.user.id === selectedUser);
  }, [pepinieres, selectedUser]);

  const columns = useMemo(() => [
    {
      accessorKey: 'nom',
      header: 'Nom',
      cell: info => (
        <div>
          <div className="text-sm font-medium text-gray-900">{info.getValue()}</div>
          <div className="text-sm text-gray-500">{info.row.original.adresse}</div>
        </div>
      ),
    },
    {
      accessorKey: 'nomGestionnaire',
      header: 'Gestionnaire',
      cell: info => (
        <div>
          <div className="text-sm text-gray-900">{info.getValue() || '-'}</div>
          <div className="text-sm text-gray-500">{info.row.original.posteGestionnaire || '-'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'capacite',
      header: 'Capacité',
      cell: info => info.getValue() ? `${info.getValue()}` : '-',
    },
    {
      id: 'membre',
      header: 'Membre',
      cell: info => {
        const user = info.row.original.user;
        return user ? (
          <div className="flex items-center">
            {user.logo && (
              <img src={getLogoUrl(user.logo)} alt="Logo" className="w-6 h-6 rounded-full mr-2" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{user.nomInstitution || user.username}</div>
              <div className="text-sm text-gray-500">{user.nomProjet || user.abreviation}</div>
            </div>
          </div>
        ) : '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date création',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString('fr-FR') : '-',
    },
    // Ajoute ici d'autres colonnes ou actions si besoin
  ], []);

  if (loading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <span className="ml-4 text-gray-600">Chargement des pépinières...</span>
      </div>
    );
  }

  if (error || usersError) {
    return (
      <div className="text-center text-red-600 py-8">Erreur lors du chargement des pépinières ou des membres.</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Gestion des Pépinières</h1>
          <p className="text-gray-600 text-sm mt-1">Consultez et gérez toutes les pépinières de tous les membres.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus size={16} /> Ajouter une pépinière
        </Button>
      </div>
      <div className="mb-4 max-w-xs">
        <MemberFilter
          users={users}
          selectedMembers={selectedUser ? [selectedUser] : []}
          onFilterChange={arr => setSelectedUser(arr[0] || '')}
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredPepinieres}
        filterKey="nom"
        filterPlaceholder="Rechercher par nom..."
      />
      {/* Modal d'ajout à venir ici si besoin */}
    </div>
  );
} 