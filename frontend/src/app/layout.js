'use client';

import { ApolloProvider } from '@apollo/client';
import { useState, useEffect } from 'react';
import client from '../lib/apollo-client';
import { useToast } from '../lib/useToast';
import Toast from '../components/Toast';
import './globals.css';
import { AuthProvider, useAuth } from '../components/Providers';

function LayoutContent({ children }) {
  const { user, isLoading, isLoggingOut, logout } = useAuth();
  const { toasts, removeToast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (isLoading) {
    return (
      <html lang="fr" style={{ height: '100%' }}>
        <head>
          <title>Agri-Geo - Gestion des parcelles agricoles</title>
          <meta name="description" content="Application web pour la gestion des parcelles agricoles avec cartographie interactive" />
        </head>
        <body style={{ height: '100%' }}>
          <div className="min-h-screen flex items-center justify-center" style={{ height: '100%' }}>
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr" style={{ height: '100%' }}>
      <head>
        <title>Agri-Geo - Gestion des parcelles agricoles</title>
        <meta name="description" content="Application web pour la gestion des parcelles agricoles avec cartographie interactive" />
      </head>
      <body style={{ height: '100%' }}>
        <ApolloProvider client={client}>
          <div className="min-h-screen bg-gray-50" style={{ height: '100%' }}>
            {/* Overlay de chargement lors du logout */}
            {isLoggingOut && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
                  <span className="text-white text-lg font-semibold">Déconnexion...</span>
                </div>
              </div>
            )}
            {/* Modal de confirmation de déconnexion */}
            {showLogoutConfirm && !isLoggingOut && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
                  <h2 className="text-xl font-bold mb-4">Confirmer la déconnexion</h2>
                  <p className="mb-6 text-gray-700">Voulez-vous vraiment vous déconnecter ?</p>
                  <div className="flex gap-4">
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                      onClick={async () => {
                        setShowLogoutConfirm(false);
                        await logout();
                      }}
                    >
                      Oui, me déconnecter
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-semibold"
                      onClick={() => setShowLogoutConfirm(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Header */}
            {user && (
              <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-6">
                      <h1 className="text-xl font-bold text-gray-900">
                        Agri-Geo
                      </h1>
                       <a href="/" className="text-blue-700 hover:underline font-semibold text-base px-3 py-1 rounded transition bg-blue-50 hover:bg-blue-100 border border-blue-100">
                        Mes parcelles
                      </a>
                      <a href="/map" className="text-blue-700 hover:underline font-semibold text-base px-3 py-1 rounded transition bg-blue-50 hover:bg-blue-100 border border-blue-100">
                        Carte globale
                      </a>
                      <a href="/parcelles-globales" className="text-green-700 hover:underline font-semibold text-base px-3 py-1 rounded transition bg-green-50 hover:bg-green-100 border border-green-100">
                        Parcelles globales
                      </a>
                      <a href="/sieges-globaux" className="text-purple-700 hover:underline font-semibold text-base px-3 py-1 rounded transition bg-purple-50 hover:bg-purple-100 border border-purple-100">
                        Sièges globaux
                      </a>
                      <a href="/pepiniere" className="text-orange-700 hover:underline font-semibold text-base px-3 py-1 rounded transition bg-orange-50 hover:bg-orange-100 border border-orange-100">
                        Mes pépinières
                      </a>
                      <a href="/pepinieres-globales" className="text-orange-700 hover:underline font-semibold text-base px-3 py-1 rounded transition bg-orange-50 hover:bg-orange-100 border border-orange-100">
                        Pépinières globales
                      </a>
                      <a href="/profil" className="text-gray-700 hover:underline font-semibold text-base px-3 py-1 rounded transition bg-gray-50 hover:bg-gray-100 border border-gray-100">
                        Le profil
                      </a>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {user?.logo && (
                          <img
                            src={`http://localhost:8000/media/${user.logo}`}
                            alt="Logo"
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        )}
                        <span className="text-sm text-gray-700">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {user?.role}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                        disabled={isLoggingOut}
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </header>
            )}
            {/* Contenu principal */}
            <main className="h-full">
              {children}
            </main>
          </div>
          {/* Toasts */}
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </ApolloProvider>
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
} 