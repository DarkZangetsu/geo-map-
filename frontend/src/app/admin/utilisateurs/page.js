"use client";
import { useQuery } from '@apollo/client';
import { GET_ALL_USERS } from '../../../lib/graphql-queries';
import UsersTable from '../../../components/UsersTable';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminUtilisateursPage() {
  const { data, loading } = useQuery(GET_ALL_USERS);
  const users = data?.allUsers || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestion des utilisateurs</h1>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <UsersTable users={users} />
          )}
        </div>
      </main>
    </div>
  );
} 