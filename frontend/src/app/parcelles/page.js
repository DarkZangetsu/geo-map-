"use client";
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_MY_PARCELLES, CREATE_PARCELLE, DELETE_PARCELLE, GET_MY_SIEGES } from '../../lib/graphql-queries';
import { toast } from 'sonner';
import ParcellesMap from '../../components/ParcellesMap';
import ParcelleModal from '../../components/ParcelleModal';
import CSVImportExport from '../../components/CSVImportExport';
import { DataTable } from '../../components/ui/table-data-table';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Edit, Trash, Plus, ChevronLeft, ChevronRight, Map, Eye } from 'lucide-react';
import { useAuth } from '../../components/Providers';
import ConfirmationDialog from '../../components/ConfirmationDialog';

// Mapping des pratiques pour affichage lisible
const PRATIQUE_LABELS = {
  structure_brise_vent: "Structure Brise-vent",
  structure_pare_feu: "Structure Pare feu",
  structures_antierosives: "Structures antiérosives",
  structure_cultures_couloir: "Structure Cultures en Couloir/allée",
  pratiques_taillage_coupe: "Pratiques de taillage, coupe et application engrais verts",
  pratiques_couverture_sol: "Pratiques couverture du sol",
  pratiques_conservation_eau: "Pratiques/structures conservation d'eau",
  systeme_multi_etage: "Système multi-étage diversifié",
  arbres_autochtones: "Arbres Autochtones",
  production_epices: "Production épices",
  production_bois_energie: "Production Bois énergie",
  production_fruit: "Production fruit",
  integration_cultures_vivrieres: "Intégration cultures vivrières",
  integration_elevage: "Intégration d'élevage",
};

