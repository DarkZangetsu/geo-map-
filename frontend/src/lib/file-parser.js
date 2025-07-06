 import * as shapefile from 'shapefile';
import * as JSZip from 'jszip';
import * as toGeoJSON from '@mapbox/togeojson';

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  
  try {
    if (ext === 'geojson' || ext === 'json') {
      return await parseGeoJSON(file);
    } else if (ext === 'shp' || ext === 'zip') {
      return await parseShapefile(file);
    } else if (ext === 'kml') {
      return await parseKML(file);
    } else {
      throw new Error(`Format de fichier non supporté: ${ext}`);
    }
  } catch (error) {
    console.error('Erreur lors du parsing du fichier:', error);
    throw new Error(`Impossible de lire le fichier: ${error.message}`);
  }
}

async function parseGeoJSON(file) {
  const text = await file.text();
  const geojson = JSON.parse(text);
  
  // Vérifier que c'est un GeoJSON valide
  if (!geojson.type || !geojson.features) {
    throw new Error('Format GeoJSON invalide');
  }
  
  return geojson;
}

async function parseShapefile(file) {
  let arrayBuffer;
  
  if (file.name.endsWith('.zip')) {
    // Si c'est un fichier ZIP contenant le shapefile
    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);
    
    // Chercher les fichiers .shp et .dbf
    const shpFile = Object.values(zipData.files).find(f => f.name.endsWith('.shp'));
    const dbfFile = Object.values(zipData.files).find(f => f.name.endsWith('.dbf'));
    
    if (!shpFile) {
      throw new Error('Aucun fichier .shp trouvé dans le ZIP');
    }
    
    const shpBuffer = await shpFile.async('arraybuffer');
    const dbfBuffer = dbfFile ? await dbfFile.async('arraybuffer') : null;
    
    arrayBuffer = shpBuffer;
  } else {
    // Si c'est directement un fichier .shp
    arrayBuffer = await file.arrayBuffer();
  }
  
  const geojson = await shapefile.open(arrayBuffer)
    .then(source => source.read()
      .then(function collect(result) {
        if (result.done) return source.read();
        return source.read().then(collect);
      }))
    .then(geojson => ({ type: 'FeatureCollection', features: geojson }));
  
  return geojson;
}

async function parseKML(file) {
  const text = await file.text();
  const parser = new DOMParser();
  const kml = parser.parseFromString(text, 'text/xml');
  
  // Vérifier les erreurs de parsing XML
  const errors = kml.getElementsByTagName('parsererror');
  if (errors.length > 0) {
    throw new Error('Fichier KML invalide');
  }
  
  const geojson = await toGeoJSON.kml(kml);
  return geojson;
}

// Fonction pour exporter en GeoJSON
export function exportToGeoJSON(data, filename = 'parcelles.geojson') {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
} 