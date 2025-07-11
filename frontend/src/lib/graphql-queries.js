import { gql } from '@apollo/client';

// Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      firstName
      lastName
      role
      logo
    }
  }
`;

export const GET_MY_PARCELLES = gql`
  query GetMyParcelles {
    myParcelles {
      id
      nom
      culture
      proprietaire
      geojson
      superficie
      variete
      dateSemis
      dateRecoltePrevue
      typeSol
      irrigation
      typeIrrigation
      rendementPrevue
      coutProduction
      certificationBio
      certificationHve
      notes
      createdAt
      updatedAt
      user {
        id
        username
        firstName
        lastName
        logo
      }
      images {
        id
        image
        ordre
      }
    }
  }
`;

export const GET_ALL_PARCELLES = gql`
  query GetAllParcelles {
    allParcelles {
      id
      nom
      culture
      proprietaire
      geojson
      superficie
      variete
      dateSemis
      dateRecoltePrevue
      typeSol
      irrigation
      typeIrrigation
      rendementPrevue
      coutProduction
      certificationBio
      certificationHve
      notes
      createdAt
      updatedAt
      user {
        id
        username
        firstName
        lastName
        logo
      }
      images {
        id
        image
        ordre
      }
    }
  }
`;

export const GET_PARCELLE = gql`
  query GetParcelle($id: ID!) {
    parcelle(id: $id) {
      id
      nom
      culture
      proprietaire
      geojson
      superficie
      variete
      dateSemis
      dateRecoltePrevue
      typeSol
      irrigation
      typeIrrigation
      rendementPrevue
      coutProduction
      certificationBio
      certificationHve
      notes
      createdAt
      updatedAt
      user {
        id
        username
        firstName
        lastName
        logo
      }
      images {
        id
        image
        ordre
      }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      username
      email
      firstName
      lastName
      role
      logo
      dateJoined
    }
  }
`;

export const GET_MY_SIEGES = gql`
  query GetMySieges {
    mySieges {
      id
      nom
      adresse
      latitude
      longitude
      description
      createdAt
      updatedAt
      user {
        id
        username
      }
    }
  }
`;

export const GET_ALL_SIEGES = gql`
  query GetAllSieges {
    allSieges {
      id
      nom
      adresse
      latitude
      longitude
      description
      createdAt
      updatedAt
      user {
        id
        username
        firstName
        lastName
        logo
      }
    }
  }
`;

export const GET_SIEGE = gql`
  query GetSiege($id: ID!) {
    siege(id: $id) {
      id
      nom
      adresse
      latitude
      longitude
      description
      createdAt
      updatedAt
      user {
        id
        username
        firstName
        lastName
        logo
      }
    }
  }
`;

// Mutations
export const CREATE_USER = gql`
  mutation CreateUser(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
    $abreviation: String
    $role: String
    $logo: Upload
  ) {
    createUser(
      username: $username
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      abreviation: $abreviation
      role: $role
      logo: $logo
    ) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        abreviation
        role
        logo
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      success
      message
      token
      user {
        id
        username
        email
        firstName
        lastName
        role
        logo
      }
    }
  }
`;

export const CREATE_PARCELLE = gql`
  mutation CreateParcelle(
    $nom: String!
    $culture: String!
    $proprietaire: String!
    $geojson: JSONString!
    $superficie: Decimal
    $variete: String
    $dateSemis: Date
    $dateRecoltePrevue: Date
    $typeSol: String
    $irrigation: Boolean
    $typeIrrigation: String
    $rendementPrevue: Decimal
    $coutProduction: Decimal
    $certificationBio: Boolean
    $certificationHve: Boolean
    $notes: String
    $images: [Upload]
  ) {
    createParcelle(
      nom: $nom
      culture: $culture
      proprietaire: $proprietaire
      geojson: $geojson
      superficie: $superficie
      variete: $variete
      dateSemis: $dateSemis
      dateRecoltePrevue: $dateRecoltePrevue
      typeSol: $typeSol
      irrigation: $irrigation
      typeIrrigation: $typeIrrigation
      rendementPrevue: $rendementPrevue
      coutProduction: $coutProduction
      certificationBio: $certificationBio
      certificationHve: $certificationHve
      notes: $notes
      images: $images
    ) {
      success
      message
      parcelle {
        id
        nom
        culture
        proprietaire
        geojson
        superficie
        variete
        dateSemis
        dateRecoltePrevue
        typeSol
        irrigation
        typeIrrigation
        rendementPrevue
        coutProduction
        certificationBio
        certificationHve
        notes
        createdAt
        updatedAt
        user {
          id
          username
          firstName
          lastName
          logo
        }
        images {
          id
          image
          ordre
        }
      }
    }
  }
