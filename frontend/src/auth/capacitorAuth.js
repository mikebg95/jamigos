import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';
import { CapacitorHttp } from '@capacitor/core';

/**
 * Handles OAuth authentication flow for Capacitor mobile apps
 * Uses native browser for OAuth (avoids webview limitations)
 */
export class CapacitorAuthHandler {
    constructor(keycloakUrl, realm, clientId) {
        this.keycloakUrl = keycloakUrl;
        this.realm = realm;
        this.clientId = clientId;
        this.codeVerifier = null;
        this.state = null;
    }

    /**
     * Generate random string for PKCE
     */
    generateRandomString(length) {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let text = '';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Generate SHA256 hash for PKCE code challenge
     */
    async sha256(plain) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        const hash = await window.crypto.subtle.digest('SHA-256', data);
        return hash;
    }

    /**
     * Base64 URL encode
     */
    base64urlencode(buffer) {
        let str = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    /**
     * Generate PKCE code challenge
     */
    async generateCodeChallenge(codeVerifier) {
        const hashed = await this.sha256(codeVerifier);
        return this.base64urlencode(hashed);
    }

    /**
     * Build authorization URL
     */
    async buildAuthUrl(redirectUri) {
        this.codeVerifier = this.generateRandomString(128);
        this.state = this.generateRandomString(32);
        const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

        const authUrl = new URL(`${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/auth`);
        authUrl.searchParams.append('client_id', this.clientId);
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', 'openid profile email');
        authUrl.searchParams.append('state', this.state);
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');

        return authUrl.toString();
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code, redirectUri) {
        const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', this.clientId);
        params.append('redirect_uri', redirectUri);
        params.append('code', code);
        params.append('code_verifier', this.codeVerifier);

        console.log('[CapacitorAuth] Exchanging code for tokens...');
        console.log('[CapacitorAuth] Token URL:', tokenUrl);
        console.log('[CapacitorAuth] Request params:', {
            grant_type: 'authorization_code',
            client_id: this.clientId,
            redirect_uri: redirectUri,
            code: code.substring(0, 20) + '...',
            code_verifier: this.codeVerifier.substring(0, 20) + '...'
        });

        try {
            // Use CapacitorHttp for native HTTP request (bypasses CORS/webview issues)
            const response = await CapacitorHttp.post({
                url: tokenUrl,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: params.toString(),
            });

            console.log('[CapacitorAuth] Response status:', response.status);
            console.log('[CapacitorAuth] Response data:', response.data);

            if (response.status !== 200) {
                const errorText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                console.error('[CapacitorAuth] Token exchange failed - Status:', response.status);
                console.error('[CapacitorAuth] Token exchange failed - Response:', errorText);
                throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
            }

            // CapacitorHttp automatically parses JSON responses
            const tokens = response.data;
            console.log('[CapacitorAuth] Tokens received successfully');
            return tokens;
        } catch (error) {
            console.error('[CapacitorAuth] Token exchange error:', error);
            console.error('[CapacitorAuth] Error type:', error.constructor.name);
            console.error('[CapacitorAuth] Error message:', error.message);
            console.error('[CapacitorAuth] Error stack:', error.stack);
            throw error;
        }
    }

    /**
     * Perform login flow
     */
    async login() {
        // Use unique app-specific scheme to avoid conflicts with other apps
        const redirectUri = 'com.todoproject.app://oauth-callback';

        console.log('[CapacitorAuth] Starting login flow...');
        console.log('[CapacitorAuth] Redirect URI:', redirectUri);

        // Build authorization URL
        const authUrl = await this.buildAuthUrl(redirectUri);
        console.log('[CapacitorAuth] Auth URL:', authUrl);

        // Return a promise that resolves when we get the callback
        return new Promise((resolve, reject) => {
            // Set up app URL listener for OAuth callback
            const listener = CapacitorApp.addListener('appUrlOpen', async (data) => {
                console.log('[CapacitorAuth] App URL opened:', data.url);

                try {
                    // Close the browser
                    await Browser.close();

                    // Parse the callback URL
                    const url = new URL(data.url);
                    const code = url.searchParams.get('code');
                    const state = url.searchParams.get('state');
                    const error = url.searchParams.get('error');

                    if (error) {
                        console.error('[CapacitorAuth] OAuth error:', error);
                        listener.remove();
                        reject(new Error(`OAuth error: ${error}`));
                        return;
                    }

                    if (!code) {
                        console.error('[CapacitorAuth] No authorization code received');
                        listener.remove();
                        reject(new Error('No authorization code received'));
                        return;
                    }

                    if (state !== this.state) {
                        console.error('[CapacitorAuth] State mismatch');
                        listener.remove();
                        reject(new Error('State mismatch - possible CSRF attack'));
                        return;
                    }

                    console.log('[CapacitorAuth] Authorization code received, exchanging for tokens...');

                    // Exchange code for tokens
                    const tokens = await this.exchangeCodeForTokens(code, redirectUri);

                    // Remove listener
                    listener.remove();

                    // Resolve with tokens
                    resolve(tokens);
                } catch (err) {
                    console.error('[CapacitorAuth] Error processing callback:', err);
                    listener.remove();
                    reject(err);
                }
            });

            // Open the authorization URL in the system browser
            Browser.open({
                url: authUrl,
                presentationStyle: 'popover'
            }).catch((err) => {
                console.error('[CapacitorAuth] Failed to open browser:', err);
                listener.remove();
                reject(err);
            });
        });
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', this.clientId);
        params.append('refresh_token', refreshToken);

        console.log('[CapacitorAuth] Refreshing token...');

        // Use CapacitorHttp for native HTTP request
        const response = await CapacitorHttp.post({
            url: tokenUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: params.toString(),
        });

        if (response.status !== 200) {
            const errorText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            console.error('[CapacitorAuth] Token refresh failed:', errorText);
            throw new Error(`Token refresh failed: ${response.status}`);
        }

        const tokens = response.data;
        console.log('[CapacitorAuth] Token refreshed successfully');
        return tokens;
    }

    /**
     * Logout
     */
    async logout(refreshToken) {
        if (refreshToken) {
            const logoutUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout`;

            const params = new URLSearchParams();
            params.append('client_id', this.clientId);
            params.append('refresh_token', refreshToken);

            try {
                await CapacitorHttp.post({
                    url: logoutUrl,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    data: params.toString(),
                });
                console.log('[CapacitorAuth] Logged out successfully');
            } catch (err) {
                console.error('[CapacitorAuth] Logout failed:', err);
            }
        }

        // Clear stored tokens
        localStorage.removeItem('keycloak_tokens');
    }
}
