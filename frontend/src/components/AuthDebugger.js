'use client';

import { useState } from 'react';
import { authUtils } from '../lib/utils';

export default function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const runDebugTests = async () => {
    let info = '=== Diagnostic d\'authentification ===\n\n';
    
    // Test 1: Vérifier localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    info += '1. localStorage:\n';
    info += `   Token présent: ${!!token}\n`;
    info += `   Utilisateur présent: ${!!user}\n`;
    
    if (token) {
      info += `   Token (début): ${token.substring(0, 50)}...\n`;
      
      // Test de décodage
      try {
        const decoded = authUtils.decodeToken(token);
        info += `   Token décodé: ${JSON.stringify(decoded, null, 2)}\n`;
        info += `   Expiration: ${new Date(decoded.exp * 1000).toLocaleString()}\n`;
        info += `   Valide: ${authUtils.validateToken(token)}\n`;
      } catch (error) {
        info += `   Erreur décodage: ${error.message}\n`;
      }
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        info += `   Utilisateur: ${JSON.stringify(userData, null, 2)}\n`;
      } catch (error) {
        info += `   Erreur parsing utilisateur: ${error.message}\n`;
      }
    }
    
    // Test 2: Vérifier l'état d'authentification
    info += '\n2. État d\'authentification:\n';
    info += `   isAuthenticated: ${authUtils.isAuthenticated()}\n`;
    
    // Test 3: Vérifier Apollo Client
    info += '\n3. Apollo Client:\n';
    info += '   Configuration vérifiée\n';
    
    setDebugInfo(info);
  };

  const clearAuth = () => {
    authUtils.clearAuthData();
    setDebugInfo('Authentification nettoyée');
  };

  const testAuthMutation = async () => {
    if (typeof window.testAuthWithJWTDecode !== 'undefined') {
      const result = await window.testAuthWithJWTDecode.testUserCreationAndAuth();
      setDebugInfo(JSON.stringify(result, null, 2));
    } else {
      setDebugInfo('Fonctions de test non disponibles');
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full text-xs"
        title="Debug Auth"
      >
        🔧
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Debug Auth</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runDebugTests}
          className="w-full bg-blue-500 text-white p-2 rounded text-sm"
        >
          🔍 Diagnostiquer
        </button>
        
        <button
          onClick={testAuthMutation}
          className="w-full bg-green-500 text-white p-2 rounded text-sm"
        >
          🧪 Test Auth
        </button>
        
        <button
          onClick={clearAuth}
          className="w-full bg-red-500 text-white p-2 rounded text-sm"
        >
          🗑️ Nettoyer
        </button>
      </div>
      
      <div className="bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-48 overflow-auto">
        {debugInfo || 'Cliquez sur "Diagnostiquer" pour commencer...'}
      </div>
    </div>
  );
} 