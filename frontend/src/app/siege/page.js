"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../components/Providers";
import { useRouter } from "next/navigation";
import { GET_MY_SIEGES, DELETE_SIEGE } from "../../lib/graphql-queries";
import SiegeForm from "../../components/SiegeForm";
import SiegeTable from "../../components/SiegeTable";
import ParcellesMap from "../../components/ParcellesMap";
import { Map, Search, Plus, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from '../../lib/useToast';
import CSVImportExportSiege from '../../components/CSVImportExportSiege';

export default function SiegePage() {
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
    "adresse",
    "latitude",
    "longitude",
    "description"
  ]);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const { showSuccess, showError } = useToast();
  const [editingSiege, setEditingSiege] = useState(null);
  const [deleteSiege] = useMutation(DELETE_SIEGE);
  const [showCSVModal, setShowCSVModal] = useState(false);

  const { data: siegesData, loading: siegesLoading, refetch: refetchSieges } = useQuery(GET_MY_SIEGES, {
    skip: !isAuthenticated || (user && (user.role === "ADMIN" || user.role === "admin")),
  });
  const sieges = siegesData?.mySieges || [];

  // Redirection si non membre
  if (!isLoading && (!isAuthenticated || !user || user.role === "ADMIN" || user.role === "admin")) {
    router.push("/");
    return null;
  }

  const handleSiegeSuccess = () => {
    setShowSiegeForm(false);
    refetchSieges();
  };

  const handleShowOnMap = (siege) => {
    setMapSiege(siege);
    setShowMap(true);
  };

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
    setShowSiegeForm(true);
  };

  const handleDeleteSiege = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce siège ?')) return;
    try {
      const { data } = await deleteSiege({ variables: { id } });
      if (data.deleteSiege.success) {
        showSuccess('Siège supprimé avec succès');
        refetchSieges();
      } else {
        showError(data.deleteSiege.message);
      }
    } catch (e) {
      showError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow-sm">Mes sièges</h1>
            <p className="text-gray-700 mt-1 font-medium">{sieges.length} siège{sieges.length !== 1 ? "s" : ""} au total</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCSVModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold shadow-sm transition"
              title="Import/Export CSV sièges"
            >
              Import/Export CSV
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold transition flex items-center gap-2 border border-blue-900"
            >
              <Map size={18} /> Tableau des parcelles
            </button>
            <button
              onClick={() => setShowSiegeForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={18} /> Ajouter un siège
            </button>
            <button
              onClick={() => setShowMap(true)}
              className="px-4 py-2 bg-blue-700 text-white rounded-md shadow hover:bg-blue-800 font-bold transition flex items-center gap-2 border border-blue-900"
            >
              <Map size={18} /> Voir la carte
            </button>
          </div>
        </div>
        {/* Recherche et colonnes dynamiques */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-blue-100 bg-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-blue-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="border border-gray-300 px-3 py-2 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800"
              style={{ minWidth: 180 }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 border-none rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 shadow-md text-xs font-semibold transition-all duration-150"
                onClick={() => setShowColumnsDropdown(v => !v)}
                style={{ boxShadow: '0 2px 8px 0 rgba(30, 64, 175, 0.08)' }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor"/></svg>
                Colonnes
              </button>
              {showColumnsDropdown && (
                <div className="absolute left-0 mt-2 w-52 bg-white border border-blue-100 rounded-2xl shadow-2xl z-50 p-3 flex flex-col gap-2 animate-fade-in" style={{ boxShadow: '0 8px 32px 0 rgba(30, 64, 175, 0.10)' }}>
                  {[
                    { key: "nom", label: "Nom" },
                    { key: "adresse", label: "Adresse" },
                    { key: "latitude", label: "Latitude" },
                    { key: "longitude", label: "Longitude" },
                    { key: "description", label: "Description" }
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
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }} className="border border-gray-300 px-2 py-1 rounded-lg bg-gray-50 text-gray-800">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        {/* Tableau */}
        <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-blue-100 text-blue-900 text-sm rounded-2xl overflow-hidden">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr>
                {visibleColumns.includes("nom") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>}
                {visibleColumns.includes("adresse") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>}
                {visibleColumns.includes("latitude") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Latitude</th>}
                {visibleColumns.includes("longitude") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Longitude</th>}
                {visibleColumns.includes("description") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>}
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSieges.map((siege) => (
                <tr key={siege.id}>
                  {visibleColumns.includes("nom") && <td className="px-4 py-2 whitespace-nowrap">{siege.nom}</td>}
                  {visibleColumns.includes("adresse") && <td className="px-4 py-2 whitespace-nowrap">{siege.adresse}</td>}
                  {visibleColumns.includes("latitude") && <td className="px-4 py-2 whitespace-nowrap">{siege.latitude}</td>}
                  {visibleColumns.includes("longitude") && <td className="px-4 py-2 whitespace-nowrap">{siege.longitude}</td>}
                  {visibleColumns.includes("description") && <td className="px-4 py-2 whitespace-nowrap">{siege.description}</td>}
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => handleEditSiege(siege)}
                      className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition shadow-sm"
                      title="Modifier le siège"
                    >
                      <Edit size={15} className="mr-1" />
                    </button>
                    <button
                      onClick={() => handleDeleteSiege(siege.id)}
                      className="inline-flex items-center px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition shadow-sm"
                      title="Supprimer le siège"
                    >
                      <Trash size={15} className="mr-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              Page {page} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
        {/* Modal d'ajout/modif */}
        {showSiegeForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <SiegeForm siege={editingSiege} onSuccess={() => { setShowSiegeForm(false); setEditingSiege(null); refetchSieges(); }} onCancel={() => { setShowSiegeForm(false); setEditingSiege(null); }} />
          </div>
        )}
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
                <h2 className="text-lg font-semibold text-gray-900">Carte des sièges</h2>
                <p className="text-sm text-gray-600">
                  {sieges.length} siège{sieges.length !== 1 ? "s" : ""} affiché{sieges.length !== 1 ? "s" : ""} sur la carte
                </p>
              </div>
              <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
                <ParcellesMap
                  parcelles={[]}
                  sieges={mapSiege ? [mapSiege] : sieges}
                  style={{ height: "100vh", width: "100vw" }}
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