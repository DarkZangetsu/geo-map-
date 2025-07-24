"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALL_SIEGES, GET_ALL_USERS } from "../../lib/graphql-queries";
import { useToast } from "../../lib/useToast";
import { siegesColumns } from "./columns";
import { DataTable } from "@/components/ui/table-data-table";
import MemberFilter from "@/components/MemberFilter";
import CategorieFilter from "@/components/CategorieFilter";
import { exportToCSV } from "../../lib/export-csv";
import { Button } from "@/components/ui/button";

export default function SiegesGlobauxPage() {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredSieges, setFilteredSieges] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const { showError } = useToast();
  const [detailModal, setDetailModal] = useState({ open: false, siege: null });

  // Ajout d'une variable CSS pour la couleur midnight blue
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --midnight-blue: rgb(0,70,144);
      }
      .midnight-blue-bg {
        background-color: var(--midnight-blue) !important;
        color: #fff !important;
      }
      .midnight-blue-text {
        color: var(--midnight-blue) !important;
      }
      .midnight-blue-border {
        border-color: var(--midnight-blue) !important;
      }
      .midnight-blue-btn {
        background-color: var(--midnight-blue) !important;
        color: #fff !important;
        border: 1px solid var(--midnight-blue) !important;
      }
      .midnight-blue-btn:hover {
        background-color: #003366 !important;
        color: #fff !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Récupération des données
  const { data: siegesData, loading: siegesLoading, error: siegesError } = useQuery(GET_ALL_SIEGES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);

  // Filtrage des sièges selon les critères sélectionnés
  useEffect(() => {
    if (siegesData?.allSieges) {
      let filtered = siegesData.allSieges;
      
      // Filtre par membre
      if (selectedMembers.length > 0) {
        filtered = filtered.filter(siege => selectedMembers.includes(siege.user.id));
      }
      
      // Filtre par catégorie
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(siege =>
          selectedCategories.some(sel =>
            (siege.categorie || "").toLowerCase().replace(/\s+/g, "") === sel.toLowerCase().replace(/\s+/g, "")
          )
        );
      }
      
      // Recherche globale sur toutes les colonnes principales
      if (searchValue.trim() !== "") {
        const lowerSearch = searchValue.toLowerCase();
        filtered = filtered.filter(siege => {
          return [
            siege.nom,
            siege.adresse,
            siege.categorie,
            siege.user?.firstName,
            siege.user?.lastName,
            siege.user?.nomInstitution,
            siege.description,
            siege.latitude,
            siege.longitude
          ].some(val => (val || "").toString().toLowerCase().includes(lowerSearch));
        });
      }
      
      setFilteredSieges(filtered);
    }
  }, [siegesData, selectedMembers, selectedCategories, searchValue]);

  // Gestion des erreurs
  if (siegesError) {
    showError("Erreur lors du chargement des sièges");
    console.error("Sieges error:", siegesError);
  }
  if (usersError) {
    showError("Erreur lors du chargement des utilisateurs");
    console.error("Users error:", usersError);
  }

  // Loader d'authentification
  if (siegesLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Handler pour ouvrir le modal de détail
  const handleViewDetails = (siege) => {
    setDetailModal({ open: true, siege });
  };

  // Handler pour fermer le modal de détail
  const handleCloseDetailModal = () => {
    setDetailModal({ open: false, siege: null });
  };

  // Handler pour le filtre membre
  const handleMemberFilterChange = (memberIds) => {
    setSelectedMembers(memberIds);
  };

  // Handler pour le filtre catégorie
  const handleCategorieFilterChange = (categories) => {
    setSelectedCategories(categories);
  };

  // Handler pour la recherche globale
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  // Handler pour l'export CSV
  const handleExportCSV = () => {
    const data = filteredSieges.map(siege => ({
      nom: siege.nom,
      adresse: siege.adresse,
      categorie: siege.categorie || '',
      membre: `${siege.user?.firstName} ${siege.user?.lastName}`,
      username: siege.user?.username,
      institution: siege.user?.nomInstitution || '',
      latitude: siege.latitude,
      longitude: siege.longitude,
      description: siege.description || '',
      date_creation: new Date(siege.createdAt).toLocaleDateString('fr-FR')
    }));
    exportToCSV(data, "locaux_globaux.csv");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold midnight-blue-text mb-2">
            Liste des locaux
          </h1>
          <p className="text-gray-600">
            Consultez tous les locaux de tous les membres de la plateforme.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 mb-4 lg:mb-0">
              <h3 className="text-lg font-medium midnight-blue-text mb-3">Filtrer par membre</h3>
              <MemberFilter
                users={usersData?.allUsers || []}
                selectedMembers={selectedMembers}
                onFilterChange={handleMemberFilterChange}
              />
            </div>
            <div className="flex-1 mb-4 lg:mb-0">
              <h3 className="text-lg font-medium midnight-blue-text mb-3">Filtrer par catégorie</h3>
              <CategorieFilter
                selectedCategories={selectedCategories}
                onFilterChange={handleCategorieFilterChange}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium midnight-blue-text mb-3">Recherche globale</h3>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Rechercher dans toutes les colonnes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium midnight-blue-text">
                Locaux ({filteredSieges.length})
              </h3>
              {(selectedMembers.length > 0 || selectedCategories.length > 0) && (
                <span className="text-sm text-gray-500">
                  {selectedMembers.length > 0 && `Filtré par ${selectedMembers.length} membre(s)`}
                  {selectedMembers.length > 0 && selectedCategories.length > 0 && " - "}
                  {selectedCategories.length > 0 && `${selectedCategories.length} catégorie(s)`}
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            <DataTable
              columns={siegesColumns(handleViewDetails)}
              data={filteredSieges}
              actions={
                <Button 
                  className="midnight-blue-btn px-4 py-2 rounded-md font-bold text-sm" 
                  onClick={handleExportCSV} 
                  disabled={filteredSieges.length === 0}
                >
                  Exporter CSV
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}