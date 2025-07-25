'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PARCELLE, UPDATE_PARCELLE, GET_ME } from '../lib/graphql-queries';
import { useToast } from '../lib/useToast';
import MapDrawModal from './MapDrawModal';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';
import * as turf from '@turf/turf';

const ParcelleForm = ({ parcelle = null, onSuccess, onCancel, parcellesCount = 0, mode = 'add' }) => {
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
    proprietaire: parcelle?.proprietaire || '',
    nomPersonneReferente: parcelle?.nomPersonneReferente || '',
    poste: parcelle?.poste || '',
    telephone: parcelle?.telephone || '',
    email: parcelle?.email || '',
    superficie: parcelle?.superficie || '',
    pratique: parcelle?.pratique || '',
    nomProjet: parcelle?.nomProjet || '',
    description: parcelle?.description || '',
    images: []
  });
  
  const [photos, setPhotos] = useState([]);
  // Charger les images existantes lors de l'édition
  useEffect(() => {
    if (isEdit && parcelle && parcelle.images && Array.isArray(parcelle.images)) {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/media/` || '';
      setPhotos(parcelle.images.map(photo => ({
        id: photo.id,
        url: photo.image ? (photo.image.startsWith('http') ? photo.image : `${apiUrl.replace(/\/$/, '')}/${photo.image.replace(/^\//, '')}`) : '',
        titre: photo.titre || '',
        description: photo.description || '',
        isExisting: true
      })));
    }
  }, [isEdit, parcelle]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [geojson, setGeojson] = useState(parcelle?.geojson || null);
  const [showMapModal, setShowMapModal] = useState(false);
  const { showSuccess, showError } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [createParcelle, { loading: createLoading }] = useMutation(CREATE_PARCELLE);
  const [updateParcelle, { loading: updateLoading }] = useMutation(UPDATE_PARCELLE);

  // Liste des projets de l'utilisateur connecté
  const projets = (meData?.me?.nomProjet || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

  // Mettre à jour le nom si l'abréviation utilisateur change et qu'on est en mode création
  useEffect(() => {
    if (!isEdit && userAbreviation) {
      setFormData(prev => ({
        ...prev,
        nom: `${userAbreviation}_site de référence ${parcellesCount + 1}`
      }));
    }
  }, [userAbreviation, parcellesCount, isEdit]);

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
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    let geojsonToUse = geojson;
    if (showMapModal) {
      geojsonToUse = null;
    }
    if (!geojsonToUse) {
      showError('Veuillez fournir un fichier GeoJSON ou dessiner sur la carte.');
      setConfirmLoading(false);
      return;
    }
    try {
      const imagesToSend = photos.filter(photo => !photo.isExisting).map(photo => photo.file);
      // Gestion suppression d'images existantes
      let imagesToDelete = [];
      if (mode === 'edit' && parcelle && Array.isArray(parcelle.images)) {
        const currentIds = photos.filter(photo => photo.isExisting).map(photo => photo.id);
        imagesToDelete = parcelle.images
          .filter(img => !currentIds.includes(img.id))
          .map(img => img.id);
      }
      const variables = {
        ...formData,
        geojson: JSON.stringify(geojsonToUse),
        images: imagesToSend.length > 0 ? imagesToSend : null,
        imagesToDelete: imagesToDelete.length > 0 ? imagesToDelete : null
      };
      if (mode === 'edit' && parcelle) {
        // Mise à jour
        const { data } = await updateParcelle({
          variables: {
            id: parcelle.id,
            ...variables
          }
        });
        if (data.updateParcelle.success) {
          showSuccess('Site de référence mis à jour avec succès !');
          onSuccess && onSuccess(data.updateParcelle.parcelle);
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
          onSuccess && onSuccess(data.createParcelle.parcelle);
        } else {
          showError(data.createParcelle.message);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setConfirmLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* Header fixe - complètement séparé */}
      <div className="bg-white border-b border-gray-200 p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'edit' ? 'Modifier le site de référence' : 'Ajouter un site de référence'}
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
                    Pratique
                  </label>
                  <select
                    name="pratique"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.pratique}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner une pratique</option>
                    <option value="structure_brise_vent">Structure Brise-vent</option>
                    <option value="structure_pare_feu">Structure Pare feu</option>
                    <option value="structures_antierosives">Structures antiérosives</option>
                    <option value="structure_cultures_couloir">Structure Cultures en Couloir/allée</option>
                    <option value="pratiques_taillage_coupe">Pratiques de taillage, coupe et application engrais verts</option>
                    <option value="pratiques_couverture_sol">Pratiques couverture du sol</option>
                    <option value="pratiques_conservation_eau">Pratiques/structures conservation d'eau</option>
                    <option value="systeme_multi_etage">Système multi-étage diversifié</option>
                    <option value="arbres_autochtones">Arbres Autochtones</option>
                    <option value="production_epices">Production épices</option>
                    <option value="production_bois_energie">Production Bois énergie</option>
                    <option value="production_fruit">Production fruit</option>
                    <option value="integration_cultures_vivrieres">Intégration cultures vivrières</option>
                    <option value="integration_elevage">Intégration d'élevage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du projet
                  </label>
                  <select
                    name="nomProjet"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.nomProjet}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner un projet</option>
                    {projets.map((projet, idx) => (
                      <option key={idx} value={projet}>{projet}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description du site de référence..."
                  />
                </div>
              </div>
            </div>

            {/* Géolocalisation et superficie */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Géolocalisation et superficie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    readOnly
                  />
                </div>
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
                      // Calcul automatique de la superficie si polygone
                      try {
                        if (gjson && (gjson.type === 'Polygon' || gjson.type === 'MultiPolygon')) {
                          const area = turf.area({ type: 'Feature', geometry: gjson });
                          // Convertir en hectares (1 ha = 10 000 m²)
                          const superficieHa = (area / 10000).toFixed(2);
                          setFormData(prev => ({ ...prev, superficie: superficieHa }));
                        }
                      } catch (e) {
                        // ignore erreur turf
                      }
                      setShowMapModal(false);
                    }}
                  />
                </div>
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
                {mode === 'edit' ? 'Mise à jour...' : 'Création...'}
              </div>
            ) : (
              mode === 'edit' ? 'Mettre à jour' : 'Créer le site de référence'
            )}
          </button>
        </div>
      </div>
      {showConfirm && (
        <ConfirmationDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          title={mode === 'edit' ? 'Confirmer la modification' : 'Confirmer la création'}
          message={mode === 'edit' ? 'Voulez-vous vraiment modifier ce site de référence ?' : 'Voulez-vous vraiment créer ce site de référence ?'}
          confirmText={mode === 'edit' ? 'Mettre à jour' : 'Créer'}
          confirmButtonClass={confirmLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
          cancelButtonClass={confirmLoading ? 'cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}
          confirmDisabled={confirmLoading}
          confirmLoading={confirmLoading}
        />
      )}
    </>
  );
};

export default ParcelleForm; 