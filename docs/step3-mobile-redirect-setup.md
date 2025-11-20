# Step 3: Mobile Redirect URI & Deep Link Configuration

**Completed:** 2025-11-20
**Goal:** Configure redirect URIs and deep link handling for mobile OAuth2/Keycloak flow.

---

## Mobile Redirect URI

### Chosen Callback URI

```
com.jamigos.app://auth/callback
```

**Components:**
- **Scheme:** `com.jamigos.app` (matches app ID)
- **Host:** `auth`
- **Path:** `/callback`

This URI will be used when the mobile app initiates OAuth2 login with Keycloak, allowing the browser to redirect back into the app after authentication.

---

## Files Created

### 1. Auth Configuration
**File:** [frontend/src/auth/config.js](../frontend/src/auth/config.js)

**Purpose:** Centralized configuration for mobile redirect URI and helper functions.

**Exports:**
- `MOBILE_REDIRECT_URI` - The full callback URI string
- `MOBILE_REDIRECT_CONFIG` - Parsed components (scheme, host, path)
- `isMobileRedirectUrl(url)` - Check if URL matches callback pattern
- `parseAuthCallback(url)` - Extract code/state/error from callback URL

**Example usage:**
```javascript
import { MOBILE_REDIRECT_URI, parseAuthCallback } from '@/auth/config.js';

// Use in OAuth2 flow
const authUrl = `${keycloakUrl}/auth?redirect_uri=${encodeURIComponent(MOBILE_REDIRECT_URI)}`;

// Parse callback
const result = parseAuthCallback('com.jamigos.app://auth/callback?code=ABC123&state=xyz');
// Returns: { code: 'ABC123', state: 'xyz' }
```

### 2. Deep Link Handler
**File:** [frontend/src/utils/deepLinkHandler.js](../frontend/src/utils/deepLinkHandler.js)

**Purpose:** Listen for app URL opens and handle OAuth callbacks in Capacitor.

**Functions:**
- `initializeDeepLinkHandler()` - Register appUrlOpen listener (called in main.js)
- `setAuthCallbackHandler(handler)` - Set callback function for auth redirects
- `checkInitialUrl()` - Check if app was launched via deep link

**Behavior:**
- Only active in Capacitor environment (no-op on web)
- Logs all deep link URLs for debugging
- Calls registered handler when auth callback is detected

**Integration in main.js:**
```javascript
import { initializeDeepLinkHandler } from '@/utils/deepLinkHandler.js';

// Early in app bootstrap
initializeDeepLinkHandler();
```

### 3. Capacitor Configuration
**File:** [frontend/capacitor.config.ts](../frontend/capacitor.config.ts)

**Purpose:** Main Capacitor configuration (created if missing).

**Configuration:**
```typescript
{
  appId: 'com.jamigos.app',
  appName: 'Jamigos',
  webDir: 'dist',
  server: {
    androidScheme: 'https', // Use HTTPS scheme for local files
    cleartext: true,        // Allow HTTP for development
  },
  plugins: {
    App: {
      // Deep link handling enabled by default
    },
  },
}
```

---

## Native Platform Configuration

### Android Setup

To enable deep linking on Android, you need to add an intent filter to the main activity.

**File:** `android/app/src/main/AndroidManifest.xml`

**Add this intent filter inside the main `<activity>` tag:**

```xml
<activity
    android:name=".MainActivity"
    ...>

    <!-- Existing intent filters -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- Deep link intent filter for OAuth callbacks -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />

        <!-- Custom scheme for auth callbacks -->
        <data
            android:scheme="com.jamigos.app"
            android:host="auth"
            android:pathPrefix="/callback" />
    </intent-filter>
</activity>
```

**Regenerate Android project if needed:**
```bash
cd frontend
npx cap sync android
```

### iOS Setup

To enable deep linking on iOS, you need to register the custom URL scheme.

**File:** `ios/App/App/Info.plist`

**Add this inside the main `<dict>` tag:**

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.jamigos.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.jamigos.app</string>
        </array>
    </dict>
</array>
```

**Regenerate iOS project if needed:**
```bash
cd frontend
npx cap sync ios
```

---

## Keycloak Configuration

### Mobile Client Setup

**Client ID:** `jamigos-mobile-client`

**In Keycloak Admin Console:**

1. Navigate to your realm (`jamigos-realm`)
2. Go to **Clients** → `jamigos-mobile-client`
3. Add the mobile redirect URI to **Valid Redirect URIs:**

```
com.jamigos.app://auth/callback
```

4. Ensure the following settings:
   - **Access Type:** `public` (mobile apps can't keep secrets)
   - **Standard Flow Enabled:** `ON` (Authorization Code flow)
   - **Direct Access Grants:** `OFF` (not needed for PKCE)
   - **Valid Post Logout Redirect URIs:** `com.jamigos.app://*`

5. Save configuration

**Web client (`jamigos-client`) remains unchanged** - it continues to use standard HTTP(S) URLs.

---

## How It Works

### Deep Link Flow (Step-by-step)

1. **App Initialization:**
   ```
   main.js → initializeDeepLinkHandler()
   → Registers listener for 'appUrlOpen' events (mobile only)
   ```

2. **User Initiates Login (future Step 5):**
   ```
   User clicks "Login" → MobileAuthProvider.login()
   → Opens system browser with Keycloak auth URL
   → redirect_uri = com.jamigos.app://auth/callback
   ```

3. **User Authenticates:**
   ```
   User enters credentials in browser
   → Keycloak redirects to: com.jamigos.app://auth/callback?code=...
   ```

