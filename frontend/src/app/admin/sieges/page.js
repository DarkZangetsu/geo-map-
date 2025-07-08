"use client";
import { useQuery } from '@apollo/client';
import { GET_MY_SIEGES } from '../../../lib/graphql-queries';
import SiegeTable from '../../../components/SiegeTable';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminSiegesPage() {
  const { data, loading } = useQuery(GET_MY_SIEGES);
  const sieges = data?.mySieges || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestion des sièges</h1>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <SiegeTable sieges={sieges} />
          )}
        </div>
      </main>
    </div>
  );
} 