import React from 'react';
import PepinieresMap from './PepinieresMap';

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
  width: '600px',
  minWidth: '350px',
  height: '500px',
  minHeight: '400px',
  maxWidth: '95vw',
  maxHeight: '95vh',
  display: 'flex',
  flexDirection: 'column',
};



export default function PepiniereMapModal({ open, onClose, pepiniere }) {
  if (!open || !pepiniere) return null;
  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Voir la pépinière sur la carte</h2>
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Fermer</button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <PepinieresMap pepinieres={[pepiniere]} style={{ height: '100%', width: '100%' }} center={[parseFloat(pepiniere.latitude) || -18.7669, parseFloat(pepiniere.longitude) || 46.8691]} />
        </div>
      </div>
    </div>
  );
}


