 'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PARCELLE, UPDATE_PARCELLE } from '../lib/graphql-queries';
import { useToast } from '../lib/useToast';
import MapDrawModal from './MapDrawModal';

const ParcelleForm = ({ parcelle = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: parcelle?.nom || '',
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
  
  const [imageFiles, setImageFiles] = useState([]);
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
      const variables = {
        ...formData,
        geojson: JSON.stringify(geojsonToUse),
        images: imageFiles.length > 0 ? imageFiles : null
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
          showSuccess('Parcelle mise à jour avec succès !');
          onSuccess(data.updateParcelle.parcelle);
        } else {
          showError(data.updateParcelle.message);
        }
      } else {
        // Création
        const { data } = await createParcelle({
          variables
        });

        if (data.createParcelle.success) {
          showSuccess('Parcelle créée avec succès !');
          onSuccess(data.createParcelle.parcelle);
        } else {
          showError(data.createParcelle.message);
        }
      }
    } catch (error) {
      showError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Parcelle error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {parcelle ? 'Modifier la parcelle' : 'Ajouter une nouvelle parcelle'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la parcelle *
            </label>
            <input
              type="text"
              name="nom"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.nom}
              onChange={handleInputChange}
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

        {/* Informations de la personne référente */}
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

        {/* Informations agricoles */}
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

        {/* Irrigation */}
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

        {/* Informations économiques */}
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

        {/* Certifications */}
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

        {/* Fichier GeoJSON */}
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
            <p className="mt-1 text-sm text-green-600">✓ Parcelle définie</p>
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

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images de la parcelle
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
              <button
                type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
              >
                    ×
              </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Informations supplémentaires..."
          />
          </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          <button
            type="submit"
            disabled={createLoading || updateLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {(createLoading || updateLoading) ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {parcelle ? 'Mise à jour...' : 'Création...'}
              </div>
            ) : (
              parcelle ? 'Mettre à jour' : 'Créer la parcelle'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParcelleForm; 