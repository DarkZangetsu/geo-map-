'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PARCELLE, UPDATE_PARCELLE, GET_ME } from '../lib/graphql-queries';
import { useToast } from '../lib/useToast';
import MapDrawModal from './MapDrawModal';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../components/Providers';

const ParcelleForm = ({ parcelle = null, onSuccess, onCancel, parcellesCount = 0 }) => {
  const { data: meData } = useQuery(GET_ME);
  const userAbreviation = meData?.me?.abreviation || '';
  // Déterminer le nom par défaut si création
  const isEdit = !!parcelle;
  const currentAbreviation = isEdit
    ? (''|| userAbreviation)
    : userAbreviation;
  const defaultNom = isEdit
    ? parcelle?.nom || ''
    : `${currentAbreviation}_site de référence ${parcellesCount + 1}`;
  const [formData, setFormData] = useState({
    nom: defaultNom,
    culture: parcelle?.culture || '',
    proprietaire: parcelle?.proprietaire || '',
    nomPersonneReferente: parcelle?.nomPersonneReferente || '',
    poste: parcelle?.poste || '',
    telephone: parcelle?.telephone || '',
    email: parcelle?.email || '',
    superficie: parcelle?.superficie || '',
    variete: parcelle?.variete || '',
    dateSemis: parcelle?.dateSemis || '',
    dateRecoltePrevue: parcelle?.dateRecoltePrevue || '',
    typeSol: parcelle?.typeSol || '',
    irrigation: parcelle?.irrigation || false,
    typeIrrigation: parcelle?.typeIrrigation || '',
    rendementPrevue: parcelle?.rendementPrevue || '',
    coutProduction: parcelle?.coutProduction || '',
    certificationBio: parcelle?.certificationBio || false,
    certificationHve: parcelle?.certificationHve || false,
    notes: parcelle?.notes || '',
    images: []
  });
  
  const [photos, setPhotos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [geojson, setGeojson] = useState(parcelle?.geojson || null);
  const [showMapModal, setShowMapModal] = useState(false);
  const { showSuccess, showError } = useToast();

  const [createParcelle, { loading: createLoading }] = useMutation(CREATE_PARCELLE);
  const [updateParcelle, { loading: updateLoading }] = useMutation(UPDATE_PARCELLE);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Créer les previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      return newPreviews;
    });
  };

  const handleGeojsonUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const geojsonData = JSON.parse(event.target.result);
          setGeojson(geojsonData);
          showSuccess('Fichier GeoJSON chargé avec succès');
        } catch (error) {
          showError('Erreur lors du chargement du fichier GeoJSON');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 2) {
      showError('Vous ne pouvez ajouter que 2 images maximum.');
      return;
    }
    const newPhotos = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      titre: '',
      description: '',
      isExisting: false
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const updatePhotoInfo = (index, field, value) => {
    setPhotos(prev => prev.map((photo, i) =>
      i === index ? { ...photo, [field]: value } : photo
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let geojsonToUse = geojson;
    if (showMapModal) {
      geojsonToUse = null;
    }
    if (!geojsonToUse) {
      showError('Veuillez fournir un fichier GeoJSON ou dessiner sur la carte.');
      return;
    }

    try {
      const imagesToSend = photos.filter(photo => !photo.isExisting).map(photo => photo.file);
      const variables = {
        ...formData,
        geojson: JSON.stringify(geojsonToUse),
        images: imagesToSend.length > 0 ? imagesToSend : null
      };

      if (parcelle) {
        // Mise à jour
        const { data } = await updateParcelle({
          variables: {
            id: parcelle.id,
            ...variables
          }
        });

        if (data.updateParcelle.success) {
          showSuccess('Site de référence mis à jour avec succès !');
          onSuccess(data.updateParcelle.parcelle);
        } else {
          showError(data.updateParcelle.message);
        }
      } else {
        // Création
        const { data } = await createParcelle({
          variables: variables
        });

        if (data.createParcelle.success) {
          showSuccess('Site de référence créé avec succès !');
          onSuccess(data.createParcelle.parcelle);
        } else {
          showError(data.createParcelle.message);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <>
      {/* Header fixe - complètement séparé */}
      <div className="bg-white border-b border-gray-200 p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold text-gray-900">
          {parcelle ? 'Modifier le site de référence' : 'Ajouter un nouveau site de référence'}
        </h2>
      </div>

      {/* Contenu scrollable - section séparée */}
      <div className="bg-white overflow-y-auto max-h-[60vh]">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du site de référence *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                    value={formData.nom}
                    onChange={handleInputChange}
                    readOnly={!isEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Culture *
                  </label>
                  <input
                    type="text"
                    name="culture"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.culture}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Propriétaire *
                  </label>
                  <input
                    type="text"
                    name="proprietaire"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.proprietaire}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie (ha)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="superficie"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.superficie}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Informations de la personne référente */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personne référente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la personne référente
                  </label>
                  <input
                    type="text"
                    name="nomPersonneReferente"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.nomPersonneReferente}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste
                  </label>
                  <input
                    type="text"
                    name="poste"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.poste}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.telephone}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Informations agricoles */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations agricoles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variété
                  </label>
                  <input
                    type="text"
                    name="variete"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.variete}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de sol
                  </label>
                  <select
                    name="typeSol"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.typeSol}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner</option>
                    <option value="argileux">Argileux</option>
                    <option value="sableux">Sableux</option>
                    <option value="limoneux">Limoneux</option>
                    <option value="calcaire">Calcaire</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de semis
                  </label>
                  <input
                    type="date"
                    name="dateSemis"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.dateSemis}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de récolte prévue
                  </label>
                  <input
                    type="date"
                    name="dateRecoltePrevue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.dateRecoltePrevue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Irrigation */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Irrigation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="irrigation"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.irrigation}
                    onChange={handleInputChange}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Irrigation
                  </label>
                </div>
                
                {formData.irrigation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'irrigation
                    </label>
                    <select
                      name="typeIrrigation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.typeIrrigation}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionner</option>
                      <option value="aspersion">Aspersion</option>
                      <option value="goutte_a_goutte">Goutte à goutte</option>
                      <option value="gravitaire">Gravitaire</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Informations économiques */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations économiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rendement prévu (t/ha)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="rendementPrevue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.rendementPrevue}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coût de production (€/ha)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="coutProduction"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.coutProduction}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="certificationBio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.certificationBio}
                    onChange={handleInputChange}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Certification Bio
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="certificationHve"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.certificationHve}
                    onChange={handleInputChange}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Certification HVE
                  </label>
                </div>
              </div>
            </div>

            {/* Géolocalisation */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Géolocalisation</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier GeoJSON *
                </label>
                <input
                  type="file"
                  accept=".geojson,.json"
                  onChange={handleGeojsonUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!!geojson}
                />
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={!!geojson}
                >
                  Dessiner sur la carte
                </button>
                {geojson && (
                  <p className="mt-1 text-sm text-green-600">✓ Site de référence défini</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Importer un fichier OU dessiner sur la carte.</p>
                <MapDrawModal
                  open={showMapModal}
                  onClose={() => setShowMapModal(false)}
                  onSave={gjson => {
                    setGeojson(gjson);
                    setShowMapModal(false);
                  }}
                />
              </div>
            </div>

            {/* Images */}
            <h3 className="text-lg font-medium text-gray-900 mb-4">Images du site de référence (max 2)</h3>
            <div className="space-y-4">
              {/* Upload de nouvelles images */}
              {photos.length < 2 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Cliquez pour ajouter une image
                      </span>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG jusqu'à 10MB
                  </p>
                </div>
              )}
              {/* Affichage des images */}
              {photos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative border rounded-lg p-4">
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                      <div className="flex items-center space-x-3 mb-3">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Titre de l'image"
                            value={photo.titre}
                            onChange={e => updatePhotoInfo(index, 'titre', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                      </div>
                      <img
                        src={photo.url}
                        alt={photo.titre || 'Image du site'}
                        className="w-full h-32 object-cover rounded"
                      />
                      <textarea
                        placeholder="Description de l'image"
                        value={photo.description}
                        onChange={e => updatePhotoInfo(index, 'description', e.target.value)}
                        className="w-full mt-2 text-sm border border-gray-300 rounded px-2 py-1 resize-none"
                        rows="2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <div>
                <textarea
                  name="notes"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Informations supplémentaires..."
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer fixe - complètement séparé */}
      <div className="bg-white border-t border-gray-200 p-6 rounded-b-lg">
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={createLoading || updateLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {(createLoading || updateLoading) ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {parcelle ? 'Mise à jour...' : 'Création...'}
              </div>
            ) : (
              parcelle ? 'Mettre à jour' : 'Créer le site de référence'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ParcelleForm; 