# Mobile App Setup (iOS via Capacitor)

This document describes how to build and run the Todo Project mobile app on iOS.

## Prerequisites

- macOS with Xcode installed
- Node.js 20+
- CocoaPods (`sudo gem install cocoapods`)
- iOS development environment set up

## Initial Setup

### 1. Update Environment Configuration

Edit `frontend/.env.mobile` with your actual Render URLs:

```bash
# Replace these with your actual Render service URLs
VITE_API_BASE_URL=https://your-backend-dev.onrender.com
VITE_KEYCLOAK_URL=https://your-keycloak-dev.onrender.com
VITE_KEYCLOAK_REALM=todo-project-realm
VITE_KEYCLOAK_CLIENT_ID=todo-project-client
```

### 2. Configure Keycloak Client

You must update your Keycloak client configuration to allow the mobile app to authenticate.

**In Keycloak Admin Console:**

1. Navigate to: Clients → `todo-project-client`
2. Under **Valid Redirect URIs**, add:
   - `capacitor://localhost`
   - `http://localhost`
3. Under **Valid Post Logout Redirect URIs**, add:
   - `capacitor://localhost`
   - `http://localhost`
4. Under **Web Origins**, add:
   - `capacitor://localhost`
   - `http://localhost`
5. Save the changes

**Why these URIs?**
Capacitor apps run inside a webview with a custom URL scheme (`capacitor://localhost`). Keycloak needs to allow these origins for OAuth2 authentication to work.

### 3. Install Dependencies

```bash
cd frontend
npm install
```

## Building for Mobile

### Quick Build & Open

```bash
# Build the app and sync to iOS, then open Xcode
npm run mobile:build
npm run mobile:open
```

### Step-by-Step

```bash
# 1. Build the frontend with mobile environment
npm run build:mobile

# 2. Sync the build to iOS native project
npm run cap:sync:ios

# 3. Open Xcode
npm run cap:open:ios
```

## Running on Device/Simulator

1. In Xcode, select your target device (simulator or physical iPhone)
2. Click the "Play" button or press `Cmd+R`
3. The app will build and launch

**For physical devices:**
- You'll need to configure signing in Xcode (select your development team)
- Your device must be in Developer Mode (Settings → Privacy & Security → Developer Mode)

## Development Workflow

### Testing Changes

After making changes to the Vue frontend:

```bash
# Rebuild and sync
npm run mobile:build

# Xcode will detect the changes
# Just rebuild in Xcode (Cmd+R)
```

### Debugging

- Use Safari Web Inspector to debug the webview:
  1. Run app on simulator/device
  2. Open Safari → Develop → [Your Device] → localhost
  3. This opens the web inspector for the Capacitor webview

### Live Reload (Advanced)

For faster development, you can point Capacitor to your local Vite dev server:

1. Start Vite dev server: `npm run dev`
2. Find your local IP address: `ifconfig | grep "inet "`
3. Update `capacitor.config.ts` temporarily:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:5173',
     cleartext: true
   }
   ```
4. Sync and rebuild: `npm run cap:sync:ios`

**Note:** Remember to remove the `server` config before building for production!

## Troubleshooting

### Build Fails in Xcode

- Try cleaning the build folder: `Product → Clean Build Folder` (Shift+Cmd+K)
- Update CocoaPods: `cd ios/App && pod install`

### Authentication Fails

- Verify Keycloak redirect URIs are configured correctly
- Check that `.env.mobile` has the correct Keycloak URL
- Ensure your Keycloak dev instance is accessible from your device (not localhost)

### API Calls Fail

- Verify `VITE_API_BASE_URL` in `.env.mobile` is correct
- Check that your backend dev instance is running and accessible
- Test the backend URL in a browser to confirm it's reachable

### CocoaPods Issues

If you get CocoaPods errors:
```bash
cd ios/App
pod repo update
pod install
```

## File Structure

```
frontend/
├── .env.mobile              # Mobile build environment config
├── capacitor.config.ts      # Capacitor configuration
├── ios/                     # Native iOS project (generated)
│   └── App/                 # Xcode project
└── src/
    └── service/http.js      # API client (auto-detects mobile vs web)
```

## GitHub Actions

The CI pipeline includes a mobile build verification job that runs on every push. This ensures the mobile build compiles successfully but does not deploy anywhere.

To set up CI, add this GitHub secret:
- `VITE_API_BASE_URL_MOBILE`: Your Render backend URL (e.g., `https://your-backend-dev.onrender.com`)

## Notes

- The mobile build uses the **same dev backend and Keycloak** as your web development environment
- No separate mobile infrastructure is needed
- The app is built for local development/testing only (not App Store distribution)
- Web and mobile builds share the same codebase with minimal conditional logic
