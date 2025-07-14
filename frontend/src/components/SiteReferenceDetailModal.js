import { X, MapPin, User, Image as ImageIcon, Calendar, Leaf, Phone, Mail, ClipboardList, Euro, CheckCircle, AlertCircle } from 'lucide-react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

export default function SiteReferenceDetailModal({ parcelle, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  const formatDecimal = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return value;
  };
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border border-gray-200 rounded-2xl m-4 max-w-[440px] transition-all duration-300 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header fixé */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{parcelle.nom}</h2>
              <p className="text-sm text-gray-600">Détails du site de référence</p>
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
          {/* Section générale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-gray-900">Culture :</span>
                    <span className="text-gray-700">{parcelle.culture}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Propriétaire :</span>
                    <span className="text-gray-700">{parcelle.proprietaire}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Adresse :</span>
                    <span className="text-gray-700">{parcelle.adresse || 'Non renseignée'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Superficie :</span>
                    <span className="text-gray-700">{formatDecimal(parcelle.superficie)} ha</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-gray-900">Variété :</span>
                    <span className="text-gray-700">{parcelle.variete || '-'}</span>
                  </div>
                  {parcelle.description && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      <span className="font-medium text-gray-900">Description :</span>
                      <span className="text-gray-700">{parcelle.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Personne référente */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personne référente</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-gray-900">Nom :</span>
                    <span className="text-gray-700">{parcelle.nomPersonneReferente || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Poste :</span>
                    <span className="text-gray-700">{parcelle.poste || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Téléphone :</span>
                    <span className="text-gray-700">{parcelle.telephone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Email :</span>
                    <span className="text-gray-700">{parcelle.email || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section technique */}
          <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-400" />
                <span className="font-medium text-gray-900">Type de sol :</span>
                <span className="text-gray-700">{parcelle.typeSol || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-gray-900">Irrigation :</span>
                <span className="text-gray-700">{parcelle.irrigation ? 'Oui' : 'Non'}</span>
              </div>
              {parcelle.irrigation && (
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-400" />
                  <span className="font-medium text-gray-900">Type d'irrigation :</span>
                  <span className="text-gray-700">{parcelle.typeIrrigation || '-'}</span>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-400" />
                <span className="font-medium text-gray-900">Rendement prévu :</span>
                <span className="text-gray-700">{formatDecimal(parcelle.rendement_prevue)} t/ha</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Coût de production :</span>
                <span className="text-gray-700">{formatCurrency(parcelle.coutProduction)}</span>
              </div>
            </div>
          </div>

          {/* Section environnementale */}
          <div className="border-t border-gray-200 pt-6 flex gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Certification Bio :</span>
              <span className="text-gray-700">{parcelle.certification_bio ? 'Oui' : 'Non'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Certification HVE :</span>
              <span className="text-gray-700">{parcelle.certification_hve ? 'Oui' : 'Non'}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <Calendar className="h-5 w-5 text-purple-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Date de semis</div>
              <div className="text-sm text-gray-600">{formatDate(parcelle.date_semis)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <Calendar className="h-5 w-5 text-indigo-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Récolte prévue</div>
              <div className="text-sm text-gray-600">{formatDate(parcelle.date_recolte_prevue)}</div>
            </div>
          </div>

          {/* Notes */}
          {parcelle.notes && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <div className="text-base text-gray-800 bg-gray-50 p-3 rounded-md">{parcelle.notes}</div>
            </div>
          )}

          {/* Galerie d'images */}
          {Array.isArray(parcelle.images) && parcelle.images.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Galerie d'images</h3>
              <ImageGallery
                items={parcelle.images.map((img, idx) => ({
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