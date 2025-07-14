'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_ME, GET_ALL_USERS, GET_ALL_PARCELLES, DELETE_PARCELLE, GET_MY_SIEGES, DELETE_SIEGE, UPDATE_USER_ACTIVE_STATUS, UPDATE_USER_ABREVIATION } from '../../lib/graphql-queries';
import { useToast } from '../../lib/useToast';
import ParcelleForm from '../../components/ParcelleForm';
import { useAuth } from '../../components/Providers';
import SiegeForm from '../../components/SiegeForm';import
 SiegeTable from '../../components/SiegeTable';
import ParcellesMap from '../../components/ParcellesMap';
import SiegeModal from '../../components/SiegeModal';
import ParcelleModal from '../../components/ParcelleModal';
import AdminSidebar from '../../components/AdminSidebar';
import { Layers, Map, User, FileText } from 'lucide-react';
import ParcellesTable from '../../components/ParcellesTable';
import UsersTable from '../../components/UsersTable';

export default function AdminPage() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // Redirection si non admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || (user.role !== 'ADMIN' && user.role !== 'admin'))) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

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
          localStorage.setItem('user', JSON.stringify(data.me));
        }
      }
    },
    onError: () => {
      // Token invalid, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      logout();
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
  const { data: siegesData, loading: siegesLoading, refetch: refetchSieges } = useQuery(GET_MY_SIEGES, {
    skip: !isAuthenticated
  });
  const [showSiegeModal, setShowSiegeModal] = useState(false);
  const [editingSiege, setEditingSiege] = useState(null);
  const [deleteSiege] = useMutation(DELETE_SIEGE);
  const [mapSiege, setMapSiege] = useState(null); // <-- Correction ajoutée
  const [showParcelleModal, setShowParcelleModal] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [updateUserActiveStatus] = useMutation(UPDATE_USER_ACTIVE_STATUS);
  const [updateUserAbreviation] = useMutation(UPDATE_USER_ABREVIATION);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleParcelleSuccess = () => {
    setShowParcelleModal(false);
    setEditingParcelle(null);
    refetchParcelles();
  };

  const handleAddParcelle = () => {
    setEditingParcelle(null);
    setShowParcelleModal(true);
  };

  const handleEditParcelle = (parcelle) => {
    setEditingParcelle(parcelle);
    setShowParcelleModal(true);
  };

  const handleDeleteParcelle = async (parcelle) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) return;
    try {
      // Remplacer par la mutation appropriée si besoin
      showSuccess('Suppression de parcelle non implémentée');
      // refetchParcelles();
    } catch (e) {
      showError('Erreur lors de la suppression');
    }
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
          `"${(parcelle.notes || '').toString().replace(/"/g, '""')}"`,
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

  const handleSiegeSuccess = () => {
    setShowSiegeModal(false);
    setEditingSiege(null);
    refetchSieges();
  };

  const handleEditSiege = (siege) => {
    setEditingSiege(siege);
    setShowSiegeModal(true);
  };

  const handleAddSiege = () => {
    setEditingSiege(null);
    setShowSiegeModal(true);
  };

  const handleDeleteSiege = async (siege) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce siège ?')) return;
    try {
      const { data } = await deleteSiege({ variables: { id: siege.id } });
      if (data.deleteSiege.success) {
        showSuccess('Siège supprimé avec succès');
        refetchSieges();
      } else {
        showError(data.deleteSiege.message);
      }
    } catch (e) {
      showError('Erreur lors de la suppression');
    }
  };

  const handleShowOnMap = (siege) => {
    setMapSiege(siege);
  };

  const handleToggleActive = async (user) => {
    try {
      setIsUpdatingUser(true);
      const { data } = await updateUserActiveStatus({
        variables: { userId: user.id, isActive: !user.isActive }
      });
      if (data.updateUserActiveStatus.success) {
        const action = user.isActive ? 'désactivé' : 'activé';
        showSuccess(`Utilisateur ${user.firstName} ${user.lastName} ${action} avec succès`);
        refetchUsers();
      } else {
        showError(data.updateUserActiveStatus.message);
      }
    } catch (e) {
      showError('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleEditAbreviation = async (user, newAbrev) => {
    try {
      setIsUpdatingUser(true);
      const { data } = await updateUserAbreviation({
        variables: { userId: user.id, abreviation: newAbrev }
      });
      if (data.updateUserAbreviation.success) {
        showSuccess(`Abréviation de ${user.firstName} ${user.lastName} modifiée en "${newAbrev}"`);
        refetchUsers();
      } else {
        showError(data.updateUserAbreviation.message);
      }
    } catch (e) {
      showError('Erreur lors de la modification de l\'abréviation');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  const users = usersData?.allUsers || [];
  const parcelles = parcellesData?.allParcelles || [];
  const sieges = siegesData?.mySieges || [];

  // Dashboard/statistiques
  const stats = [
    { label: 'Utilisateurs', value: users.length },
    { label: 'Parcelles', value: parcelles.length },
    { label: 'Sièges', value: sieges.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard/statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                <div className="text-3xl font-extrabold text-blue-900 mb-2">{stat.value}</div>
                <div className="text-lg font-medium text-gray-700">{stat.label}</div>
              </div>
            ))}
          </div>
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-600 mt-2">Gestion centralisée de la plateforme</p>
          </div>
          {/* Bouton d'ajout de parcelle */}
          <div className="mb-8 flex justify-end">
            <button
              onClick={handleAddParcelle}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow-sm transition"
            >
              Ajouter une parcelle
            </button>
          </div>
          {/* Section Parcelles */}
          <section id="parcelles" className="mb-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><Layers size={22} /> Parcelles</h2>
            <ParcellesTable
              parcelles={parcelles}
              onEdit={handleEditParcelle}
              onDelete={handleDeleteParcelle}
            />
          </section>
          {/* Section Sièges */}
          <section id="sieges" className="mb-12 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2"><Map size={22} /> Sièges</h2>
              <button
                onClick={handleAddSiege}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow-sm transition"
              >
                Ajouter un siège
              </button>
            </div>
            <SiegeTable
              sieges={sieges}
              onShowOnMap={handleShowOnMap}
              onEdit={handleEditSiege}
              onDelete={handleDeleteSiege}
            />
          </section>
          {/* Section Utilisateurs */}
          <section id="users" className="mb-12 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2"><User size={22} /> Utilisateurs</h2>
              <button
                onClick={() => exportToCSV(users, 'users')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
            <UsersTable
              users={users}
              onToggleActive={handleToggleActive}
              onEditAbreviation={handleEditAbreviation}
              isLoading={isUpdatingUser}
            />
          </section>
          {/* Section Import/Export */}
          <section id="import" className="mb-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-4"><FileText size={22} /> Import/Export</h2>
            {/* Composants d'import/export à venir ici */}
          </section>
          {/* Section Carte */}
          <section className="mb-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-4"><Map size={22} /> Carte des parcelles et sièges</h2>
            <div style={{ height: 500 }}>
              <ParcellesMap parcelles={parcelles} sieges={mapSiege ? [mapSiege] : sieges} />
            </div>
          </section>
          <SiegeModal
            open={showSiegeModal}
            onClose={() => { setShowSiegeModal(false); setEditingSiege(null); }}
            initialData={editingSiege}
            mode={editingSiege ? 'edit' : 'add'}
            siegeId={editingSiege ? editingSiege.id : null}
            onSuccess={handleSiegeSuccess}
          />
          <ParcelleModal
            open={showParcelleModal}
            onClose={() => { setShowParcelleModal(false); setEditingParcelle(null); }}
            parcelle={editingParcelle}
            onSuccess={handleParcelleSuccess}
          />
        </div>
      </main>
    </div>
  );
} 