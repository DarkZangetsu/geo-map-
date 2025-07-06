# Agri-Geo - Frontend

Application web Next.js pour la gestion des parcelles agricoles avec cartographie interactive.

## 🚀 Fonctionnalités

### 👤 Authentification
- **Inscription/Connexion** avec rôles (admin/membre)
- **Gestion des sessions** avec JWT
- **Interface intuitive** pour les utilisateurs

### 🗺️ Cartographie interactive
- **Carte Leaflet** avec styles multiples (Street, Satellite, Relief)
- **Affichage des parcelles** en GeoJSON
- **Marqueurs interactifs** au centre de chaque parcelle
- **Mode plein écran** pour une meilleure visualisation
- **Clic sur parcelle** pour voir les détails

### 📁 Gestion des parcelles
- **Ajout de parcelles** avec formulaire complet
- **Upload de fichiers** : `.geojson`, `.shp`, `.kml`, `.zip`
- **Saisie manuelle** GeoJSON
- **Prévisualisation** des données avant sauvegarde
- **Export individuel** et global des parcelles

### 🔧 Interface d'administration
- **Gestion des utilisateurs** (admin uniquement)
- **Vue globale** de toutes les parcelles
- **Suppression de parcelles** (admin uniquement)
- **Export de toutes les parcelles**

### 📊 Exportation de données
- **Export GeoJSON** des parcelles individuelles
- **Export global** de toutes les parcelles
- **Export personnalisé** avec métadonnées

## 🛠️ Installation

1. **Installer les dépendances** :
```bash
npm install
```

2. **Démarrer le serveur de développement** :
```bash
npm run dev
```

3. **Ouvrir l'application** :
```
http://localhost:3000
```

## 📋 Utilisation

### 🔐 Connexion
1. Accédez à l'application
2. Créez un compte ou connectez-vous
3. Choisissez votre rôle (membre ou admin)

### 👨‍🌾 Pour les membres (agriculteurs)

#### Ajouter une parcelle
1. Cliquez sur "Ajouter une parcelle"
2. Remplissez les informations :
   - **Nom** de la parcelle
   - **Culture** (blé, maïs, vigne, etc.)
   - **Propriétaire**
3. **Importez des données géographiques** :
   - **Fichier** : `.geojson`, `.shp`, `.kml`, `.zip`
   - **Ou saisie manuelle** : GeoJSON
4. Cliquez sur "Ajouter"

#### Visualiser vos parcelles
- **Carte interactive** : Cliquez sur une parcelle pour voir les détails
- **Liste des parcelles** : Dans la sidebar
- **Mode plein écran** : Pour une meilleure visualisation
- **Export** : Téléchargez vos parcelles en GeoJSON

### 👨‍💼 Pour les administrateurs

#### Interface d'administration
1. Cliquez sur "Administration"
2. **Onglet Parcelles** :
   - Vue globale de toutes les parcelles
   - Carte interactive avec toutes les parcelles
   - Détails et suppression des parcelles
   - Export global
3. **Onglet Utilisateurs** :
   - Liste de tous les utilisateurs
   - Rôles et dates d'inscription

## 🗂️ Formats de fichiers supportés

### Import
- **GeoJSON** (`.geojson`, `.json`)
- **Shapefile** (`.shp`, `.zip` contenant .shp + .dbf)
- **KML** (`.kml`)

### Export
- **GeoJSON** avec métadonnées enrichies

## 🏗️ Architecture technique

### Frontend
- **Next.js 13+** avec App Router
- **React** avec hooks
- **TailwindCSS** pour le styling
- **Leaflet** pour la cartographie
- **Apollo Client** pour GraphQL

### Librairies principales
- `react-leaflet` : Intégration Leaflet avec React
- `shapefile` : Lecture des fichiers .shp
- `@mapbox/togeojson` : Conversion KML vers GeoJSON
- `jszip` : Gestion des fichiers ZIP
- `@apollo/client` : Client GraphQL

### Structure des composants
```
src/
├── app/
│   ├── page.js          # Page principale
│   ├── admin/page.js    # Interface d'administration
│   └── layout.js        # Layout avec providers
├── components/
│   ├── AuthForm.js      # Formulaire d'authentification
│   ├── ParcelleForm.js  # Formulaire d'ajout de parcelle
│   ├── ParcellesMap.js  # Carte interactive
│   └── Providers.js     # Providers Apollo
└── lib/
    ├── apollo-client.js # Configuration GraphQL
    ├── file-parser.js   # Utilitaires fichiers
    └── graphql-queries.js # Requêtes GraphQL
```

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env.local` :
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql/
```

### Backend requis
L'application nécessite le backend Django avec GraphQL :
- URL : `http://localhost:8000`
- Endpoint GraphQL : `/graphql/`
- Authentification JWT

## 🚀 Déploiement

### Build de production
```bash
npm run build
npm start
```

### Variables d'environnement de production
```env
NEXT_PUBLIC_GRAPHQL_URL=https://votre-backend.com/graphql/
```

## 📱 Responsive Design

L'application est entièrement responsive :
- **Desktop** : Layout en colonnes avec sidebar
- **Tablet** : Layout adaptatif
- **Mobile** : Interface optimisée pour petits écrans

## 🔒 Sécurité

- **Authentification JWT** avec expiration
- **Rôles utilisateurs** (admin/membre)
- **Validation côté client et serveur**
- **CORS configuré** pour le backend

## 🐛 Dépannage

### Erreurs courantes
1. **"window is not defined"** : Erreur SSR résolue avec chargement dynamique
2. **Carte ne se charge pas** : Vérifiez la connexion internet
3. **Upload de fichiers** : Vérifiez le format et la taille

### Logs de débogage
Activez les logs dans la console du navigateur pour plus d'informations.

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les logs de la console
3. Vérifiez la connexion au backend
4. Contactez l'équipe de développement
