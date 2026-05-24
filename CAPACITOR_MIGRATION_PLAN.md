# Capacitor.js Migration Plan - Arabic Prompt Repository App

**Project:** Arabic Prompt Repository → Mobile App (iOS/Android)  
**Current Stack:** React + TypeScript + Vite + Tailwind CSS + Supabase  
**Target Stack:** Capacitor.js + React + TypeScript + Tailwind CSS + Supabase  
**Date:** May 2026

---

## Executive Summary

This document outlines a step-by-step plan to transform your Arabic Prompt Repository website into a native iOS and Android app using Capacitor.js. The migration will maintain your existing React codebase while adding native platform capabilities and offline functionality.

**Key Benefits:**
- Reuse 95% of existing React code
- Access native device features (storage, permissions, notifications)
- Deploy on App Store and Google Play
- Improved offline experience
- Better performance on mobile devices

---

## Table of Contents

1. [Phase 1: Environment Setup](#phase-1-environment-setup)
2. [Phase 2: Capacitor Installation & Configuration](#phase-2-capacitor-installation--configuration)
3. [Phase 3: Code Modifications](#phase-3-code-modifications)
4. [Phase 4: Native Platform Integration](#phase-4-native-platform-integration)
5. [Phase 5: Testing & Optimization](#phase-5-testing--optimization)
6. [Phase 6: Build & Deployment](#phase-6-build--deployment)
7. [Timeline & Resources](#timeline--resources)
8. [Risks & Mitigation](#risks--mitigation)

---

## Phase 1: Environment Setup

### 1.1 Prerequisites
- **Node.js**: v16+ (verify current version)
- **npm**: v7+ or yarn v1.22+
- **iOS Development**:
  - macOS 11.0+
  - Xcode 13.0+ (iOS SDK 14+)
  - CocoaPods (`sudo gem install cocoapods`)
- **Android Development**:
  - Android Studio 4.1+
  - Android SDK (API level 24+)
  - Java Development Kit (JDK 11+)
  - Gradle 7.0+

### 1.2 System Validation
```bash
# Verify Node.js and npm
node --version
npm --version

# For iOS (macOS only)
xcodebuild -version
pod --version

# For Android
android --version
java -version
gradle --version
```

### 1.3 Dependencies to Add
Before installing Capacitor, ensure your build is optimized:
```bash
npm install --save-dev @capacitor/cli@latest
```

---

## Phase 2: Capacitor Installation & Configuration

### 2.1 Initialize Capacitor
```bash
# Step 1: Add Capacitor packages to your project
npm install @capacitor/core @capacitor/cli

# Step 2: Initialize Capacitor
npx cap init
```

**Interactive Setup Prompts:**
- App Name: `Arabic Prompt Repository` (or your preferred name)
- App ID: `com.example.promptrepository` (follow reverse domain notation)
- Web dir: `dist` (Vite's build output directory)
- Select platforms: Choose `ios` and `android`

### 2.2 Expected Output
```
✔ Creating capacitor.config.ts
✔ Adding Capacitor native platforms
  ios
  android
✔ Writing native Capacitor files
```

### 2.3 Install Platform-Specific Packages
```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android
```

### 2.4 Update `capacitor.config.ts`
Create or update `capacitor.config.ts` in your project root:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.promptrepository',
  appName: 'Prompty',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 3000,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

---

## Phase 3: Code Modifications

### 3.1 Update Vite Configuration
Modify `vite.config.ts` to ensure proper PWA/mobile support:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true, // Helpful for debugging on devices
  },
  server: {
    port: 3000,
    strictPort: false,
  },
});
```

### 3.2 Update HTML Viewport (index.html)
Ensure proper mobile viewport settings:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" 
          content="viewport-fit=cover, width=device-width, initial-scale=1.0, 
                   minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="true" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Prompty" />
    <meta name="theme-color" content="#000000" />
    <title>Prompty - Arabic Prompt Repository</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3.3 Add Capacitor Initialization
Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CapacitorUpdater } from '@capacitor/updater';
import App from './App';
import './index.css';

// Initialize Capacitor app
if (window.capacitor) {
  CapacitorUpdater.notifyAppReady();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 3.4 Handle Safe Area Insets (App.tsx)
Add support for notches and home indicators:

```typescript
import { useEffect, useState } from 'react';
import { SafeArea } from 'capacitor-plugin-safe-area';

export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    SafeArea.getStatus().then((status) => {
      setSafeArea({
        top: status.insets.top,
        bottom: status.insets.bottom,
        left: status.insets.left,
        right: status.insets.right,
      });
    });
  }, []);

  return safeArea;
};
```

**In your App component:**
```typescript
const safeArea = useSafeArea();

return (
  <div style={{ paddingTop: `${safeArea.top}px`, paddingBottom: `${safeArea.bottom}px` }}>
    {/* Your app content */}
  </div>
);
```

### 3.5 Add Offline Support
Install and configure SQLite plugin for offline data:

```bash
npm install @capacitor/storage
npm install capacitor-sqlcipher
```

Create `src/lib/offlineStorage.ts`:

```typescript
import { Storage } from '@capacitor/storage';

export const offlineStorage = {
  async savePrompts(prompts: any[]) {
    await Storage.set({
      key: 'cached_prompts',
      value: JSON.stringify(prompts),
    });
  },

  async getPrompts() {
    const result = await Storage.get({ key: 'cached_prompts' });
    return result.value ? JSON.parse(result.value) : null;
  },

  async clearCache() {
    await Storage.remove({ key: 'cached_prompts' });
  },
};
```

### 3.6 Update Authentication Flow
Add native authentication support in `src/lib/supabase.ts`:

```typescript
import { CapacitorHttp } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export const nativeAuth = {
  async storeSession(sessionData: any) {
    await Preferences.set({
      key: 'supabase_session',
      value: JSON.stringify(sessionData),
    });
  },

  async getSession() {
    const result = await Preferences.get({ key: 'supabase_session' });
    return result.value ? JSON.parse(result.value) : null;
  },

  async clearSession() {
    await Preferences.remove({ key: 'supabase_session' });
  },
};
```

### 3.7 Install Essential Plugins
```bash
# Core plugins for mobile functionality
npm install @capacitor/app
npm install @capacitor/device
npm install @capacitor/filesystem
npm install @capacitor/preferences
npm install @capacitor/keyboard
npm install @capacitor/splash-screen
npm install @capacitor/status-bar
```

---

## Phase 4: Native Platform Integration

### 4.1 Build Web Assets
```bash
npm run build
```

This creates the `dist/` folder that Capacitor will use for both iOS and Android apps.

### 4.2 iOS Setup

#### 4.2.1 Open iOS Project
```bash
npx cap open ios
```
This opens Xcode with your iOS project.

#### 4.2.2 Configure in Xcode
1. Select "Prompty" target
2. Go to **Build Settings**
3. Set **Deployment Target** to iOS 14.0+
4. Configure signing:
   - Team: Select your Apple Developer team
   - Bundle Identifier: `com.example.promptrepository`

#### 4.2.3 Configure App Capabilities
1. Select target → **Signing & Capabilities**
2. Add capabilities:
   - **App Groups** (for secure data sharing)
   - **Keychain Sharing** (for secure auth)
   - **Push Notifications** (if needed)

#### 4.2.4 Update Info.plist
In Xcode, add permissions in `Info.plist`:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location for the app to work</string>
<key>NSCameraUsageDescription</key>
<string>We need camera access</string>
```

### 4.3 Android Setup

#### 4.3.1 Open Android Project
```bash
npx cap open android
```
This opens Android Studio with your Android project.

#### 4.3.2 Configure in Android Studio
1. Update `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId = "com.example.promptrepository"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.10.0'
}
```

#### 4.3.2 Configure AndroidManifest.xml
Add required permissions in `android/app/src/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

#### 4.3.3 Configure ProGuard (if using release builds)
Create or update `android/app/proguard-rules.pro`:

```
# Supabase
-keep class com.supabase.** { *; }
-keepclassmembers class com.supabase.** { *; }

# Capacitor
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }
```

---

## Phase 5: Testing & Optimization

### 5.1 Local Testing

#### iOS Testing
```bash
# Build and sync
npm run build
npx cap sync ios

# Open in Xcode for testing
npx cap open ios

# Or use CLI to run in simulator
npx cap run ios
```

#### Android Testing
```bash
# Build and sync
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android

# Or use CLI to run on emulator/device
npx cap run android
```

### 5.2 Key Testing Checklist
- [ ] Authentication works on device
- [ ] Offline mode functions correctly
- [ ] Supabase sync works when online
- [ ] Safe area/notch rendering correct
- [ ] All UI elements are touch-friendly (minimum 44x44 points)
- [ ] Images load correctly
- [ ] Forms are responsive
- [ ] Back button behavior matches platform conventions
- [ ] Performance acceptable (< 3s load time)

### 5.3 Performance Optimization

#### Image Optimization
```bash
npm install sharp
```

Update `vite.config.ts` to optimize images:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});
```

#### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const AdditionalFeatures = lazy(() => 
  import('./components/AdditionalFeatures')
);

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdditionalFeatures />
    </Suspense>
  );
}
```

#### Remove Unused Dependencies
```bash
npm audit
npm prune
```

---

## Phase 6: Build & Deployment

### 6.1 iOS App Store Deployment

#### 6.1.1 Prepare App Store Connect
1. Create App on App Store Connect (https://appstoreconnect.apple.com)
2. Create Bundle ID matching `com.example.promptrepository`
3. Configure provisioning profiles

#### 6.1.2 Build for Release
```bash
# In Xcode:
# 1. Select Product → Scheme → Edit Scheme
# 2. Select Release configuration
# 3. Product → Archive
```

#### 6.1.3 Validate & Submit
```bash
# Using Xcode
# 1. Product → Archive
# 2. Distribute App
# 3. Follow App Store Connect upload wizard
```

### 6.2 Android Google Play Deployment

#### 6.2.1 Generate Signed APK/AAB
```bash
# In Android Studio:
# 1. Build → Generate Signed Bundle/APK
# 2. Select Android App Bundle (AAB) for Play Store
# 3. Create/select keystore
# 4. Select Release build variant
```

#### 6.2.2 Prepare Google Play Console
1. Go to https://play.google.com/console
2. Create new app
3. Upload App Bundle
4. Fill in app details (description, screenshots, etc.)
5. Set pricing and distribution

#### 6.2.3 Release Steps
```bash
# Build optimized release
./gradlew bundleRelease

