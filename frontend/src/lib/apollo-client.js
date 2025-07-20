import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { jwtDecode } from 'jwt-decode';

// Créer le lien d'upload pour les fichiers
const uploadLink = createUploadLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql/`,
});

// Lien d'authentification
const authLink = setContext((_, { headers }) => {
  // Récupérer le token depuis localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  console.log('Apollo Client - Token récupéré:', token ? 'Token présent' : 'Aucun token');
  
  // Vérifier la validité du token si présent
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        console.log('Apollo Client - Token expiré, nettoyage...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return {
          headers: {
            ...headers,
            authorization: '',
          }
        };
      }
      
      console.log('Apollo Client - Token valide, expiration:', new Date(decoded.exp * 1000).toLocaleString());
    } catch (error) {
      console.error('Apollo Client - Erreur lors du décodage du token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        headers: {
          ...headers,
          authorization: '',
        }
      };
    }
  }
  
  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : '',
    }
  };
});

// Lien de gestion d'erreur
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Si l'erreur est liée à l'authentification, déconnecter l'utilisateur
      if (extensions?.code === 'UNAUTHENTICATED' || 
          message.includes('authentication') || 
          message.includes('decoding signature') ||
          message.includes('token') ||
          message.includes('expired')) {
        console.log('Token expiré ou invalide, redirection vers login...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Rediriger vers la page de login au lieu de recharger
          window.location.href = '/';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Gérer les erreurs réseau liées à l'authentification
    if (networkError.statusCode === 401) {
      console.log('Erreur 401 - Token invalide, redirection vers login...');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
  }
});

// Créer le client Apollo avec tous les liens
const client = new ApolloClient({
  link: from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client; 