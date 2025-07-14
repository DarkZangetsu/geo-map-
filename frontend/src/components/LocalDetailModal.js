import { X, MapPin, User, Image as ImageIcon, Calendar, Building } from 'lucide-react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

export default function LocalDetailModal({ siege, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border border-gray-200 rounded-2xl m-4 max-w-[440px] transition-all duration-300 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header fixé */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{siege.nom}</h2>
              <p className="text-sm text-gray-600">Détails du local</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                      <p className="text-sm text-gray-600">{siege.adresse || 'Non renseignée'}</p>
                      <p className="text-xs text-gray-500">
                        Coordonnées: {siege.latitude}, {siege.longitude}
                      </p>
                    </div>
                  </div>
                  {siege.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Description</p>
                      <p className="text-sm text-gray-600">{siege.description}</p>
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
                      <p className="text-sm text-gray-600">{siege.nomPointContact || 'Non défini'}</p>
                    </div>
                  </div>
                  {siege.user && siege.user.logo && (
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                      <img src={`http://localhost:8000${siege.user.logo}`} alt="Logo" className="w-10 h-10 rounded-full border" />
                    </div>
                  )}
                  {siege.poste && (
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Poste</p>
                        <p className="text-sm text-gray-600">{siege.poste}</p>
                      </div>
                    </div>
                  )}
                  {siege.telephone && (
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 text-gray-400">📞</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Téléphone</p>
                        <p className="text-sm text-gray-600">{siege.telephone}</p>
                      </div>
                    </div>
                  )}
                  {siege.email && (
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 text-gray-400">✉️</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{siege.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Catégorie et horaires */}
          <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900">Catégorie</div>
              <div className="text-sm text-gray-600">{siege.categorie || 'Non définie'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900">Horaires</div>
              <div className="text-sm text-gray-600">Matin : {siege.horaireMatin || '-'}</div>
              <div className="text-sm text-gray-600">Après-midi : {siege.horaireApresMidi || '-'}</div>
            </div>
          </div>

          {/* Dates */}
          <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <Calendar className="h-5 w-5 text-green-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Date de création</div>
              <div className="text-sm text-gray-600">{formatDate(siege.createdAt)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <Calendar className="h-5 w-5 text-green-800 mb-2" />
              <div className="text-sm font-medium text-gray-900">Dernière modification</div>
              <div className="text-sm text-gray-600">{formatDate(siege.updatedAt)}</div>
            </div>
          </div>

          {/* Galerie d'images */}
          {Array.isArray(siege.photosBatiment) && siege.photosBatiment.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Galerie d'images</h3>
              <ImageGallery
                items={siege.photosBatiment.map((img, idx) => ({
                  original: `http://localhost:8000/media/${img.image}`,
                  thumbnail: `http://localhost:8000/media/${img.image}`,
                  description: img.titre || `Image ${idx + 1}`
                }))}
                showPlayButton={false}
                showFullscreenButton={true}
                showNav={true}
                showThumbnails={true}
                slideInterval={3000}
                slideOnThumbnailOver={true}
                additionalClass="custom-gallery"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 