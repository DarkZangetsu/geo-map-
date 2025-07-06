'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_ME, GET_ALL_USERS, GET_ALL_PARCELLES, DELETE_PARCELLE } from '../../lib/graphql-queries';
import { useToast } from '../../lib/useToast';
import ParcelleForm from '../../components/ParcelleForm';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.role === 'ADMIN' || userData.role === 'admin' || userData.isStaff) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          showError('Accès non autorisé - Rôle administrateur requis');
          router.push('/');
        }
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router, showError]);

  // Requête pour vérifier l'utilisateur actuel
  const { data: meData, loading: meLoading, error: meError } = useQuery(GET_ME, {
    skip: !isAuthenticated,
    onCompleted: (data) => {
      if (data?.me) {
        // Vérifier que l'utilisateur est toujours admin
        if (data.me.role !== 'ADMIN' && data.me.role !== 'admin' && !data.me.isStaff) {
          showError('Accès non autorisé - Rôle administrateur requis');
          handleLogout();
        } else {
          setUser(data.me);
          localStorage.setItem('user', JSON.stringify(data.me));
        }
      }
    },
    onError: () => {
      // Token invalid, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    }
  });

  // Requêtes GraphQL
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(GET_ALL_USERS, {
    skip: !isAuthenticated
  });
  const { data: parcellesData, loading: parcellesLoading, refetch: refetchParcelles } = useQuery(GET_ALL_PARCELLES, {
    skip: !isAuthenticated
  });
  const [deleteParcelle] = useMutation(DELETE_PARCELLE);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
    showSuccess('Déconnexion réussie');
  };

  const handleParcelleSuccess = (parcelle) => {
    setShowForm(false);
    setEditingParcelle(null);
    refetchParcelles();
  };

  const handleDeleteParcelle = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      return;
    }

    try {
      const { data } = await deleteParcelle({
        variables: { id }
      });

      if (data.deleteParcelle.success) {
        showSuccess('Parcelle supprimée avec succès');
        refetchParcelles();
      } else {
        showError(data.deleteParcelle.message);
      }
    } catch (error) {
      showError('Erreur lors de la suppression');
      console.error('Delete error:', error);
    }
  };

  const handleEditParcelle = (parcelle) => {
    setEditingParcelle(parcelle);
    setShowForm(true);
  };

  const exportToCSV = (data, type) => {
    if (!data || data.length === 0) {
      showError(`Aucun ${type} à exporter`);
      return;
    }

    let headers, csvContent;

    if (type === 'users') {
      headers = ['ID', 'Nom d\'utilisateur', 'Email', 'Prénom', 'Nom', 'Rôle', 'Date d\'inscription'];
      csvContent = [
        headers.join(','),
        ...data.map(user => [
          user.id,
          user.username,
          user.email,
          user.firstName || '',
          user.lastName || '',
          user.role,
          new Date(user.dateJoined).toLocaleDateString('fr-FR')
        ].join(','))
      ].join('\n');
    } else {
      headers = [
        'Nom', 'Culture', 'Propriétaire', 'Superficie (ha)', 'Variété',
        'Date de semis', 'Date de récolte prévue', 'Type de sol',
        'Irrigation', 'Type d\'irrigation', 'Rendement prévu (t/ha)',
        'Coût de production (€/ha)', 'Certification Bio', 'Certification HVE',
        'Notes', 'Date de création', 'Utilisateur'
      ];

      csvContent = [
        headers.join(','),
        ...data.map(parcelle => [
          parcelle.nom,
          parcelle.culture,
          parcelle.proprietaire,
          parcelle.superficie || '',
          parcelle.variete || '',
          parcelle.dateSemis || '',
          parcelle.dateRecoltePrevue || '',
          parcelle.typeSol || '',
          parcelle.irrigation ? 'Oui' : 'Non',
          parcelle.typeIrrigation || '',
          parcelle.rendementPrevue || '',
          parcelle.coutProduction || '',
          parcelle.certificationBio ? 'Oui' : 'Non',
          parcelle.certificationHve ? 'Oui' : 'Non',
          `"${(parcelle.notes || '').replace(/"/g, '""')}"`,
          new Date(parcelle.createdAt).toLocaleDateString('fr-FR'),
          `${parcelle.user?.firstName || ''} ${parcelle.user?.lastName || ''}`
        ].join(','))
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || (user?.role !== 'ADMIN' && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const users = usersData?.allUsers || [];
  const parcelles = parcellesData?.allParcelles || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* En-tête avec informations utilisateur et bouton de déconnexion */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600 mt-2">Gestion des utilisateurs et des parcelles</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {user?.logo && (
              <img
                src={`http://localhost:8000${user.logo}`}
                alt="Logo"
                className="w-8 h-8 rounded-full mr-3"
              />
            )}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-sm text-gray-500">
                @{user?.username} • {user?.role}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout/modification de parcelle */}
      {showForm && (
        <div className="mb-8">
          <ParcelleForm
            parcelle={editingParcelle}
            onSuccess={handleParcelleSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingParcelle(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Utilisateurs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Utilisateurs</h2>
            <button
              onClick={() => exportToCSV(users, 'users')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
          
          {usersLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user?.logo && (
                            <img
                              src={`http://localhost:8000${user.logo}`}
                              alt="Logo"
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user?.firstName} {user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user?.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          user?.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user?.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString('fr-FR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section Parcelles */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Parcelles</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => exportToCSV(parcelles, 'parcelles')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Ajouter
              </button>
            </div>
          </div>
          
          {parcellesLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : parcelles.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune parcelle trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcelle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Culture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propriétaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parcelles.map((parcelle) => (
                    <tr key={parcelle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {parcelle.user?.logo && (
                            <img
                              src={`http://localhost:8000${parcelle.user.logo}`}
                              alt="Logo"
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {parcelle.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {parcelle.user?.firstName} {parcelle.user?.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parcelle.culture}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parcelle.proprietaire}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditParcelle(parcelle)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteParcelle(parcelle.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 