 'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import L from 'leaflet';
import React from 'react';

// Icône personnalisée "pin" style Google Maps, couleur bleue
const full3DIcon = new L.DivIcon({
  className: '',
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -36],
  html: `
    <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#shadow)">
        <path d="M18 2C10.268 2 4 8.268 4 16.001c0 7.732 11.09 22.13 13.97 25.89a2 2 0 0 0 3.06 0C20.91 38.13 32 23.733 32 16.001 32 8.268 25.732 2 18 2Z" fill="#2563eb"/>
        <circle cx="18" cy="16" r="6" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      </g>
      <defs>
        <filter id="shadow" x="0" y="0" width="36" height="42" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.2"/>
        </filter>
      </defs>
    </svg>
  `
});

// Import dynamique de Leaflet pour éviter les erreurs SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ParcellesMap = ({ parcelles, sieges = [], onParcelleClick, onSiegeClick, mapStyle = 'street', style, center }) => {
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef(null);
  const galleryRef = useRef(null);

  // S'assurer que geojson est un objet (pas une chaîne)
  const parseGeojson = (geojson) => {
    if (!geojson) return null;
    if (typeof geojson === 'string') {
      try {
        return JSON.parse(geojson);
      } catch (e) {
        return null;
      }
    }
    return geojson;
  };

  // Calculer le centroïde d'un polygone GeoJSON
  const getPolygonCenter = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates[0])) return null;
    // On clone le tableau pour éviter toute modification
    const coords = coordinates[0].map(coord => [...coord]);
    let x = 0, y = 0, n = coords.length;
    coords.forEach(([lng, lat]) => {
      x += lng;
      y += lat;
    });
    return [y / n, x / n]; // [lat, lng] pour Leaflet
  };

  // Coordonnées de Madagascar (centre approximatif)
  const MADAGASCAR_CENTER = [-18.7669, 46.8691];
  const MADAGASCAR_BOUNDS = [
    [-25.6070, 43.2540], // Sud-Ouest
    [-11.9450, 50.4830]  // Nord-Est
  ];

  const mapStyles = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const attribution = {
    street: '© OpenStreetMap contributors',
    satellite: 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    hybrid: '© Esri'
  };

  // Forcer le re-render de la carte quand les parcelles changent
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [parcelles]);

  // Invalidation de la taille de la carte après le rendu
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        
        // Ajuster les bounds si on a des parcelles
    if (parcelles && parcelles.length > 0) {
          const bounds = [];
      parcelles.forEach(parcelle => {
            if (parcelle.geojson && parcelle.geojson.coordinates) {
              // Convertir les coordonnées GeoJSON en format Leaflet
              const coordinates = parcelle.geojson.coordinates[0].map(coord => [coord[1], coord[0]]);
              bounds.push(...coordinates);
            }
          });
          
          if (bounds.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: [20, 20] });
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [parcelles, mapKey]);

  useLayoutEffect(() => {
    setTimeout(() => {
      if (mapRef.current && mapRef.current.invalidateSize) {
        mapRef.current.invalidateSize();
      }
    }, 200);
  }, []);

  const handleParcelleClick = (parcelle, geojson) => {
    setSelectedParcelle(parcelle);
    if (onParcelleClick) {
      onParcelleClick(parcelle);
    }
    // Zoom sur la parcelle
    if (geojson && geojson.coordinates && mapRef.current) {
      const latlngs = geojson.coordinates[0].map(coord => [coord[1], coord[0]]);
      mapRef.current.fitBounds(latlngs, { maxZoom: 17, padding: [40, 40] });
    }
  };

  const getParcelleCenter = (geojson) => {
    if (!geojson || !geojson.coordinates) return null;
    
    const coordinates = geojson.coordinates[0];
    const center = coordinates.reduce(
      (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
      [0, 0]
    );
    return [center[1] / coordinates.length, center[0] / coordinates.length];
  };

  const prepareGalleryImages = (images) => {
    if (!images || images.length === 0) return [];
    // Si toutes les images ont ordre 0 ou pas de champ ordre, ne pas trier
    const hasValidOrder = images.some(img => typeof img.ordre === 'number' && img.ordre !== 0);
    const sorted = hasValidOrder
      ? [...images].sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
      : [...images];
    return sorted.map((img, idx) => ({
      original: `http://localhost:8000/media/${img.image}`,
      thumbnail: `http://localhost:8000/media/${img.image}`,
      description: `Image ${img.ordre !== undefined ? img.ordre + 1 : idx + 1}`
      }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (typeof window === 'undefined') {
  return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }
      
  return (
    <div
      className="w-full h-full relative flex"
      style={{
        height: (typeof style !== 'undefined' && style.height) ? style.height : '100%',
        width: (typeof style !== 'undefined' && style.width) ? style.width : '100%',
        minHeight: (typeof style !== 'undefined' && style.height) ? undefined : '400px',
        minWidth: (typeof style !== 'undefined' && style.width) ? undefined : undefined,
        margin: 0,
        padding: 0,
      }}
    >
      <MapContainer
        ref={mapRef}
        key={mapKey}
        center={center || MADAGASCAR_CENTER}
        zoom={6}
        style={{
          height: '100%',
          width: '100%',
          minHeight: (typeof style !== 'undefined' && style.height) ? undefined : '400px',
          minWidth: (typeof style !== 'undefined' && style.width) ? undefined : undefined,
        }}
        className="z-0"
        maxBounds={MADAGASCAR_BOUNDS}
        maxBoundsViscosity={1.0}
        whenReady={() => {
          setTimeout(() => {
            if (mapRef.current && mapRef.current.invalidateSize) {
              mapRef.current.invalidateSize();
            }
          }, 200);
        }}
      >
        <TileLayer
          url={mapStyles[mapStyle]}
          attribution={attribution[mapStyle]}
        />
        {/* Satellite + labels (comme dans MapDrawModal) */}
        {mapStyle === 'satellite' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="Labels © Esri"
          />
        )}
        {/* Hybride = satellite + OSM routes/villes */}
        {mapStyle === 'hybrid' && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
            opacity={0.7}
          />
        )}
        
        {Array.isArray(parcelles) && parcelles.length > 0 && parcelles.map((parcelle) => {
          // S'assurer que geojson est bien un objet
          const geojson = parseGeojson(parcelle.geojson);
          let center = null;
          if (geojson && geojson.type === 'Polygon' && geojson.coordinates) {
            center = getPolygonCenter(geojson.coordinates);
          }
          return (
            <div key={parcelle.id}>
              {/* Polygone de la parcelle */}
              {geojson && geojson.coordinates && (
                <Polygon
                  positions={geojson.coordinates[0].map(coord => [coord[1], coord[0]])}
                  pathOptions={{
                    color: parcelle.certificationBio ? '#22c55e' : '#3b82f6',
                    weight: 2,
                    fillOpacity: 0.2
                  }}
                  eventHandlers={{
                    click: () => handleParcelleClick(parcelle, geojson)
                  }}
                />
              )}
              {/* Marqueur au centre de la parcelle */}
              {center && (
                <Marker position={center} icon={full3DIcon} eventHandlers={{
                  click: () => handleParcelleClick(parcelle, geojson)
                }}>
                  {/* Plus de Popup, tout est dans le panneau latéral */}
                </Marker>
              )}
            </div>
          );
        })}
        {/* Affichage des sièges (marqueurs verts) */}
        {sieges.map((siege) => (
          <Marker
            key={siege.id}
            position={[parseFloat(siege.latitude), parseFloat(siege.longitude)]}
            icon={greenIcon}
            eventHandlers={{
              click: () => onSiegeClick && onSiegeClick(siege)
            }}
          >
            <Popup>
              <div>
                <strong>{siege.nom}</strong><br />
                {siege.adresse}<br />
                Lat: {siege.latitude}, Lng: {siege.longitude}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Panneau latéral pour les détails de la parcelle sélectionnée */}
      {selectedParcelle && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-gray-50 shadow-2xl z-50 overflow-y-auto transition-all duration-300 border border-gray-200 flex flex-col rounded-2xl m-4" style={{maxWidth: 440}}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full shadow">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 012-2h14a2 2 0 012 2v9.382a2 2 0 01-1.553 1.894L15 20m-6 0v-2a2 2 0 012-2h2a2 2 0 012 2v2' /></svg>
              </span>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight ml-2">Détails de la parcelle</h3>
            </div>
            <button
              onClick={() => setSelectedParcelle(null)}
              className="text-gray-400 hover:text-indigo-600 text-3xl font-bold transition-colors duration-150 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              title="Fermer"
            >
              ×
            </button>
          </div>
          <div className="px-2 py-2 flex-1 text-gray-900">
            <div className="space-y-2">
              <div className="bg-white rounded-xl shadow p-2 flex items-center gap-4">
                {selectedParcelle.user?.logo && (
                  <img
                    src={`http://localhost:8000/media/${selectedParcelle.user.logo}`}
                    alt="Logo"
                    className="w-14 h-14 rounded-full border border-gray-200 shadow"
                  />
                )}
                <div>
                  <h3 className="font-bold text-xl text-gray-900 leading-tight">{selectedParcelle.nom}</h3>
                  <p className="text-base text-gray-700 font-normal mt-1">
                    {selectedParcelle.user?.firstName} {selectedParcelle.user?.lastName}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-2">
                <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z' /></svg>
                  Culture
                </div>
                <div className="text-base font-medium text-gray-900">{selectedParcelle.culture}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-2">
                <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                  Propriétaire
                </div>
                <div className="text-base font-medium text-gray-900">{selectedParcelle.proprietaire}</div>
              </div>
              {selectedParcelle.superficie && (
                <div className="bg-white rounded-xl shadow p-2">
                  <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 10h16M4 14h16M4 18h16' /></svg>
                    Superficie
                  </div>
                  <div className="text-base font-medium text-gray-900">{selectedParcelle.superficie} ha</div>
                </div>
              )}
              {selectedParcelle.variete && (
                <div className="bg-white rounded-xl shadow p-2">
                  <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z' /></svg>
                    Variété
                  </div>
                  <div className="text-base font-medium text-gray-900">{selectedParcelle.variete}</div>
                </div>
              )}
              {selectedParcelle.dateSemis && (
                <div className="bg-white rounded-xl shadow p-2">
                  <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                    Date de semis
                  </div>
                  <div className="text-base font-medium text-gray-900">{formatDate(selectedParcelle.dateSemis)}</div>
                </div>
              )}
              {selectedParcelle.dateRecoltePrevue && (
                <div className="bg-white rounded-xl shadow p-2">
                  <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                    Récolte prévue
                  </div>
                  <div className="text-base font-medium text-gray-900">{formatDate(selectedParcelle.dateRecoltePrevue)}</div>
                </div>
              )}
              <div className="bg-white rounded-xl shadow p-2 flex gap-2">
                {selectedParcelle.certificationBio && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold border border-green-200">Bio</span>
                )}
                {selectedParcelle.certificationHve && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold border border-blue-200">HVE</span>
                )}
              </div>
              {selectedParcelle.notes && (
                <div className="bg-white rounded-xl shadow p-2">
                  <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0A6 6 0 019 12z' /></svg>
                    Notes
                  </div>
                  <div className="text-base text-gray-800">{selectedParcelle.notes}</div>
                </div>
              )}
            </div>
            {/* Bouton voir images juste après les sections */}
            {Array.isArray(selectedParcelle.images) && selectedParcelle.images.length > 0 && (
              <button
                onClick={() => {
                  setShowGallery(true);
                  setTimeout(() => {
                    if (galleryRef.current) {
                      galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-base rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg mt-4"
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.342L8 10m7 0V7a5 5 0 00-10 0v3m10 0H8' /></svg>
                Voir les images ({selectedParcelle.images.length})
              </button>
            )}
          </div>
          {/* Galerie d'images dans le panneau latéral, style amélioré */}
          {showGallery && selectedParcelle && (
            <div ref={galleryRef} className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
              <div className="mb-2 text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-indigo-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.342L8 10m7 0V7a5 5 0 00-10 0v3m10 0H8' /></svg>
                Galerie d'images
            </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <ImageGallery
                  items={prepareGalleryImages(selectedParcelle.images)}
                  showPlayButton={false}
                  showFullscreenButton={true}
                  showNav={true}
                  showThumbnails={true}
                  slideInterval={3000}
                  slideOnThumbnailOver={true}
                  additionalClass="custom-gallery"
                />
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="mt-2 w-full px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 font-semibold"
              >
                Fermer la galerie
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParcellesMap;