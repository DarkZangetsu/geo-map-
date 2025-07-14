'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../components/Providers';
import { useRouter } from 'next/navigation';
import { GET_MY_PEPINIERES, DELETE_PEPINIERE } from '../../lib/graphql-queries';
import { useAuthGuard } from '../../lib/useAuthGuard';
import PepiniereForm from '../../components/PepiniereForm';
import PepinieresTable from '../../components/PepinieresTable';
import CSVImportExportPepiniere from '../../components/CSVImportExportPepiniere';
import { Map, Search, Plus, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from '../../lib/useToast';
import PepiniereModal from '../../components/PepiniereModal';
import ParcellesMap from '../../components/ParcellesMap';

export default function PepinieresPage() {
  const { isLoading: authLoading, isAuthorized } = useAuthGuard(true);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showPepiniereForm, setShowPepiniereForm] = useState(false);
  const [mapPepiniere, setMapPepiniere] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState('nom');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [mapStyle, setMapStyle] = useState('street');
  
  // Colonnes du tableau (configurable)
  const columns = [
    { key: 'nom', label: 'Pépinière' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'nomGestionnaire', label: 'Gestionnaire' },
    { key: 'especesProduites', label: 'Espèces produites' },
    { key: 'capacite', label: 'Capacité' },
    { key: 'createdAt', label: 'Créée le' }
  ];
  
  // Colonnes visibles pour le tableau (filtrage dynamique)
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const { showSuccess, showError } = useToast();
  const [editingPepiniere, setEditingPepiniere] = useState(null);
  const [deletePepiniere] = useMutation(DELETE_PEPINIERE);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showPepiniereModal, setShowPepiniereModal] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const { data: pepinieresData, loading: pepinieresLoading, refetch: refetchPepinieres } = useQuery(GET_MY_PEPINIERES, {
    skip: !isAuthenticated || (user && (user.role === "ADMIN" || user.role === "admin")),
  });
  const pepinieres = pepinieresData?.myPepinieres || [];

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

  const handlePepiniereSuccess = () => {
    setShowPepiniereModal(false);
    setEditingPepiniere(null);
    refetchPepinieres();
  };

  const handleShowOnMap = (pepiniere) => {
    setMapPepiniere(pepiniere);
    setShowMap(true);
  };

  const handleEditPepiniere = (pepiniere) => {
    setEditingPepiniere(pepiniere);
    setShowPepiniereModal(true);
  };

  const handleAddPepiniere = () => {
    setEditingPepiniere(null);
    setShowPepiniereModal(true);
  };

  const handleDeletePepiniere = async (pepiniere) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pépinière ?')) return;
    try {
      const { data } = await deletePepiniere({ variables: { id: pepiniere.id } });
      if (data.deletePepiniere.success) {
        showSuccess('Pépinière supprimée avec succès');
        refetchPepinieres();
      } else {
        showError(data.deletePepiniere.message);
      }
    } catch (e) {
      showError('Erreur lors de la suppression');
    }
  };

  // Filtrage, tri et pagination des pépinières
  const filteredPepinieres = useMemo(() => {
    let data = pepinieres;
    if (search) {
      data = data.filter(p =>
        (p.nom || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.adresse || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.nomGestionnaire || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    data = [...data].sort((a, b) => {
      let vA = a[sortBy] || '';
      let vB = b[sortBy] || '';
      if (typeof vA === 'string') vA = vA.toLowerCase();
      if (typeof vB === 'string') vB = vB.toLowerCase();
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [pepinieres, search, sortBy, sortDir]);

  const paginatedPepinieres = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredPepinieres.slice(start, start + rowsPerPage);
  }, [filteredPepinieres, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredPepinieres.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      {/* Header et contrôles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          {/* Titre et statistiques */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-blue-900 drop-shadow-sm">
              Mes pépinières
            </h1>
            <p className="text-gray-700 mt-1 font-medium text-sm lg:text-base">
              {pepinieres.length} pépinière{pepinieres.length !== 1 ? 's' : ''} au total
        </p>
      </div>

          {/* Contrôles principaux */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Bouton principal d'ajout */}
            <button
              onClick={handleAddPepiniere}
              className="px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 font-bold transition flex items-center justify-center gap-2 border border-purple-900 text-sm"
              title="Ajouter une nouvelle pépinière"
            >
              <Plus size={16} /> Ajouter une pépinière
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
                      onClick={() => { router.push('/'); setShowActionsDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      Tableau des sites de référence
                    </button>
                    <button
                      onClick={() => { router.push('/siege'); setShowActionsDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Gérer mes locaux
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Contrôles de carte (seulement si carte active) */}
            {(showMap || mapFullscreen) && (
              <div className="flex items-center gap-2">
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                  className="px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-purple-900 font-semibold shadow-sm text-sm"
                >
                  <option value="street">Carte routière</option>
                  <option value="satellite">Satellite</option>
                  <option value="hybrid">Hybride</option>
                </select>
                {!mapFullscreen && (
                  <button
                    onClick={() => setMapFullscreen(true)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold shadow-sm transition text-sm"
                    title="Afficher la carte en plein écran"
                  >
                    Plein écran
                  </button>
                )}
                {mapFullscreen && (
        <button
                    onClick={() => setMapFullscreen(false)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold shadow-sm transition text-sm"
                    title="Quitter le plein écran"
        >
                    Quitter
        </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Affichage conditionnel : Carte ou Tableau */}
      {showMap || mapFullscreen ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bouton pour revenir au tableau au-dessus de la carte */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setShowMap(false)}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 flex items-center gap-2 shadow-sm transition font-semibold text-sm"
            >
              <Map size={16} />
              <span className="hidden sm:inline">Voir le tableau</span>
              <span className="sm:hidden">Tableau</span>
            </button>
          </div>
          <div className={mapFullscreen ? "fixed inset-0 z-50 bg-white bg-opacity-95 flex items-center justify-center" : "bg-white rounded-lg shadow-lg overflow-hidden"} style={mapFullscreen ? {height: '100vh', width: '100vw'} : {}}>
            <div className={mapFullscreen ? "w-full h-full flex flex-col bg-white rounded-none shadow-none relative" : "bg-white rounded-lg shadow-lg overflow-hidden"} style={mapFullscreen ? {maxWidth: '100vw', maxHeight: '100vh'} : {}}>
              {/* Quitter plein écran visible en overlay en haut à droite en mode plein écran */}
              {mapFullscreen && (
                <button
                  onClick={() => setMapFullscreen(false)}
                  className="absolute top-4 right-4 z-50 px-4 py-2 bg-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-900 font-bold transition"
                  title="Quitter le plein écran"
                >
                  Quitter plein écran
                </button>
              )}
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Carte des pépinières</h2>
                <p className="text-sm text-gray-600">
                  {pepinieres.length} pépinière{pepinieres.length !== 1 ? 's' : ''} affichée{pepinieres.length !== 1 ? 's' : ''} sur la carte
                </p>
              </div>
              <div style={mapFullscreen ? {flex: 1, minHeight: 0, minWidth: 0} : { height: '600px', width: '100%' }}>
                {pepinieresLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Chargement de la carte...</p>
                    </div>
                  </div>
                ) : (
                  <ParcellesMap
                    parcelles={[]}
                    sieges={[]}
                    pepinieres={pepinieres}
                    onPepiniereClick={setMapPepiniere}
                    mapStyle={mapStyle}
                    style={{ height: '100%', minHeight: 400 }}
                    mode="pepinieres"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bouton Voir la carte au-dessus du tableau, aligné à droite */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setShowMap(true)}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 flex items-center gap-2 shadow-sm transition font-semibold text-sm"
            >
              <Map size={16} />
              <span className="hidden sm:inline">Voir la carte</span>
              <span className="sm:hidden">Carte</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Barre de contrôle du datatable intégrée au bloc */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-blue-100 bg-white">
              {/* Recherche à gauche avec icône */}
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
              {/* Filtres à droite */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                      {columns.map(col => (
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
            <div className="overflow-x-auto rounded-2xl border border-blue-100 shadow-xl bg-white">
              <table className="min-w-full divide-y divide-blue-100 text-blue-900 text-sm rounded-2xl overflow-hidden">
                <thead className="sticky top-0 z-10 bg-white shadow-sm">
                  <tr>
                    <th className="px-3 py-2">
                      <input type="checkbox" checked={selected.length === paginatedPepinieres.length && paginatedPepinieres.length > 0} onChange={e => setSelected(e.target.checked ? paginatedPepinieres.map(p => p.id) : [])} className="accent-blue-600 rounded" />
                    </th>
                    {visibleColumns.map(colKey => {
                      const col = columns.find(c => c.key === colKey);
                      return (
                        <th key={colKey} className="px-3 py-2 text-xs font-bold text-blue-900 uppercase tracking-wider text-left whitespace-nowrap">
                          {col?.label}
                        </th>
                      );
                    })}
                    <th className="px-3 py-2 text-xs font-bold text-blue-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPepinieres.map((pepiniere, idx) => (
                    <tr key={pepiniere.id} className={"hover:bg-indigo-50 transition-all " + (idx % 2 === 0 ? 'bg-white' : 'bg-blue-50')} style={{ borderRadius: 12 }}>
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={selected.includes(pepiniere.id)} onChange={e => setSelected(e.target.checked ? [...selected, pepiniere.id] : selected.filter(id => id !== pepiniere.id))} className="accent-blue-600 rounded" />
                      </td>
                      {visibleColumns.map(colKey => (
                        <td key={colKey} className={colKey === 'nom' ? 'px-3 py-2 font-bold text-blue-900' : 'px-3 py-2'}>
                          {colKey === 'createdAt' ? (pepiniere.createdAt ? new Date(pepiniere.createdAt).toLocaleDateString('fr-FR') : '') :
                           colKey === 'nomGestionnaire' ? (
                             <div>
                               <div className="text-sm font-medium">{pepiniere.nomGestionnaire || '-'}</div>
                               <div className="text-xs text-gray-500">{pepiniere.posteGestionnaire || '-'}</div>
                             </div>
                           ) :
                           colKey === 'especesProduites' ? (
                             <div className="max-w-xs truncate" title={pepiniere.especesProduites || '-'}>
                               {pepiniere.especesProduites || '-'}
                             </div>
                           ) :
                           pepiniere[colKey]}
                        </td>
                      ))}
                      <td className="px-3 py-2 whitespace-nowrap flex gap-2">
                        <button
                          onClick={() => handleShowOnMap(pepiniere)}
                          className="inline-flex items-center px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-bold transition shadow-sm"
                          title="Voir la pépinière sur la carte"
                        >
                          <Map size={15} className="mr-1" />
                        </button>
                        <button
                          onClick={() => handleEditPepiniere(pepiniere)}
                          className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition shadow-sm"
                          title="Modifier la pépinière"
                        >
                          <Edit size={15} className="mr-1" />
                        </button>
                        <button
                          onClick={() => handleDeletePepiniere(pepiniere)}
                          className="inline-flex items-center px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition shadow-sm"
                          title="Supprimer la pépinière"
                        >
                          <Trash size={15} className="mr-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
        </div>
      )}

      {/* Modal d'ajout/modification */}
      <PepiniereModal
        open={showPepiniereModal}
        onClose={() => { setShowPepiniereModal(false); setEditingPepiniere(null); }}
        initialData={editingPepiniere}
        mode={editingPepiniere ? 'edit' : 'add'}
        pepiniereId={editingPepiniere ? editingPepiniere.id : null}
        onSuccess={handlePepiniereSuccess}
      />

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
            <CSVImportExportPepiniere onImportSuccess={() => { setShowCSVModal(false); refetchPepinieres(); }} />
          </div>
        </div>
      )}
    </div>
  );
} 