# Output: android/app/release/app-release.aab
```

### 6.3 Version Management
Update in both places:

**iOS** (Xcode → Build Settings):
- Bundle Identifier: `com.example.promptrepository`
- Version: `1.0`
- Build: `1`

**Android** (`android/app/build.gradle`):
```gradle
versionCode 1
versionName "1.0"
```

**Web** (`package.json`):
```json
"version": "1.0.0"
```

---

## Phase 7: Continuous Integration & Updates

### 7.1 Set Up CI/CD Pipeline (GitHub Actions)
Create `.github/workflows/build.yml`:

```yaml
name: Build Mobile App

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      
      - name: Build Android
        run: |
          npx cap sync android
          cd android && ./gradlew bundleRelease
```

### 7.2 Auto-Update with Capacitor Live Updates
Install Capacitor Updater:
```bash
npm install @capacitor/updater
```

Configure in `capacitor.config.ts`:
```typescript
plugins: {
  Updater: {
    autoUpdate: true,
    updateUrl: 'https://your-server.com/updates',
  },
}
```

---

## Timeline & Resources

### Estimated Timeline: 6-10 weeks

| Phase | Duration | Notes |
|-------|----------|-------|
| Setup & Configuration | 1-2 weeks | Environment setup, Capacitor init |
| Code Modifications | 2 weeks | UI updates, offline support, auth |
| Platform Integration | 1-2 weeks | iOS/Android specific setup |
| Testing & Optimization | 2-3 weeks | Device testing, performance tuning |
| Deployment Prep | 1 week | Store setup, release builds |
| **Total** | **6-10 weeks** | |

### Resource Requirements
- **Developer Time**: 1 full-time developer
- **Devices for Testing**: 1 iOS device, 1 Android device (or emulators)
- **Apple Developer Account**: $99/year
- **Google Play Developer Account**: $25 (one-time)
- **Code Signing Certificates**: Free with developer accounts

---

## Risks & Mitigation

### Risk Matrix

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Supabase CORS issues on mobile | High | Use security rules, whitelist app domains |
| Storage quota exceeded | Medium | Implement cache expiration, cleanup old data |
| Authentication token expiry | Medium | Implement refresh token logic in offline storage |
| Performance degradation | Medium | Profile on real devices, optimize assets |
| Platform-specific bugs | Medium | Test thoroughly on both iOS & Android |
| App rejection on stores | Medium | Follow app store guidelines from start |

### Mitigation Strategies

1. **CORS Issues**
   - Use Supabase Row Level Security (RLS)
   - Whitelist app domain in Supabase settings
   - Test authentication flow on real device early

2. **Storage Management**
   - Implement data cleanup for offline cache
   - Monitor storage usage
   - Provide cache clearing option in settings

3. **Authentication**
   - Store refresh tokens securely using Preferences plugin
   - Implement token refresh before expiry
   - Handle 401 errors gracefully

4. **Performance**
   - Profile app using Xcode Instruments (iOS) and Android Profiler
   - Lazy load images
   - Implement virtual scrolling for long lists
   - Cache API responses

5. **Platform Testing**
   - Test on iOS 14+ devices
   - Test on Android 7+ devices
   - Test with different screen sizes
   - Test with slow network conditions

---

## Post-Launch Maintenance

### Month 1-3 (Stabilization)
- Monitor crash reports
- Fix critical bugs
- Gather user feedback
- Optimize performance based on usage

### Ongoing (Maintenance)
- Monthly dependency updates
- Monthly Capacitor updates
- Security patches
- Feature requests implementation
- Platform OS updates compatibility

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Web development server
npm run build            # Build web assets
npx cap open ios        # Open iOS project in Xcode
npx cap open android    # Open Android project in Android Studio

# Sync & Deploy
npx cap sync            # Sync web assets to native projects
npx cap sync ios        # Sync to iOS only
npx cap sync android    # Sync to Android only

# Testing
npx cap run ios         # Run on iOS simulator
npx cap run android     # Run on Android emulator

# Updates
npx cap update          # Update Capacitor to latest
npx cap doctor          # Check for issues
```

---

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Supabase Mobile Guide](https://supabase.com/docs/reference/javascript/auth-phone)

---

## Next Steps

1. **Immediately**: Review this plan with your team
2. **Week 1**: Set up development environments (iOS/Android)
3. **Week 1-2**: Install and initialize Capacitor
4. **Week 2-3**: Make code modifications and test locally
5. **Week 4**: Configure native platforms and test on real devices
6. **Week 5-6**: Optimize performance and conduct thorough testing
7. **Week 7**: Prepare app store submissions
8. **Week 8**: Submit to Apple App Store and Google Play

---

**Questions? Concerns? Next Steps:**
Please review this plan and let me know if you'd like to:
- Add specific features (push notifications, camera, geolocation, etc.)
- Clarify any technical details
- Adjust the timeline
- Add any additional integrations

