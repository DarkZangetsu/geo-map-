import { useState } from 'react';
import PepiniereForm from './PepiniereForm';

const PepiniereModal = ({ isOpen, onClose, onSuccess, initialData = null, mode = 'add' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {mode === 'edit' ? 'Modifier la pépinière' : 'Ajouter une pépinière'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <PepiniereForm
            onSuccess={(pepiniere) => {
              onSuccess(pepiniere);
              onClose();
            }}
            onCancel={onClose}
            initialData={initialData}
            mode={mode}
            pepiniereId={initialData?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default PepiniereModal; 