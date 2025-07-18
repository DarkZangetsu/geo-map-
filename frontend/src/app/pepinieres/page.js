'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../components/Providers';
import { useRouter } from 'next/navigation';
import { GET_MY_PEPINIERES, DELETE_PEPINIERE } from '../../lib/graphql-queries';
import { useAuthGuard } from '../../lib/useAuthGuard';
import CSVImportExportPepiniere from '../../components/CSVImportExportPepiniere';
import { Map, Search, Plus, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from '../../lib/useToast';
import PepiniereModal from '../../components/PepiniereModal';
import PepinieresMap from '../../components/PepinieresMap';
import { DataTable } from '../../components/ui/table-data-table';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function PepinieresPage() {
  const { isLoading: authLoading, isAuthorized } = useAuthGuard(true);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
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

  // Colonnes DataTable shadcn/ui
  const columnsDT = useMemo(() => [
    visibleColumns.includes('nom') && {
      accessorKey: 'nom',
      header: 'Pépinière',
      cell: info => info.getValue(),
    },
    visibleColumns.includes('adresse') && {
      accessorKey: 'adresse',
      header: 'Adresse',
      cell: info => info.getValue(),
    },
    visibleColumns.includes('nomGestionnaire') && {
      accessorKey: 'nomGestionnaire',
      header: 'Gestionnaire',
      cell: info => {
        const p = info.row.original;
        return (
          <div>
            <div className="text-sm font-medium">{p.nomGestionnaire || '-'}</div>
            <div className="text-xs text-gray-500">{p.posteGestionnaire || '-'}</div>
          </div>
        );
      },
    },
    visibleColumns.includes('especesProduites') && {
      accessorKey: 'especesProduites',
      header: 'Espèces produites',
      cell: info => (
        <div className="max-w-xs truncate" title={info.getValue() || '-'}>
          {info.getValue() || '-'}
        </div>
      ),
    },
    visibleColumns.includes('capacite') && {
      accessorKey: 'capacite',
      header: 'Capacité',
      cell: info => info.getValue() || '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditPepiniere(row.original)}
            title="Modifier la pépinière"
          >
            <Edit size={15} />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeletePepiniere(row.original)}
            title="Supprimer la pépinière"
          >
            <Trash size={15} />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ].filter(Boolean), [visibleColumns]);

  const rowsPerPageOptions = [10, 25, 50];
  const dataTableActions = (
    <div className="flex items-center gap-2">
      <Select
        value={String(rowsPerPage)}
        onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Lignes par page" />
        </SelectTrigger>
        <SelectContent>
          {rowsPerPageOptions.map(opt => (
            <SelectItem key={opt} value={String(opt)}>{opt} par page</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header et contrôles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          {/* Titre et statistiques */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold midnight-blue-text drop-shadow-sm">
              Mes pépinières
            </h1>
            <p className="text-gray-700 mt-1 font-medium text-sm lg:text-base">
              {pepinieres.length} pépinière{pepinieres.length !== 1 ? 's' : ''} au total
        </p>
      </div>

          {/* Contrôles principaux */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Bouton principal d'ajout */}
            <Button
              onClick={handleAddPepiniere}
              className="px-4 py-2 midnight-blue-btn rounded-md shadow font-bold transition flex items-center justify-center gap-2 text-sm"
              title="Ajouter une nouvelle pépinière"
            >
              <Plus size={16} /> Ajouter une pépinière
            </Button>

            {/* Menu déroulant pour les actions secondaires */}
            <div className="relative actions-dropdown">
              <Button
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition flex items-center justify-center gap-2 border border-gray-300 text-sm"
                title="Autres actions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                Actions
              </Button>
              
              {/* Dropdown des actions */}
              {showActionsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <Button
                      onClick={() => { setShowCSVModal(true); setShowActionsDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Import/Export CSV
                    </Button>
                    <hr className="my-1" />
                    <Button
                      onClick={() => { router.push('/'); setShowActionsDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      Tableau des sites de référence
                    </Button>
                    <Button
                      onClick={() => { router.push('/sieges'); setShowActionsDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Gérer mes locaux
                    </Button>
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
                  className="px-3 py-2 border midnight-blue-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white midnight-blue-text font-semibold shadow-sm text-sm"
                >
                  <option value="street">Carte routière</option>
                  <option value="satellite">Satellite</option>
                  <option value="hybrid">Hybride</option>
                </select>
                {!mapFullscreen && (
                  <Button
                    onClick={() => setMapFullscreen(true)}
                    className="px-3 py-2 midnight-blue-btn rounded-md font-semibold shadow-sm transition text-sm"
                    title="Afficher la carte en plein écran"
                  >
                    Plein écran
                  </Button>
                )}
                {mapFullscreen && (
        <Button
                    onClick={() => setMapFullscreen(false)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold shadow-sm transition text-sm"
                    title="Quitter le plein écran"
        >
                    Quitter
        </Button>
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
            <Button
              onClick={() => setShowMap(false)}
              variant="outline"
              className="px-3 py-2 rounded-md border midnight-blue-border bg-white midnight-blue-text hover:bg-blue-50 flex items-center gap-2 shadow-sm transition font-semibold text-sm"
            >
              <Map size={16} />
              <span className="hidden sm:inline">Voir le tableau</span>
              <span className="sm:hidden">Tableau</span>
            </Button>
          </div>
          <div className={mapFullscreen ? "fixed inset-0 z-50 bg-white bg-opacity-95 flex items-center justify-center" : "bg-white rounded-lg shadow-lg overflow-hidden"} style={mapFullscreen ? {height: '100vh', width: '100vw'} : {}}>
            <div className={mapFullscreen ? "w-full h-full flex flex-col bg-white rounded-none shadow-none relative" : "bg-white rounded-lg shadow-lg overflow-hidden"} style={mapFullscreen ? {maxWidth: '100vw', maxHeight: '100vh'} : {}}>
              {/* Quitter plein écran visible en overlay en haut à droite en mode plein écran */}
              {mapFullscreen && (
                <Button
                  onClick={() => setMapFullscreen(false)}
                  className="absolute top-4 right-4 z-50 px-4 py-2 bg-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-900 font-bold transition"
                  title="Quitter le plein écran"
                >
                  Quitter plein écran
                </Button>
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
                  <PepinieresMap
                    pepinieres={pepinieres}
                    onPepiniereClick={setMapPepiniere}
                    mapStyle={mapStyle}
                    style={{ height: '100%', minHeight: 400 }}
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
            <Button
              onClick={() => setShowMap(true)}
              variant="outline"
              className="midnight-blue-text midnight-blue-border border rounded-md hover:bg-blue-50 flex items-center justify-center gap-2 font-bold transition text-sm shadow-sm"
              title="Voir la carte"
            >
              <Map size={16} />
              <span className="hidden sm:inline">Voir la carte</span>
              <span className="sm:hidden">Carte</span>
            </Button>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
            {/* DataTable shadcn/ui */}
            <DataTable
              columns={columnsDT}
              data={paginatedPepinieres}
              filterKey="nom"
              filterPlaceholder="Rechercher par nom..."
              actions={dataTableActions}
            />
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-b-2xl border-t border-blue-100">
              <div className="text-sm text-blue-900 font-semibold">
                Page {page} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="flex items-center gap-1">
                  <ChevronLeft size={14} /> <span className="hidden sm:inline">Précédent</span>
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="flex items-center gap-1">
                  <span className="hidden sm:inline">Suivant</span> <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
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
                <Button
                  onClick={() => setShowCSVModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
                  title="Fermer"
                >
                  ×
                </Button>
                <CSVImportExportPepiniere onImportSuccess={() => { setShowCSVModal(false); refetchPepinieres(); }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 