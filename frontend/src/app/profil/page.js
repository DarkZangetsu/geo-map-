"use client";
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, UPDATE_USER_ABREVIATION, UPDATE_USER_LOGO } from '../../lib/graphql-queries';
import { useToast } from '../../lib/useToast';

export default function ProfilPage() {
  const { data, loading, refetch } = useQuery(GET_ME);
  const [updateUserAbreviation] = useMutation(UPDATE_USER_ABREVIATION);
  const [updateUserLogo] = useMutation(UPDATE_USER_LOGO);
  const { showSuccess, showError } = useToast();
  const user = data?.me;
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    abreviation: user?.abreviation || '',
    logo: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Mon profil</h1>
      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 flex flex-col gap-6">
        <div className="flex items-center gap-6">
          {user.logo && (
            <img src={`http://localhost:8000${user.logo}`} alt="Logo" className="w-20 h-20 rounded-full object-cover border" />
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
            <input type="text" name="firstName" value={form.firstName} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" name="lastName" value={form.lastName} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={form.email} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
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
              <button type="button" onClick={() => { setIsEditing(false); setForm({ ...form, abreviation: user.abreviation }); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-semibold">Annuler</button>
              <button type="submit" disabled={isSaving || !form.abreviation.trim()} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
} 