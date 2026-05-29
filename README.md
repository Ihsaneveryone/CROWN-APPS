# 👑 CROWN - Daily Indicators Staff System

Sistem manajemen indikator harian untuk staff toko dengan integrasi Google Sheets dan fitur multi-device sync.

## ✨ Fitur Utama

### 📊 Staff Dashboard
- Submit indikator harian dengan mudah
- Upload foto bukti
- Lihat history submission
- Real-time scoring system

### 🔧 Admin Dashboard  
- Kelola indikator toko
- Review submission staff
- Ubah target dan bobot indikator
- Export data ke Excel
- Statistik dan grafik performance

### 👨‍💼 Super Admin Panel
- Manajemen multi-branch
- Ranking toko dan staff
- Template indikator global
- Kontrol akses sistem

### 🔄 Google Sheets Integration
- Auto-sync ke Google Sheets
- Backup otomatis
- Multi-device access
- Real-time collaboration

### 💾 Data Recovery System
- Auto-backup lokal
- Recovery console commands
- Version monitoring
- Cache management

## 🚀 Quick Start

### Jalankan di Komputer Lokal

Baca panduan lengkap di: **[SETUP_LOKAL.md](./SETUP_LOKAL.md)**

```bash
# Install dependencies
pnpm install

# Jalankan dev server
pnpm dev

# Build production
pnpm build
```

## 📱 Mobile App

Aplikasi ini responsive dan bisa diconvert ke:
- 📱 Android APK (via Capacitor)
- 🍎 iOS App (via Capacitor)
- 💻 Desktop App (via Electron)

## 🌐 Deploy Online GRATIS

- **Vercel**: [vercel.com](https://vercel.com) (Recommended)
- **Netlify**: [netlify.com](https://netlify.com)
- **GitHub Pages**: [pages.github.com](https://pages.github.com)

## 🔑 Fitur Keamanan

- ✅ Session management dengan localStorage
- ✅ Branch-level access control
- ✅ Admin & Super Admin roles
- ✅ Secret code untuk akses admin
- ✅ Data encryption ready

## 🛠️ Tech Stack

- ⚛️ **React 18** - UI Framework
- 🎨 **Tailwind CSS v4** - Styling
- 🔀 **React Router 7** - Navigation
- 📊 **TanStack Query** - Data fetching
- 📈 **Recharts** - Charts & graphs
- 📑 **ExcelJS** - Excel export
- 📄 **html2pdf.js** - PDF export
- 🎭 **Radix UI** - Accessible components
- 🔔 **Sonner** - Toast notifications
- 🎬 **Motion** - Animations

## 📂 Struktur Project

```
src/
├── app/
│   ├── App.tsx              # Main app component
│   ├── routes.tsx           # Route configuration
│   ├── types.ts             # TypeScript types
│   ├── components/          # React components
│   │   ├── admin/           # Admin dashboard
│   │   ├── superadmin/      # Super admin panel
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Libraries & configs
│   └── utils/               # Utility functions
└── styles/                  # Global styles
```

## 🎨 Customization

### Ubah Tema Warna

Edit file `src/styles/theme.css`:

```css
:root {
  --color-primary: #dc2626;    /* Red */
  --color-secondary: #ea580c;  /* Orange */
  --color-accent: #eab308;     /* Yellow */
}
```

### Ubah Logo & Branding

Ganti text "AZKO" di:
- `src/app/components/BranchSelector.tsx`
- `src/app/components/LoginPage.tsx`
- `src/app/components/LoadingScreen.tsx`

## 📊 Google Sheets Setup

1. Buat Google Spreadsheet baru
2. Copy spreadsheet ID dari URL
3. Buat API Key di Google Cloud Console
4. Enable Google Sheets API
5. Update config di `src/app/utils/googleSheets.ts`

## 🆘 Data Recovery

Aplikasi punya fitur recovery console. Buka browser console (F12) dan ketik:

```javascript
// Cek status backup
CROWN_RECOVERY.status()

// Lihat recovery logs
CROWN_RECOVERY.logs()

// Restore dari backup
CROWN_RECOVERY.fullRecovery()

// Lihat help
CROWN_RECOVERY.help()
```

## 🐛 Debugging

### Development Mode

```bash
# Run dengan logging
pnpm dev

# Cek browser console untuk logs
# Prefix: 🔍 📊 ✅ ❌ ⚡ 🔄
```

### Production Logs

```javascript
// Enable debug mode di console
localStorage.setItem('DEBUG', 'true')
```

## 📜 License

Created by **Management Trainee Batch 16 - Muhammad Ihsan**

## 🙏 Credits

- UI Components: [shadcn/ui](https://ui.shadcn.com)
- Icons: [Lucide Icons](https://lucide.dev)
- Colors: [Tailwind CSS](https://tailwindcss.com)

## 💬 Support

Untuk bantuan dan pertanyaan, hubungi developer atau buka issue di repository.

---

**Made with ❤️ for AZKO - Your Home Life Improvement Partner**

🎯 **CROWN System** - Complete Real-time Operational Workflow Navigator
