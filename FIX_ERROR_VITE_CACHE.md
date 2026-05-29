# 🔧 FIX ERROR: DEFAULT_ROLE_INDICATORS Undefined

## Error yang Muncul:
```
Cannot read properties of undefined (reading 'Advisor')
```

## Root Cause:
**Vite cache corrupted** setelah edit `roleIndicators.ts`

---

## ✅ SOLUSI (2 Menit):

### STEP 1: Stop Dev Server

Di terminal tempat dev server jalan:
1. **Tekan Ctrl+C**
2. **Tunggu** sampai server stop

---

### STEP 2: Clear Vite Cache

Jalankan command ini di terminal:

```bash
rm -rf node_modules/.vite
```

---

### STEP 3: Restart Dev Server

```bash
npm run dev
```

**Atau jika pakai pnpm:**
```bash
pnpm dev
```

---

### STEP 4: Hard Refresh Browser

1. **Tekan Ctrl+Shift+R** (hard refresh)
2. **Atau Ctrl+F5**

---

## 🎯 Setelah Restart:

1. **Login** sebagai Advisor
2. **Indikator PASTI muncul** (6 indikator)
3. **No error lagi!**

---

## ❓ Jika Masih Error:

### Solusi Alternatif: Clear ALL Cache

```bash
# Stop server
Ctrl+C

# Clear ALL cache
rm -rf node_modules/.vite
rm -rf dist
rm -rf .turbo

# Restart
npm run dev
```

---

## 📸 Jika Masih Tidak Jalan:

Screenshot:
1. Terminal error (saat `npm run dev`)
2. Browser console error
3. Kirim ke saya

---

**PASTI JALAN setelah restart dev server!** 🚀
