import * as React from 'react';
import { DataTable } from './ui/table-data-table';
import MemberFilter from './MemberFilter';

export default function PepinieresGlobalesTable({ pepinieres, users = [] }) {
  const [selectedUser, setSelectedUser] = React.useState('');
  const safePepinieres = Array.isArray(pepinieres) ? pepinieres : [];
  const filteredPepinieres = selectedUser
    ? safePepinieres.filter(pepiniere => pepiniere.user && pepiniere.user.id === selectedUser)
    : safePepinieres;

  const columns = React.useMemo(() => [
    {
      accessorKey: 'nom',
      header: 'Nom',
      cell: info => (
        <div>
          <div className="text-sm font-medium text-gray-900">{info.getValue()}</div>
          <div className="text-sm text-gray-500">{info.row.original.adresse}</div>
        </div>
      ),
    },
    {
      accessorKey: 'nomGestionnaire',
      header: 'Gestionnaire',
      cell: info => (
        <div>
          <div className="text-sm text-gray-900">{info.getValue() || '-'}</div>
          <div className="text-sm text-gray-500">{info.row.original.posteGestionnaire || '-'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'capacite',
      header: 'Capacité',
      cell: info => info.getValue() ? `${info.getValue()}` : '-',
    },
    {
      id: 'membre',
      header: 'Membre',
      cell: info => {
        const user = info.row.original.user;
        return user ? (
          <div className="flex items-center">
            {user.logo && (
              <img src={user.logo} alt="Logo" className="w-6 h-6 rounded-full mr-2" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{user.nomInstitution || user.username}</div>
              <div className="text-sm text-gray-500">{user.nomProjet || user.abreviation}</div>
            </div>
          </div>
        ) : '-';
      },
    },
  ], []);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Toutes les Pépinières</h2>
        <MemberFilter
          users={users}
          selectedUser={selectedUser}
          onUserChange={setSelectedUser}
          placeholder="Filtrer par membre..."
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredPepinieres}
        filterKey="nom"
        filterPlaceholder="Rechercher par nom..."
      />
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Total: {filteredPepinieres.length} pépinière{filteredPepinieres.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
} 