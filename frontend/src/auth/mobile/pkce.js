/**
 * PKCE (Proof Key for Code Exchange) utility functions for OAuth2 mobile authentication
 *
 * PKCE Flow Overview:
 * 1. Generate a random code_verifier (client-side secret)
 * 2. Create code_challenge = BASE64URL(SHA256(code_verifier))
 * 3. Send code_challenge to auth server during login
 * 4. Send code_verifier to token endpoint when exchanging auth code for tokens
 * 5. Server verifies: SHA256(code_verifier) == code_challenge
 *
 * This prevents authorization code interception attacks in mobile/public clients.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7636
 */

/**
 * Generate a cryptographically secure random code verifier
 *
 * Spec requirements (RFC 7636):
 * - Length: 43-128 characters
 * - Character set: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~" (unreserved URI characters)
 *
 * @returns {string} Base64URL-encoded random string (64 characters)
 *
 * @example
 * const verifier = generateCodeVerifier();
 * console.log(verifier); // "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
 */
export function generateCodeVerifier() {
    // Generate 32 random bytes (256 bits of entropy)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    // Encode as Base64URL (produces 43-character string from 32 bytes)
    return base64UrlEncode(array);
}

/**
 * Generate a code challenge from a code verifier using S256 method
 *
 * @param {string} verifier - The code verifier string
 * @returns {Promise<string>} Base64URL-encoded SHA-256 hash of the verifier
 *
 * @example
 * const verifier = generateCodeVerifier();
 * const challenge = await generateCodeChallenge(verifier);
 * console.log(challenge); // "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
 */
export async function generateCodeChallenge(verifier) {
    // Convert verifier string to bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);

    // Hash with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Encode hash as Base64URL
    return base64UrlEncode(new Uint8Array(hashBuffer));
}

/**
 * Encode a byte array as Base64URL (URL-safe base64 without padding)
 *
 * Standard base64 uses: A-Z, a-z, 0-9, +, /, = (padding)
 * Base64URL uses: A-Z, a-z, 0-9, -, _, no padding
 *
 * @param {Uint8Array} buffer - Byte array to encode
 * @returns {string} Base64URL-encoded string
 *
 * @example
 * const bytes = new Uint8Array([72, 101, 108, 108, 111]);
 * const encoded = base64UrlEncode(bytes);
 * console.log(encoded); // "SGVsbG8"
 */
function base64UrlEncode(buffer) {
    // Convert bytes to base64 string
    let base64 = btoa(String.fromCharCode(...buffer));

    // Convert to URL-safe format:
    // - Replace + with -
    // - Replace / with _
    // - Remove padding (=)
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Complete PKCE flow example:
 *
 * @example
 * import { generateCodeVerifier, generateCodeChallenge } from './pkce.js';
 *
 * // Step 1: Generate verifier and challenge
 * const verifier = generateCodeVerifier();
 * const challenge = await generateCodeChallenge(verifier);
 *
 * // Step 2: Store verifier securely (will need it later for token exchange)
 * sessionStorage.setItem('pkce_verifier', verifier);
 *
 * // Step 3: Build auth URL with challenge (see keycloakMobileEndpoints.js)
 * const authUrl = buildAuthUrl({
 *   codeChallenge: challenge,
 *   state: 'random_state_value'
 * });
 *
 * // Step 4: Open auth URL in system browser
 * // User authenticates, Keycloak redirects back with auth code
 *
 * // Step 5: Exchange auth code for tokens (later implementation)
 * // Send: { code, code_verifier: verifier, redirect_uri, client_id }
 * // Receive: { access_token, refresh_token, id_token }
 */
