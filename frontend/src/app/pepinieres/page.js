'use client';

import { useState } from 'react';
import PepinieresTable from '../../components/PepinieresTable';
import CSVImportExportPepiniere from '../../components/CSVImportExportPepiniere';

export default function PepinieresPage() {
  const [showImportExport, setShowImportExport] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Pépinières</h1>
        <p className="text-gray-600">
          Gérez vos pépinières et leurs informations de production.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowImportExport(!showImportExport)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showImportExport ? 'Masquer' : 'Afficher'} Import/Export CSV
        </button>
      </div>

      {showImportExport && (
        <div className="mb-6">
          <CSVImportExportPepiniere />
        </div>
      )}

      <PepinieresTable />
    </div>
  );
} 