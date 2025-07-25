"use client";
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_USERS, UPDATE_USER_ACTIVE_STATUS, UPDATE_USER_ABREVIATION } from '../../../lib/graphql-queries';
import UsersTable from '../../../components/UsersTable';
import { useToast } from '../../../lib/useToast';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function AdminUtilisateursPage() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_USERS);
  const [updateUserActiveStatus] = useMutation(UPDATE_USER_ACTIVE_STATUS);
  const [updateUserAbreviation] = useMutation(UPDATE_USER_ABREVIATION);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const { showSuccess, showError } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const users = data?.allUsers || [];

  const handleToggleActive = async (user) => {
    try {
      setIsUpdatingUser(true);
      const { data } = await updateUserActiveStatus({
        variables: { userId: user.id, isActive: !user.isActive }
      });
      if (data.updateUserActiveStatus.success) {
        const action = user.isActive ? 'désactivé' : 'activé';
        showSuccess(`Utilisateur ${user.firstName} ${user.lastName} ${action} avec succès`);
        refetch();
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
        refetch();
      } else {
        showError(data.updateUserAbreviation.message);
      }
    } catch (e) {
      showError('Erreur lors de la modification de l\'abréviation');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <span className="ml-4 text-gray-600">Chargement des utilisateurs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">Erreur lors du chargement des utilisateurs.</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 text-sm mt-1">Gérez les comptes utilisateurs, activez ou désactivez les institutions et modifiez leurs abréviations.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus size={16} /> Ajouter un utilisateur
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des utilisateurs ({users.length})
            </h2>
            <div className="text-sm text-gray-500">
              {users.filter(u => u.isActive).length} actifs, {users.filter(u => !u.isActive).length} inactifs
            </div>
          </div>
        </div>
        <UsersTable 
          users={users} 
          onToggleActive={handleToggleActive} 
          onEditAbreviation={handleEditAbreviation}
          isLoading={isUpdatingUser}
        />
      </div>
      {/* Modal d'ajout à venir ici si besoin */}
    </div>
  );
} 