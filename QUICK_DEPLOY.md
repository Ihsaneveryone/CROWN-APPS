# 🚀 QUICK DEPLOYMENT GUIDE - CROWN DAILY INDICATORS

## ✅ **KONFIGURASI YANG SUDAH READY**

### **Master Configuration**
- ✅ Spreadsheet ID: `1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0`
- ✅ Google Drive Folder ID: `1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU`
- ✅ Drive Folder Link: https://drive.google.com/drive/folders/1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU

---

## 📋 **STEP-BY-STEP DEPLOYMENT**

### **STEP 1: Verify Google Drive Folder Sharing** ⏱️ 30 detik

1. **Buka link**: https://drive.google.com/drive/folders/1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU?usp=sharing

2. **Klik tombol Share** (pojok kanan atas)

3. **Pastikan setting**:
   ```
   General access: Anyone with the link
   Role: Viewer ✅
   ```

4. **Jika belum public**:
   - Click "Change" di bagian "Restricted"
   - Pilih "Anyone with the link"
   - Role: Viewer
   - Click "Done"

---

### **STEP 2: Deploy Apps Script Master** ⏱️ 2 menit

1. **Buka spreadsheet master**:
   ```
   https://docs.google.com/spreadsheets/d/1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0/edit
   ```

2. **Buka Apps Script**:
   - Menu: Extensions → Apps Script

3. **Hapus semua kode lama** (Ctrl+A → Delete)

4. **Copy-paste kode baru**:
   - Buka file: `APPS_SCRIPT_MASTER_FINAL.gs` 
   - Copy SEMUA kode (Ctrl+A → Ctrl+C)
   - Paste ke Apps Script editor (Ctrl+V)

5. **PENTING - Cek konfigurasi** (line 24-26):
   ```javascript
   const MASTER_SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';
   const MASTER_GDRIVE_FOLDER_ID = '1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU'; // ✅
   ```
   **Pastikan kedua ID sudah benar!**

6. **Save**: Ctrl+S atau File → Save

7. **Setup header submissions** (sekali saja):
   - Pilih function: `setupSubmissionsHeader` dari dropdown
   - Click **Run** (▶️ button)
   - **Allow permissions** jika muncul popup:
     - Click "Review Permissions"
     - Pilih akun Google Anda
     - Click "Advanced" → "Go to [project name] (unsafe)"
     - Click "Allow"
   - Tunggu sampai selesai (cek Execution log)

8. **Deploy as Web App**:
   - Click **Deploy** → **New deployment**
   - Click ⚙️ icon di samping "Select type"
   - Pilih: **Web app**
   - Settings:
     ```
     Description: CROWN Master API v1
     Execute as: Me (your email)
     Who has access: Anyone
     ```
   - Click **Deploy**
   - **COPY DEPLOYMENT URL** (simpan!)
     ```
     Format: https://script.google.com/macros/s/AKfycbz.../exec
     ```

---

### **STEP 3: Update Frontend** ⏱️ 30 detik

1. **Buka file**: `src/app/utils/api.ts`

2. **Find line 57** (Ctrl+G → ketik 57):
   ```typescript
   const APPS_SCRIPT_URL = 'PASTE_URL_DEPLOYMENT_ANDA_DISINI';
   ```

3. **Replace** dengan URL deployment dari Step 2.8:
   ```typescript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```

4. **Save**: Ctrl+S

---

### **STEP 4: Build & Deploy Frontend** ⏱️ 1 menit

```bash
# Install dependencies (jika belum)
pnpm install

# Build production
pnpm run build

# Deploy ke hosting (sesuai platform Anda)
# Vercel/Netlify/dll
```

---

### **STEP 5: Register Master Branch di App** ⏱️ 1 menit

1. **Login** sebagai Super Admin di aplikasi

2. **Pilih tab**: "Kelola Cabang"

3. **Klik**: "Tambah Cabang Baru"

4. **Isi form MASTER branch**:
   ```
   NIK Cabang: A336
   Nama Cabang: Toko Master A336
   Nama Admin: MGR AZKO
   URL Google Spreadsheet: https://docs.google.com/spreadsheets/d/1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0/edit
   URL Apps Script: [PASTE URL DEPLOYMENT DARI STEP 2.8]
   Google Drive Folder ID: 1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU
   ```

5. **Klik**: "Buat Cabang"

---

## 🧪 **VERIFICATION CHECKLIST**

### **Test 1: Google Drive Folder Access** ✅
- [ ] Buka https://drive.google.com/drive/folders/1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU
- [ ] Folder bisa diakses tanpa login (public)
- [ ] Bisa melihat isi folder

### **Test 2: Apps Script Deployment** ✅
- [ ] Apps Script sudah deployed
- [ ] Bisa akses deployment URL di browser (muncul JSON response)
- [ ] Response berisi: `{"status":"ok","message":"Crown Daily Indicators - Master API"}`

