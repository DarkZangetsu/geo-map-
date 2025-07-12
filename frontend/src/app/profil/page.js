"use client";
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, UPDATE_USER_ABREVIATION, UPDATE_USER_LOGO, UPDATE_USER_PROFILE, CHANGE_PASSWORD } from '../../lib/graphql-queries';
import { useToast } from '../../lib/useToast';

export default function ProfilPage() {
  const { data, loading, refetch } = useQuery(GET_ME);
  const [updateUserAbreviation] = useMutation(UPDATE_USER_ABREVIATION);
  const [updateUserLogo] = useMutation(UPDATE_USER_LOGO);
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);
  const [changePassword] = useMutation(CHANGE_PASSWORD);
  const { showSuccess, showError } = useToast();
  const user = data?.me;
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    abreviation: '',
    logo: null
  });

  // Mettre à jour le formulaire quand les données utilisateur sont chargées
  React.useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        abreviation: user.abreviation || '',
        logo: null
      });
    }
  }, [user]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new1: '', new2: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }
  if (!user) {
    return <div className="text-center py-12 text-gray-500">Aucune donnée utilisateur.</div>;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Ici, on ne gère que l'abréviation (ajouter mutation pour logo si besoin)
      const { data } = await updateUserAbreviation({
        variables: { userId: user.id, abreviation: form.abreviation }
      });
      if (data.updateUserAbreviation.success) {
        showSuccess('Profil mis à jour');
        setIsEditing(false);
        refetch();
      } else {
        showError(data.updateUserAbreviation.message);
      }
    } catch (e) {
      showError('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await updateUserProfile({
        variables: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email
        }
      });
      if (data.updateUserProfile.success) {
        showSuccess('Profil mis à jour');
        setIsEditing(false);
        refetch();
      } else {
        showError(data.updateUserProfile.message);
      }
    } catch (e) {
      showError('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const { data } = await updateUserLogo({ variables: { logo: file } });
      if (data.updateUserLogo.success) {
        showSuccess('Logo mis à jour');
        refetch();
      } else {
        showError(data.updateUserLogo.message);
      }
    } catch (e) {
      showError('Erreur lors de la mise à jour du logo');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(f => ({ ...f, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new1 !== passwordForm.new2) {
      showError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    setIsChangingPassword(true);
    try {
      const { data } = await changePassword({
        variables: { oldPassword: passwordForm.old, newPassword: passwordForm.new1 }
      });
      if (data.changePassword.success) {
        showSuccess('Mot de passe modifié avec succès');
        setShowPasswordForm(false);
        setPasswordForm({ old: '', new1: '', new2: '' });
      } else {
        showError(data.changePassword.message);
      }
    } catch (e) {
      showError('Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Mon profil</h1>
      <form onSubmit={isEditing ? handleProfileSave : handleSave} className="bg-white rounded-lg shadow p-6 flex flex-col gap-6">
        <div className="flex items-center gap-6">
          {user.logo && (
            <img src={`http://localhost:8000/media/${user.logo}`} alt="Logo" className="w-20 h-20 rounded-full object-cover border" />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Changer le logo</label>
            <input type="file" name="logo" accept="image/*" onChange={handleLogoChange} disabled={isSaving} className="block w-full text-sm text-gray-500" />
            <span className="text-xs text-gray-400">(Modification du logo à venir)</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} disabled={!isEditing || isSaving} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} disabled={!isEditing || isSaving} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} disabled={!isEditing || isSaving} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Abréviation</label>
          <input type="text" name="abreviation" value={form.abreviation} onChange={handleChange} maxLength={20} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={isSaving} />
        </div>
        <div className="flex justify-end gap-3">
          {!isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Modifier</button>
          ) : (
            <>
              <button type="button" onClick={() => { 
                setIsEditing(false); 
                setForm({
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email || '',
                  abreviation: user.abreviation || '',
                  logo: null
                }); 
              }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-semibold">Annuler</button>
              <button type="submit" disabled={isSaving || !form.abreviation.trim()} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </>
          )}
        </div>
      </form>
      <div className="flex justify-end mt-8">
        <button type="button" onClick={() => setShowPasswordForm(v => !v)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold">
          {showPasswordForm ? 'Annuler' : 'Changer mon mot de passe'}
        </button>
      </div>
      {showPasswordForm && (
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow p-6 mt-4 flex flex-col gap-4 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-blue-900 mb-2">Changer mon mot de passe</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ancien mot de passe</label>
            <input type="password" name="old" value={passwordForm.old} onChange={handlePasswordChange} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={isChangingPassword} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input type="password" name="new1" value={passwordForm.new1} onChange={handlePasswordChange} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={isChangingPassword} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input type="password" name="new2" value={passwordForm.new2} onChange={handlePasswordChange} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={isChangingPassword} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="submit" disabled={isChangingPassword || !passwordForm.old || !passwordForm.new1 || !passwordForm.new2} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              {isChangingPassword ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 