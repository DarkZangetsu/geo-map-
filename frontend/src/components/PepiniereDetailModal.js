'use client';

import { X, MapPin, User, Phone, Mail, Leaf, Calendar, Building } from 'lucide-react';

export default function PepiniereDetailModal({ pepiniere, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header avec dégradé subtil */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b border-gray-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <Building className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {pepiniere.nom}
                </h2>
                <p className="text-sm text-gray-500 font-medium">Détails de la pépinière</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-8 py-6">
          <div className="space-y-8">
            
            {/* Section Informations principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Informations générales */}
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Informations générales
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">Adresse</p>
                      <p className="text-sm text-gray-600 mt-1">{pepiniere.adresse}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {pepiniere.latitude}, {pepiniere.longitude}
                      </p>
                    </div>
                  </div>
                  
                  {pepiniere.nomProjet && (
                    <div className="p-3 bg-white/60 rounded-xl">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Nom du projet</p>
                      <p className="text-sm text-gray-600">{pepiniere.nomProjet}</p>
                    </div>
                  )}
                  
                  {pepiniere.description && (
                    <div className="p-3 bg-white/60 rounded-xl">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Description</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{pepiniere.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gestionnaire */}
              <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Gestionnaire
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Nom</p>
                      <p className="text-sm text-gray-600">{pepiniere.nomGestionnaire || 'Non défini'}</p>
                    </div>
                  </div>
                  
                  {pepiniere.posteGestionnaire && (
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Building className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Poste</p>
                        <p className="text-sm text-gray-600">{pepiniere.posteGestionnaire}</p>
                      </div>
                    </div>
                  )}
                  
                  {pepiniere.telephoneGestionnaire && (
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Phone className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Téléphone</p>
                        <p className="text-sm text-gray-600">{pepiniere.telephoneGestionnaire}</p>
                      </div>
                    </div>
                  )}
                  
                  {pepiniere.emailGestionnaire && (
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Mail className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Email</p>
                        <p className="text-sm text-gray-600">{pepiniere.emailGestionnaire}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Production */}
            <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/50 rounded-2xl p-6 border border-emerald-100/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Production
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-xl p-5 border border-emerald-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Espèces produites</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {pepiniere.especesProduites || 'Non définies'}
                  </p>
                </div>
                
                <div className="bg-white/60 rounded-xl p-5 border border-emerald-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Production générale</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {pepiniere.quantiteProductionGenerale || 'Non définie'}
                  </p>
                </div>
              </div>
            </div>

            {/* Photos */}
            {pepiniere.photos && pepiniere.photos.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-2xl p-6 border border-orange-100/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Galerie photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pepiniere.photos.map((photo, index) => (
                    <div key={photo.id} className="group relative">
                      <div className="relative overflow-hidden rounded-xl bg-white/60 p-2">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/media/${photo.image}`}
                          alt={photo.titre || `Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      {photo.titre && (
                        <p className="text-xs text-gray-600 mt-2 text-center font-medium">{photo.titre}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations système */}
            <div className="bg-gradient-to-br from-slate-50/50 to-gray-50/50 rounded-2xl p-6 border border-slate-100/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                Informations système
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 rounded-xl">
                  <p className="text-sm font-semibold text-gray-800">Date de création</p>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(pepiniere.createdAt)}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl">
                  <p className="text-sm font-semibold text-gray-800">Dernière modification</p>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(pepiniere.updatedAt)}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}