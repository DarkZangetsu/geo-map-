'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_SIEGES, GET_ALL_USERS } from '../../lib/graphql-queries';
import { useToast } from '../../lib/useToast';
import SiegesGlobauxTable from '../../components/SiegesGlobauxTable';
import MemberFilter from '../../components/MemberFilter';
import CSVExport from '../../components/CSVExport';

export default function SiegesGlobauxPage() {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [filteredSieges, setFilteredSieges] = useState([]);
  const { showError } = useToast();

  // Récupération des données
  const { data: siegesData, loading: siegesLoading, error: siegesError } = useQuery(GET_ALL_SIEGES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);

  // Filtrage des sièges selon les membres sélectionnés
  useEffect(() => {
    if (siegesData?.allSieges) {
      if (selectedMembers.length === 0) {
        // Si aucun membre sélectionné, afficher tous les sièges
        setFilteredSieges(siegesData.allSieges);
      } else {
        // Filtrer par les membres sélectionnés
        const filtered = siegesData.allSieges.filter(siege => 
          selectedMembers.includes(siege.user.id)
        );
        setFilteredSieges(filtered);
      }
    }
  }, [siegesData, selectedMembers]);

  // Gestion des erreurs
  if (siegesError) {
    showError('Erreur lors du chargement des sièges');
    console.error('Sieges error:', siegesError);
  }

  if (usersError) {
    showError('Erreur lors du chargement des utilisateurs');
    console.error('Users error:', usersError);
  }

  const handleMemberFilterChange = (memberIds) => {
    setSelectedMembers(memberIds);
  };

  const handleExportCSV = (data) => {
    // Formater les données pour l'export CSV des sièges
    return data.map(siege => ({
      nom: siege.nom,
      adresse: siege.adresse,
      membre: `${siege.user?.firstName} ${siege.user?.lastName}`,
      username: siege.user?.username,
      latitude: siege.latitude,
      longitude: siege.longitude,
      description: siege.description || '',
      date_creation: new Date(siege.createdAt).toLocaleDateString('fr-FR')
    }));
  };

  if (siegesLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tout les locaux
          </h1>
          <p className="text-gray-600">
            Consultez tous les sièges de tous les membres de la plateforme
          </p>
        </div>

        {/* Filtres et actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Filtrer par membre
              </h3>
              <MemberFilter
                users={usersData?.allUsers || []}
                selectedMembers={selectedMembers}
                onFilterChange={handleMemberFilterChange}
              />
            </div>
            <div className="lg:ml-4">
              <CSVExport
                data={filteredSieges}
                filename="sieges_globaux"
                onExport={handleExportCSV}
                disabled={filteredSieges.length === 0}
              />
            </div>
          </div>
        </div>

        {/* Tableau des sièges */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Sièges ({filteredSieges.length})
              </h3>
              {selectedMembers.length > 0 && (
                <span className="text-sm text-gray-500">
                  Filtré par {selectedMembers.length} membre(s)
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            <SiegesGlobauxTable 
              sieges={filteredSieges}
              loading={siegesLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 