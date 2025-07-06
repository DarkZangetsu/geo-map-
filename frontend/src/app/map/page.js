"use client";
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_MY_PARCELLES } from '../../lib/graphql-queries';
import ParcellesMap from '../../components/ParcellesMap';
import { useState } from 'react';

export default function MapPage() {
  const router = useRouter();
  const { data, loading } = useQuery(GET_MY_PARCELLES);
  const [mapStyle, setMapStyle] = useState('street');
  const parcelles = data?.myParcelles || [];

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '0 0 auto', padding: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => router.back()}
          style={{ padding: '8px 16px', background: '#eee', borderRadius: 6 }}
        >
          ← Retour
        </button>
        <h1 style={{ fontWeight: 'bold', fontSize: 20 }}>Carte de mes parcelles</h1>
        <select
          value={mapStyle}
          onChange={e => setMapStyle(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="street">Carte routière</option>
          <option value="satellite">Satellite</option>
          <option value="hybrid">Hybride</option>
        </select>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Chargement de la carte...</div>
        ) : (
          <div style={{ height: '100%', width: '100%' }}>
            <ParcellesMap
              parcelles={parcelles}
              mapStyle={mapStyle}
              onParcelleClick={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
} 