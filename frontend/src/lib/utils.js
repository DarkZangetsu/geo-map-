import { jwtDecode } from 'jwt-decode';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Fonction pour normaliser les rôles (gérer majuscules/minuscules)
export const isAdmin = (role) => {
  return role === 'ADMIN' || role === 'admin';
};

export const isMember = (role) => {
  return role === 'MEMBRE' || role === 'membre' || role === 'MEMBER' || role === 'member';
};

// Utilitaires pour l'authentification
export const authUtils = {
  // Stocker le token et les données utilisateur
  setAuthData: (token, user) => {
    if (typeof token !== 'string' || !token.trim()) {
      console.error('setAuthData appelé avec un token non string:', token);
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Données d\'authentification stockées');
      
      // Décoder et afficher les informations du token
      try {
        const decoded = jwtDecode(token);
        console.log('Token décodé:', decoded);
        console.log('Expiration:', new Date(decoded.exp * 1000).toLocaleString());
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
      }
    }
  },

  // Récupérer le token
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Récupérer les données utilisateur
  getUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Erreur lors du parsing des données utilisateur:', error);
          return null;
        }
      }
    }
    return null;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = authUtils.getToken();
    const user = authUtils.getUser();
    return !!(token && user && !authUtils.isTokenExpired(token));
  },

  // Nettoyer les données d'authentification
  clearAuthData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Données d\'authentification supprimées');
    }
  },

  // Vérifier si le token est expiré avec jwt-decode
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      console.log('Vérification du token:');
      console.log('  - Expiration:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('  - Temps actuel:', new Date(currentTime * 1000).toLocaleString());
      console.log('  - Expiré:', decoded.exp < currentTime);
      
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true;
    }
  },

  // Décoder et afficher les informations du token
  decodeToken: (token) => {
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      console.log('Token décodé:', decoded);
      return decoded;
    } catch (error) {
      console.error('Erreur lors du décodage:', error);
      return null;
    }
  },

  // Vérifier la validité du token
  validateToken: (token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.log('Aucun token fourni ou token non valide');
      return false;
    }
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      console.log('Validation du token:');
      console.log('  - Payload:', decoded);
      console.log('  - Expiration:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('  - Temps actuel:', new Date(currentTime * 1000).toLocaleString());
      console.log('  - Valide:', decoded.exp > currentTime);
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Token invalide:', error);
      return false;
    }
  }
};

// Utilitaires pour les dates
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR');
};

// Utilitaires pour les nombres
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '';
  return Number(number).toFixed(decimals);
};

// Fonction pour valider les emails
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction pour nettoyer les données de formulaire
export const cleanFormData = (data) => {
  const cleaned = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
}; 