'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../components/Providers';
import { useRouter } from 'next/navigation';
import { GET_MY_PEPINIERES, DELETE_PEPINIERE } from '../../lib/graphql-queries';
import { useAuthGuard } from '../../lib/useAuthGuard';
import CSVImportExportPepiniere from '../../components/CSVImportExportPepiniere';
import { Map, Search, Plus, Edit, Trash, ChevronLeft, ChevronRight, Eye } from "lucide-react";
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPepiniere, setSelectedPepiniere] = useState(null);

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

  const handleShowDetails = (pepiniere) => {
    setSelectedPepiniere(pepiniere);
    setShowDetailsModal(true);
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
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShowDetails(row.original)}
            title="Voir les détails"
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={15} />
          </Button>
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
            <Button
              onClick={() => setShowCSVModal(true)}
              className="px-4 py-2 midnight-blue-btn rounded-md shadow font-bold transition flex items-center justify-center gap-2 text-sm"
              title="Import/Export CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Import/Export CSV
            </Button>

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

          {/* Modal de détails de la pépinière */}
          {showDetailsModal && selectedPepiniere && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                <Button
                  onClick={() => { setShowDetailsModal(false); setSelectedPepiniere(null); }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
                  title="Fermer"
                >
                  ×
                </Button>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold midnight-blue-text mb-2">
                    Détails de la pépinière
                  </h2>
                  <div className="w-20 h-1 bg-blue-600 rounded"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations générales */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Informations générales</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nom de la pépinière</label>
                          <p className="text-gray-900 font-medium">{selectedPepiniere.nom || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Adresse</label>
                          <p className="text-gray-900">{selectedPepiniere.adresse || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Espèces produites</label>
                          <p className="text-gray-900">{selectedPepiniere.especesProduites || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Capacité</label>
                          <p className="text-gray-900">{selectedPepiniere.capacite || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations du gestionnaire */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Gestionnaire</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nom</label>
                          <p className="text-gray-900 font-medium">{selectedPepiniere.nomGestionnaire || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Poste</label>
                          <p className="text-gray-900">{selectedPepiniere.posteGestionnaire || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Téléphone</label>
                          <p className="text-gray-900">{selectedPepiniere.telephoneGestionnaire || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-900">{selectedPepiniere.emailGestionnaire || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Informations supplémentaires</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Description</label>
                          <p className="text-gray-900">{selectedPepiniere.description || 'Aucune description disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Date de création</label>
                          <p className="text-gray-900">
                            {selectedPepiniere.createdAt ? new Date(selectedPepiniere.createdAt).toLocaleDateString('fr-FR') : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => { setShowDetailsModal(false); setSelectedPepiniere(null); }}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPepiniere(null);
                      handleEditPepiniere(selectedPepiniere);
                    }}
                    className="midnight-blue-btn px-4 py-2"
                  >
                    Modifier
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 