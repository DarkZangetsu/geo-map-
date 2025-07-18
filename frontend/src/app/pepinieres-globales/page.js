"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALL_PEPINIERES, GET_ALL_USERS } from "../../lib/graphql-queries";
import { useToast } from "../../lib/useToast";
import { useAuthGuard } from "../../lib/useAuthGuard";
import { pepinieresColumns } from "./columns";
import { DataTable } from "@/components/ui/table-data-table";
import MemberFilter from "@/components/MemberFilter";
import { exportToCSV } from "../../lib/export-csv";
import { Button } from "@/components/ui/button";
import CSVImportExportPepiniere from "../../components/CSVImportExportPepiniere";

export default function PepinieresGlobalesPage() {
  const { isLoading, isAuthorized } = useAuthGuard(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [filteredPepinieres, setFilteredPepinieres] = useState([]);
  const { showError, showToast } = useToast();
  const [showCSVModal, setShowCSVModal] = useState(false);

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
  const { data: pepinieresData, loading: pepinieresLoading, error: pepinieresError } = useQuery(GET_ALL_PEPINIERES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);

  // Filtrage des pépinières selon les membres sélectionnés
  useEffect(() => {
    if (pepinieresData?.allPepinieres) {
      if (selectedMembers.length === 0) {
        setFilteredPepinieres(pepinieresData.allPepinieres);
      } else {
        const filtered = pepinieresData.allPepinieres.filter(pepin =>
          selectedMembers.includes(pepin.user.id)
        );
        setFilteredPepinieres(filtered);
      }
    }
  }, [pepinieresData, selectedMembers]);

  // Gestion des erreurs
  if (pepinieresError) {
    showError("Erreur lors du chargement des pépinières");
    console.error("Pepinieres error:", pepinieresError);
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

  if (pepinieresLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Handler pour le filtre membre
  const handleMemberFilterChange = (memberIds) => {
    setSelectedMembers(memberIds);
  };

  // Handler pour l'export CSV
  const handleExportCSV = () => {
    const data = filteredPepinieres.map(pepin => ({
      nom: pepin.nom,
      categorie: pepin.categorie,
      adresse: pepin.adresse,
      membre: `${pepin.user?.firstName} ${pepin.user?.lastName}`,
      username: pepin.user?.username,
      abreviation: pepin.user?.abreviation || '',
      superficie_ha: pepin.superficie || '',
      variete: pepin.variete || '',
      date_creation: pepin.createdAt ? new Date(pepin.createdAt).toLocaleDateString('fr-FR') : '',
    }));
    exportToCSV(data, "pepinieres_globales.csv");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold midnight-blue-text mb-2">
            Liste des pépinières
          </h1>
          <p className="text-gray-600">
            Consultez toutes les pépinières de tous les membres de la plateforme.
          </p>
        </div>
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium midnight-blue-text mb-3">
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
              <h3 className="text-lg font-medium midnight-blue-text">
                Pépinières ({filteredPepinieres.length})
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
              columns={pepinieresColumns(() => {})}
              data={filteredPepinieres}
              filterKey="nom"
              filterPlaceholder="Rechercher par nom..."
              actions={
                <>
                  <Button className="midnight-blue-btn px-4 py-2 rounded-md font-bold text-sm" onClick={handleExportCSV} disabled={filteredPepinieres.length === 0}>
                    Exporter CSV
                  </Button>
                </>
              }
            />
          </div>
        </div>
        {/* Modal d'import CSV */}
        {showCSVModal && (
          <CSVImportExportPepiniere
            onClose={() => setShowCSVModal(false)}
            onSuccess={() => {
              setShowCSVModal(false);
              if (typeof refetch === 'function') refetch();
              showToast('Export CSV terminé avec succès', 'success');
            }}
          />
        )}
      </div>
    </div>
  );
} 