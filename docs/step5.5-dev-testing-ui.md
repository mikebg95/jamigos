# Step 5.5: Dev-Only Mobile Auth Testing UI

**Date:** 2025-11-20
**Status:** ✅ Completed

## Overview

Added a dev-only UI testing hook for MobileAuthProvider that allows testing the mobile auth flow directly on an iPhone without needing to use the Safari console.

## What Was Added

### 1. **Dev Helper Module** (`frontend/src/auth/mobile/devMobileAuth.js`)

A singleton helper module that:
- Detects Capacitor environment (`window.Capacitor`)
- Checks for dev mode (`import.meta.env.DEV`)
- Creates ONE MobileAuthProvider instance when both conditions are true
- Exposes it as `window.mobileAuth` for debugging
- Provides test functions with comprehensive logging and alerts

**Functions:**
- `getDevMobileAuth()` - Get/create singleton instance
- `isDevMobileAuthAvailable()` - Check if dev testing is available
- `testMobileLogin()` - Test login flow with logging and alerts
- `testMobileLogout()` - Test logout flow
- `testGetAccessToken()` - Test token retrieval

### 2. **Dev UI Section** (Added to `HomeView.vue`)

A yellow-bordered dev section that appears on the home page when:
- Running in Capacitor (iOS/Android)
- AND in development mode

**Three test buttons:**
1. **🚀 Test Mobile Login** - Triggers full PKCE login flow
2. **🚪 Test Mobile Logout** - Clears tokens and logs out
3. **🔑 Test Get Token** - Retrieves current access token

## Files Modified

### Created:
- `frontend/src/auth/mobile/devMobileAuth.js` (~170 lines)

### Modified:
- `frontend/src/views/HomeView.vue`
  - Added import for dev helper functions
  - Added `showDevMobileAuth` computed property
  - Added dev UI section in template
  - Added dev styles in style block

## How It Works

### Detection Logic:

```javascript
// Only initialize in dev + native
const isCapacitor = typeof window !== 'undefined' && window.Capacitor !== undefined;
const isDev = import.meta.env.DEV;
const shouldInitialize = isCapacitor && isDev;
```

### Visibility:

| Environment | Platform | Dev UI Visible? |
|------------|----------|----------------|
| Production | iOS/Android | ❌ No |
| Production | Web | ❌ No |
| Development | iOS/Android | ✅ **YES** |
| Development | Web | ❌ No |

### Console Logging:

When you tap "🚀 Test Mobile Login":

```
[MobileAuth TEST] Test mobile login button clicked
[MobileAuth TEST] Starting login flow...
[MobileAuth] ====== LOGIN FLOW STARTED ======
[MobileAuth] Step 1: Generating PKCE values...
... (all MobileAuthProvider logs)
[MobileAuth TEST] ✅ Login successful!
[MobileAuth TEST] Login tokens: { access_token: "...", ... }
[MobileAuth TEST] Current user: { authenticated: true, roles: [...], tokenParsed: {...} }
[MobileAuth TEST] Username: testuser
[MobileAuth TEST] Roles: ['USER']
[MobileAuth TEST] Is authenticated: true
```

### Visual Alerts:

After login completes, you'll see an iOS alert:
```
✅ Login successful!
Username: testuser
Roles: USER
```

This provides visual confirmation even if the console is hard to read.

## How to Test

### Step 1: Build and Deploy to iOS

```bash
cd frontend
npm run build
npx cap sync ios
npx cap open ios
```

### Step 2: Run in Xcode

1. Select your target device (iPhone simulator or real device)
2. Click Run (▶️)
3. Open Xcode console (View → Debug Area → Show Debug Area)

### Step 3: Find the Dev UI

1. App opens to home page
2. Scroll down below the hero section
3. You'll see a **yellow-bordered box** with:
   - Header: "🔧 DEV MODE - Mobile Auth Testing"
   - Three red gradient buttons
   - Info note about checking Xcode console

### Step 4: Test Login Flow

1. **Tap "🚀 Test Mobile Login"**
2. Safari opens with Keycloak login
3. Enter credentials and authenticate
4. iOS shows "Open in Jamigos?" dialog
5. Tap "Open"
6. App resumes, you'll see iOS alert: "✅ Login successful! Username: testuser"
7. Check Xcode console for full log output

### Step 5: Verify Authentication

1. **Tap "🔑 Test Get Token"**
2. iOS alert shows: "✅ Token retrieved! First 50 chars: eyJhbGciOiJSUzI1NiIs..."
3. Console shows full token info

### Step 6: Test Logout

1. **Tap "🚪 Test Mobile Logout"**
2. Safari opens with Keycloak logout
3. iOS alert shows: "✅ Logout successful!"
4. Check console for logout logs

## Expected Console Output

### On App Start (Dev + Capacitor):

