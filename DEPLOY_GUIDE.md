# 🚀 Panduan Deploy Aplikasi CROWN

## 📦 Persiapan Sebelum Deploy

### 1. Export dari Figma Make
1. Download/export seluruh project dari Figma Make
2. Extract ke folder di komputer Anda
3. Ikuti langkah berikut

### 2. Setup File yang Diperlukan

Setelah extract, **rename file-file berikut** (hapus `.template`):

```bash
# Rename files
mv index.html.template index.html
mv src/main.tsx.template src/main.tsx
```

### 3. Konfigurasi Google Sheets API (PENTING!)

Edit `src/app/utils/googleSheets.ts`:

```typescript
// Baris 3-4, ganti dengan data Anda:
const GOOGLE_SHEETS_API_KEY = 'YOUR_API_KEY_HERE';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

**Cara Mendapatkan API Key:**
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing
3. Enable **Google Sheets API** di Library
4. Buat Credentials → API Key
5. Copy API Key yang diberikan

**Cara Mendapatkan Spreadsheet ID:**
1. Buat Google Spreadsheet baru
2. Buka spreadsheet tersebut
3. Copy ID dari URL (bagian setelah `/d/`)
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

## 🌐 Deploy ke Vercel (GRATIS & MUDAH)

### Metode 1: Via CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Ikuti instruksi interaktif
# - Project name: crown-system
# - Framework: Vite
# - Build command: pnpm build
# - Output directory: dist
```

### Metode 2: Via GitHub

1. Push project ke GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/crown-system.git
git push -u origin main
```

2. Buka [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Import from GitHub
5. Pilih repository Anda
6. Deploy!

**Environment Variables di Vercel:**
- Tidak perlu set environment variables
- API key sudah hardcoded di code
- (Untuk production sebenarnya, gunakan environment variables)

## 🎯 Deploy ke Netlify (GRATIS)

### Metode 1: Drag & Drop

```bash
# Build dulu
pnpm install
pnpm build

# Upload folder 'dist/' ke netlify.com
```

1. Buka [netlify.com](https://netlify.com)
2. Login/Sign up
3. Drag & drop folder `dist/`
4. Selesai!

### Metode 2: Via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## 📱 Build Android APK

### Prerequisites
- Android Studio terinstall
- Java JDK 17+

### Langkah:

```bash
# 1. Install Capacitor
pnpm add @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init "CROWN System" "com.azko.crown"

# 3. Build web app
pnpm build

# 4. Add Android platform
npx cap add android

# 5. Sync files
npx cap sync

# 6. Open di Android Studio
npx cap open android
```

**Di Android Studio:**
1. Build → Generate Signed Bundle / APK
2. Pilih APK
3. Create new keystore (atau gunakan existing)
4. Build release APK
5. APK ada di: `android/app/build/outputs/apk/release/`

### Install APK di HP
1. Transfer APK ke HP Android
2. Enable "Install from Unknown Sources"
3. Tap APK dan install
4. Selesai! 🎉

## 🍎 Build iOS App

**Prerequisites:**
- MacOS dengan Xcode
- Apple Developer Account ($99/year)

```bash
# Add iOS platform
npx cap add ios

# Sync
npx cap sync

# Open di Xcode
npx cap open ios
```

Di Xcode:
1. Set Bundle Identifier
2. Set Signing & Capabilities
3. Build → Archive
4. Distribute App → App Store Connect

## 💻 Build Desktop App (Electron)

```bash
# Install Electron
pnpm add -D electron electron-builder

# Install Vite Electron plugin
pnpm add -D vite-plugin-electron

# Build
pnpm build
```

Output: `.exe` (Windows), `.dmg` (Mac), `.AppImage` (Linux)

## 🔧 Troubleshooting

### Build Error: "Module not found"
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Deploy Error: "Build failed"
- Cek Node.js version (harus 18+)
- Pastikan semua dependencies terinstall
- Cek build logs untuk error spesifik

### Google Sheets tidak berfungsi setelah deploy
- Pastikan API Key benar
- Pastikan Spreadsheet ID benar
- Pastikan Google Sheets API enabled
- Cek browser console untuk error

### Mobile app tidak bisa build
- Pastikan Android Studio/Xcode terinstall
- Update Capacitor: `pnpm update @capacitor/cli`
- Clean build: `cd android && ./gradlew clean`

## 📊 Monitoring & Analytics

### Tambah Google Analytics (Optional)

1. Buat property di [analytics.google.com](https://analytics.google.com)
2. Install package:
```bash
pnpm add react-ga4
```

3. Add di `src/main.tsx`:
```typescript
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
```

## 🔐 Security Best Practices

### Untuk Production:
1. **Jangan hardcode API keys** - gunakan environment variables
2. **Enable HTTPS** - Vercel/Netlify otomatis provide
3. **Rate limiting** - implement di backend
4. **Input validation** - sudah ada di code
5. **CORS configuration** - set di Google Cloud Console

### Environment Variables:
Buat file `.env`:
```env
VITE_GOOGLE_SHEETS_API_KEY=your_key_here
VITE_SPREADSHEET_ID=your_id_here
```

Update `src/app/utils/googleSheets.ts`:
```typescript
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
```

## 🎉 Selesai!

Aplikasi Anda sekarang online dan bisa diakses dari mana saja!

### Checklist Final:
- ✅ Aplikasi bisa diakses via URL
- ✅ Google Sheets sync berfungsi
- ✅ Mobile responsive
- ✅ PWA installable (auto dari Vite)
- ✅ Fast loading (<3 detik)

---

**Selamat! Aplikasi CROWN Anda sudah production-ready! 🎊**

Untuk bantuan lebih lanjut, hubungi developer atau baca dokumentasi lengkap di README.md
