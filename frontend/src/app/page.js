'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_ME, GET_MY_PARCELLES, CREATE_PARCELLE, TOKEN_AUTH_WITH_USER, CREATE_USER, GET_ALL_PARCELLES, DELETE_PARCELLE } from '../lib/graphql-queries';
import { exportToGeoJSON } from '../lib/file-parser';
import { useToast } from '../lib/useToast';
import { authUtils } from '../lib/utils';
import client from '../lib/apollo-client';
import '../lib/test-auth'; // Importer les fonctions de test
import AuthForm from '../components/AuthForm';
import ParcellesMap from '../components/ParcellesMap';
import ParcelleForm from '../components/ParcelleForm';
import CarteTest from '../components/CarteTest';
import { Edit, Trash, Plus, ChevronLeft, ChevronRight, Map, Bug } from 'lucide-react';
import { useAuth } from '../components/Providers';
// import AuthDebugger from '../components/AuthDebugger';

export default function HomePage() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [showParcelleDetails, setShowParcelleDetails] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [mapStyle, setMapStyle] = useState('street');
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [showMap, setShowMap] = useState(false);
  // Colonnes du tableau (configurable)
  const columns = [
    { key: 'nom', label: 'Parcelle' },
    { key: 'culture', label: 'Culture' },
    { key: 'proprietaire', label: 'Propriétaire' },
    { key: 'superficie', label: 'Superficie' },
    { key: 'variete', label: 'Variété' },
    { key: 'typeSol', label: 'Type de sol' },
    { key: 'irrigation', label: 'Irrigation' },
    { key: 'rendementPrevue', label: 'Rendement prévu' },
    { key: 'certificationBio', label: 'Bio' },
    { key: 'certificationHve', label: 'HVE' },
    { key: 'notes', label: 'Notes' },
    { key: 'createdAt', label: 'Créée le' }
  ];
  // Colonnes visibles pour le tableau (filtrage dynamique)
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  // Queries - only run when authenticated
  const { data: meData, loading: meLoading, error: meError } = useQuery(GET_ME, {
    skip: !isAuthenticated,
    onCompleted: (data) => {
      console.log('GET_ME completed:', data);
      if (data?.me) {
        console.log('Données utilisateur mises à jour:', data.me);
      }
    },
    onError: (error) => {
      console.error('GET_ME error:', error);
      // Si l'erreur est liée à l'authentification, déconnecter
      if (error.message.includes('authentication') || error.message.includes('UNAUTHENTICATED')) {
        console.log('Token invalide, déconnexion...');
        handleLogout();
      }
    }
  });

  const { data: parcellesData, loading: parcellesLoading, refetch: refetchParcelles } = useQuery(GET_MY_PARCELLES, {
    skip: !isAuthenticated,
  });

  const { data: allParcellesData, loading: allParcellesLoading, refetch: refetchAllParcelles } = useQuery(
    GET_ALL_PARCELLES,
    { skip: !isAuthenticated || isAuthenticated && user?.role !== 'ADMIN' && user?.role !== 'admin' }
  );

  // Mutations
  const [tokenAuth] = useMutation(TOKEN_AUTH_WITH_USER);
  const [createUser] = useMutation(CREATE_USER);
  const [createParcelle] = useMutation(CREATE_PARCELLE);
  const [deleteParcelle] = useMutation(DELETE_PARCELLE);

  const handleLogin = async (credentials) => {
    try {
      const { data } = await tokenAuth({ variables: credentials });
      if (data.tokenAuthWithUser && data.tokenAuthWithUser.success) {
        const { token, user: userData } = data.tokenAuthWithUser;
        if (token && authUtils.validateToken(token)) {
          login(userData, token); // maj contexte
          if (userData.role === 'ADMIN' || userData.role === 'admin' || userData.isStaff) {
            router.push('/admin');
          } else {
            showSuccess('Connexion réussie !');
          }
        } else {
          throw new Error('Token reçu mais invalide');
        }
      } else {
        throw new Error(data.tokenAuthWithUser?.message || 'Erreur de connexion');
      }
    } catch (error) {
      throw new Error(error.message || 'Erreur de connexion');
    }
  };

  const handleRegister = async (userData) => {
    try {
      const { data } = await createUser({
        variables: userData
      });

      if (data.createUser.success) {
        // Auto-login after registration
        await handleLogin({
          username: userData.username,
          password: userData.password
        });
      } else {
        throw new Error(data.createUser.message);
      }
    } catch (error) {
      throw new Error(error.message || 'Erreur d\'inscription');
    }
  };

  const handleLogout = () => {
    logout();
    showSuccess('Déconnexion réussie');
  };

  const handleCreateParcelle = async (parcelleData) => {
    try {
      const { data } = await createParcelle({
        variables: parcelleData
      });

      if (data.createParcelle.success) {
        setShowForm(false);
        refetchParcelles();
        showSuccess('Parcelle créée avec succès !');
        return data.createParcelle.parcelle;
      } else {
        throw new Error(data.createParcelle.message);
      }
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la création de la parcelle');
    }
  };

  const handleParcelleClick = (parcelle) => {
    setSelectedParcelle(parcelle);
    setShowParcelleDetails(true);
  };

  const handleExportMyParcelles = () => {
    if (parcellesData?.myParcelles) {
      const allFeatures = parcellesData.myParcelles.flatMap(parcelle => {
        if (parcelle.geojson && parcelle.geojson.features) {
          return parcelle.geojson.features.map(feature => ({
            ...feature,
            properties: {
              ...feature.properties,
              parcelle_id: parcelle.id,
              parcelle_nom: parcelle.nom,
              parcelle_culture: parcelle.culture,
              parcelle_proprietaire: parcelle.proprietaire,
              parcelle_superficie: parcelle.superficie,
              parcelle_variete: parcelle.variete,
              parcelle_type_sol: parcelle.type_sol,
              parcelle_irrigation: parcelle.irrigation,
              parcelle_certification_bio: parcelle.certification_bio,
              parcelle_certification_hve: parcelle.certification_hve,
              parcelle_created_at: parcelle.createdAt
            }
          }));
        }
        return [];
      });

      const exportData = {
        type: 'FeatureCollection',
        features: allFeatures
      };

      exportToGeoJSON(exportData, `mes_parcelles_${user?.username}.geojson`);
      showSuccess('Export réussi !');
    }
  };

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  const handleAuthSuccess = (userData) => {
    if (userData.role === 'ADMIN' || userData.role === 'admin') {
      refetchAllParcelles();
    } else {
      refetchParcelles();
    }
  };

  const handleParcelleSuccess = (parcelle) => {
    setShowForm(false);
    setEditingParcelle(null);
    if (user.role === 'ADMIN' || user.role === 'admin') {
      refetchAllParcelles();
    } else {
      refetchParcelles();
    }
  };

  const handleDeleteParcelle = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      return;
    }

    try {
      const { data } = await deleteParcelle({
        variables: { id }
      });

      if (data.deleteParcelle.success) {
        showSuccess('Parcelle supprimée avec succès');
        if (user.role === 'ADMIN' || user.role === 'admin') {
          refetchAllParcelles();
        } else {
          refetchParcelles();
        }
      } else {
        showError(data.deleteParcelle.message);
      }
    } catch (error) {
      showError('Erreur lors de la suppression');
      console.error('Delete error:', error);
    }
  };

  const handleEditParcelle = (parcelle) => {
    setEditingParcelle(parcelle);
    setShowForm(true);
  };

  // Fonctions de debug supprimées pour production

  const exportToCSV = (parcelles) => {
    if (!parcelles || parcelles.length === 0) {
      showError('Aucune parcelle à exporter');
      return;
    }

    const headers = [
      'Nom', 'Culture', 'Propriétaire', 'Superficie (ha)', 'Variété',
      'Date de semis', 'Date de récolte prévue', 'Type de sol',
      'Irrigation', 'Type d\'irrigation', 'Rendement prévu (t/ha)',
      'Coût de production (€/ha)', 'Certification Bio', 'Certification HVE',
      'Notes', 'Date de création'
    ];

    const csvContent = [
      headers.join(','),
      ...parcelles.map(parcelle => [
        parcelle.nom,
        parcelle.culture,
        parcelle.proprietaire,
        parcelle.superficie || '',
        parcelle.variete || '',
        parcelle.dateSemis || '',
        parcelle.dateRecoltePrevue || '',
        parcelle.typeSol || '',
        parcelle.irrigation ? 'Oui' : 'Non',
        parcelle.typeIrrigation || '',
        parcelle.rendementPrevue || '',
        parcelle.coutProduction || '',
        parcelle.certificationBio ? 'Oui' : 'Non',
        parcelle.certificationHve ? 'Oui' : 'Non',
        `"${(parcelle.notes || '').replace(/"/g, '""')}"`,
        new Date(parcelle.createdAt).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `parcelles_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToGeoJSON = (parcelles) => {
    if (!parcelles || parcelles.length === 0) {
      showError('Aucune parcelle à exporter');
      return;
    }

    const geojson = {
      type: 'FeatureCollection',
      features: parcelles.map(parcelle => ({
        type: 'Feature',
        geometry: parcelle.geojson,
        properties: {
          id: parcelle.id,
          nom: parcelle.nom,
          culture: parcelle.culture,
          proprietaire: parcelle.proprietaire,
          superficie: parcelle.superficie,
          variete: parcelle.variete,
          dateSemis: parcelle.dateSemis,
          dateRecoltePrevue: parcelle.dateRecoltePrevue,
          typeSol: parcelle.typeSol,
          irrigation: parcelle.irrigation,
          typeIrrigation: parcelle.typeIrrigation,
          rendementPrevue: parcelle.rendementPrevue,
          coutProduction: parcelle.coutProduction,
          certificationBio: parcelle.certificationBio,
          certificationHve: parcelle.certificationHve,
          notes: parcelle.notes,
          createdAt: parcelle.createdAt
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `parcelles_${new Date().toISOString().split('T')[0]}.geojson`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrage, tri et pagination des parcelles
  const filteredParcelles = useMemo(() => {
    let data = parcellesData?.myParcelles || [];
    if (search) {
      data = data.filter(p =>
        (p.nom || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.culture || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.proprietaire || '').toLowerCase().includes(search.toLowerCase())
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
  }, [parcellesData?.myParcelles, search, sortBy, sortDir]);

  const paginatedParcelles = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredParcelles.slice(start, start + rowsPerPage);
  }, [filteredParcelles, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredParcelles.length / rowsPerPage);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <AuthForm 
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={meLoading}
      />
    );
  }

  const parcelles = (user.role === 'ADMIN' || user.role === 'admin')
    ? (allParcellesData?.allParcelles || [])
    : (parcellesData?.myParcelles || []);

  const loading = (user.role === 'ADMIN' || user.role === 'admin') ? allParcellesLoading : parcellesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      {/* Header et contrôles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow-sm">
              {(user.role === 'ADMIN' || user.role === 'admin') ? 'Gestion des parcelles' : 'Mes parcelles'}
            </h1>
            <p className="text-gray-700 mt-1 font-medium">
              {parcelles.length} parcelle{parcelles.length !== 1 ? 's' : ''} au total
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Admin button always visible */}
              {(user.role === 'ADMIN' || user.role === 'admin') && (
                <button
                  onClick={handleGoToAdmin}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Administration
                </button>
              )}
              {/* Carte controls only if showMap or mapFullscreen */}
              {(showMap || mapFullscreen) && (
                <>
                  <select
                    value={mapStyle}
                    onChange={(e) => setMapStyle(e.target.value)}
                    className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-900 font-semibold shadow-sm"
                  >
                    <option value="street">Carte routière</option>
                    <option value="satellite">Satellite</option>
                    <option value="hybrid">Hybride</option>
                  </select>
                  {!mapFullscreen && (
                    <button
                      onClick={() => setMapFullscreen(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold shadow-sm transition"
                      title="Afficher la carte en plein écran"
                    >
                      Plein écran
                    </button>
                  )}
                  {mapFullscreen && (
                    <button
                      onClick={() => setMapFullscreen(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold shadow-sm transition"
                      title="Quitter le plein écran"
                    >
                      Quitter plein écran
                    </button>
                  )}
                </>
              )}
              {/* Tableau controls only if !showMap and !mapFullscreen */}
              {(!showMap && !mapFullscreen) && (
                <>
                  <button
                    onClick={() => exportToCSV(parcelles)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow-sm transition"
                    title="Exporter en CSV"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportToGeoJSON(parcelles)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow-sm transition"
                    title="Exporter en GeoJSON"
                  >
                    Export GeoJSON
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-700 text-white rounded-md shadow hover:bg-blue-800 font-bold transition flex items-center gap-2 border border-blue-900"
                    title="Ajouter une nouvelle parcelle"
                  >
                    <Plus size={18} /> Ajouter une parcelle
                  </button>
                </>
              )}
            </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800"
              style={{ minWidth: 180 }}
            />
            {/* Burger menu pour filtres colonnes */}
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
            <button
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 flex items-center gap-2 shadow-sm transition font-semibold"
            >
              <Map size={18} />
              {showMap ? 'Voir le tableau' : 'Voir la carte'}
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }} className="border border-gray-300 px-2 py-1 rounded-lg bg-gray-50 text-gray-800">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500">par page</span>
          </div>
          <div className="p-6 flex flex-row items-center justify-end gap-2">
            {selected.length > 0 && (
              <button
                onClick={() => { selected.forEach(id => handleDeleteParcelle(id)); setSelected([]); }}
                className="px-3 py-1 rounded-lg bg-red-50 text-red-700 font-medium shadow-sm hover:bg-red-100 border border-red-200 text-sm transition flex items-center gap-1"
              >
                <Trash size={16} /> Supprimer ({selected.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Affichage conditionnel : Carte ou Tableau */}
      {(showMap || mapFullscreen) ? (
        /* Carte des parcelles (plein écran ou normal) */
        <div className={mapFullscreen ? "fixed inset-0 z-50 bg-white bg-opacity-95 flex items-center justify-center" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"} style={mapFullscreen ? {height: '100vh', width: '100vw'} : {}}>
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
              <h2 className="text-lg font-semibold text-gray-900">Carte des parcelles</h2>
              <p className="text-sm text-gray-600">
                {parcelles.length} parcelle{parcelles.length !== 1 ? 's' : ''} affichée{parcelles.length !== 1 ? 's' : ''} sur la carte
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
                  mapStyle={mapStyle}
                  onParcelleClick={handleParcelleClick}
                  style={mapFullscreen ? {height: '100%', width: '100%'} : {}}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Datatable des parcelles */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 flex flex-row items-center justify-end gap-2">
              {selected.length > 0 && (
                <button
                  onClick={() => { selected.forEach(id => handleDeleteParcelle(id)); setSelected([]); }}
                  className="px-3 py-1 rounded-lg bg-red-50 text-red-700 font-medium shadow-sm hover:bg-red-100 border border-red-200 text-sm transition flex items-center gap-1"
                >
                  <Trash size={16} /> Supprimer ({selected.length})
                </button>
              )}
            </div>
            {/* Table modernisée */}
            <div className="overflow-x-auto rounded-2xl border border-blue-100 shadow-xl bg-white">
              <table className="min-w-full divide-y divide-blue-100 text-blue-900 text-sm rounded-2xl overflow-hidden">
                <thead className="sticky top-0 z-10 bg-white shadow-sm">
                  <tr>
                    <th className="px-3 py-2">
                      <input type="checkbox" checked={selected.length === paginatedParcelles.length && paginatedParcelles.length > 0} onChange={e => setSelected(e.target.checked ? paginatedParcelles.map(p => p.id) : [])} className="accent-blue-600 rounded" />
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
                  {paginatedParcelles.map((parcelle, idx) => (
                    <tr key={parcelle.id} className={"hover:bg-indigo-50 transition-all " + (idx % 2 === 0 ? 'bg-white' : 'bg-blue-50')} style={{ borderRadius: 12 }}>
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={selected.includes(parcelle.id)} onChange={e => setSelected(e.target.checked ? [...selected, parcelle.id] : selected.filter(id => id !== parcelle.id))} className="accent-blue-600 rounded" />
                      </td>
                      {visibleColumns.map(colKey => (
                        <td key={colKey} className={colKey === 'nom' ? 'px-3 py-2 font-bold text-blue-900' : 'px-3 py-2'}>
                          {colKey === 'superficie' ? (parcelle.superficie ? `${parcelle.superficie} ha` : '-') :
                           colKey === 'irrigation' ? (parcelle.irrigation ? 'Oui' : 'Non') :
                           colKey === 'certificationBio' ? (parcelle.certificationBio ? 'Oui' : '') :
                           colKey === 'certificationHve' ? (parcelle.certificationHve ? 'Oui' : '') :
                           colKey === 'createdAt' ? (parcelle.createdAt ? new Date(parcelle.createdAt).toLocaleDateString('fr-FR') : '') :
                           parcelle[colKey]}
                        </td>
                      ))}
                      <td className="px-3 py-2 whitespace-nowrap flex gap-2">
                        <button
                          onClick={() => handleEditParcelle(parcelle)}
                          className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition shadow-sm"
                          title="Modifier la parcelle"
                        >
                          <Edit size={15} className="mr-1" />
                        </button>
                        <button
                          onClick={() => handleDeleteParcelle(parcelle.id)}
                          className="inline-flex items-center px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition shadow-sm"
                          title="Supprimer la parcelle"
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
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-b-2xl border-t border-blue-100">
              <div className="text-sm text-blue-900 font-semibold">
                Page {page} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-blue-900 font-bold shadow border border-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 transition flex items-center gap-1">
                  <ChevronLeft size={16} /> Précédent
                </button>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-blue-900 font-bold shadow border border-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 transition flex items-center gap-1">
                  Suivant <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout/modification */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 text-blue-900 rounded-3xl shadow-2xl max-w-3xl md:max-w-4xl w-full max-h-[90vh] p-4 md:p-8 flex flex-col border-2 border-blue-200">
            <div className="flex justify-between items-center pb-4 border-b border-blue-100">
              <h2 className="text-2xl font-extrabold text-blue-900">{editingParcelle ? 'Modifier la parcelle' : 'Ajouter une parcelle'}</h2>
              <button onClick={() => { setShowForm(false); setEditingParcelle(null); }} className="text-blue-400 hover:text-blue-700 text-3xl font-bold">×</button>
            </div>
            <div className="overflow-y-auto pt-4" style={{ color: 'inherit' }}>
              <ParcelleForm
                parcelle={editingParcelle}
                onSuccess={handleParcelleSuccess}
                onCancel={() => { setShowForm(false); setEditingParcelle(null); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}