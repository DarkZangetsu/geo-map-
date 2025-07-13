'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './Providers';
import { authUtils } from '../lib/utils';

export default function ProtectedRoute({ children, requireAuth = true }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkAuth = () => {
      const token = authUtils.getToken();
      const savedUser = authUtils.getUser();
      
      // Si aucun token ou utilisateur, ou si le token est expiré
      if (!token || !savedUser || authUtils.isTokenExpired(token)) {
        console.log('Utilisateur non authentifié, redirection vers login...');
        authUtils.clearAuthData();
        router.push('/');
        return;
      }
    };

    // Vérifier l'authentification après le chargement
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        checkAuth();
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, router]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  // Si tout est OK, afficher le contenu
  return children;
} 