export default function ParcellesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  // toast de sonner utilisé pour les notifications
  const [showForm, setShowForm] = useState(false);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [mapStyle, setMapStyle] = useState('street');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedParcelleDetails, setSelectedParcelleDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [parcelleToDelete, setParcelleToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const { data: parcellesData, loading: parcellesLoading, refetch: refetchParcelles } = useQuery(GET_MY_PARCELLES, {
    skip: !isAuthenticated,
  });

  const { data: siegesData, loading: siegesLoading, refetch: refetchSieges } = useQuery(GET_MY_SIEGES, {
    skip: !isAuthenticated
  });

  const [createParcelle] = useMutation(CREATE_PARCELLE);
  const [deleteParcelle] = useMutation(DELETE_PARCELLE);

  const columns = [
    { key: 'nom', label: 'Site de référence' },
    { key: 'proprietaire', label: 'Propriétaire' },
    { key: 'superficie', label: 'Superficie' },
    { key: 'pratique', label: 'Pratique' },
    { key: 'nomProjet', label: 'Nom Projet' },
    { key: 'description', label: 'Description' },
  ];
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  const columnsDT = [
    // Suppression de la colonne de sélection (checkbox)
    ...visibleColumns.map(colKey => {
      const col = columns.find(c => c.key === colKey);
      return col && {
        accessorKey: col.key,
        header: col.label,
        cell: info => {
          const parcelle = info.row.original;
          if (col.key === 'superficie') return parcelle.superficie ? `${parcelle.superficie} ha` : '-';
          if (col.key === 'createdAt') return parcelle.createdAt ? new Date(parcelle.createdAt).toLocaleDateString('fr-FR') : '';
          if (col.key === 'pratique') return PRATIQUE_LABELS[(parcelle.pratique || '').toLowerCase()] || parcelle.pratique || '-';
          return parcelle[col.key] || '-';
        },
      };
    }).filter(Boolean),
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
            onClick={() => handleEditParcelle(row.original)}
            title="Modifier le site de référence"
          >
            <Edit size={15} />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteParcelle(row.original.id)}
            title="Supprimer le site de référence"
          >
            <Trash size={15} />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const filteredParcelles = useMemo(() => {
    let data = parcellesData?.myParcelles || [];
    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter(row =>
        visibleColumns.some(col => {
          let value = row[col];
          // Affichage lisible pour la colonne pratique
          if (col === 'pratique') {
            value = PRATIQUE_LABELS[(value || '').toLowerCase()] || value || '-';
          }
          // Affichage concaténé pour user (membre)
          if (col === 'user' && row.user) {
            value = [row.user.firstName, row.user.lastName, row.user.email, row.user.abreviation].filter(Boolean).join(' ');
          }
          // Affichage abréviation
          if (col === 'user.abreviation' && row.user) {
            value = row.user.abreviation || '-';
          }
          // Superficie formatée
          if (col === 'superficie') {
            value = row.superficie ? `${row.superficie} ha` : '-';
          }
          // Si tableau, joindre les valeurs
          if (Array.isArray(value)) value = value.join(' ');
          // Si objet, essayer de joindre les valeurs
          if (typeof value === 'object' && value !== null) value = Object.values(value).join(' ');
          if (value === undefined || value === null) return false;
          return String(value).toLowerCase().includes(lowerSearch);
        })
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
  }, [parcellesData?.myParcelles, search, sortBy, sortDir, visibleColumns]);

  const paginatedParcelles = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredParcelles.slice(start, start + rowsPerPage);
  }, [filteredParcelles, page, rowsPerPage]);

  const handleCreateParcelle = async (parcelleData) => {
    try {
      const { data } = await createParcelle({
        variables: parcelleData
      });
      if (data.createParcelle.success) {
        setShowForm(false);
        refetchParcelles();
        toast.success('Site de référence créé avec succès !');
        return data.createParcelle.parcelle;
      } else {
        toast.error(data.createParcelle.message || 'Erreur lors de la création du site de référence');
        throw new Error(data.createParcelle.message);
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la création du site de référence');
      throw new Error(error.message || 'Erreur lors de la création du site de référence');
    }
  };

  const handleDeleteParcelle = (id) => {
    setParcelleToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteParcelle = async () => {
    if (!parcelleToDelete) return;
    try {
      const { data } = await deleteParcelle({
        variables: { id: parcelleToDelete }
      });
      if (data.deleteParcelle.success) {
        toast.success('Site de référence supprimé avec succès');
        refetchParcelles();
      } else {
        toast.error(data.deleteParcelle.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Delete error:', error);
    } finally {
      setShowDeleteConfirm(false);
      setParcelleToDelete(null);
    }
  };

  const handleEditParcelle = (parcelle) => {
    setEditingParcelle(parcelle);
    setShowForm(true);
  };

  const handleShowDetails = (parcelle) => {
    setSelectedParcelleDetails(parcelle);
    setShowDetailsModal(true);
  };

  const totalPages = Math.ceil(filteredParcelles.length / rowsPerPage);
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

  if (isLoading || parcellesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const parcelles = parcellesData?.myParcelles || [];
  const loading = parcellesLoading;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div className="flex-shrink-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold midnight-blue-text drop-shadow-sm">
              Mes sites de référence
            </h1>
            <p className="text-gray-700 mt-1 font-medium text-sm lg:text-base">
              {parcelles.length} site{parcelles.length !== 1 ? 's' : ''} de référence au total
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => { setEditingParcelle(null); setShowForm(true); }}
              className="px-4 py-2 midnight-blue-btn rounded-md shadow font-bold transition flex items-center justify-center gap-2 text-sm"
              title="Ajouter un nouveau site de référence"
            >
              <Plus size={16} /> Ajouter un site
            </button>
            <button
              onClick={() => setShowCSVModal(true)}
              className="px-4 py-2 midnight-blue-btn rounded-md shadow font-bold transition flex items-center justify-center gap-2 text-sm"
              title="Import/Export CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Import/Export CSV
            </button>
            {(showMap || mapFullscreen) && (
              <div className="flex items-center gap-2">
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-900 font-semibold shadow-sm text-sm"
                >
                  <option value="street">Carte routière</option>
                  <option value="satellite">Satellite</option>
                  <option value="hybrid">Hybride</option>
                </select>
                {!mapFullscreen && (
                  <button
                    onClick={() => setMapFullscreen(true)}
                    className="px-3 py-2 midnight-blue-btn rounded-md font-semibold shadow-sm transition text-sm"
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
              className="px-3 py-2 rounded-md border midnight-blue-border bg-white midnight-blue-text hover:bg-blue-50 flex items-center gap-2 shadow-sm transition font-semibold text-sm"
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
                <h2 className="text-lg font-semibold text-gray-900">Carte des sites de référence</h2>
                <p className="text-sm text-gray-600">
                  {parcelles.length} site{parcelles.length !== 1 ? 's' : ''} de référence affiché{parcelles.length !== 1 ? 's' : ''} sur la carte
                </p>
              </div>
              <div style={mapFullscreen ? {flex: 1, minHeight: 0, minWidth: 0} : { height: '600px', width: '100%' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Chargement de la carte...</p>
                    </div>
                  </div>
                ) : (
                  <ParcellesMap
                    parcelles={parcelles}
                    sieges={[]}
                    pepinieres={[]}
                    onParcelleClick={setSelectedParcelle}
                    mapStyle={mapStyle}
                    style={{ height: '100%', minHeight: 400 }}
                    mode="parcelle"
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
              className="px-3 py-2 rounded-md border midnight-blue-border bg-white midnight-blue-text hover:bg-blue-50 flex items-center gap-2 shadow-sm transition font-semibold text-sm"
            >
              <Map size={16} />
              <span className="hidden sm:inline">Voir la carte</span>
              <span className="sm:hidden">Carte</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <DataTable
              columns={columnsDT}
              data={paginatedParcelles}
              filterKey="nom"
              filterPlaceholder="Rechercher par nom..."
              actions={dataTableActions}
            />
            {/* Pagination sous le DataTable */}
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
        </div>
      )}

      {/* Modal d'ajout/modification */}
      <ParcelleModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingParcelle(null); }}
        parcelle={editingParcelle}
        onSuccess={() => { setShowForm(false); setEditingParcelle(null); refetchParcelles(); }}
        title={editingParcelle ? 'Modifier le site de référence' : 'Ajouter un nouveau site de référence'}
        description={editingParcelle ? 'Modifiez les informations du site.' : 'Remplissez le formulaire pour ajouter un nouveau site.'}
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
            <CSVImportExport onImportSuccess={() => { setShowCSVModal(false); refetchParcelles(); }} />
          </div>
        </div>
      )}

      {/* Modal de détails du site de référence */}
      {showDetailsModal && selectedParcelleDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 relative flex flex-col">
            <button
              onClick={() => { setShowDetailsModal(false); setSelectedParcelleDetails(null); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold z-20"
              title="Fermer"
            >
              ×
            </button>

            {/* Header fixe */}
            <div className="bg-white border-b border-gray-200 p-6 rounded-t-lg sticky top-0 z-10">
              <h2 className="text-2xl font-bold midnight-blue-text mb-2">
                Détails du site de référence
              </h2>
              <div className="w-20 h-1 bg-blue-600 rounded"></div>
            </div>

            {/* Contenu principal scrollable */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 160px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations générales */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Informations générales</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom</label>
                        <p className="text-gray-900 font-medium">{selectedParcelleDetails.nom || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Propriétaire</label>
                        <p className="text-gray-900">{selectedParcelleDetails.proprietaire || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Superficie</label>
                        <p className="text-gray-900">{selectedParcelleDetails.superficie ? `${selectedParcelleDetails.superficie} ha` : '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Pratique</label>
                        <p className="text-gray-900">{PRATIQUE_LABELS[(selectedParcelleDetails.pratique || '').toLowerCase()] || selectedParcelleDetails.pratique || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom du projet</label>
                        <p className="text-gray-900">{selectedParcelleDetails.nomProjet || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-900">{selectedParcelleDetails.description || 'Aucune description disponible'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Photos</h3>
                    <div className="flex flex-wrap gap-3">
                      {Array.isArray(selectedParcelleDetails.photos) && selectedParcelleDetails.photos.length > 0 ? (
                        selectedParcelleDetails.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-32 h-32 object-cover rounded shadow border"
                          />
                        ))
                      ) : (
                        <span className="text-gray-500">Aucune photo disponible</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Informations supplémentaires</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date de création</label>
                        <p className="text-gray-900">
                          {selectedParcelleDetails.createdAt ? new Date(selectedParcelleDetails.createdAt).toLocaleDateString('fr-FR') : '-'}
                        </p>
                      </div>
                      {/* Ajoutez ici d'autres champs si besoin, sauf geojson */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer fixe */}
            <div className="bg-white border-t border-gray-200 p-6 rounded-b-lg sticky bottom-0 z-10 flex justify-end gap-3">
              <Button
                onClick={() => { setShowDetailsModal(false); setSelectedParcelleDetails(null); }}
                variant="outline"
                className="px-4 py-2"
              >
                Fermer
              </Button>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedParcelleDetails(null);
                  handleEditParcelle(selectedParcelleDetails);
                }}
                className="midnight-blue-btn px-4 py-2"
              >
                Modifier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation suppression */}
      {showDeleteConfirm && (
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => { setShowDeleteConfirm(false); setParcelleToDelete(null); }}
          onConfirm={confirmDeleteParcelle}
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer ce site de référence ?"
          confirmText="Supprimer"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
} 