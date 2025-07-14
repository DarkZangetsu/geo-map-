'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import L from 'leaflet';
import React from 'react';

// Icône personnalisée pour les pépinières
const pepiniereIcon = new L.DivIcon({
  className: '',
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -36],
  html: `
    <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#shadow)">
        <path d="M18 2C10.268 2 4 8.268 4 16.001c0 7.732 11.09 22.13 13.97 25.89a2 2 0 0 0 3.06 0C20.91 38.13 32 23.733 32 16.001 32 8.268 25.732 2 18 2Z" fill="#f97316"/>
        <circle cx="18" cy="16" r="6" fill="#fff" stroke="#f97316" stroke-width="2"/>
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

const PepinieresMap = ({ pepinieres = [], onPepiniereClick, mapStyle = 'street', style, center }) => {
  const [selectedPepiniere, setSelectedPepiniere] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef(null);
  const galleryRef = useRef(null);

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

  // Forcer le re-render de la carte quand les pépinières changent
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [pepinieres]);

  // Invalidation de la taille de la carte après le rendu
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        
        // Ajuster les bounds si on a des pépinières
        if (pepinieres && pepinieres.length > 0) {
          const bounds = [];
          pepinieres.forEach(pepiniere => {
            if (pepiniere.latitude && pepiniere.longitude) {
              const lat = parseFloat(pepiniere.latitude);
              const lng = parseFloat(pepiniere.longitude);
              if (!isNaN(lat) && !isNaN(lng)) {
                bounds.push([lat, lng]);
              }
            }
          });
          
          if (bounds.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: [20, 20] });
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pepinieres, mapKey]);

  useLayoutEffect(() => {
    setTimeout(() => {
      if (mapRef.current && mapRef.current.invalidateSize) {
        mapRef.current.invalidateSize();
      }
    }, 200);
  }, []);

  const handlePepiniereClick = (pepiniere) => {
    setSelectedPepiniere(pepiniere);
    if (onPepiniereClick) {
      onPepiniereClick(pepiniere);
    }
    // Zoom sur la pépinière
    if (pepiniere.latitude && pepiniere.longitude && mapRef.current) {
      const lat = parseFloat(pepiniere.latitude);
      const lng = parseFloat(pepiniere.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.setView([lat, lng], 15);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Gestion du clic sur la carte pour fermer les panneaux de détail
  const handleMapClick = (e) => {
    setSelectedPepiniere(null);
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
        onClick={handleMapClick}
      >
        <TileLayer
          url={mapStyles[mapStyle]}
          attribution={attribution[mapStyle]}
        />
        {/* Satellite + labels */}
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
        
        {/* Affichage des pépinières */}
        {Array.isArray(pepinieres) && pepinieres.length > 0 && pepinieres.map((pepiniere) => {
          // Vérification et conversion sécurisée des coordonnées
          const lat = pepiniere.latitude ? parseFloat(pepiniere.latitude) : null;
          const lng = pepiniere.longitude ? parseFloat(pepiniere.longitude) : null;
          
          // Ne pas afficher le marqueur si les coordonnées sont invalides
          if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
            return null;
          }
          
          return (
            <Marker
              key={pepiniere.id}
              position={[lat, lng]}
              icon={pepiniereIcon}
              eventHandlers={{
                click: () => handlePepiniereClick(pepiniere)
              }}
            >
            </Marker>
          );
        })}
      </MapContainer>

      {/* Panneau latéral pour les détails de la pépinière sélectionnée */}
      {selectedPepiniere && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border border-gray-200 rounded-2xl m-4 max-w-[440px]">
          {/* Header fixe */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full shadow">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
              </span>
              <h3 className="text-2xl font-bold text-orange-900 tracking-tight ml-2">Détails de la pépinière</h3>
            </div>
            <button
              onClick={() => setSelectedPepiniere(null)}
              className="text-gray-400 hover:text-orange-600 text-3xl font-bold transition-colors duration-150 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-orange-300"
              title="Fermer"
            >
              ×
            </button>
          </div>
          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="bg-gray-50 rounded-xl shadow p-3 flex items-center gap-4">
              <div>
                <h3 className="font-bold text-xl text-orange-900 leading-tight">{selectedPepiniere.nom || 'Sans nom'}</h3>
                <div className="text-xs text-gray-500 font-semibold mt-1">Type : <span className="font-bold text-orange-700">{selectedPepiniere.type || 'Non défini'}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-3">
              <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-orange-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2h5' /></svg>
                Adresse
              </div>
              <div className="text-base font-medium text-gray-900">{selectedPepiniere.adresse || 'Non définie'}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-3">
              <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-orange-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z' /></svg>
                Contact
              </div>
              <div className="text-base font-medium text-gray-900">{selectedPepiniere.nomContact || '-'}</div>
              <div className="text-xs text-gray-500">{selectedPepiniere.telephone || '-'}</div>
              <div className="text-xs text-gray-500">{selectedPepiniere.email || '-'}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-3">
              <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-orange-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                Horaires
              </div>
              <div className="text-xs text-gray-700"><span className="font-semibold">Matin :</span> {selectedPepiniere.horaireMatin || '-'}</div>
              <div className="text-xs text-gray-700"><span className="font-semibold">Après-midi :</span> {selectedPepiniere.horaireApresMidi || '-'}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-3">
              <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-orange-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 20h9' /></svg>
                Description
              </div>
              <div className="text-base text-gray-800">{selectedPepiniere.description || '-'}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-3">
              <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-orange-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3' /></svg>
                Coordonnées GPS
              </div>
              <div className="text-xs text-gray-700">Lat : {selectedPepiniere.latitude}, Lng : {selectedPepiniere.longitude}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-3">
              <div className="uppercase text-xs text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-orange-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                Date de création
              </div>
              <div className="text-xs text-gray-700">{selectedPepiniere.createdAt ? formatDate(selectedPepiniere.createdAt) : '-'}</div>
            </div>
            {/* Bouton voir images */}
            {Array.isArray(selectedPepiniere.images) && selectedPepiniere.images.length > 0 && !showGallery && (
              <button
                onClick={() => setShowGallery(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white text-base rounded-xl font-semibold hover:bg-orange-700 transition shadow-lg mt-4"
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.342L8 10m7 0V7a5 5 0 00-10 0v3m10 0H8' /></svg>
                Voir les images ({selectedPepiniere.images.length})
              </button>
            )}
            {/* Galerie d'images */}
            {showGallery && Array.isArray(selectedPepiniere.images) && selectedPepiniere.images.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                <div className="mb-2 text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-orange-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.342L8 10m7 0V7a5 5 0 00-10 0v3m10 0H8' /></svg>
                  Galerie d'images
                </div>
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <ImageGallery
                    items={selectedPepiniere.images.map((img, idx) => ({
                      original: `http://localhost:8000/media/${img.image}`,
                      thumbnail: `http://localhost:8000/media/${img.image}`,
                      description: `Image ${idx + 1}`
                    }))}
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
        </div>
      )}
    </div>
  );
};

export default PepinieresMap; 