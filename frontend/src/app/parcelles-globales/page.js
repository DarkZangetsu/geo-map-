'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PARCELLES, GET_ALL_USERS } from '../../lib/graphql-queries';
import { useToast } from '../../lib/useToast';
import { useAuthGuard } from '../../lib/useAuthGuard';
import ParcellesGlobalesTable from '../../components/ParcellesGlobalesTable';

export default function ParcellesGlobalesPage() {
  const { isLoading, isAuthorized } = useAuthGuard(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [filteredParcelles, setFilteredParcelles] = useState([]);
  const { showError } = useToast();

  // Récupération des données
  const { data: parcellesData, loading: parcellesLoading, error: parcellesError } = useQuery(GET_ALL_PARCELLES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);
  


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

  // Gestion des erreurs supplémentaires
  if (siegesError) {
    showError('Erreur lors du chargement des locaux');
    console.error('Sieges error:', siegesError);
  }
  if (pepinieresError) {
    showError('Erreur lors du chargement des pépinières');
    console.error('Pepinieres error:', pepinieresError);
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

  // Afficher un loader pendant la vérification d'authentification
  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Vérification de l\'authentification...' : 'Redirection vers la page de connexion...'}
          </p>
        </div>
      </div>
    );
  }

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
            Carte globale des sites de référence, locaux et pépinières
          </h1>
          <p className="text-gray-600">
            Consultez tous les sites de référence, locaux et pépinières de tous les membres de la plateforme sur une seule carte.
          </p>
        </div>
        {/* Tableau des parcelles (inchangé) */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Sites de référence ({filteredParcelles.length})
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