# MobileAuthProvider Testing Guide

Quick reference for testing the mobile authentication provider.

## Setup

1. **Build and sync iOS app:**
   ```bash
   cd frontend
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. **Ensure Keycloak mobile client is configured:**
   - Go to Keycloak Admin Console
   - Navigate to Clients → jamigos-mobile-client
   - Verify settings:
     - Access Type: `public`
     - Standard Flow Enabled: `ON`
     - Valid Redirect URIs: `com.jamigos.app://auth/callback`
     - PKCE Code Challenge Method: `S256`

## Manual Testing (Browser Console)

### Test 1: Import and Initialize

```javascript
// In browser console (after app loads)
import MobileAuthProvider from '@/auth/mobile/MobileAuthProvider.js';

const mobile = new MobileAuthProvider();
console.log('Provider initialized');
```

**Expected output:**
```
[MobileAuth] MobileAuthProvider initialized
[MobileAuth] Deep link callback handler registered
Provider initialized
```

### Test 2: Login Flow

```javascript
// Start login
mobile.login()
    .then(tokens => {
        console.log('✅ Login successful!');
        console.log('Access Token (first 20 chars):', tokens.access_token.substring(0, 20));
        console.log('Expires in:', tokens.expires_in, 'seconds');
        console.log('Has refresh token:', !!tokens.refresh_token);
    })
    .catch(error => {
        console.error('❌ Login failed:', error);
    });
```

**Expected console output:**
```
[MobileAuth] ====== LOGIN FLOW STARTED ======
[MobileAuth] Step 1: Generating PKCE values...
[MobileAuth] Verifier generated (first 10 chars): dBjftJeZ4C...
[MobileAuth] Challenge generated (first 10 chars): E9Melhoa2O...
[MobileAuth] State: 550e8400-e29b-41d4-a716-446655440000
[MobileAuth] Step 2: Building authorization URL...
[MobileAuth] Auth URL: https://keycloak.example.com/realms/jamigos-realm/protocol/openid-connect/auth?...
[MobileAuth] Step 3: Opening system browser...
[MobileAuth] Browser opened successfully
[MobileAuth] Step 4: Waiting for authorization code...
```

**Then:**
1. Safari opens with Keycloak login page
2. Enter credentials and click Login
3. iOS shows "Open in Jamigos?" dialog
4. Tap "Open"

**Expected output continues:**
```
[DeepLink] ====== appUrlOpen EVENT FIRED ======
[DeepLink] Event URL: com.jamigos.app://auth/callback?code=abc123...
[MobileAuth] _handleDeepLinkCallback() called
[MobileAuth] ✅ Authorization code received, resolving promise
[MobileAuth] ✅ State verified
[MobileAuth] Step 5: Exchanging code for tokens...
[MobileAuth] Posting to token endpoint: https://keycloak.example.com/...
[MobileAuth] Token endpoint response status: 200
[MobileAuth] ✅ Tokens received successfully
[MobileAuth] Token type: Bearer
[MobileAuth] Expires in: 300
[MobileAuth] Has refresh token: true
[MobileAuth] Tokens stored in memory
[MobileAuth] Parsed ID token for user: testuser
[MobileAuth] Roles: ['USER']
[MobileAuth] ✅ User authenticated: testuser
[MobileAuth] ====== LOGIN FLOW COMPLETED ======
[MobileAuth] Browser closed
✅ Login successful!
Access Token (first 20 chars): eyJhbGciOiJSUzI1NiIs
Expires in: 300 seconds
Has refresh token: true
```

### Test 3: Check Authentication Status

```javascript
console.log('Is authenticated?', mobile.isAuthenticated());
console.log('Current user:', mobile.getCurrentUser());
```

**Expected output:**
```
Is authenticated? true
Current user: {
  authenticated: true,
  roles: ['USER'],
  tokenParsed: {
    sub: '550e8400-e29b-41d4-a716-446655440000',
    preferred_username: 'testuser',
    email: 'test@example.com',
    email_verified: true,
    given_name: 'Test',
    family_name: 'User',
    ...
  }
}
```

### Test 4: Get Access Token

```javascript
mobile.getAccessToken()
    .then(token => {
        console.log('Access token (first 20 chars):', token.substring(0, 20));
    })
    .catch(error => {
        console.error('Failed to get token:', error);
    });
```

**Expected output:**
```
Access token (first 20 chars): eyJhbGciOiJSUzI1NiIs
```

### Test 5: Make Authenticated API Request

```javascript
async function testAuthenticatedRequest() {
    try {
        const token = await mobile.getAccessToken();

        const response = await fetch('https://api.example.com/items', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('✅ API call successful:', data);
    } catch (error) {
        console.error('❌ API call failed:', error);
    }
}

testAuthenticatedRequest();
```

### Test 6: Token Refresh (Automatic)

Wait for token to expire (or manually set expiration):

