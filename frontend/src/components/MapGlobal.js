import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import L from 'leaflet';
import React from 'react';
import PepiniereDetailModal from './PepiniereDetailModal';
import SiteReferenceDetailModal from './SiteReferenceDetailModal';
import LocalDetailModal from './LocalDetailModal';

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

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });

const MADAGASCAR_CENTER = [-18.7669, 46.8691];
const MADAGASCAR_BOUNDS = [
  [-25.6070, 43.2540],
  [-11.9450, 50.4830]
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

function parseGeojson(geojson) {
  if (!geojson) return null;
  if (typeof geojson === 'string') {
    try { return JSON.parse(geojson); } catch { return null; }
  }
  return geojson;
}

export default function MapGlobal({ parcelles = [], sieges = [], pepinieres = [], mapStyle = 'street', style, center }) {
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [selectedSiege, setSelectedSiege] = useState(null);
  const [selectedPepiniere, setSelectedPepiniere] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showSiegeGallery, setShowSiegeGallery] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => { setMapKey(prev => prev + 1); }, [parcelles, sieges, pepinieres]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [mapKey]);

  useLayoutEffect(() => {
    setTimeout(() => {
      if (mapRef.current && mapRef.current.invalidateSize) mapRef.current.invalidateSize();
    }, 200);
  }, []);

  const handleMapClick = () => {
    setSelectedParcelle(null);
    setSelectedSiege(null);
    setSelectedPepiniere(null);
  };

  if (typeof window === 'undefined') {
    return <div className="w-full h-full flex items-center justify-center bg-gray-100"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div><p className="mt-2 text-gray-600">Chargement de la carte...</p></div></div>;
  }

  return (
    <div className="w-full h-full relative flex" style={{ height: style?.height || '100%', width: style?.width || '100%', minHeight: style?.height ? undefined : '400px', minWidth: style?.width ? undefined : undefined, margin: 0, padding: 0 }}>
      <MapContainer
        ref={mapRef}
        key={mapKey}
        center={center || MADAGASCAR_CENTER}
        zoom={6}
        style={{ height: '100%', width: '100%', minHeight: style?.height ? undefined : '400px', minWidth: style?.width ? undefined : undefined }}
        className="z-0"
        maxBounds={MADAGASCAR_BOUNDS}
        maxBoundsViscosity={1.0}
        whenReady={() => { setTimeout(() => { if (mapRef.current && mapRef.current.invalidateSize) { mapRef.current.invalidateSize(); } }, 200); }}
        onClick={handleMapClick}
      >
        <TileLayer url={mapStyles[mapStyle]} attribution={attribution[mapStyle]} />
        {mapStyle === 'satellite' && (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" attribution="Labels © Esri" />
        )}
        {mapStyle === 'hybrid' && (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" opacity={0.7} />
        )}
        {/* Parcelles */}
        {Array.isArray(parcelles) && parcelles.map((parcelle) => {
          const geojson = parseGeojson(parcelle.geojson);
          let center = null;
          if (geojson && geojson.type === 'Polygon' && geojson.coordinates) {
            center = geojson.coordinates[0].reduce((acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]], [0, 0]);
            center = [center[1] / geojson.coordinates[0].length, center[0] / geojson.coordinates[0].length];
          }
          return (
            <React.Fragment key={parcelle.id}>
              {geojson && geojson.coordinates && (
                <Polygon
                  positions={geojson.coordinates[0].map(coord => [coord[1], coord[0]])}
                  pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0.2 }}
                  eventHandlers={{
                    click: () => {
                      setSelectedParcelle(parcelle);
                      if (mapRef.current && geojson.coordinates) {
                        const latlngs = geojson.coordinates[0].map(coord => [coord[1], coord[0]]);
                        mapRef.current.fitBounds(latlngs, { maxZoom: 17, padding: [40, 40] });
                      }
                    }
                  }}
                />
              )}
              {center && (
                <Marker position={center} icon={full3DIcon} eventHandlers={{
                  click: () => {
                    setSelectedParcelle(parcelle);
                    if (mapRef.current && center) {
                      mapRef.current.setView(center, 17, { animate: true });
                    }
                  }
                }} />
              )}
            </React.Fragment>
          );
        })}
        {/* Sièges */}
        {Array.isArray(sieges) && sieges.map((siege) => (
          <Marker
            key={siege.id}
            position={[parseFloat(siege.latitude), parseFloat(siege.longitude)]}
            icon={greenIcon}
            eventHandlers={{
              click: () => {
                setSelectedSiege(siege);
                if (mapRef.current) {
                  mapRef.current.setView([parseFloat(siege.latitude), parseFloat(siege.longitude)], 17, { animate: true });
                }
              }
            }}
          />
        ))}
        {/* Pépinières */}
        {Array.isArray(pepinieres) && pepinieres.map((pepiniere) => (
          <Marker
            key={pepiniere.id}
            position={[parseFloat(pepiniere.latitude), parseFloat(pepiniere.longitude)]}
            icon={orangeIcon}
            eventHandlers={{
              click: () => {
                setSelectedPepiniere(pepiniere);
                if (mapRef.current) {
                  mapRef.current.setView([parseFloat(pepiniere.latitude), parseFloat(pepiniere.longitude)], 17, { animate: true });
                }
              }
            }}
          />
        ))}
      </MapContainer>
      {/* Panneau latéral pour chaque type d'entité */}
      {selectedPepiniere && (
        <PepiniereDetailModal
          pepiniere={selectedPepiniere}
          onClose={() => setSelectedPepiniere(null)}
        />
      )}
      {selectedParcelle && (
        <SiteReferenceDetailModal
          parcelle={selectedParcelle}
          onClose={() => setSelectedParcelle(null)}
        />
      )}
      {selectedSiege && (
        <LocalDetailModal
          siege={selectedSiege}
          onClose={() => setSelectedSiege(null)}
        />
      )}
    </div>
  );
} 