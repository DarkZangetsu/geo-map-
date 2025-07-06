 'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import L from 'leaflet';

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

const ParcellesMap = ({ parcelles, onParcelleClick, mapStyle = 'street' }) => {
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef(null);

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
    satellite: '© Esri',
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
    // Cloner le tableau avant de trier pour éviter l'erreur sur les objets readonly
    return [...images]
      .sort((a, b) => a.ordre - b.ordre)
      .map(img => ({
        original: `http://localhost:8000${img.image}`,
        thumbnail: `http://localhost:8000${img.image}`,
        description: `Image ${img.ordre + 1}`
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
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        key={mapKey}
        center={MADAGASCAR_CENTER}
        zoom={6}
        style={{ 
          height: '100%', 
          width: '100%',
          minHeight: '400px'
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

        {/* Hybride = satellite + labels (routes, villes) */}
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
                  <Popup>
                    <div className="p-2 min-w-64">
                      <div className="flex items-center mb-3">
                        {parcelle.user?.logo && (
                          <img
                            src={`http://localhost:8000${parcelle.user.logo}`}
                            alt="Logo"
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{parcelle.nom}</h3>
                          <p className="text-sm text-gray-600">
                            {parcelle.user?.firstName} {parcelle.user?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Culture:</strong> {parcelle.culture}</p>
                        <p><strong>Propriétaire:</strong> {parcelle.proprietaire}</p>
                        {parcelle.superficie && (
                          <p><strong>Superficie:</strong> {parcelle.superficie} ha</p>
                        )}
                        {parcelle.variete && (
                          <p><strong>Variété:</strong> {parcelle.variete}</p>
                        )}
                        {parcelle.dateSemis && (
                          <p><strong>Date de semis:</strong> {formatDate(parcelle.dateSemis)}</p>
                        )}
                        {parcelle.dateRecoltePrevue && (
                          <p><strong>Récolte prévue:</strong> {formatDate(parcelle.dateRecoltePrevue)}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {parcelle.certificationBio && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Bio</span>
                          )}
                          {parcelle.certificationHve && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">HVE</span>
                          )}
                        </div>
                        {Array.isArray(parcelle.images) && parcelle.images.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedParcelle(parcelle);
                              setShowGallery(true);
                            }}
                            className="mt-2 w-full px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                          >
                            Voir les images ({parcelle.images.length})
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </div>
          );
        })}
      </MapContainer>

      {/* Modal pour la galerie d'images */}
      {showGallery && selectedParcelle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Images de {selectedParcelle.nom}
              </h3>
              <button
                onClick={() => setShowGallery(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto">
              {selectedParcelle.images && selectedParcelle.images.length > 0 ? (
                <ImageGallery
                  items={prepareGalleryImages(selectedParcelle.images)}
                  showPlayButton={false}
                  showFullscreenButton={true}
                  showNav={true}
                  showThumbnails={true}
                  slideInterval={3000}
                  slideOnThumbnailOver={true}
                />
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Aucune image disponible pour cette parcelle
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcellesMap;