// Script de débogage pour l'authentification
export const debugAuth = () => {
  console.log('=== DÉBOGAGE AUTHENTIFICATION ===');
  
  // Vérifier localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('Token dans localStorage:', token ? 'Présent' : 'Absent');
  console.log('User dans localStorage:', user ? 'Présent' : 'Absent');
  
  if (token) {
    try {
      const decoded = require('jwt-decode').jwtDecode(token);
      console.log('Token décodé:', decoded);
      console.log('Expiration:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('Expiré:', decoded.exp < Date.now() / 1000);
    } catch (error) {
      console.error('Erreur décodage token:', error);
    }
  }
  
  if (user) {
    try {
      const userObj = JSON.parse(user);
      console.log('Données utilisateur:', userObj);
    } catch (error) {
      console.error('Erreur parsing user:', error);
    }
  }
  
  console.log('=== FIN DÉBOGAGE ===');
};

// Fonction pour forcer la reconnexion
export const forceReconnect = async () => {
  console.log('Forçage de la reconnexion...');
  
  // Nettoyer localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Recharger la page
  window.location.reload();
};

// Fonction pour tester la requête GraphQL
export const testGraphQLQuery = async (client) => {
  console.log('Test de requête GraphQL...');
  
  try {
    const { data } = await client.query({
      query: require('./graphql-queries').GET_ME,
      fetchPolicy: 'network-only'
    });
    
    console.log('Résultat GET_ME:', data);
    return data;
  } catch (error) {
    console.error('Erreur requête GraphQL:', error);
    return null;
  }
}; 