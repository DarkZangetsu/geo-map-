'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SIEGE } from '../lib/graphql-queries';

const SiegeDetailModal = ({ siege, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');

  // Charger les données complètes du siège
  const { data: siegeData, loading: siegeLoading, error: siegeError } = useQuery(GET_SIEGE, {
    variables: { id: siege?.id },
    skip: !siege?.id,
    fetchPolicy: 'cache-and-network'
  });

  // Debug
  console.log('SiegeDetailModal - siege:', siege);
  console.log('SiegeDetailModal - siegeData:', siegeData);
  console.log('SiegeDetailModal - siegeLoading:', siegeLoading);
  console.log('SiegeDetailModal - siegeError:', siegeError);

  // Utiliser les données complètes si disponibles, sinon les données de base
  const siegeComplete = siegeData?.siege || siege;

  if (!siege) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${siegeComplete?.latitude},${siegeComplete?.longitude}`;
    window.open(url, '_blank');
  };

  const openOpenStreetMap = () => {
    const url = `https://www.openstreetmap.org/?mlat=${siegeComplete?.latitude}&mlon=${siegeComplete?.longitude}&zoom=15`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Détails du siège : {siegeComplete?.nom || '-'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Loading state */}
            {siegeLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Chargement des détails...</span>
              </div>
            )}

            {/* Error state */}
            {siegeError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800 text-sm">
                  Erreur lors du chargement des détails : {siegeError.message}
                </p>
              </div>
            )}

            {/* Content */}
            {!siegeLoading && !siegeError && (
              <>
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'info'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Informations
                    </button>
                    <button
                      onClick={() => setActiveTab('localisation')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'localisation'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Localisation
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="max-h-96 overflow-y-auto">
                  {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informations de base */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Informations de base</h4>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nom</dt>
                            <dd className="text-sm text-gray-900 font-medium">{siegeComplete?.nom || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                            <dd className="text-sm text-gray-900">{siegeComplete?.adresse || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="text-sm text-gray-900">
                              {typeof siegeComplete?.description === 'string' && siegeComplete.description.trim() !== ''
                                ? siegeComplete.description
                                : 'Aucune description disponible'}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {/* Informations utilisateur */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Membre</h4>
                        <div className="flex items-center gap-3">
                          {siegeComplete?.user?.logo && (
                            <img
                              src={`http://localhost:8000${siegeComplete.user.logo}`}
                              alt="Logo"
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {siegeComplete?.user?.firstName || '-'} {siegeComplete?.user?.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-500">{siegeComplete?.user?.username || '-'}</div>
                            <div className="text-sm text-gray-500">{siegeComplete?.user?.email || '-'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Coordonnées */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Coordonnées géographiques</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Latitude</dt>
                            <dd className="text-sm text-gray-900 font-mono">{typeof siegeComplete?.latitude === 'number' ? siegeComplete.latitude : '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Longitude</dt>
                            <dd className="text-sm text-gray-900 font-mono">{typeof siegeComplete?.longitude === 'number' ? siegeComplete.longitude : '-'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Dates */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Dates</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Créé le</dt>
                            <dd className="text-sm text-gray-900">{formatDate(siegeComplete?.createdAt)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Modifié le</dt>
                            <dd className="text-sm text-gray-900">{formatDate(siegeComplete?.updatedAt)}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Actions rapides */}
                      <div className="md:col-span-2">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Actions rapides</h4>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={openGoogleMaps}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Voir sur Google Maps
                          </button>
                          <button
                            onClick={openOpenStreetMap}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Voir sur OpenStreetMap
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'localisation' && (
                    <div className="space-y-6">
                      {/* Carte intégrée */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Carte interactive</h4>
                        <div className="bg-gray-100 rounded-lg p-4">
                          {typeof siegeComplete?.latitude === 'number' && typeof siegeComplete?.longitude === 'number' ? (
                            <iframe
                              width="100%"
                              height="300"
                              frameBorder="0"
                              scrolling="no"
                              marginHeight="0"
                              marginWidth="0"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${siegeComplete.longitude-0.01},${siegeComplete.latitude-0.01},${siegeComplete.longitude+0.01},${siegeComplete.latitude+0.01}&layer=mapnik&marker=${siegeComplete.latitude},${siegeComplete.longitude}`}
                              title="Carte du siège"
                            ></iframe>
                          ) : (
                            <div className="text-gray-500">Coordonnées non disponibles</div>
                          )}
                        </div>
                      </div>

                      {/* Coordonnées détaillées */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Coordonnées détaillées</h4>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Latitude (WGS84)</dt>
                              <dd className="text-sm text-gray-900 font-mono">{typeof siegeComplete?.latitude === 'number' ? siegeComplete.latitude : '-'}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Longitude (WGS84)</dt>
                              <dd className="text-sm text-gray-900 font-mono">{typeof siegeComplete?.longitude === 'number' ? siegeComplete.longitude : '-'}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Format décimal</dt>
                              <dd className="text-sm text-gray-900 font-mono">
                                {typeof siegeComplete?.latitude === 'number' && typeof siegeComplete?.longitude === 'number'
                                  ? `${siegeComplete.latitude}, ${siegeComplete.longitude}`
                                  : '-'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Format GPS</dt>
                              <dd className="text-sm text-gray-900 font-mono">
                                {typeof siegeComplete?.latitude === 'number' && typeof siegeComplete?.longitude === 'number'
                                  ? `${Math.abs(siegeComplete.latitude).toFixed(6)}° ${siegeComplete.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(siegeComplete.longitude).toFixed(6)}° ${siegeComplete.longitude >= 0 ? 'E' : 'W'}`
                                  : '-'}
                              </dd>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Liens externes */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Liens externes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {typeof siegeComplete?.latitude === 'number' && typeof siegeComplete?.longitude === 'number' ? (
                            <>
                              <a
                                href={`https://www.google.com/maps?q=${siegeComplete.latitude},${siegeComplete.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                              >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                Google Maps
                              </a>
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${siegeComplete.latitude}&mlon=${siegeComplete.longitude}&zoom=15`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                OpenStreetMap
                              </a>
                              <a
                                href={`https://www.bing.com/maps?cp=${siegeComplete.latitude}~${siegeComplete.longitude}&lvl=15`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                Bing Maps
                              </a>
                              <a
                                href={`https://maps.apple.com/?q=${siegeComplete.latitude},${siegeComplete.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                Apple Maps
                              </a>
                            </>
                          ) : (
                            <div className="text-gray-500">Coordonnées non disponibles</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiegeDetailModal; 