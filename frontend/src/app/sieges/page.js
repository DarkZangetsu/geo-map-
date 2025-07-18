"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../components/Providers";
import { useRouter } from "next/navigation";
import { GET_MY_SIEGES, DELETE_SIEGE } from "../../lib/graphql-queries";
import { useAuthGuard } from '../../lib/useAuthGuard';
import SiegeForm from "../../components/SiegeForm";
import SiegeTable from "../../components/SiegeTable";
import SiegesMap from "../../components/SiegesMap";
import { Map, Search, Plus, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from '../../lib/useToast';
import CSVImportExportSiege from '../../components/CSVImportExportSiege';
import SiegeModal from '../../components/SiegeModal';
import { useEffect } from "react";

export default function SiegePage() {
  const { isLoading: authLoading, isAuthorized } = useAuthGuard(true);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showSiegeForm, setShowSiegeForm] = useState(false);
  const [mapSiege, setMapSiege] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState([
    "nom",
    "categorie",
    "adresse",
    "pointContact",
    "horaires",
    "description",
    "createdAt"
  ]);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const { showSuccess, showError } = useToast();
  const [editingSiege, setEditingSiege] = useState(null);
  const [deleteSiege] = useMutation(DELETE_SIEGE);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showSiegeModal, setShowSiegeModal] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const { data: siegesData, loading: siegesLoading, refetch: refetchSieges } = useQuery(GET_MY_SIEGES, {
    skip: !isAuthenticated || (user && (user.role === "ADMIN" || user.role === "admin")),
  });
  const sieges = siegesData?.mySieges || [];

  // Afficher un loader pendant la vérification d'authentification
  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Vérification de l\'authentification...' : 'Redirection vers la page de connexion...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirection si non membre
  if (!isLoading && (!isAuthenticated || !user || user.role === "ADMIN" || user.role === "admin")) {
    router.push("/");
    return null;
  }

  const handleSiegeSuccess = () => {
    setShowSiegeModal(false);
    setEditingSiege(null);
    refetchSieges();
  };

  const handleSiegeClick = (siege) => {
    // Gérer le clic sur un siège dans la carte
    console.log('Siège cliqué:', siege);
    // Ici vous pouvez ajouter une logique pour afficher les détails du siège
  };

  const mapStyle = "mapbox://styles/mapbox/streets-v11";

  // Recherche et pagination
  const filteredSieges = useMemo(() => {
    let data = sieges;
    if (search) {
      data = data.filter(s =>
        (s.nom || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.adresse || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [sieges, search]);

  const paginatedSieges = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredSieges.slice(start, start + rowsPerPage);
  }, [filteredSieges, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredSieges.length / rowsPerPage);

  const handleEditSiege = (siege) => {
    setEditingSiege(siege);
    setShowSiegeModal(true);
  };

  const handleAddSiege = () => {
    setEditingSiege(null);
    setShowSiegeModal(true);
  };

  const handleDeleteSiege = async (siege) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce local ?')) return;
    try {
      const { data } = await deleteSiege({ variables: { id: siege.id } });
      if (data.deleteSiege.success) {
        showSuccess('Local supprimé avec succès');
        refetchSieges();
      } else {
        showError(data.deleteSiege.message);
      }
    } catch (e) {
      showError('Erreur lors de la suppression');
    }
  };

  // Fermer le dropdown des actions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionsDropdown && !event.target.closest('.actions-dropdown')) {
        setShowActionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsDropdown]);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          {/* Titre et statistiques */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold midnight-blue-text drop-shadow-sm">Mes locaux</h1>
            <p className="text-gray-700 mt-1 font-medium text-sm lg:text-base">{sieges.length} local{sieges.length !== 1 ? "s" : ""} au total</p>
          </div>

          {/* Contrôles principaux */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Bouton principal d'ajout */}
            <button
              onClick={handleAddSiege}
              className="px-4 py-2 midnight-blue-btn rounded-md flex items-center justify-center gap-2 font-bold transition text-sm"
              title="Ajouter un nouveau local"
            >
              <Plus size={16} /> Ajouter un local
            </button>
            {/* Menu déroulant pour les actions secondaires */}
            <div className="relative actions-dropdown">
              <button
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition flex items-center justify-center gap-2 border border-gray-300 text-sm"
                title="Autres actions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                Actions
              </button>
              {/* Dropdown des actions */}
              {showActionsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => { setShowCSVModal(true); setShowActionsDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Import/Export CSV
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => { router.push('/pepinieres'); setShowActionsDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0M12 3v4m0 0a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4h1a4 4 0 014 4z" />
                      </svg>
                      Gérer mes pépinières
                    </button>
                    <button
                      onClick={() => { router.push('/'); setShowActionsDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      Tableau des sites de référence
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Bouton Voir la carte juste avant le tableau, comme dans page.js */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowMap(true)}
            className="px-4 py-2 bg-white midnight-blue-text midnight-blue-border border rounded-md hover:bg-blue-50 flex items-center justify-center gap-2 font-bold transition text-sm shadow-sm"
            title="Voir la carte"
          >
            <Map size={16} />
            <span className="hidden sm:inline">Voir la carte</span>
            <span className="sm:hidden">Carte</span>
          </button>
        </div>
        {/* Recherche et colonnes dynamiques */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-blue-100 bg-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-blue-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800"
              style={{ minWidth: 180 }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end w-full">
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 border-none rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 shadow-md text-xs font-semibold transition-all duration-150"
                onClick={() => setShowColumnsDropdown(v => !v)}
                style={{ boxShadow: '0 2px 8px 0 rgba(30, 64, 175, 0.08)' }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor"/></svg>
                <span className="hidden sm:inline">Colonnes</span>
              </button>
              {showColumnsDropdown && (
                <div className="absolute left-0 mt-2 w-52 bg-white border border-blue-100 rounded-2xl shadow-2xl z-50 p-3 flex flex-col gap-2 animate-fade-in" style={{ boxShadow: '0 8px 32px 0 rgba(30, 64, 175, 0.10)' }}>
                  {[
                    { key: "nom", label: "Nom" },
                    { key: "categorie", label: "Catégorie" },
                    { key: "adresse", label: "Adresse" },
                    { key: "pointContact", label: "Point de Contact" },
                    { key: "horaires", label: "Horaires" },
                    { key: "description", label: "Description" },
                    { key: "createdAt", label: "Date de création" }
                  ].map(col => (
                    <label key={col.key} className="flex items-center gap-2 text-xs font-semibold text-blue-900 cursor-pointer hover:bg-blue-50 rounded-lg px-2 py-1 transition">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => setVisibleColumns(v => v.includes(col.key) ? v.filter(k => k !== col.key) : [...v, col.key])}
                        className="accent-blue-600 rounded"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }} className="border border-gray-300 px-2 py-1 rounded-lg bg-gray-50 text-gray-800 text-sm">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-500 hidden sm:inline">par page</span>
            </div>
          </div>
        </div>
        {/* Tableau */}
        <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
          <SiegeTable
            sieges={paginatedSieges}
            onEdit={handleEditSiege}
            onDelete={handleDeleteSiege}
            visibleColumns={visibleColumns}
          />
          
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-b-2xl border-t border-blue-100">
            <div className="text-sm text-blue-900 font-semibold">
              Page {page} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-blue-900 font-bold shadow border border-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 transition flex items-center gap-1 text-sm">
                <ChevronLeft size={14} /> <span className="hidden sm:inline">Précédent</span>
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-blue-900 font-bold shadow border border-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 transition flex items-center gap-1 text-sm">
                <span className="hidden sm:inline">Suivant</span> <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
        <SiegeModal
          open={showSiegeModal}
          onClose={() => { setShowSiegeModal(false); setEditingSiege(null); }}
          initialData={editingSiege}
          mode={editingSiege ? 'edit' : 'add'}
          siegeId={editingSiege ? editingSiege.id : null}
          onSuccess={handleSiegeSuccess}
        />
        {/* Carte */}
        {showMap && (
          <div className="fixed inset-0 z-50 bg-white bg-opacity-95 flex items-center justify-center">
            <div className="w-full h-full flex flex-col bg-white rounded-none shadow-none relative">
              <button
                onClick={() => setShowMap(false)}
                className="absolute top-4 right-4 z-50 px-4 py-2 bg-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-900 font-bold transition"
                title="Fermer la carte"
              >
                Fermer la carte
              </button>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Carte des locaux</h2>
                <p className="text-sm text-gray-600">
                  {sieges.length} local{sieges.length !== 1 ? "s" : ""} affiché{sieges.length !== 1 ? "s" : ""} sur la carte
                </p>
              </div>
              <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
                <SiegesMap
                  sieges={sieges}
                  onSiegeClick={handleSiegeClick}
                  mapStyle={mapStyle}
                  style={{ height: '100%', minHeight: 400 }}
                />
              </div>
            </div>
          </div>
        )}
        {/* Modal Import/Export CSV */}
        {showCSVModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 relative">
              <button
                onClick={() => setShowCSVModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
                title="Fermer"
              >
                ×
              </button>
              <CSVImportExportSiege onImportSuccess={() => { setShowCSVModal(false); refetchSieges(); }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 