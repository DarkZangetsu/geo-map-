"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALL_PARCELLES, GET_ALL_USERS } from "../../lib/graphql-queries";
import { useToast } from "../../lib/useToast";
import { useAuthGuard } from "../../lib/useAuthGuard";
import { parcellesColumns } from "./columns";
import { DataTable } from "@/components/ui/table-data-table";
import MemberFilter from "@/components/MemberFilter";
import ParcelleDetailModal from "@/components/ParcelleDetailModal";
import { exportToCSV } from "../../lib/export-csv";
import { Button } from "@/components/ui/button";

export default function ParcellesGlobalesPage() {
  const { isLoading, isAuthorized } = useAuthGuard(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [filteredParcelles, setFilteredParcelles] = useState([]);
  const { showError } = useToast();
  const [detailModal, setDetailModal] = useState({ open: false, parcelle: null });

  // Récupération des données
  const { data: parcellesData, loading: parcellesLoading, error: parcellesError } = useQuery(GET_ALL_PARCELLES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);

  // Filtrage des parcelles selon les membres sélectionnés
  useEffect(() => {
    if (parcellesData?.allParcelles) {
      if (selectedMembers.length === 0) {
        setFilteredParcelles(parcellesData.allParcelles);
      } else {
        const filtered = parcellesData.allParcelles.filter(parcelle =>
          selectedMembers.includes(parcelle.user.id)
        );
        setFilteredParcelles(filtered);
      }
    }
  }, [parcellesData, selectedMembers]);

  // Gestion des erreurs
  if (parcellesError) {
    showError("Erreur lors du chargement des parcelles");
    console.error("Parcelles error:", parcellesError);
  }
  if (usersError) {
    showError("Erreur lors du chargement des utilisateurs");
    console.error("Users error:", usersError);
  }

  // Loader d'authentification
  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? "Vérification de l'authentification..." : "Redirection vers la page de connexion..."}
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

  // Handler pour ouvrir le modal de détail
  const handleViewDetails = (parcelle) => {
    setDetailModal({ open: true, parcelle });
  };

  // Handler pour fermer le modal de détail
  const handleCloseDetailModal = () => {
    setDetailModal({ open: false, parcelle: null });
  };

  // Handler pour le filtre membre
  const handleMemberFilterChange = (memberIds) => {
    setSelectedMembers(memberIds);
  };

  // Handler pour l'export CSV
  const handleExportCSV = () => {
    const data = filteredParcelles.map(parcelle => ({
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
    exportToCSV(data, "parcelles_globales.csv");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Liste des sites de référence
          </h1>
          <p className="text-gray-600">
            Consultez tous les sites de référence tous les membres de la plateforme.
          </p>
        </div>
        {/* Filtres */}
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
          </div>
        </div>
        {/* DataTable */}
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
            <DataTable
              columns={parcellesColumns(handleViewDetails)}
              data={filteredParcelles}
              filterKey="nom"
              filterPlaceholder="Rechercher par nom..."
              actions={
                <Button variant="outline" onClick={handleExportCSV} disabled={filteredParcelles.length === 0}>
                  Exporter CSV
                </Button>
              }
            />
          </div>
        </div>
      </div>
      {/* Modal de détail */}
      {detailModal.open && (
        <ParcelleDetailModal
          parcelle={detailModal.parcelle}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
} 