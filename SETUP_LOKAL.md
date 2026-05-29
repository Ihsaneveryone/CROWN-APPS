# 🚀 Setup Aplikasi CROWN di Komputer Lokal

## 📋 Prerequisites
- **Node.js** versi 18+ ([Download](https://nodejs.org/))
- **pnpm** package manager (`npm install -g pnpm`)
- **Google Sheets API Key** (jika ingin fitur sync)

## 📦 Langkah 1: Download Project

1. Download/export project ini dari Figma Make
2. Extract ke folder di komputer Anda

## 🔧 Langkah 2: Setup Environment

Buat file `index.html` di root folder:

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CROWN - Daily Indicators System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Buat file `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## 📝 Langkah 3: Konfigurasi Google Sheets (Opsional)

Edit file `src/app/utils/googleSheets.ts`:

```typescript
// Ganti dengan API Key dan Spreadsheet ID Anda
const GOOGLE_SHEETS_API_KEY = 'YOUR_API_KEY_HERE';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

Cara mendapatkan:
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru
3. Enable "Google Sheets API"
4. Buat API Key di "Credentials"
5. Buat Google Spreadsheet baru dan copy ID-nya (dari URL)

## 🎮 Langkah 4: Install & Run

Buka terminal/command prompt di folder project, lalu:

```bash
# Install dependencies
pnpm install

# Jalankan development server
pnpm dev

# Aplikasi akan berjalan di http://localhost:5173
```

## 📦 Langkah 5: Build untuk Production

```bash
# Build aplikasi
pnpm build

# Hasil build ada di folder 'dist/'
# Upload folder 'dist/' ke hosting (Vercel, Netlify, dll)
```

## 🌐 Deploy ke Hosting GRATIS

### Option A: Vercel (Recommended)
1. Buat akun di [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`
3. Di folder project, jalankan: `vercel`
4. Ikuti instruksi, aplikasi akan online!

### Option B: Netlify
1. Buat akun di [netlify.com](https://netlify.com)
2. Drag & drop folder `dist/` ke Netlify
3. Aplikasi langsung online!

### Option C: GitHub Pages
1. Push ke GitHub repository
2. Enable GitHub Pages di Settings
3. Set source ke `gh-pages` branch

## 📱 Build sebagai APK Android (Bonus!)

Gunakan **Capacitor** untuk convert ke mobile app:

```bash
# Install Capacitor
pnpm add @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init "CROWN System" "com.azko.crown"

# Add Android platform
npx cap add android

# Build & sync
pnpm build
npx cap sync

# Buka di Android Studio
npx cap open android
```

Di Android Studio, build APK dengan:
- Build > Build Bundle(s) / APK(s) > Build APK(s)

## 🔧 Troubleshooting

### Error: "Cannot find module"
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Port already in use"
```bash
# Gunakan port lain
pnpm dev --port 3000
```

### Google Sheets tidak connect
- Pastikan API Key benar
- Pastikan Spreadsheet ID benar
- Pastikan Google Sheets API sudah enabled
- Cek browser console untuk error detail

## 📞 Support

Jika ada masalah, cek:
1. Browser console (F12) untuk error messages
2. Terminal output untuk error logs
3. Pastikan semua dependencies terinstall

## 🎉 Selamat!

Aplikasi CROWN Anda sudah siap digunakan! 🎊

---

**Dibuat dengan ❤️ oleh Management Trainee Batch 16 - Muhammad Ihsan**
