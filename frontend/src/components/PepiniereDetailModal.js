'use client';

import { X, MapPin, User, Phone, Mail, Leaf, Calendar, Building } from 'lucide-react';

export default function PepiniereDetailModal({ pepiniere, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{pepiniere.nom}</h2>
              <p className="text-sm text-gray-600">Détails de la pépinière</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Adresse</p>
                      <p className="text-sm text-gray-600">{pepiniere.adresse}</p>
                      <p className="text-xs text-gray-500">
                        Coordonnées: {pepiniere.latitude}, {pepiniere.longitude}
                      </p>
                    </div>
                  </div>
                  
                  {pepiniere.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Description</p>
                      <p className="text-sm text-gray-600">{pepiniere.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gestionnaire</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nom</p>
                      <p className="text-sm text-gray-600">{pepiniere.nomGestionnaire || 'Non défini'}</p>
                    </div>
                  </div>
                  
                  {pepiniere.posteGestionnaire && (
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Poste</p>
                        <p className="text-sm text-gray-600">{pepiniere.posteGestionnaire}</p>
                      </div>
                    </div>
                  )}
                  
                  {pepiniere.telephoneGestionnaire && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Téléphone</p>
                        <p className="text-sm text-gray-600">{pepiniere.telephoneGestionnaire}</p>
                      </div>
                    </div>
                  )}
                  
                  {pepiniere.emailGestionnaire && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{pepiniere.emailGestionnaire}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Production */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Production</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Espèces produites</span>
                </div>
                <p className="text-sm text-gray-600">
                  {pepiniere.especesProduites || 'Non définies'}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Capacité</span>
                </div>
                <p className="text-sm text-gray-600">
                  {pepiniere.capacite ? `${pepiniere.capacite} plants` : 'Non définie'}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Production générale</span>
                </div>
                <p className="text-sm text-gray-600">
                  {pepiniere.quantiteProductionGenerale || 'Non définie'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations système */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Date de création</p>
                <p className="text-gray-600">{formatDate(pepiniere.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Dernière modification</p>
                <p className="text-gray-600">{formatDate(pepiniere.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Photos */}
          {pepiniere.photos && pepiniere.photos.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pepiniere.photos.map((photo, index) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={`http://localhost:8000/media/${photo.image}`}
                      alt={photo.titre || `Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {photo.titre && (
                      <p className="text-xs text-gray-600 mt-1">{photo.titre}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
} 