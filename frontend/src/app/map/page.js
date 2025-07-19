"use client";
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_ALL_PARCELLES, GET_ALL_SIEGES, GET_ALL_PEPINIERES } from '../../lib/graphql-queries';
import ParcellesMap from '../../components/ParcellesMap';
import SiegesMap from '../../components/SiegesMap';
import PepinieresMap from '../../components/PepinieresMap';
import { useState } from 'react';
import { useAuth } from '../../components/Providers';
import { useAuthGuard } from '../../lib/useAuthGuard';
import MapGlobal from '../../components/MapGlobal';

export default function MapPage() {
  const { isLoading, isAuthorized } = useAuthGuard(true);
  const router = useRouter();
  // const { user } = useAuth();
  // const isAdmin = user && (user.role === 'ADMIN' || user.role === 'admin');

  // Toujours utiliser les queries globales pour la carte globale
  const { data: parcellesData, loading: parcellesLoading, error: parcellesError } = useQuery(GET_ALL_PARCELLES);
  const { data: siegesData, loading: siegesLoading, error: siegesError } = useQuery(GET_ALL_SIEGES);
  const { data: pepinieresData, loading: pepinieresLoading, error: pepinieresError } = useQuery(GET_ALL_PEPINIERES);
  const [mapStyle, setMapStyle] = useState('street');
  const [showParcelles, setShowParcelles] = useState(true);
  const [showSieges, setShowSieges] = useState(true);
  const [showPepinieres, setShowPepinieres] = useState(true);

  const allParcelles = parcellesData?.allParcelles || [];
  const allSieges = siegesData?.allSieges || [];
  const allPepinieres = pepinieresData?.allPepinieres || [];

  // Filtres d'affichage
  const parcelles = showParcelles ? allParcelles : [];
  const sieges = showSieges ? allSieges : [];
  const pepinieres = showPepinieres ? allPepinieres : [];

  // Centre Madagascar par défaut
  const MADAGASCAR_CENTER = [-18.7669, 46.8691];
  const hasParcelles = parcelles && parcelles.length > 0;

  // Afficher un loader pendant la vérification d'authentification
  if (isLoading || !isAuthorized) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Vérification de l\'authentification...' : 'Redirection vers la page de connexion...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b shadow-sm" style={{ flex: '0 0 auto' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 font-semibold text-gray-700"
          >
            ← Retour
          </button>
          <h1 className="ml-4 text-2xl font-extrabold text-blue-900">Carte globale</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-blue-900 font-semibold bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
            <input
              type="checkbox"
              checked={showParcelles}
              onChange={() => setShowParcelles(v => !v)}
              className="accent-blue-600"
            />
            Sites de référence
            <span className="ml-1 text-xs bg-blue-200 text-blue-900 rounded px-2 py-0.5 font-bold">{allParcelles.length}</span>
          </label>
          <label className="flex items-center gap-2 text-green-900 font-semibold bg-green-50 px-3 py-2 rounded-lg border border-green-100">
            <input
              type="checkbox"
              checked={showSieges}
              onChange={() => setShowSieges(v => !v)}
              className="accent-green-600"
            />
            Locaux
            <span className="ml-1 text-xs bg-green-200 text-green-900 rounded px-2 py-0.5 font-bold">{allSieges.length}</span>
          </label>
          <label className="flex items-center gap-2 text-orange-900 font-semibold bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
            <input
              type="checkbox"
              checked={showPepinieres}
              onChange={() => setShowPepinieres(v => !v)}
              className="accent-orange-600"
            />
            Pépinières
            <span className="ml-1 text-xs bg-orange-200 text-orange-900 rounded px-2 py-0.5 font-bold">{allPepinieres.length}</span>
          </label>
          <select
            value={mapStyle}
            onChange={e => setMapStyle(e.target.value)}
            className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-900 font-semibold shadow-sm"
          >
            <option value="street">Carte routière</option>
            <option value="satellite">Satellite</option>
            <option value="hybrid">Hybride</option>
          </select>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
        {(parcellesLoading || siegesLoading || pepinieresLoading) ? (
          <div className="flex items-center justify-center h-full text-lg text-blue-700 font-semibold">Chargement de la carte...</div>
        ) : parcellesError ? (
          <div className="flex items-center justify-center h-full text-lg text-red-700 font-semibold">Erreur d'accès aux parcelles : {parcellesError.message}</div>
        ) : siegesError ? (
          <div className="flex items-center justify-center h-full text-lg text-red-700 font-semibold">Erreur d'accès aux sièges : {siegesError.message}</div>
        ) : pepinieresError ? (
          <div className="flex items-center justify-center h-full text-lg text-red-700 font-semibold">Erreur d'accès aux pépinières : {pepinieresError.message}</div>
        ) : (
          <div style={{ height: '100%', width: '100%' }}>
            <MapGlobal
              parcelles={parcelles}
              sieges={sieges}
              pepinieres={pepinieres}
              mapStyle={mapStyle}
              style={{ height: '100%', width: '100%' }}
              key={parcelles.length + '-' + sieges.length + '-' + pepinieres.length + '-' + mapStyle}
              center={!hasParcelles ? MADAGASCAR_CENTER : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
} 