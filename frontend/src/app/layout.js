'use client';

import { ApolloProvider } from '@apollo/client';
import { useState, useEffect } from 'react';
import client from '../lib/apollo-client';
import { useToast } from '../lib/useToast';
import Toast from '../components/Toast';
import './globals.css';
import { AuthProvider, useAuth } from '../components/Providers';
import { usePathname } from 'next/navigation';

function LayoutContent({ children }) {
  const { user, isLoading, isLoggingOut, logout } = useAuth();
  const { toasts, removeToast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false);
  const [showPersonalDropdown, setShowPersonalDropdown] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Correction : return un écran de chargement AVANT le return principal si isLoading
  if (isLoading) {
    return (
      <html lang="fr" style={{ height: '100%' }}>
        <head>
          <title>Alliance-Agroforesterie</title>
          <meta name="description" content="Application web pour la visualisation des sites de référene et des locaux et des pépinières des institutions membre de l'Alliance-Agroforesterie avec cartographie interactive" />
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
        <title>Alliance-Agroforesterie</title>
        <meta name="description" content="Application web pour la visualisation des sites de référene et des locaux et des pépinières des institutions membre de l'Alliance-Agroforesterie avec cartographie interactive" />
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
            {/* Header ou flèche retour selon la page */}
            {isAuthPage ? (
              <div className="w-full flex items-center px-4 py-4">
                <a href="/" className="inline-flex items-center text-blue-700 font-bold text-lg hover:underline">
                  <span className="text-2xl mr-2">&#8592;</span> Retour à la carte générale
                </a>
              </div>
            ) : (
              // Header */}
              <header className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-3">
                    {/* Logo et titre */}
                    <div className="flex items-center min-w-0">
                      <h1 className="text-lg font-bold text-gray-900 truncate whitespace-nowrap">
                        Alliance-Agroforesterie
                      </h1>
                    </div>
                    {/* Navigation principale - centrée */}
                    <div className="hidden lg:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
                      {/* Dropdown Global */}
                      <div className="relative">
                        <button
                          onClick={() => setShowGlobalDropdown(!showGlobalDropdown)}
                          onBlur={() => setTimeout(() => setShowGlobalDropdown(false), 150)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        >
                          <span>Vue Globale</span>
                          <svg className={`w-4 h-4 transition-transform ${showGlobalDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showGlobalDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                              Carte générale
                            </a>
                            <a href="/parcelles-globales" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                              Liste des Sites de référence
                            </a>
                            <a href="/sieges-globaux" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                              Liste des Locaux
                            </a>
                            <a href="/pepinieres-globales" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                              Liste des Pépinières
                            </a>
                          </div>
                        )}
                      </div>
                      {/* Dropdown Personnel (seulement si connecté) */}
                      {user && (
                        <div className="relative">
                          <button
                            onClick={() => setShowPersonalDropdown(!showPersonalDropdown)}
                            onBlur={() => setTimeout(() => setShowPersonalDropdown(false), 150)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                          >
                            <span>Mes Données</span>
                            <svg className={`w-4 h-4 transition-transform ${showPersonalDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showPersonalDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                              <a href="/parcelles" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                                Mes sites de référence
                              </a>
                              <a href="/sieges" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                                Mes locaux
                              </a>
                              <a href="/pepinieres" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                                Mes pépinières
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Actions à droite */}
                    <div className="flex items-center space-x-4 flex-shrink-0">
                      {user ? (
                        <>
                          <div className="flex items-center">
                            {console.log('USER NAVBAR:', user)}
                            {user?.logo&& (
                              <img
                                src={`http://localhost:8000/media/${user.logo}`}
                                alt="Logo"
                                className="w-8 h-8 rounded-full mr-2"
                              />
                            )}
                            <div className="hidden sm:block">
                              <span className="text-sm text-gray-700 font-medium">
                                {user?.firstName} {user?.lastName}
                              </span>
                              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {user?.nomInstitution}
                              </span>
                            </div>
                          </div>
                          <a href="/profil" className="hidden lg:block px-3 py-1 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors">
                            Mon profil
                          </a>
                          <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            disabled={isLoggingOut}
                          >
                            Déconnexion
                          </button>
                        </>
                      ) : (
                        <>
                          <a href="/login" className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-white hover:bg-blue-700 border border-blue-700 rounded transition-colors">Connexion</a>
                          <a href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors">Inscription</a>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Menu mobile */}
                  {showMenu && (
                    <div className="lg:hidden border-t border-gray-200 py-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vue Globale</h3>
                          <div className="space-y-1">
                            <a href="/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded">
                              Carte générale
                            </a>
                            <a href="/parcelles-globales" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded">
                              Parcelles globales
                            </a>
                            <a href="/sieges-globaux" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded">
                              Sièges globaux
                            </a>
                            <a href="/pepinieres-globales" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded">
                              Pépinières globales
                            </a>
                          </div>
                        </div>
                        {user && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mes Données</h3>
                            <div className="space-y-1">
                              <a href="/parcelles" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded">
                                Mes sites de référence
                              </a>
                              <a href="/sieges" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded">
                                Mes locaux
                              </a>
                              <a href="/pepinieres" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded">
                                Mes pépinières
                              </a>
                            </div>
                          </div>
                        )}
                        {user && (
                          <div className="border-t border-gray-200 pt-3">
                            <a href="/profil" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded">
                              Mon profil
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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