4. **Deep Link Triggers:**
   ```
   OS recognizes custom scheme
   → Opens/focuses Jamigos app
   → Fires 'appUrlOpen' event with URL
   ```

5. **Handler Processes Callback:**
   ```
   deepLinkHandler receives URL
   → Checks if isMobileRedirectUrl()
   → Parses auth code/state with parseAuthCallback()
   → Calls registered auth handler (from MobileAuthProvider)
   ```

6. **Auth Provider Completes Flow (future Step 5):**
   ```
   MobileAuthProvider receives code
   → Exchanges code for tokens (with PKCE verifier)
   → Stores tokens securely
   → Updates user state
   ```

---

## Testing Deep Links

### Test on Android

**Using ADB:**
```bash
# With fake auth code
adb shell am start -a android.intent.action.VIEW \
  -d "com.jamigos.app://auth/callback?code=TEST123&state=xyz"

# Check logs
adb logcat | grep "DeepLink"
```

**Expected behavior:**
- App opens or comes to foreground
- Console logs: `[DeepLink] Received URL: com.jamigos.app://auth/callback?code=TEST123...`
- Console logs: `[DeepLink] Auth callback detected`
- Console logs: `[DeepLink] Auth code received: TEST123...`

### Test on iOS

**Using Simulator:**
```bash
xcrun simctl openurl booted "com.jamigos.app://auth/callback?code=TEST123&state=xyz"
```

**Using Device:**
1. Open Notes app
2. Type the URL: `com.jamigos.app://auth/callback?code=TEST123&state=xyz`
3. Tap the link

**Expected behavior:**
- Same as Android (check Safari Web Inspector console for logs)

---

## Web Behavior (Unchanged)

### No Impact on Web Build

The deep link handler checks for Capacitor environment:

```javascript
if (typeof window === 'undefined' || !window.Capacitor) {
    console.log('[DeepLink] Not in Capacitor environment, skipping');
    return;
}
```

**Web continues to use:**
- Standard HTTP(S) redirect URIs (e.g., `http://localhost:5173`, `https://jamigos.com`)
- Keycloak JS adapter's built-in redirect handling
- No custom URL schemes

---

## Integration Points

### Current Integration (Step 3)

1. ✅ `main.js` calls `initializeDeepLinkHandler()`
2. ✅ Handler listens for `appUrlOpen` events
3. ✅ Handler logs received URLs
4. ⏳ **No auth handler registered yet** (will be added in Step 5)

### Future Integration (Step 5)

When we implement `MobileAuthProvider`:

```javascript
// In MobileAuthProvider.js
import { setAuthCallbackHandler } from '@/utils/deepLinkHandler.js';

class MobileAuthProvider {
    constructor() {
        // Register our callback handler
        setAuthCallbackHandler((result) => {
            if (result.code) {
                this.handleAuthCode(result.code, result.state);
            } else if (result.error) {
                this.handleAuthError(result.error, result.errorDescription);
            }
        });
    }
}
```

---

## Package Dependencies

To fully use Capacitor features, ensure these dependencies are installed:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/app @capacitor/browser @capacitor/preferences
```

**Note:** These will be needed for Step 5 (mobile auth implementation).

---

## Troubleshooting

### Deep Link Not Working on Android

1. **Check intent filter is in MainActivity:**
   - Open `android/app/src/main/AndroidManifest.xml`
   - Verify intent filter is inside `<activity android:name=".MainActivity">`

2. **Rebuild app:**
   ```bash
   npx cap sync android
   npx cap open android
   # Build & run from Android Studio
   ```

3. **Check logcat for errors:**
   ```bash
   adb logcat | grep -i "intent\|deeplink\|jamigos"
   ```

### Deep Link Not Working on iOS

1. **Check URL scheme in Info.plist:**
   ```bash
   cd ios/App/App
   cat Info.plist | grep -A5 CFBundleURLTypes
   ```

2. **Rebuild app:**
   ```bash
   npx cap sync ios
   npx cap open ios
   # Build & run from Xcode
   ```

3. **Check Safari Web Inspector:**
   - Safari → Develop → [Your Device] → [App]
   - Look for `[DeepLink]` logs

### Handler Not Logging

1. **Verify Capacitor is available:**
   ```javascript
   console.log('Capacitor available?', !!window.Capacitor);
   ```

2. **Check if handler was registered:**
   - Look for `[DeepLink] Handler registered successfully` in console

3. **Manually trigger:**
   ```javascript
   import { initializeDeepLinkHandler } from '@/utils/deepLinkHandler.js';
   initializeDeepLinkHandler();
   ```

---

## Summary

✅ **Step 3 Complete (Code-wise)**

### What was implemented:
1. ✅ Defined mobile redirect URI: `com.jamigos.app://auth/callback`
2. ✅ Created auth config with helper functions
3. ✅ Implemented deep link handler for Capacitor
4. ✅ Integrated handler into app bootstrap (main.js)
5. ✅ Created Capacitor config file
6. ✅ Documented Android/iOS native setup steps
7. ✅ Documented Keycloak configuration

### What needs manual setup:
1. ⏳ Install Capacitor dependencies (if not already installed)
2. ⏳ Regenerate native projects (`npx cap sync`)
3. ⏳ Add intent filter to Android manifest (see above)
4. ⏳ Add URL scheme to iOS Info.plist (see above)
5. ⏳ Configure Keycloak mobile client redirect URI
6. ⏳ Test deep links on actual device/emulator

### Ready for next step:
Once native platforms are properly configured and deep links are tested, we'll be ready for **Step 4/5: Implement mobile PKCE auth flow**.

---

**Web app behavior remains unchanged** - no regressions expected. 🚀
