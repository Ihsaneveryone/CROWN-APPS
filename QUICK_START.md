# ⚡ Quick Start - Aplikasi CROWN

## 🎯 Download & Setup dalam 5 Menit!

### Step 1: Export dari Figma (1 menit)
1. Cari tombol **"Export"** atau **"Download"** di Figma Make
2. Download project sebagai ZIP
3. Extract ke folder `crown-system`

### Step 2: Rename Files (30 detik)
```bash
cd crown-system

# Windows (Command Prompt)
rename index.html.template index.html
rename src\main.tsx.template src\main.tsx

# Mac/Linux (Terminal)
mv index.html.template index.html
mv src/main.tsx.template src/main.tsx
```

### Step 3: Install Dependencies (2 menit)
```bash
# Install pnpm jika belum punya
npm install -g pnpm

# Install dependencies
pnpm install
```

### Step 4: Run! (30 detik)
```bash
pnpm dev
```

Buka browser: **http://localhost:5173**

🎉 **SELESAI!** Aplikasi sudah jalan!

---

## 🚀 Deploy Online (5 menit tambahan)

### Vercel (Paling Mudah):
```bash
# Install Vercel
npm install -g vercel

# Deploy (ikuti instruksi)
vercel
```

**ATAU** drag-drop folder `dist/` ke [vercel.com](https://vercel.com) setelah `pnpm build`

---

## 📱 Build APK Android (15 menit)

```bash
# Install Capacitor
pnpm add @capacitor/core @capacitor/cli @capacitor/android

# Setup
npx cap init "CROWN System" "com.azko.crown"
npx cap add android

# Build & Open
pnpm build
npx cap sync
npx cap open android
```

Di Android Studio: **Build > Build APK**

---

## 🆘 Masalah?

### "Command not found: pnpm"
```bash
npm install -g pnpm
```

### "Port 5173 already in use"
```bash
pnpm dev --port 3000
```

### Error lainnya?
```bash
# Reset everything
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📚 Dokumentasi Lengkap

- **Setup detail**: [SETUP_LOKAL.md](./SETUP_LOKAL.md)
- **Panduan deploy**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
- **Features**: [README.md](./README.md)

---

**Made with ❤️ - Selamat mencoba!**
