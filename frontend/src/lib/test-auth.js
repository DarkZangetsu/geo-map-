// Script de test d'authentification avec jwt-decode
import { jwtDecode } from 'jwt-decode';
import client from './apollo-client';
import { gql } from '@apollo/client';

export const testAuthWithJWTDecode = {
  // Test de décodage d'un token
  testTokenDecode: (token) => {
    console.log('=== Test de décodage de token ===');
    
    if (!token) {
      console.log('❌ Aucun token fourni');
      return false;
    }
    
    try {
      const decoded = jwtDecode(token);
      console.log('✅ Token décodé avec succès');
      console.log('Payload:', decoded);
      
      // Vérifier les champs requis
      if (!decoded.exp) {
        console.log('❌ Token sans expiration');
        return false;
      }
      
      if (!decoded.user_id) {
        console.log('❌ Token sans user_id');
        return false;
      }
      
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp < currentTime;
      
      console.log('Expiration:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('Temps actuel:', new Date(currentTime * 1000).toLocaleString());
      console.log('Expiré:', isExpired);
      
      return !isExpired;
    } catch (error) {
      console.error('❌ Erreur lors du décodage:', error);
      return false;
    }
  },

  // Test de la mutation d'authentification
  testAuthMutation: async (username, password) => {
    console.log('\n=== Test de la mutation d\'authentification ===');
    
    const mutation = gql`
      mutation TokenAuthWithUser($username: String!, $password: String!) {
        tokenAuthWithUser(username: $username, password: $password) {
          token
          refreshToken
          user {
            id
            username
            email
            firstName
            lastName
            role
          }
          success
          message
        }
      }
    `;
    
    try {
      const { data } = await client.mutate({
        mutation,
        variables: { username, password }
      });
      
      console.log('Réponse de la mutation:', data);
      
      if (data.tokenAuthWithUser.success) {
        const { token, user } = data.tokenAuthWithUser;
        
        console.log('✅ Authentification réussie');
        console.log('Token reçu:', token ? 'Oui' : 'Non');
        console.log('Utilisateur:', user);
        
        // Tester le décodage du token reçu
        const tokenValid = testAuthWithJWTDecode.testTokenDecode(token);
        
        if (tokenValid) {
          console.log('✅ Token valide et décodable');
          return { success: true, token, user };
        } else {
          console.log('❌ Token invalide ou non décodable');
          return { success: false, error: 'Token invalide' };
        }
      } else {
        console.log('❌ Échec de l\'authentification:', data.tokenAuthWithUser.message);
        return { success: false, error: data.tokenAuthWithUser.message };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mutation:', error);
      return { success: false, error: error.message };
    }
  },

  // Test de la query me avec token
  testMeQuery: async (token) => {
    console.log('\n=== Test de la query me ===');
    
    if (!token) {
      console.log('❌ Aucun token fourni');
      return false;
    }
    
    // Vérifier d'abord la validité du token
    if (!testAuthWithJWTDecode.testTokenDecode(token)) {
      console.log('❌ Token invalide');
      return false;
    }
    
    const query = gql`
      query GetMe {
        me {
          id
          username
          email
          firstName
          lastName
          role
        }
      }
    `;
    
    try {
      const { data } = await client.query({
        query,
        fetchPolicy: 'network-only'
      });
      
      console.log('✅ Query me réussie');
      console.log('Données utilisateur:', data.me);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la query me:', error);
      return false;
    }
  },

  // Test complet d'authentification
  runFullTest: async () => {
    console.log('🔍 Test complet d\'authentification avec jwt-decode\n');
    
    // Test 1: Token existant dans localStorage
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      console.log('Test du token existant...');
      testAuthWithJWTDecode.testTokenDecode(existingToken);
    }
    
    // Test 2: Mutation d'authentification
    const authResult = await testAuthWithJWTDecode.testAuthMutation('testuser', 'testpass123');
    
    if (authResult.success) {
      // Test 3: Query me avec le nouveau token
      await testAuthWithJWTDecode.testMeQuery(authResult.token);
    }
    
    console.log('\n🎯 Test complet terminé');
    return authResult;
  },

  // Test de création d'utilisateur et authentification
  testUserCreationAndAuth: async () => {
    console.log('🔍 Test de création d\'utilisateur et authentification\n');
    
    const createUserMutation = gql`
      mutation CreateUser($username: String!, $email: String!, $password: String!, $firstName: String, $lastName: String, $role: String) {
        createUser(username: $username, email: $email, password: $password, firstName: $firstName, lastName: $lastName, role: $role) {
          success
          message
          user {
            id
            username
            email
            firstName
            lastName
            role
          }
        }
      }
    `;
    
    const testUser = {
      username: 'jwtuser',
      email: 'jwt@test.com',
      password: 'jwtpass123',
      firstName: 'JWT',
      lastName: 'User',
      role: 'membre'
    };
    
    try {
      // Créer l'utilisateur
      console.log('Création de l\'utilisateur...');
      const { data: createData } = await client.mutate({
        mutation: createUserMutation,
        variables: testUser
      });
      
      if (createData.createUser.success) {
        console.log('✅ Utilisateur créé:', createData.createUser.user);
        
        // Authentifier l'utilisateur
        const authResult = await testAuthWithJWTDecode.testAuthMutation(testUser.username, testUser.password);
        return authResult;
      } else {
        console.log('❌ Échec de la création:', createData.createUser.message);
        return { success: false, error: createData.createUser.message };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      return { success: false, error: error.message };
    }
  }
};

// Fonctions utilitaires pour le débogage
export const debugToken = (token) => {
  if (!token) {
    console.log('Aucun token fourni');
    return;
  }
  
  try {
    const decoded = jwtDecode(token);
    console.log('=== Décodage du token ===');
    console.log('Token complet:', token);
    console.log('Payload décodé:', decoded);
    console.log('Expiration:', new Date(decoded.exp * 1000).toLocaleString());
    console.log('Utilisateur ID:', decoded.user_id);
    console.log('Algorithme:', decoded.alg);
    console.log('Type:', decoded.typ);
  } catch (error) {
    console.error('Erreur lors du décodage:', error);
  }
};

// Exporter pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.testAuthWithJWTDecode = testAuthWithJWTDecode;
  window.debugToken = debugToken;
  console.log('Fonctions de test disponibles:');
  console.log('- window.testAuthWithJWTDecode.runFullTest()');
  console.log('- window.testAuthWithJWTDecode.testUserCreationAndAuth()');
  console.log('- window.debugToken(token)');
} 