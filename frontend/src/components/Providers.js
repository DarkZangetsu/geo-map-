 'use client';

import { ApolloProvider } from '@apollo/client';
import { useEffect } from 'react';
import client from '../lib/apollo-client';

export default function Providers({ children }) {
  useEffect(() => {
    // Charger le CSS Leaflet côté client
    import('leaflet/dist/leaflet.css');
  }, []);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 