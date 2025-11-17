# Mobile Setup Checklist

Use this checklist to set up and test the mobile app.

## Initial Setup (One-Time)

### 1. Configure Environment
- [ ] Copy `.env.mobile.example` to `.env.mobile`
  ```bash
  cd frontend
  cp .env.mobile.example .env.mobile
  ```
- [ ] Edit `.env.mobile` and replace placeholder URLs:
  - [ ] `VITE_API_BASE_URL` → Your Render backend URL (e.g., `https://todo-backend-dev.onrender.com`)
  - [ ] `VITE_KEYCLOAK_URL` → Your Render Keycloak URL (e.g., `https://todo-keycloak-dev.onrender.com`)
  - [ ] Verify `VITE_KEYCLOAK_REALM` and `VITE_KEYCLOAK_CLIENT_ID` match your Keycloak config

### 2. Configure Keycloak Client
- [ ] Log into Keycloak Admin Console
- [ ] Navigate to: Clients → `todo-project-client`
- [ ] Under **Valid Redirect URIs**, add:
  - [ ] `capacitor://localhost`
  - [ ] `http://localhost`
- [ ] Under **Valid Post Logout Redirect URIs**, add:
  - [ ] `capacitor://localhost`
  - [ ] `http://localhost`
- [ ] Under **Web Origins**, add:
  - [ ] `capacitor://localhost`
  - [ ] `http://localhost`
- [ ] Click **Save**

### 3. Install Dependencies (If Not Already Done)
- [ ] Install npm dependencies
  ```bash
  cd frontend
  npm install
  ```

### 4. Build Mobile App
- [ ] Build the Vue app with mobile configuration
  ```bash
  npm run build:mobile
  ```
- [ ] Verify build succeeded (check for `dist/` folder)

### 5. Sync to iOS
- [ ] Sync the build to iOS native project
  ```bash
  npm run cap:sync:ios
  ```
  Or use the combined command:
  ```bash
  npm run mobile:build
  ```

### 6. Open in Xcode
- [ ] Open the iOS project in Xcode
  ```bash
  npm run mobile:open
  ```
- [ ] Wait for Xcode to open

### 7. Configure Xcode Signing (If Using Physical Device)
- [ ] In Xcode, select the project in the navigator (top item)
- [ ] Select the "App" target
- [ ] Under "Signing & Capabilities" tab:
  - [ ] Check "Automatically manage signing"
  - [ ] Select your Team (Apple Developer account)
- [ ] If you see signing errors, try changing the Bundle Identifier slightly (e.g., add your initials)

### 8. Run on Simulator or Device
- [ ] In Xcode, select your target device from the dropdown (e.g., "iPhone 16 Pro")
- [ ] Click the "Play" button (▶) or press `Cmd+R`
- [ ] Wait for the app to build and launch
- [ ] The app should open in the simulator/device

## Testing the App

### Basic Functionality
- [ ] App launches successfully
- [ ] App shows login screen
- [ ] Click "Sign In" - redirects to Keycloak
- [ ] Enter Keycloak credentials
- [ ] Successfully redirected back to app
- [ ] Can see the todo dashboard
- [ ] Can create a new todo item
- [ ] Can view existing todo items
- [ ] Can delete a todo item
- [ ] Can log out

### Debugging (If Issues Occur)
- [ ] Open Safari Web Inspector:
  1. [ ] Run app on simulator/device
  2. [ ] Open Safari → Develop → [Your Device] → localhost
  3. [ ] Check console for errors
- [ ] Verify backend is reachable:
  - [ ] Open browser on your Mac
  - [ ] Visit your `VITE_API_BASE_URL` + `/actuator/health`
  - [ ] Should see `{"status":"UP"}`
- [ ] Verify Keycloak is reachable:
  - [ ] Visit your `VITE_KEYCLOAK_URL` in browser
  - [ ] Should see Keycloak welcome page

### Common Issues

#### "Network request failed" or "Cannot connect to server"
- [ ] Verify `VITE_API_BASE_URL` in `.env.mobile` is correct
- [ ] Verify your backend dev instance is running on Render
- [ ] Try visiting the backend URL in your phone's Safari browser

#### Authentication fails or infinite redirect loop
- [ ] Verify Keycloak redirect URIs are configured correctly
- [ ] Verify `VITE_KEYCLOAK_URL` in `.env.mobile` is correct
- [ ] Try clearing app data (delete app from simulator/device and reinstall)

#### "Build Failed" in Xcode
- [ ] Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
- [ ] Try running `pod install` in `ios/App` directory:
  ```bash
  cd ios/App
  pod install
  cd ../..
  ```

#### Changes not showing up in app
- [ ] Rebuild the mobile app:
  ```bash
  npm run mobile:build
  ```
- [ ] Rebuild in Xcode (Cmd+R)

## Making Changes to the App

### After modifying Vue code:
1. [ ] Rebuild mobile app
   ```bash
   npm run mobile:build
   ```
2. [ ] Rebuild in Xcode (Cmd+R)

### To test changes quickly without Xcode:
1. [ ] Run Vite dev server
   ```bash
   npm run dev
   ```
2. [ ] Test in browser first at `http://localhost:5173`
3. [ ] Once working, build for mobile

## GitHub Actions CI Setup

To enable mobile build verification in CI:
- [ ] Add GitHub repository secret:
  - [ ] Name: `VITE_API_BASE_URL_MOBILE`
  - [ ] Value: Your Render backend URL (e.g., `https://todo-backend-dev.onrender.com`)

This will make the `build-mobile` job run successfully in CI.

## Verification Complete ✓

Once you've checked all items above, your mobile app should be fully functional!

## Next Steps (Optional)

- [ ] Test on a physical iPhone
- [ ] Add app icon (in Xcode: Assets.xcassets → AppIcon)
- [ ] Customize splash screen
- [ ] Add Android support (`npx cap add android`)
- [ ] Explore Capacitor plugins for native features

## Reference Documents

- See `frontend/MOBILE_SETUP.md` for detailed setup instructions
- See `MOBILE_IMPLEMENTATION_SUMMARY.md` for technical implementation details
- See `CLAUDE.md` for full project documentation
