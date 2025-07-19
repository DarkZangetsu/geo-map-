'use client';

import { useState } from 'react';
import { useToast } from './Toast';

export default function AuthForm({ onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    abreviation: '',
    nomInstitution: '',
    nomProjet: '',
    role: 'membre'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Validation pour la connexion
      if (!formData.username || !formData.password) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }
    } else {
      // Validation pour l'inscription
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.abreviation) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
      }
      
      if (formData.password.length < 6) {
        showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await onLogin({
          username: formData.username,
          password: formData.password
        });
        showToast('Connexion réussie !', 'success');
      } else {
        await onRegister({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          abreviation: formData.abreviation,
          nomInstitution: formData.nomInstitution,
          nomProjet: formData.nomProjet,
          role: 'membre'
        });
        showToast('Inscription réussie !', 'success');
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      abreviation: '',
      nomInstitution: '',
      nomProjet: '',
      role: 'membre'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(0,70,144,0.1)' }}>
            <svg className="h-8 w-8" style={{ color: 'rgb(0,70,144)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 leading-tight">
            <div>{isLogin ? 'Connexion' : 'Inscription'}</div>
            <div className="text-lg">à</div>
            <div>Alliance-Agroforesterie</div>
          </h2>
          {/* <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Accédez à votre espace agricole' : 'Créez votre compte agricole'}
          </p> */}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Utilisation d'une grille responsive pour l'inscription */}
          <div className={`rounded-md shadow-sm -space-y-px ${!isLogin ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}`}> 
            {!isLogin && (
              <>
                <div className="mb-4">
                  <label htmlFor="nomInstitution" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'institution
                  </label>
                  <input
                    id="nomInstitution"
                    name="nomInstitution"
                    type="text"
                    value={formData.nomInstitution}
                    onChange={handleInputChange}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Nom de l'institution"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="nomProjet" className="block text-sm font-medium text-gray-700 mb-1">
                    Projet rattaché
                  </label>
                  <input
                    id="nomProjet"
                    name="nomProjet"
                    type="text"
                    value={formData.nomProjet}
                    onChange={handleInputChange}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Nom du projet"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="abreviation" className="block text-sm font-medium text-gray-700 mb-1">
                    Abréviation *
                  </label>
                  <input
                    id="abreviation"
                    name="abreviation"
                    type="text"
                    required
                    value={formData.abreviation}
                    onChange={handleInputChange}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Abréviation (ex: JD)"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirmer le mot de passe"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    disabled
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-100 cursor-not-allowed"
                  >
                    <option value="membre">Membre</option>
                  </select>
                </div>
              </>
            )}

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nom d'utilisateur"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'rgb(0,70,144)',
                '--tw-ring-color': 'rgb(0,70,144)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(0,51,102)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(0,70,144)'}
            >
              {isSubmitting || loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Connexion...' : 'Inscription...'}
                </div>
              ) : (
                isLogin ? 'Se connecter' : 'S\'inscrire'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetForm();
              }}
              className="text-sm"
              style={{ 
                color: 'rgb(0,70,144)'
              }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(0,51,102)'}
              onMouseLeave={(e) => e.target.style.color = 'rgb(0,70,144)'}
            >
              {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 