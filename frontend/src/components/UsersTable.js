import React, { useState, useEffect } from 'react';

const UsersTable = ({ users, onToggleActive, onEditAbreviation, isLoading = false }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [newAbreviation, setNewAbreviation] = useState('');

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingUser) {
        if (e.key === 'Escape') {
          setEditingUser(null);
          setNewAbreviation('');
        } else if (e.key === 'Enter' && newAbreviation.trim()) {
          handleSaveAbreviation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingUser, newAbreviation]);

  // Fermer le modal en cliquant à l'extérieur
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setEditingUser(null);
      setNewAbreviation('');
    }
  };

  const handleEditAbreviation = (user) => {
    setEditingUser(user);
    setNewAbreviation(user.abreviation || '');
  };

  const handleSaveAbreviation = () => {
    if (newAbreviation.trim() && onEditAbreviation) {
      onEditAbreviation(editingUser, newAbreviation.trim());
      setEditingUser(null);
      setNewAbreviation('');
    }
  };

  const handleToggleActive = (user) => {
    const action = user.isActive ? 'désactiver' : 'activer';
    const message = `Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.nomInstitution || user.username} ?`;
    
    if (confirm(message)) {
      onToggleActive && onToggleActive(user);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Institution/Projet</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Abréviation</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date d'inscription</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">
                <div>
                  <div className="font-medium">{user.nomInstitution || user.username}</div>
                  <div className="text-sm text-gray-500">{user.nomProjet || '-'}</div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-600">{user.email}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {user.abreviation ? (
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{user.abreviation}</span>
                ) : (
                  <span className="text-gray-400 italic">-</span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {user.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    Actif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                    Inactif
                  </span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      user.isActive 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleToggleActive(user)}
                    disabled={isLoading}
                    title={user.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                        {user.isActive ? 'Désactivation...' : 'Activation...'}
                      </span>
                    ) : (
                      user.isActive ? 'Désactiver' : 'Activer'
                    )}
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleEditAbreviation(user)}
                    disabled={isLoading}
                    title="Modifier l'abréviation"
                  >
                    Modifier abrév.
                  </button>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                {user.dateJoined ? new Date(user.dateJoined).toLocaleDateString('fr-FR') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal pour modifier l'abréviation */}
      {editingUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleModalClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 shadow-xl">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900 mb-4">
              Modifier l'abréviation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Modifier l'abréviation pour <strong>{editingUser.nomInstitution || editingUser.username}</strong>
            </p>
            <div className="mb-4">
              <label htmlFor="abreviation" className="block text-sm font-medium text-gray-700 mb-2">
                Abréviation
              </label>
              <input
                type="text"
                id="abreviation"
                value={newAbreviation}
                onChange={(e) => setNewAbreviation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: JD"
                maxLength={20}
                autoFocus
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 20 caractères • Appuyez sur Entrée pour sauvegarder, Échap pour annuler
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewAbreviation('');
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAbreviation}
                disabled={!newAbreviation.trim() || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable; 