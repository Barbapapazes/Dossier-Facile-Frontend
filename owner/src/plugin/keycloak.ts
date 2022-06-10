import Keycloak, { KeycloakConfig } from 'keycloak-js';

const options: KeycloakConfig = {
  url: import.meta.env.VITE_SSO_ENDPOINT?.toString() || '',
  realm: import.meta.env.VITE_SSO_REALM?.toString() || 'dossier-facile-owner',
  clientId: import.meta.env.VITE_SSO_CLIENT_ID?.toString() || '',
};

const keycloak = Keycloak(options);
export default keycloak;