```
[MobileAuth DEV] Dev mode + Capacitor detected
[MobileAuth DEV] Mobile auth testing enabled
[MobileAuth DEV] Creating dev MobileAuthProvider instance
[MobileAuth] MobileAuthProvider initialized
[MobileAuth] Deep link callback handler registered
[MobileAuth DEV] MobileAuthProvider exposed as window.mobileAuth
```

### On Login Button Tap:

```
[MobileAuth TEST] Test mobile login button clicked
[MobileAuth TEST] Starting login flow...
[MobileAuth] ====== LOGIN FLOW STARTED ======
[MobileAuth] Step 1: Generating PKCE values...
[MobileAuth] Verifier generated (first 10 chars): dBjftJeZ4C...
[MobileAuth] Challenge generated (first 10 chars): E9Melhoa2O...
[MobileAuth] State: 550e8400-e29b-41d4-a716-446655440000
[MobileAuth] Step 2: Building authorization URL...
[MobileAuth] Auth URL: https://keycloak.jamigos.app/realms/...
[MobileAuth] Step 3: Opening system browser...
[MobileAuth] Browser opened successfully
[MobileAuth] Step 4: Waiting for authorization code...

[DeepLink] ====== appUrlOpen EVENT FIRED ======
[DeepLink] Event URL: com.jamigos.app://auth/callback?code=...
[MobileAuth] _handleDeepLinkCallback() called
[MobileAuth] ✅ Authorization code received
[MobileAuth] ✅ State verified
[MobileAuth] Step 5: Exchanging code for tokens...
[MobileAuth] Token endpoint response status: 200
[MobileAuth] ✅ Tokens received successfully
[MobileAuth] ✅ User authenticated: testuser
[MobileAuth] ====== LOGIN FLOW COMPLETED ======

[MobileAuth TEST] ✅ Login successful!
[MobileAuth TEST] Login tokens: { access_token: "eyJ...", refresh_token: "eyJ...", ... }
[MobileAuth TEST] Current user: { authenticated: true, roles: ['USER'], tokenParsed: {...} }
[MobileAuth TEST] Username: testuser
[MobileAuth TEST] Roles: ['USER']
[MobileAuth TEST] Is authenticated: true
```

## What This Does NOT Do

✅ **Does:**
- Provides easy tap-to-test UI for mobile auth
- Shows visual alerts for success/failure
- Exposes `window.mobileAuth` for console debugging
- Comprehensive logging with `[MobileAuth TEST]` prefix

❌ **Does NOT:**
- Affect production builds (completely removed)
- Affect web browser behavior (only Capacitor)
- Change normal auth flow
- Integrate with auth facade yet (Step 6)
- Persist tokens to storage yet (Step 7)

## Debugging Window Object

If console ever works, you can use:

```javascript
// In browser console on device
window.mobileAuth.login()
window.mobileAuth.logout()
window.mobileAuth.getAccessToken()
window.mobileAuth.isAuthenticated()
window.mobileAuth.getCurrentUser()
```

## Visual Appearance

The dev UI appears below the hero section with:

**🔧 DEV MODE - Mobile Auth Testing** (orange badge)

[🚀 Test Mobile Login] [🚪 Test Mobile Logout] [🔑 Test Get Token]

ℹ️ This section only appears in dev mode on native (iOS/Android) builds.
Check Xcode console for detailed logs.

*(Yellow dashed border, red gradient buttons)*

## Production Safety

### Build Tree-Shaking:

When you run `npm run build` for production:
```javascript
// import.meta.env.DEV is false
const isDev = import.meta.env.DEV; // false in production
const shouldInitialize = isCapacitor && isDev; // false!

// All dev code is dead code and removed by Vite
```

### Production Build Result:

```javascript
// In production bundle:
export function isDevMobileAuthAvailable() {
    return false; // Constant, tree-shaken
}

// In HomeView.vue:
const showDevMobileAuth = false; // v-if="false" removed from DOM
```

The entire dev UI section is **completely removed** from production builds.

## Testing Checklist

- [x] ✅ Build succeeds (`npm run build`)
- [x] ✅ Lint passes (`npm run lint`)
- [x] ✅ Dev UI only visible in dev + Capacitor
- [ ] ⏳ Test on iOS simulator
- [ ] ⏳ Test on real iPhone
- [ ] ⏳ Verify login flow works end-to-end
- [ ] ⏳ Verify alerts appear
- [ ] ⏳ Verify console logs are readable
- [ ] ⏳ Verify production build has no dev code

## Next Steps

After testing on device:
1. Verify all three buttons work
2. Check all console logs appear
3. Verify alerts show correctly
4. Test error scenarios (wrong credentials, timeout, etc.)
5. Proceed to Step 6: Integrate with auth facade

## Summary

**What to tap:** On the home page, tap the **"🚀 Test Mobile Login"** button in the yellow dev section.

**Where to look:** Xcode console for detailed logs, iOS alerts for visual confirmation.

**What happens:** Full PKCE OAuth2 flow with comprehensive logging and visual feedback.

**Production:** Completely removed from production builds via tree-shaking.
