// Script de test pour vérifier l'authentification côté frontend
// À exécuter dans la console du navigateur

console.log('=== Test d\'authentification Frontend ===');

// Fonction pour tester le localStorage
function testLocalStorage() {
    console.log('1. Test du localStorage...');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Token présent:', !!token);
    console.log('Utilisateur présent:', !!user);
    
    if (token) {
        console.log('Token (premiers caractères):', token.substring(0, 50) + '...');
    }
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('Données utilisateur:', userData);
        } catch (error) {
            console.error('Erreur parsing utilisateur:', error);
        }
    }
    
    return { token, user };
}

// Fonction pour tester Apollo Client
async function testApolloClient() {
    console.log('\n2. Test d\'Apollo Client...');
    
    try {
        // Test de la query GET_ME
        const { data } = await client.query({
            query: gql`
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
            `,
            fetchPolicy: 'network-only'
        });
        
        console.log('Query GET_ME réussie:', data);
        return true;
    } catch (error) {
        console.error('Erreur Apollo Client:', error);
        return false;
    }
}

// Fonction pour tester la connexion
async function testLogin() {
    console.log('\n3. Test de connexion...');
    
    try {
        const { data } = await client.mutate({
            mutation: gql`
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
                        }
                        success
                        message
                    }
                }
            `,
            variables: {
                username: 'testuser',
                password: 'testpass123'
            }
        });
        
        console.log('Mutation de connexion réussie:', data);
        
        if (data.tokenAuthWithUser.success) {
            console.log('✅ Connexion réussie!');
            console.log('Token reçu:', !!data.tokenAuthWithUser.token);
            console.log('Utilisateur:', data.tokenAuthWithUser.user);
            return true;
        } else {
            console.log('❌ Échec de la connexion:', data.tokenAuthWithUser.message);
            return false;
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        return false;
    }
}

// Fonction pour nettoyer le localStorage
function clearAuth() {
    console.log('\n4. Nettoyage du localStorage...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('localStorage nettoyé');
}

// Exécution des tests
async function runTests() {
    console.log('Début des tests...\n');
    
    // Test 1: localStorage
    const storageResult = testLocalStorage();
    
    // Test 2: Apollo Client (si authentifié)
    let apolloResult = false;
    if (storageResult.token) {
        apolloResult = await testApolloClient();
    } else {
        console.log('\n2. Test Apollo Client: Ignoré (pas de token)');
    }
    
    // Test 3: Connexion
    const loginResult = await testLogin();
    
    // Test 4: Apollo Client après connexion
    const apolloResultAfter = await testApolloClient();
    
    // Résultats
    console.log('\n=== Résultats ===');
    console.log('localStorage:', storageResult.token ? '✅ Token présent' : '❌ Pas de token');
    console.log('Apollo Client (avant):', apolloResult ? '✅ Fonctionne' : '❌ Échec');
    console.log('Connexion:', loginResult ? '✅ Réussie' : '❌ Échec');
    console.log('Apollo Client (après):', apolloResultAfter ? '✅ Fonctionne' : '❌ Échec');
    
    if (loginResult && apolloResultAfter) {
        console.log('\n🎉 Authentification fonctionnelle!');
    } else {
        console.log('\n⚠️ Problèmes détectés');
    }
}

// Fonctions utilitaires pour le débogage
window.authUtils = {
    testLocalStorage,
    testApolloClient,
    testLogin,
    clearAuth,
    runTests
};

console.log('Fonctions de test disponibles: window.authUtils');
console.log('Pour exécuter tous les tests: window.authUtils.runTests()'); 