`;

export const UPDATE_PARCELLE = gql`
  mutation UpdateParcelle(
    $id: ID!
    $nom: String
    $culture: String
    $proprietaire: String
    $geojson: JSONString
    $superficie: Decimal
    $variete: String
    $dateSemis: Date
    $dateRecoltePrevue: Date
    $typeSol: String
    $irrigation: Boolean
    $typeIrrigation: String
    $rendementPrevue: Decimal
    $coutProduction: Decimal
    $certificationBio: Boolean
    $certificationHve: Boolean
    $notes: String
    $images: [Upload]
  ) {
    updateParcelle(
      id: $id
      nom: $nom
      culture: $culture
      proprietaire: $proprietaire
      geojson: $geojson
      superficie: $superficie
      variete: $variete
      dateSemis: $dateSemis
      dateRecoltePrevue: $dateRecoltePrevue
      typeSol: $typeSol
      irrigation: $irrigation
      typeIrrigation: $typeIrrigation
      rendementPrevue: $rendementPrevue
      coutProduction: $coutProduction
      certificationBio: $certificationBio
      certificationHve: $certificationHve
      notes: $notes
      images: $images
    ) {
      success
      message
      parcelle {
        id
        nom
        culture
        proprietaire
        geojson
        superficie
        variete
        dateSemis
        dateRecoltePrevue
        typeSol
        irrigation
        typeIrrigation
        rendementPrevue
        coutProduction
        certificationBio
        certificationHve
        notes
        createdAt
        updatedAt
        user {
          id
          username
          firstName
          lastName
          logo
        }
        images {
          id
          image
          ordre
        }
      }
    }
  }
`;

export const DELETE_PARCELLE = gql`
  mutation DeleteParcelle($id: ID!) {
    deleteParcelle(id: $id) {
      success
      message
    }
  }
`;

// Mutations JWT
export const TOKEN_AUTH = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshToken
    }
  }
`;

export const TOKEN_AUTH_WITH_USER = gql`
  mutation TokenAuthWithUser($username: String!, $password: String!) {
    tokenAuthWithUser(username: $username, password: $password) {
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        role
        logo
      }
      success
      message
    }
  }
`;

export const VERIFY_TOKEN = gql`
  mutation VerifyToken($token: String!) {
    verifyToken(token: $token) {
      payload
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      payload
    }
  }
`;

export const CREATE_SIEGE = gql`
  mutation CreateSiege($nom: String!, $adresse: String!, $latitude: Decimal!, $longitude: Decimal!, $description: String) {
    createSiege(nom: $nom, adresse: $adresse, latitude: $latitude, longitude: $longitude, description: $description) {
      success
      message
      siege {
        id
        nom
        adresse
        latitude
        longitude
        description
        createdAt
        updatedAt
        user {
          id
          username
        }
      }
    }
  }
`;

export const UPDATE_SIEGE = gql`
  mutation UpdateSiege($id: ID!, $nom: String, $adresse: String, $latitude: Decimal, $longitude: Decimal, $description: String) {
    updateSiege(id: $id, nom: $nom, adresse: $adresse, latitude: $latitude, longitude: $longitude, description: $description) {
      success
      message
      siege {
        id
        nom
        adresse
        latitude
        longitude
        description
        createdAt
        updatedAt
        user {
          id
          username
        }
      }
    }
  }
`;

export const DELETE_SIEGE = gql`
  mutation DeleteSiege($id: ID!) {
    deleteSiege(id: $id) {
      success
      message
    }
  }
`;

// CSV Import/Export mutations
export const EXPORT_PARCELLES_CSV = gql`
  mutation ExportParcellesCSV {
    exportParcellesCsv {
      success
      message
      csvData
    }
  }
`;

export const IMPORT_PARCELLES_CSV = gql`
  mutation ImportParcellesCSV($csvFile: Upload!) {
    importParcellesCsv(csvFile: $csvFile) {
      success
      message
      importedCount
      errors
    }
  }
`;

export const EXPORT_SIEGES_CSV = gql`
  mutation ExportSiegesCSV {
    exportSiegesCsv {
      success
      message
      csvData
    }
  }
`;

export const IMPORT_SIEGES_CSV = gql`
  mutation ImportSiegesCSV($csvFile: Upload!) {
    importSiegesCsv(csvFile: $csvFile) {
      success
      message
      importedCount
      errors
    }
  }
`;

export const UPDATE_USER_ACTIVE_STATUS = gql`
  mutation UpdateUserActiveStatus($userId: ID!, $isActive: Boolean!) {
    updateUserActiveStatus(userId: $userId, isActive: $isActive) {
      success
      message
      user {
        id
        isActive
      }
    }
  }
`;

export const UPDATE_USER_ABREVIATION = gql`
  mutation UpdateUserAbreviation($userId: ID!, $abreviation: String!) {
    updateUserAbreviation(userId: $userId, abreviation: $abreviation) {
      success
      message
      user {
        id
        abreviation
      }
    }
  }
`; 