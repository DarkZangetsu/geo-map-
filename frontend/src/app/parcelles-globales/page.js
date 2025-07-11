'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PARCELLES, GET_ALL_USERS } from '../../lib/graphql-queries';
import { useToast } from '../../lib/useToast';
import ParcellesGlobalesTable from '../../components/ParcellesGlobalesTable';
import MemberFilter from '../../components/MemberFilter';
import CSVExport from '../../components/CSVExport';

export default function ParcellesGlobalesPage() {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [filteredParcelles, setFilteredParcelles] = useState([]);
  const { showError } = useToast();

  // Récupération des données
  const { data: parcellesData, loading: parcellesLoading, error: parcellesError } = useQuery(GET_ALL_PARCELLES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);
  
  // Debug pour voir les données reçues
  console.log('ParcellesGlobalesPage - usersData:', usersData);
  console.log('ParcellesGlobalesPage - parcellesData:', parcellesData);

  // Filtrage des parcelles selon les membres sélectionnés
  useEffect(() => {
    if (parcellesData?.allParcelles) {
      if (selectedMembers.length === 0) {
        // Si aucun membre sélectionné, afficher toutes les parcelles
        setFilteredParcelles(parcellesData.allParcelles);
      } else {
        // Filtrer par les membres sélectionnés
        const filtered = parcellesData.allParcelles.filter(parcelle => 
          selectedMembers.includes(parcelle.user.id)
        );
        setFilteredParcelles(filtered);
      }
    }
  }, [parcellesData, selectedMembers]);

  // Gestion des erreurs
  if (parcellesError) {
    showError('Erreur lors du chargement des parcelles');
    console.error('Parcelles error:', parcellesError);
  }

  if (usersError) {
    showError('Erreur lors du chargement des utilisateurs');
    console.error('Users error:', usersError);
  }

  const handleMemberFilterChange = (memberIds) => {
    setSelectedMembers(memberIds);
  };

  const handleExportCSV = (data) => {
    // Formater les données pour l'export CSV des parcelles
    return data.map(parcelle => ({
      nom: parcelle.nom,
      culture: parcelle.culture,
      proprietaire: parcelle.proprietaire,
      membre: `${parcelle.user?.firstName} ${parcelle.user?.lastName}`,
      username: parcelle.user?.username,
      superficie_ha: parcelle.superficie || '',
      variete: parcelle.variete || '',
      date_semis: parcelle.dateSemis ? new Date(parcelle.dateSemis).toLocaleDateString('fr-FR') : '',
      date_recolte: parcelle.dateRecoltePrevue ? new Date(parcelle.dateRecoltePrevue).toLocaleDateString('fr-FR') : '',
      type_sol: parcelle.typeSol || '',
      irrigation: parcelle.irrigation ? 'Oui' : 'Non',
      type_irrigation: parcelle.typeIrrigation || '',
      rendement_prevue: parcelle.rendementPrevue || '',
      cout_production: parcelle.coutProduction || '',
      certification_bio: parcelle.certificationBio ? 'Oui' : 'Non',
      certification_hve: parcelle.certificationHve ? 'Oui' : 'Non',
      notes: parcelle.notes || '',
      date_creation: new Date(parcelle.createdAt).toLocaleDateString('fr-FR')
    }));
  };

  if (parcellesLoading || usersLoading) {
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
            Parcelles Globales
          </h1>
          <p className="text-gray-600">
            Consultez toutes les parcelles de tous les membres de la plateforme
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
                data={filteredParcelles}
                filename="parcelles_globales"
                onExport={handleExportCSV}
                disabled={filteredParcelles.length === 0}
              />
            </div>
          </div>
        </div>

        {/* Tableau des parcelles */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Parcelles ({filteredParcelles.length})
              </h3>
              {selectedMembers.length > 0 && (
                <span className="text-sm text-gray-500">
                  Filtré par {selectedMembers.length} membre(s)
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            <ParcellesGlobalesTable 
              parcelles={filteredParcelles}
              loading={parcellesLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 