import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PEPINIERE, UPDATE_PEPINIERE } from '../lib/graphql-queries';
import { useToast } from '../lib/useToast';
import MapPointModal from './MapPointModal';

const PepiniereForm = ({ onSuccess, onCancel, initialData = null, mode = 'add', pepiniereId = null }) => {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    latitude: '',
    longitude: '',
    description: '',
    categorie: 'bureau',
    nomGestionnaire: '',
    posteGestionnaire: '',
    telephoneGestionnaire: '',
    emailGestionnaire: '',
    especesProduites: '',
    capacite: '',
    quantiteProductionGenerale: ''
  });
  const [showMapModal, setShowMapModal] = useState(false);
  const { showSuccess, showError } = useToast();
  const [createPepiniere, { loading: loadingCreate }] = useMutation(CREATE_PEPINIERE);
  const [updatePepiniere, { loading: loadingUpdate }] = useMutation(UPDATE_PEPINIERE);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom || '',
        adresse: initialData.adresse || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        description: initialData.description || '',
        categorie: initialData.categorie || 'bureau',
        nomGestionnaire: initialData.nomGestionnaire || '',
        posteGestionnaire: initialData.posteGestionnaire || '',
        telephoneGestionnaire: initialData.telephoneGestionnaire || '',
        emailGestionnaire: initialData.emailGestionnaire || '',
        especesProduites: initialData.especesProduites || '',
        capacite: initialData.capacite || '',
        quantiteProductionGenerale: initialData.quantiteProductionGenerale || ''
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
              const variables = {
          nom: formData.nom,
          adresse: formData.adresse,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          description: formData.description,
          categorie: formData.categorie,
          nomGestionnaire: formData.nomGestionnaire,
          posteGestionnaire: formData.posteGestionnaire,
          telephoneGestionnaire: formData.telephoneGestionnaire,
          emailGestionnaire: formData.emailGestionnaire,
          especesProduites: formData.especesProduites,
          capacite: formData.capacite ? parseFloat(formData.capacite) : null,
          quantiteProductionGenerale: formData.quantiteProductionGenerale
        };

      if (mode === 'edit' && pepiniereId) {
        const { data } = await updatePepiniere({
          variables: {
            id: pepiniereId,
            ...variables
          }
        });
        if (data.updatePepiniere.success) {
          showSuccess('Pépinière modifiée avec succès !');
          onSuccess && onSuccess(data.updatePepiniere.pepiniere);
        } else {
          showError(data.updatePepiniere.message);
        }
      } else {
        const { data } = await createPepiniere({
          variables
        });
        if (data.createPepiniere.success) {
          showSuccess('Pépinière ajoutée avec succès !');
          onSuccess && onSuccess(data.createPepiniere.pepiniere);
        } else {
          showError(data.createPepiniere.message);
        }
      }
    } catch (error) {
      showError('Erreur lors de la soumission de la pépinière.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">{mode === 'edit' ? 'Modifier la pépinière' : 'Ajouter une pépinière'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" name="nom" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.nom} onChange={handleInputChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select name="categorie" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.categorie} onChange={handleInputChange}>
              <option value="bureau">Bureau</option>
              <option value="régional">Régional</option>
              <option value="national">National</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
          <input type="text" name="adresse" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.adresse} onChange={handleInputChange} />
        </div>

        {/* Coordonnées */}
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



        {/* Gestionnaire */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du gestionnaire</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du gestionnaire</label>
              <input type="text" name="nomGestionnaire" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.nomGestionnaire} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poste du gestionnaire</label>
              <input type="text" name="posteGestionnaire" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.posteGestionnaire} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du gestionnaire</label>
              <input type="tel" name="telephoneGestionnaire" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.telephoneGestionnaire} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email du gestionnaire</label>
              <input type="email" name="emailGestionnaire" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.emailGestionnaire} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de production</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espèces produites</label>
              <textarea name="especesProduites" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.especesProduites} onChange={handleInputChange} placeholder="Liste des espèces produites" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité de production</label>
              <input type="number" step="0.01" name="capacite" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.capacite} onChange={handleInputChange} placeholder="Capacité en unités" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité de production générale</label>
            <textarea name="quantiteProductionGenerale" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.quantiteProductionGenerale} onChange={handleInputChange} placeholder="Description de la production générale" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.description} onChange={handleInputChange} />
        </div>

        <div className="flex justify-end gap-2 mt-6">
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

export default PepiniereForm; 