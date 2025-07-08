import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_SIEGE, UPDATE_SIEGE } from '../lib/graphql-queries';
import { useToast } from '../lib/useToast';
import MapPointModal from './MapPointModal';

const SiegeForm = ({ onSuccess, onCancel, initialData = null, mode = 'add', siegeId = null }) => {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    latitude: '',
    longitude: '',
    description: ''
  });
  const [showMapModal, setShowMapModal] = useState(false);
  const { showSuccess, showError } = useToast();
  const [createSiege, { loading: loadingCreate }] = useMutation(CREATE_SIEGE);
  const [updateSiege, { loading: loadingUpdate }] = useMutation(UPDATE_SIEGE);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom || '',
        adresse: initialData.adresse || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        description: initialData.description || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapSelect = (geometry) => {
    if (geometry && geometry.type === 'Point' && geometry.coordinates.length === 2) {
      setFormData(prev => ({
        ...prev,
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0]
      }));
    } else {
      showError('Veuillez sélectionner un point sur la carte.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.adresse || !formData.latitude || !formData.longitude) {
      showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    try {
      if (mode === 'edit' && siegeId) {
        const { data } = await updateSiege({
          variables: {
            id: siegeId,
            nom: formData.nom,
            adresse: formData.adresse,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            description: formData.description
          }
        });
        if (data.updateSiege.success) {
          showSuccess('Siège modifié avec succès !');
          onSuccess && onSuccess(data.updateSiege.siege);
        } else {
          showError(data.updateSiege.message);
        }
      } else {
        const { data } = await createSiege({
          variables: {
            nom: formData.nom,
            adresse: formData.adresse,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            description: formData.description
          }
        });
        if (data.createSiege.success) {
          showSuccess('Siège ajouté avec succès !');
          onSuccess && onSuccess(data.createSiege.siege);
        } else {
          showError(data.createSiege.message);
        }
      }
    } catch (error) {
      showError('Erreur lors de la soumission du siège.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">{mode === 'edit' ? 'Modifier le siège' : 'Ajouter un siège'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input type="text" name="nom" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.nom} onChange={handleInputChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
          <input type="text" name="adresse" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.adresse} onChange={handleInputChange} />
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
            <input type="number" step="0.000001" name="latitude" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.latitude} onChange={handleInputChange} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
            <input type="number" step="0.000001" name="longitude" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.longitude} onChange={handleInputChange} />
          </div>
          <button type="button" onClick={() => setShowMapModal(true)} className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Sélectionner sur la carte</button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.description} onChange={handleInputChange} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annuler</button>
          <button type="submit" disabled={loadingCreate || loadingUpdate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
            {mode === 'edit' ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </form>
      {showMapModal && (
        <MapPointModal
          open={showMapModal}
          onClose={() => setShowMapModal(false)}
          onSave={geometry => {
            handleMapSelect(geometry);
            setShowMapModal(false);
          }}
          initialPosition={formData.latitude && formData.longitude ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : null}
        />
      )}
    </div>
  );
};

export default SiegeForm; 