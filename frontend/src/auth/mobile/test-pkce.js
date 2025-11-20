/**
 * Manual test file for PKCE utilities and Keycloak endpoint builders
 *
 * Run this in browser console or Node.js with crypto polyfills to verify:
 * 1. PKCE functions generate valid values
 * 2. Endpoint URLs are correctly formatted
 * 3. Auth URL includes all required parameters
 *
 * Usage in browser console (after running dev server):
 * 1. Open http://localhost:5173
 * 2. Open browser DevTools console
 * 3. Copy and paste this entire file
 * 4. Check console output for verification
 */

import { generateCodeVerifier, generateCodeChallenge } from './pkce.js';
import {
    KEYCLOAK_MOBILE_CONFIG,
    getAuthEndpoint,
    getTokenEndpoint,
    getLogoutEndpoint,
    buildAuthUrl,
    buildTokenExchangeParams,
    buildTokenRefreshParams,
} from './keycloakMobileEndpoints.js';

console.log('='.repeat(80));
console.log('PKCE AND KEYCLOAK ENDPOINTS TEST');
console.log('='.repeat(80));

// Test 1: Generate code verifier
console.log('\n[TEST 1] Generate Code Verifier');
console.log('-'.repeat(80));
const verifier1 = generateCodeVerifier();
const verifier2 = generateCodeVerifier();
console.log('Verifier 1:', verifier1);
console.log('Verifier 2:', verifier2);
console.log('✓ Verifiers are unique:', verifier1 !== verifier2);
console.log('✓ Verifier length:', verifier1.length, '(should be 43 characters)');
console.log('✓ Base64URL format (no +/=):', !/[+/=]/.test(verifier1));

// Test 2: Generate code challenge
console.log('\n[TEST 2] Generate Code Challenge');
console.log('-'.repeat(80));
generateCodeChallenge(verifier1).then(challenge => {
    console.log('Challenge for verifier 1:', challenge);
    console.log('✓ Challenge length:', challenge.length, '(should be 43 characters)');
    console.log('✓ Base64URL format (no +/=):', !/[+/=]/.test(challenge));

    // Verify same verifier produces same challenge
    return generateCodeChallenge(verifier1).then(challenge2 => {
        console.log('✓ Same verifier produces same challenge:', challenge === challenge2);
    });
});

// Test 3: Verify configuration
console.log('\n[TEST 3] Keycloak Configuration');
console.log('-'.repeat(80));
console.log('Config:', JSON.stringify(KEYCLOAK_MOBILE_CONFIG, null, 2));
console.log('✓ Base URL:', KEYCLOAK_MOBILE_CONFIG.keycloakBaseUrl);
console.log('✓ Realm:', KEYCLOAK_MOBILE_CONFIG.realm);
console.log('✓ Client ID:', KEYCLOAK_MOBILE_CONFIG.clientId);
console.log('✓ Redirect URI:', KEYCLOAK_MOBILE_CONFIG.redirectUri);
console.log('✓ Scope:', KEYCLOAK_MOBILE_CONFIG.scope);

// Test 4: Endpoint URLs
console.log('\n[TEST 4] Endpoint URLs');
console.log('-'.repeat(80));
const authEndpoint = getAuthEndpoint();
const tokenEndpoint = getTokenEndpoint();
const logoutEndpoint = getLogoutEndpoint();
console.log('Auth Endpoint:', authEndpoint);
console.log('Token Endpoint:', tokenEndpoint);
console.log('Logout Endpoint:', logoutEndpoint);
console.log('✓ Endpoints contain realm:', authEndpoint.includes('jamigos-realm'));
console.log('✓ Auth endpoint correct:', authEndpoint.endsWith('/protocol/openid-connect/auth'));
console.log('✓ Token endpoint correct:', tokenEndpoint.endsWith('/protocol/openid-connect/token'));
console.log('✓ Logout endpoint correct:', logoutEndpoint.endsWith('/protocol/openid-connect/logout'));

// Test 5: Build auth URL
console.log('\n[TEST 5] Build Authorization URL');
console.log('-'.repeat(80));
generateCodeChallenge(verifier1).then(challenge => {
    const state = 'test_state_12345';
    const authUrl = buildAuthUrl({
        codeChallenge: challenge,
        state: state,
    });

    console.log('Auth URL:', authUrl);

    // Parse and verify URL
    const url = new URL(authUrl);
    console.log('\nURL Parameters:');
    console.log('  client_id:', url.searchParams.get('client_id'));
    console.log('  redirect_uri:', url.searchParams.get('redirect_uri'));
    console.log('  response_type:', url.searchParams.get('response_type'));
    console.log('  scope:', url.searchParams.get('scope'));
    console.log('  code_challenge:', url.searchParams.get('code_challenge'));
    console.log('  code_challenge_method:', url.searchParams.get('code_challenge_method'));
    console.log('  state:', url.searchParams.get('state'));

    console.log('\nValidation:');
    console.log('✓ Has client_id:', url.searchParams.has('client_id'));
    console.log('✓ Has redirect_uri:', url.searchParams.has('redirect_uri'));
    console.log('✓ Has response_type=code:', url.searchParams.get('response_type') === 'code');
    console.log('✓ Has scope:', url.searchParams.has('scope'));
    console.log('✓ Has code_challenge:', url.searchParams.has('code_challenge'));
    console.log('✓ Has code_challenge_method=S256:', url.searchParams.get('code_challenge_method') === 'S256');
    console.log('✓ Has state:', url.searchParams.has('state'));
    console.log('✓ Redirect URI matches config:', url.searchParams.get('redirect_uri') === KEYCLOAK_MOBILE_CONFIG.redirectUri);
});

// Test 6: Token exchange params
console.log('\n[TEST 6] Token Exchange Parameters');
console.log('-'.repeat(80));
const tokenParams = buildTokenExchangeParams({
    code: 'mock_auth_code_12345',
    codeVerifier: verifier1,
});
console.log('Token Exchange Params:');
console.log('  grant_type:', tokenParams.get('grant_type'));
console.log('  client_id:', tokenParams.get('client_id'));
console.log('  redirect_uri:', tokenParams.get('redirect_uri'));
console.log('  code:', tokenParams.get('code'));
console.log('  code_verifier:', tokenParams.get('code_verifier'));
console.log('✓ Has grant_type=authorization_code:', tokenParams.get('grant_type') === 'authorization_code');
console.log('✓ Has code_verifier:', tokenParams.has('code_verifier'));

// Test 7: Token refresh params
console.log('\n[TEST 7] Token Refresh Parameters');
console.log('-'.repeat(80));
const refreshParams = buildTokenRefreshParams('mock_refresh_token_67890');
console.log('Token Refresh Params:');
console.log('  grant_type:', refreshParams.get('grant_type'));
console.log('  client_id:', refreshParams.get('client_id'));
console.log('  refresh_token:', refreshParams.get('refresh_token'));
console.log('✓ Has grant_type=refresh_token:', refreshParams.get('grant_type') === 'refresh_token');
console.log('✓ Has refresh_token:', refreshParams.has('refresh_token'));

console.log('\n' + '='.repeat(80));
console.log('ALL TESTS COMPLETED');
console.log('='.repeat(80));
