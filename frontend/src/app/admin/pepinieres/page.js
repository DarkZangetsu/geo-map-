'use client';

import PepinieresGlobalesTable from '../../../components/PepinieresGlobalesTable';

export default function AdminPepinieresPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Pépinières</h1>
        <p className="text-gray-600">
          Consultez et gérez toutes les pépinières de tous les membres.
        </p>
      </div>

      <PepinieresGlobalesTable />
    </div>
  );
} 