"use client";
import React, { useMemo, useState } from 'react';
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table';

const ParcellesDataTable = ({ parcelles, onDelete }) => {
  const data = useMemo(() => parcelles, [parcelles]);
  const columns = useMemo(() => [
    { Header: 'Nom', accessor: 'nom' },
    { Header: 'Culture', accessor: 'culture' },
    { Header: 'Propriétaire', accessor: 'proprietaire' },
    { Header: 'Superficie', accessor: 'superficie' },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: ({ row }) => (
        <button
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => onDelete && onDelete(row.original)}
        >
          Supprimer
        </button>
      ),
      disableSortBy: true,
    },
  ], [onDelete]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    setGlobalFilter,
    state: { globalFilter, pageIndex, pageSize },
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    { columns, data, initialState: { pageSize: 10 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <input
          value={globalFilter || ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Rechercher..."
          className="px-3 py-2 border border-gray-300 rounded-md w-64"
        />
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="ml-2 px-2 py-1 border rounded"
        >
          {[10, 25, 50].map(size => (
            <option key={size} value={size}>{size} par page</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none"
                  >
                    {column.render('Header')}
                    {column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="px-4 py-2 whitespace-nowrap">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          Page {pageIndex + 1} sur {pageOptions.length}
        </div>
        <div className="flex gap-2">
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-3 py-1 border rounded disabled:opacity-50">Précédent</button>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="px-3 py-1 border rounded disabled:opacity-50">Suivant</button>
        </div>
      </div>
    </div>
  );
};

export default ParcellesDataTable; 