### **Test 3: Frontend Connection** ✅
- [ ] Aplikasi bisa load list branches
- [ ] Tidak ada error di browser console (F12)
- [ ] Bisa login ke cabang master (A336)

### **Test 4: Submit dengan Foto** 🎯 **CRITICAL TEST**
1. **Login** sebagai staff di cabang A336
2. **Submit** daily indicators **DENGAN FOTO**:
   - Pilih indikator yang butuh foto (misal: Sales + foto)
   - Upload foto dari device
   - Klik "Submit"
3. **Cek browser console** (F12):
   ```
   📁 Google Drive folder ID: 1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU
   ✅ Uploaded to Drive: https://drive.google.com/uc?id=...
   ```
4. **Cek Google Sheets**:
   - Buka sheet "submissions"
   - Kolom J (photos) harus ada JSON:
     ```json
     {"sales":["https://drive.google.com/uc?id=abc123"]}
     ```
5. **Cek Google Drive Folder**:
   - Refresh folder Drive
   - Harus ada file foto baru (format: `submissionId_sales_0.jpg`)

### **Test 5: Export Excel dengan Foto** ✅
1. **Login** sebagai Admin cabang A336
2. **Buka**: Tab "Riwayat Semua Submission"
3. **Klik**: "Export Data" (button export Excel)
4. **Buka** file Excel yang ter-download
5. **Verify**: Foto muncul di cells (atau ada link ke foto)

---

## 🔍 **TROUBLESHOOTING QUICK FIXES**

### ❌ **Error: "Drive upload error"**
**Fix**:
```
1. Cek folder Drive sudah public (Step 1)
2. Cek MASTER_GDRIVE_FOLDER_ID benar di Apps Script (line 26)
3. Re-deploy Apps Script (Step 2.8)
4. Clear browser cache & retry submit
```

### ❌ **Foto tidak muncul di Google Sheets**
**Fix**:
```
1. Cek Apps Script execution log:
   - Apps Script editor → Executions (icon ⏱️)
   - Lihat ada error atau tidak
2. Pastikan frontend kirim gdriveFolderId (cek browser console)
3. Pastikan kolom J (photos) ada di sheet submissions
```

### ❌ **Error: "Missing action"**
**Fix**:
```
1. Apps Script belum deployed atau deployment lama
2. Re-deploy dengan Step 2.8
3. Update APPS_SCRIPT_URL di frontend (Step 3)
```

### ❌ **Export Excel foto tidak muncul**
**Fix**:
```
1. Cek kolom J (photos) di Google Sheets ada Drive URLs
2. Jika kosong → foto tidak ter-upload, submit ulang dengan foto
3. Jika ada URLs → coba download Excel lagi
4. Pastikan Excel viewer support gambar (Excel 2016+)
```

---

## 📊 **EXPECTED RESULTS**

### **Google Sheets - Column J (photos)**
```json
{
  "sales": ["https://drive.google.com/uc?id=1aB2cD3eF4gH"],
  "trx": [
    "https://drive.google.com/uc?id=5iJ6kL7mN8oP",
    "https://drive.google.com/uc?id=9qR0sT1uV2wX"
  ]
}
```

### **Google Drive Folder - File Structure**
```
📁 Foto Toko Master A336
  └── A336_staff123_20260528_sales_0.jpg
  └── A336_staff123_20260528_trx_0.jpg
  └── A336_staff123_20260528_trx_1.jpg
  └── ...
```

### **Browser Console - Success Log**
```
📸 ===== PHOTOS DEBUG =====
📷 photosData (full-size): 2 indicators with photos
🖼️ photosThumbs (40x40): 0 indicators with thumbnails
📁 Google Drive folder ID: 1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU

🚀 ===== SENDING TO APPS SCRIPT =====
📦 Payload action: addSubmission
✅ Response: {"success":true,"data":{"id":"...","photoCount":2}}
```

---

## 🎯 **DEPLOYMENT TIMELINE**

| Step | Time | Status |
|------|------|--------|
| 1. Verify Drive folder | 30s | ⏳ |
| 2. Deploy Apps Script | 2min | ⏳ |
| 3. Update frontend | 30s | ⏳ |
| 4. Build & deploy | 1min | ⏳ |
| 5. Register branch | 1min | ⏳ |
| **TOTAL** | **~5 menit** | |

---

## ✅ **NEXT STEPS**

Setelah master berjalan sukses:

1. **Setup branch baru** (toko lain):
   - Follow: `SETUP_GOOGLE_DRIVE_LENGKAP.md`
   - Setiap toko butuh: Spreadsheet + Apps Script + Drive Folder

2. **Monitor usage**:
   - Apps Script quota: 20k requests/day per spreadsheet
   - Google Drive: 15GB free storage

3. **Backup**:
   - Foto otomatis tersimpan di Drive (already backup)
   - Sheets data: File → Download → Excel

---

**Happy Deploying! 🚀**

Jika ada error, cek section Troubleshooting atau hubungi support.
