'use client';
import * as React from 'react';
import { DataTable } from './ui/table-data-table';
import { Button } from './ui/button';
import SiegeDetailModal from './SiegeDetailModal';

export default function SiegesGlobauxTable({ sieges, loading }) {
  const [selectedSiege, setSelectedSiege] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  const columns = React.useMemo(() => [
    {
      accessorKey: 'nom',
      header: 'Nom',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'adresse',
      header: 'Adresse',
      cell: info => info.getValue(),
    },
    {
      id: 'membre',
      header: 'Membre',
      cell: info => {
        const user = info.row.original.user;
        return user ? (
          <div className="flex items-center">
            {user.logo && (
              <img src={`http://localhost:8000${user.logo}`} alt="Logo" className="w-6 h-6 rounded-full mr-2" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
              <div className="text-sm text-gray-500">{user.firstName} {user.lastName} {user.email}</div>
            </div>
          </div>
        ) : '-';
      },
    },
    {
      id: 'abreviation',
      header: 'Abréviation',
      cell: info => info.row.original.user?.abreviation || '-',
    },
    {
      accessorKey: 'latitude',
      header: 'Latitude',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'longitude',
      header: 'Longitude',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: info => info.getValue() || '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = `https://www.google.com/maps?q=${row.original.latitude},${row.original.longitude}`;
              window.open(url, '_blank');
            }}
          >
            Voir carte
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setSelectedSiege(row.original);
              setShowDetailModal(true);
            }}
          >
            Détails
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  return (
    <>
      <DataTable
        columns={columns}
        data={Array.isArray(sieges) ? sieges : []}
        filterKey="nom"
        filterPlaceholder="Rechercher par nom..."
      />
      {showDetailModal && selectedSiege && (
        <SiegeDetailModal
          siege={selectedSiege}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSiege(null);
          }}
        />
      )}
    </>
  );
} 