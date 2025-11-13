import Keycloak from "keycloak-js";

// Validate required environment variables
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

if (!KEYCLOAK_URL) {
    throw new Error('VITE_KEYCLOAK_URL environment variable is required');
}
if (!KEYCLOAK_REALM) {
    throw new Error('VITE_KEYCLOAK_REALM environment variable is required');
}
if (!KEYCLOAK_CLIENT_ID) {
    throw new Error('VITE_KEYCLOAK_CLIENT_ID environment variable is required');
}

const keycloak = new Keycloak({
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID,
});

export default keycloak;