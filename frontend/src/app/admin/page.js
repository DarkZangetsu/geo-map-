'use client';

import { useQuery } from '@apollo/client';
import { GET_ALL_USERS, GET_ALL_PARCELLES, GET_MY_SIEGES, GET_ALL_PEPINIERES } from '../../lib/graphql-queries';
import ParcellesMap from '../../components/ParcellesMap';
import React from 'react';

export default function AdminDashboardPage() {
  const { data: usersData } = useQuery(GET_ALL_USERS);
  const { data: parcellesData } = useQuery(GET_ALL_PARCELLES);
  const { data: siegesData } = useQuery(GET_MY_SIEGES);
  const { data: pepinieresData } = useQuery(GET_ALL_PEPINIERES);
  const users = usersData?.allUsers || [];
  const parcelles = parcellesData?.allParcelles || [];
  const sieges = siegesData?.mySieges || [];
  const pepinieres = pepinieresData?.allPepinieres || [];

  const stats = [
    { label: 'Utilisateurs', value: users.length },
    { label: 'Parcelles', value: parcelles.length },
    { label: 'Sièges', value: sieges.length },
    { label: 'Pépinières', value: pepinieres.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-10">Tableau de bord</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-blue-50">
              <div className="text-4xl font-extrabold text-blue-900 mb-2">{stat.value}</div>
              <div className="text-lg font-medium text-gray-700">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Carte globale des parcelles et sièges</h2>
          <div style={{ height: 500 }}>
            <ParcellesMap parcelles={parcelles} sieges={sieges} />
          </div>
        </div>
      </div>
    </div>
  );
} 