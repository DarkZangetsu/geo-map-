import React from 'react';
import ParcelleForm from './ParcelleForm';

const ParcelleModal = ({ open, onClose, parcelle = null, onSuccess }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-2xl p-0 max-w-4xl w-full relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Fermer"
        >
          &times;
        </button>
        <ParcelleForm
          parcelle={parcelle}
          onSuccess={parcelle => {
            onSuccess && onSuccess(parcelle);
            onClose && onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default ParcelleModal; 