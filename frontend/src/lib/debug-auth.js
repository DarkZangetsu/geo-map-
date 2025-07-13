// Script de débogage pour l'authentification
import { gql } from '@apollo/client';
import { authUtils } from './utils';

export function debugAuth() {
  console.log('=== DÉBOGAGE AUTHENTIFICATION ===');
  
  // Vérifier le token
  const token = authUtils.getToken();
  console.log('Token présent:', !!token);
  if (token) {
    console.log('Token:', token.substring(0, 50) + '...');
    const decoded = authUtils.decodeToken(token);
    console.log('Token décodé:', decoded);
    console.log('Token expiré:', authUtils.isTokenExpired(token));
  }
  
  // Vérifier l'utilisateur
  const user = authUtils.getUser();
  console.log('Utilisateur présent:', !!user);
  if (user) {
    console.log('Données utilisateur:', user);
  }
  
  // Vérifier l'état d'authentification
  const isAuth = authUtils.isAuthenticated();
  console.log('Authentifié:', isAuth);
  
  // Vérifier localStorage
  if (typeof window !== 'undefined') {
    console.log('localStorage token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
    console.log('localStorage user:', localStorage.getItem('user') ? 'Présent' : 'Absent');
  }
  
  console.log('=== FIN DÉBOGAGE ===');
}

// Fonction pour tester la requête GET_ME
export async function testGetMe(client) {
  console.log('=== TEST GET_ME ===');
  
  try {
    const { data, loading, error } = await client.query({
      query: gql`
        query GetMe {
          me {
            id
            username
            email
            firstName
            lastName
            role
            logo
            abreviation
          }
        }
      `,
      fetchPolicy: 'network-only'
    });
    
    console.log('GET_ME résultat:', { data, loading, error });
    return { data, loading, error };
  } catch (error) {
    console.error('Erreur GET_ME:', error);
    return { error };
  }
} 