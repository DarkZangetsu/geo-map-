'use client';

import { ApolloProvider } from '@apollo/client';
import { useState, useEffect } from 'react';
import client from '../lib/apollo-client';
import { useToast } from '../lib/useToast';
import Toast from '../components/Toast';
import './globals.css';
import { AuthProvider, useAuth } from '../components/Providers';

function LayoutContent({ children }) {
  const { user, isLoading, logout } = useAuth();
  const { toasts, removeToast } = useToast();

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
            {/* Header */}
            {user && (
              <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                      <h1 className="text-xl font-bold text-gray-900">
                        Agri-Geo
                      </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {user?.logo && (
                          <img
                            src={`http://localhost:8000${user.logo}`}
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
                        onClick={logout}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
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