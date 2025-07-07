import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl, LayerGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const contentStyle = {
  background: 'white',
  borderRadius: '8px',
  padding: '24px',
  minWidth: '350px',
  minHeight: '400px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
};

const MapDrawModal = ({ open, onClose, onSave, initialGeojson }) => {
  const [geojson, setGeojson] = useState(initialGeojson || null);
  const featureGroupRef = useRef();
  const [fullscreen, setFullscreen] = useState(false);
  const [basemap, setBasemap] = useState('standard');

  if (!open) return null;

  const handleCreated = (e) => {
    const layer = e.layer;
    const drawnGeojson = layer.toGeoJSON();
    setGeojson(drawnGeojson.geometry);
  };

  const handleEdited = (e) => {
    const layers = e.layers;
    layers.eachLayer(layer => {
      const editedGeojson = layer.toGeoJSON();
      setGeojson(editedGeojson.geometry);
    });
  };

  const handleDeleted = () => {
    setGeojson(null);
  };

  const handleSave = () => {
    if (geojson) {
      onSave(geojson);
      onClose();
    }
  };

  return (
    <div style={{ ...modalStyle, zIndex: 1000 }}>
      <div
        style={{
          ...contentStyle,
          width: fullscreen ? '100vw' : '800px',
          height: fullscreen ? '100vh' : '600px',
          maxWidth: fullscreen ? '100vw' : '90vw',
          maxHeight: fullscreen ? '100vh' : '90vh',
          padding: fullscreen ? 0 : 24,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="flex items-center justify-between mb-2" style={{padding: fullscreen ? '16px 24px 0 24px' : 0}}>
          <h2 className="text-lg font-bold">Dessiner la parcelle</h2>
          <div className="flex items-center space-x-2">
            <select
              value={basemap}
              onChange={e => setBasemap(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100"
              style={{fontSize: '0.95em'}}
            >
              <option value="standard">Standard</option>
              <option value="satellite">Satellite + labels</option>
            </select>
            <button
              onClick={() => setFullscreen(f => !f)}
              className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100"
              title={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {fullscreen ? '⤢' : '⤢'}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: fullscreen ? 'calc(100vh - 80px)' : 400, minWidth: fullscreen ? '100vw' : 400, height: fullscreen ? 'calc(100vh - 80px)' : 400 }}>
          <MapContainer
            center={[-19.0, 47.0]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            {basemap === 'standard' && (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            )}
            {basemap === 'satellite' && (
              <>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  attribution="Labels © Esri"
                />
              </>
            )}
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: { allowIntersection: false, showArea: true }
                }}
                edit={{
                  edit: true,
                  remove: true
                }}
              />
            </FeatureGroup>
          </MapContainer>
        </div>
        <div className="flex justify-end mt-4 space-x-2" style={{padding: fullscreen ? '0 24px 24px 24px' : 0}}>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!geojson}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapDrawModal; 