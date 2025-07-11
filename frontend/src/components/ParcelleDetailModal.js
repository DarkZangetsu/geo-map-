'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PARCELLE } from '../lib/graphql-queries';

const ParcelleDetailModal = ({ parcelle, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');

  // Charger les données complètes de la parcelle
  const { data: parcelleData, loading: parcelleLoading, error: parcelleError } = useQuery(GET_PARCELLE, {
    variables: { id: parcelle?.id },
    skip: !parcelle?.id,
    fetchPolicy: 'cache-and-network'
  });

  // Debug
  console.log('ParcelleDetailModal - parcelle:', parcelle);
  console.log('ParcelleDetailModal - parcelleData:', parcelleData);
  console.log('ParcelleDetailModal - parcelleLoading:', parcelleLoading);
  console.log('ParcelleDetailModal - parcelleError:', parcelleError);

  // Utiliser les données complètes si disponibles, sinon les données de base
  const parcelleComplete = parcelleData?.parcelle || parcelle;

  if (!parcelle) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDecimal = (value) => {
    if (!value) return '-';
    return `${value}`;
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40" onClick={onClose}></div>
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50">
          {/* Test visuel */}
          {/* <div style={{background: 'red', color: 'white', padding: 8}}>TEST MODAL</div> */}
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Détails de la parcelle : {parcelleComplete?.nom || '-'}
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
            {parcelleLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Chargement des détails...</span>
              </div>
            )}

            {/* Error state */}
            {parcelleError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800 text-sm">
                  Erreur lors du chargement des détails : {parcelleError.message}
                </p>
              </div>
            )}

            {/* Content */}
            {!parcelleLoading && !parcelleError && (
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
                      onClick={() => setActiveTab('photos')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'photos'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Photos ({Array.isArray(parcelleComplete?.images) ? parcelleComplete.images.length : 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('geometrie')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'geometrie'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Géométrie
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
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nom</dt>
                            <dd className="text-sm text-gray-900">{parcelleComplete?.nom || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Culture</dt>
                            <dd className="text-sm text-gray-900">{parcelleComplete?.culture || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Propriétaire</dt>
                            <dd className="text-sm text-gray-900">{parcelleComplete?.proprietaire || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Superficie</dt>
                            <dd className="text-sm text-gray-900">{formatDecimal(parcelleComplete?.superficie)} ha</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Variété</dt>
                            <dd className="text-sm text-gray-900">{parcelleComplete?.variete || '-'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Informations techniques */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Informations techniques</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Date de semis</dt>
                            <dd className="text-sm text-gray-900">{formatDate(parcelleComplete?.dateSemis)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Date de récolte prévue</dt>
                            <dd className="text-sm text-gray-900">{formatDate(parcelleComplete?.dateRecoltePrevue)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Type de sol</dt>
                            <dd className="text-sm text-gray-900">{parcelleComplete?.typeSol || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Irrigation</dt>
                            <dd className="text-sm text-gray-900">
                              {typeof parcelleComplete?.irrigation === 'boolean'
                                ? parcelleComplete.irrigation ? 'Oui' : 'Non'
                                : '-'}
                              {parcelleComplete?.irrigation && parcelleComplete?.typeIrrigation && ` (${parcelleComplete.typeIrrigation})`}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Rendement prévu</dt>
                            <dd className="text-sm text-gray-900">{formatDecimal(parcelleComplete?.rendementPrevue)} t/ha</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Coût de production</dt>
                            <dd className="text-sm text-gray-900">{formatCurrency(parcelleComplete?.coutProduction)}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Certifications */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Certifications</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Bio:</span>
                            {typeof parcelleComplete?.certificationBio === 'boolean' ? (
                              parcelleComplete.certificationBio ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Certifié</span>
                              ) : (
                                <span className="text-sm text-gray-900">Non certifié</span>
                              )
                            ) : (
                              <span className="text-sm text-gray-900">-</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">HVE:</span>
                            {typeof parcelleComplete?.certificationHve === 'boolean' ? (
                              parcelleComplete.certificationHve ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Certifié</span>
                              ) : (
                                <span className="text-sm text-gray-900">Non certifié</span>
                              )
                            ) : (
                              <span className="text-sm text-gray-900">-</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informations utilisateur */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Membre</h4>
                        <div className="flex items-center gap-3">
                          {parcelleComplete?.user?.logo && (
                            <img
                              src={`http://localhost:8000${parcelleComplete.user.logo}`}
                              alt="Logo"
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {parcelleComplete?.user?.firstName || '-'} {parcelleComplete?.user?.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-500">{parcelleComplete?.user?.username || '-'}</div>
                            <div className="text-sm text-gray-500">{parcelleComplete?.user?.email || '-'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {parcelleComplete?.notes && typeof parcelleComplete.notes === 'string' && (
                        <div className="md:col-span-2">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Notes</h4>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                            {parcelleComplete.notes}
                          </p>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="md:col-span-2">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Dates</h4>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Créé le</dt>
                            <dd className="text-sm text-gray-900">{formatDate(parcelleComplete?.createdAt)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Modifié le</dt>
                            <dd className="text-sm text-gray-900">{formatDate(parcelleComplete?.updatedAt)}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  )}

                  {activeTab === 'photos' && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Photos de la parcelle</h4>
                      {Array.isArray(parcelleComplete?.images) && parcelleComplete.images.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {parcelleComplete.images.map((image, index) => (
                            <div key={image.id} className="relative">
                              <img
                                src={`http://localhost:8000${image.image}`}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                Photo {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">Aucune photo disponible</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'geometrie' && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Géométrie de la parcelle</h4>
                      {parcelleComplete?.geojson ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-md">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Données GeoJSON</h5>
                            <pre className="text-xs text-gray-600 overflow-x-auto">
                              {typeof parcelleComplete.geojson === 'object'
                                ? JSON.stringify(parcelleComplete.geojson, null, 2)
                                : parcelleComplete.geojson}
                            </pre>
                          </div>
                          {/* Affichage des coordonnées principales */}
                          {parcelleComplete.geojson && typeof parcelleComplete.geojson === 'object' &&
                            Array.isArray(parcelleComplete.geojson.features) &&
                            parcelleComplete.geojson.features.length > 0 &&
                            Array.isArray(parcelleComplete.geojson.features[0].geometry?.coordinates) && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Coordonnées principales</h5>
                                <div className="bg-gray-50 p-4 rounded-md">
                                  {parcelleComplete.geojson.features[0].geometry.coordinates[0].map((coord, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                      Point {index + 1}: {Array.isArray(coord) && coord.length === 2 ? `${coord[1].toFixed(6)}, ${coord[0].toFixed(6)}` : JSON.stringify(coord)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">Aucune géométrie disponible</p>
                      )}
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

export default ParcelleDetailModal; 