```javascript
// Manually trigger refresh by setting expiration to past
// (for testing only - don't do this in production)
mobile._storeTokens({
    access_token: 'old_token',
    refresh_token: tokenStorage.refreshToken, // Keep existing refresh token
    id_token: tokenStorage.idToken,
    expires_in: -10 // Already expired
});

// Now try to get token - should trigger automatic refresh
mobile.getAccessToken()
    .then(token => {
        console.log('✅ Token refreshed automatically');
        console.log('New token (first 20 chars):', token.substring(0, 20));
    })
    .catch(error => {
        console.error('❌ Refresh failed:', error);
    });
```

**Expected output:**
```
[MobileAuth] Access token expiring soon, refreshing...
[MobileAuth] refreshAccessToken() called
[MobileAuth] Posting refresh request to: https://keycloak.example.com/...
[MobileAuth] Refresh response status: 200
[MobileAuth] ✅ Tokens refreshed successfully
[MobileAuth] Tokens stored in memory
✅ Token refreshed automatically
New token (first 20 chars): eyJhbGciOiJSUzI1NiIs
```

### Test 7: Logout

```javascript
mobile.logout()
    .then(() => {
        console.log('✅ Logged out');
        console.log('Is authenticated?', mobile.isAuthenticated());
    })
    .catch(error => {
        console.error('❌ Logout failed:', error);
    });
```

**Expected output:**
```
[MobileAuth] ====== LOGOUT FLOW STARTED ======
[MobileAuth] Opening logout URL...
[MobileAuth] Tokens cleared from memory
[MobileAuth] ✅ Logout completed
[MobileAuth] ====== LOGOUT FLOW COMPLETED ======
✅ Logged out
Is authenticated? false
```

## Troubleshooting

### Issue: "Not in Capacitor environment, skipping"

**Problem:** Running in web browser instead of mobile app

**Solution:** Test must be run in iOS/Android app, not web browser

---

### Issue: "Authentication timeout - no response received"

**Problem:** Deep link not firing or callback not registered

**Checks:**
1. Verify Info.plist has CFBundleURLTypes for `com.jamigos.app`
2. Check Xcode console for `[DeepLink]` logs
3. Verify `initializeDeepLinkHandler()` is called in main.js
4. Confirm iOS shows "Open in Jamigos?" dialog

---

### Issue: "State mismatch - possible CSRF attack"

**Problem:** State parameter doesn't match

**Possible causes:**
- Multiple login attempts overlapping
- Stale PKCE storage

**Solution:** Clear app and try single login attempt

---

### Issue: "Token exchange failed: 400"

**Problem:** Keycloak rejected token request

**Checks:**
1. Verify client configuration in Keycloak:
   - Client ID matches: `jamigos-mobile-client`
   - Access Type is `public`
   - Redirect URI includes: `com.jamigos.app://auth/callback`
   - PKCE is required (S256)

2. Check Xcode console for full error message

---

### Issue: "Browser does not open"

**Problem:** Capacitor Browser plugin not working

**Checks:**
1. Verify `@capacitor/browser` is installed
2. Run `npx cap sync ios`
3. Check Pods manifest includes CapacitorBrowser

---

## Debugging Tips

### Enable Verbose Logging

All logging is already enabled with `[MobileAuth]` prefix. Monitor Xcode console for detailed flow.

### Check Token Contents

```javascript
// Decode ID token (client-side only - for debugging)
const user = mobile.getCurrentUser();
console.log('Token claims:', JSON.stringify(user.tokenParsed, null, 2));
```

### Verify PKCE Values

```javascript
// During login flow, check PKCE values in console output
// Verifier and challenge should be 43 characters each
```

### Test Deep Link Directly

```bash
# Open simulator deep link
xcrun simctl openurl booted 'com.jamigos.app://auth/callback?code=TEST123&state=xyz'
```

**Expected output in console:**
```
[DeepLink] ====== appUrlOpen EVENT FIRED ======
[DeepLink] Event URL: com.jamigos.app://auth/callback?code=TEST123&state=xyz
[MobileAuth] _handleDeepLinkCallback() called
```

---

## Integration Testing (Future Step)

Once integrated with auth facade:

```javascript
// Test via facade
import authFacade from '@/auth/authFacade.js';

// Should automatically use MobileAuthProvider on mobile
authFacade.login().then(console.log).catch(console.error);
```

---

## Performance Benchmarks

**Expected timings:**
- PKCE generation: < 10ms
- Browser open: 200-500ms
- User authentication: 3-10 seconds (user-dependent)
- Deep link callback: < 100ms
- Token exchange: 200-500ms
- **Total login flow: 5-15 seconds**

**Token operations:**
- Get access token (cached): < 1ms
- Get access token (refresh): 200-500ms
- Logout: 500-1000ms

---

## Next Steps

After testing MobileAuthProvider:

1. **Step 6:** Integrate with auth facade
2. **Step 7:** Add secure token storage (iOS Keychain)
3. **Step 8:** Test full app integration
4. **Step 9:** Add biometric authentication (optional)
