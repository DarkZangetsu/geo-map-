import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EXPORT_PEPINIERES_CSV, IMPORT_PEPINIERES_CSV } from '../lib/graphql-queries';
import { useToast } from '../lib/useToast';

const CSVImportExportPepiniere = ({ onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showSuccess, showError } = useToast();

  const [exportPepinieresCSV] = useMutation(EXPORT_PEPINIERES_CSV);
  const [importPepinieresCSV] = useMutation(IMPORT_PEPINIERES_CSV);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      showError('Veuillez sélectionner un fichier CSV valide.');
      event.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showError('Veuillez sélectionner un fichier CSV.');
      return;
    }

    setIsImporting(true);
    try {
      const { data } = await importPepinieresCSV({
        variables: {
          csvFile: selectedFile
        }
      });

      if (data.importPepinieresCsv.success) {
        showSuccess(data.importPepinieresCsv.message);
        setSelectedFile(null);
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        showError(data.importPepinieresCsv.message);
      }

      // Afficher les erreurs s'il y en a
      if (data.importPepinieresCsv.errors && data.importPepinieresCsv.errors.length > 0) {
        console.error('Erreurs d\'import:', data.importPepinieresCsv.errors);
        showError(`Import terminé avec ${data.importPepinieresCsv.errors.length} erreur(s). Vérifiez la console pour plus de détails.`);
      }
    } catch (error) {
      showError('Erreur lors de l\'import: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data } = await exportPepinieresCSV();

      if (data.exportPepinieresCsv.success) {
        // Créer et télécharger le fichier CSV
        const blob = new Blob([data.exportPepinieresCsv.csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pepinieres_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Export CSV réussi !');
      } else {
        showError(data.exportPepinieresCsv.message);
      }
    } catch (error) {
      showError('Erreur lors de l\'export: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Import/Export CSV - Pépinières</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Importer des pépinières</h4>
          <div className="space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Import en cours...' : 'Importer'}
            </button>
          </div>
                     <div className="mt-3 text-xs text-gray-600">
             <p>Format attendu: CSV avec les colonnes suivantes :</p>
             <p>Nom, Adresse, Latitude, Longitude, Description, Nom Gestionnaire, Poste Gestionnaire, Téléphone Gestionnaire, Email Gestionnaire, Espèces Produites, Capacité, Quantité Production Générale</p>
           </div>
        </div>

        {/* Export */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Exporter les pépinières</h4>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Export en cours...' : 'Exporter en CSV'}
          </button>
          <div className="mt-3 text-xs text-gray-600">
            <p>L'export inclura toutes vos pépinières avec tous les champs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportExportPepiniere; 