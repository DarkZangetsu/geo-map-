"use client";
import dynamic from 'next/dynamic';
import ParcellesMap from '../../components/ParcellesMap';

// Données factices pour la démo (à remplacer par vos vraies données)
const parcelles = [];

export default function TestMap() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#fff',
      zIndex: 1
    }}>
      <ParcellesMap parcelles={parcelles} />
    </div>
  );
} 