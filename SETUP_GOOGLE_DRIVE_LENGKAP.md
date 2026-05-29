# 📘 PANDUAN LENGKAP - Setup CROWN dengan Google Drive

## 🎯 Arsitektur: 1 Toko = 3 Link

Setiap toko/cabang membutuhkan:
1. **Google Spreadsheet** - Database toko
2. **Apps Script Deployment URL** - Backend API toko  
3. **Google Drive Folder ID** - Storage foto toko

---

## 📋 PART 1: Setup Spreadsheet MASTER (Sekali saja)

### Step 1.1: Setup Spreadsheet Master
1. Buka spreadsheet master Anda (ID: `1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0`)
2. Pastikan ada sheet: `branches`, `submissions`, `settings`, `indicators`

### Step 1.2: Deploy Apps Script Master
1. **Buka Apps Script** dari spreadsheet master:
   - Extensions → Apps Script
   
2. **Copy kode** dari `APPS_SCRIPT_MASTER_FINAL.gs`:
   ```javascript
   const MASTER_SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';
   // ... copy semua kode
   ```

3. **Deploy as Web App**:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me** (your email)
   - Who has access: **Anyone**
   - Click **Deploy**
   - **COPY URL** deployment (contoh: `https://script.google.com/macros/s/AKfycbz.../exec`)

4. **Update frontend**:
   Edit `src/app/utils/api.ts` line 57:
   ```typescript
   const APPS_SCRIPT_URL = 'PASTE_URL_MASTER_DISINI';
   ```

5. **Test connection**:
   - Run function `setupSubmissionsHeader()` dari Apps Script editor (Run → setupSubmissionsHeader)
   - Cek sheet `submissions` → header harus ada

---

## 📋 PART 2: Setup Branch/Cabang Baru

### Step 2.1: Buat Google Spreadsheet Baru
1. **Buat spreadsheet baru** untuk toko (misal: "Toko A417")
2. **Buat 3 sheets**: `submissions`, `settings`, `indicators`
3. **Share** spreadsheet:
   - Click **Share** → "Anyone with the link" → **Viewer**
4. **Copy Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
                                          ^^^^^^^^^^^^^^^^^^^^^^
                                          INI SPREADSHEET ID
   ```

### Step 2.2: Buat Google Drive Folder untuk Foto
1. **Buat folder baru** di Google Drive (misal: "Foto Toko A417")
2. **Share** folder:
   - Klik kanan folder → Share → "Anyone with the link" → **Viewer**
3. **Copy Folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
                                           ^^^^^^^^^^^^^^^^^^^^^^
                                           INI FOLDER ID
   ```

### Step 2.3: Deploy Apps Script Branch
1. **Buka Apps Script** dari spreadsheet branch:
   - Extensions → Apps Script
   
2. **Copy kode** dari `APPS_SCRIPT_BRANCH_TEMPLATE.gs`

3. **Edit KONFIGURASI** (line 26-29):
   ```javascript
   const BRANCH_SPREADSHEET_ID = 'PASTE_ID_SPREADSHEET_BRANCH_DISINI';
   const GDRIVE_FOLDER_ID = 'PASTE_ID_FOLDER_DRIVE_DISINI';
   ```

4. **Save** (Ctrl+S)

5. **Setup sheets** (Jalankan sekali):
   - Run → `setupBranchSpreadsheet`
   - Cek 3 sheets sudah ada header

6. **Deploy as Web App**:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me** (your email)
   - Who has access: **Anyone**
   - Click **Deploy**
   - **COPY URL** deployment

### Step 2.4: Daftarkan Branch di Master
1. **Login** sebagai Super Admin di aplikasi
2. **Pilih tab** "Kelola Cabang"
3. **Klik** "Tambah Cabang Baru"
4. **Isi form**:
   - NIK Cabang: `A417`
   - Nama Cabang: `Toko A417`
   - Nama Admin: `Manager A417`
   - URL Google Spreadsheet: (paste URL spreadsheet branch)
   - URL Apps Script Deployment: (paste URL deployment branch)
   - Google Drive Folder ID: (paste folder ID)
5. **Klik** "Buat Cabang"

---

## 🧪 PART 3: Testing

### Test 1: Login & Submit dengan Foto
1. **Logout** dari Super Admin
2. **Pilih** cabang yang baru dibuat (A417)
3. **Login** dengan NIK staff di cabang itu
4. **Submit** daily indicators **DENGAN FOTO**
5. **Cek Google Sheets** → kolom `photos` harus ada JSON

### Test 2: Cek Foto di Google Drive
1. **Buka** Google Drive folder untuk cabang ini
2. **Harus ada** file foto yang ter-upload
3. **Format nama** file: `submissionId_indicatorId_0.jpg`

### Test 3: Export Excel dengan Foto
1. **Login** sebagai Admin cabang
2. **Buka** tab "Riwayat Semua Submission"
3. **Klik** "Export Data" (Excel)
4. **Buka** file Excel → foto harus muncul di cells!

---

## 🔍 Troubleshooting

### Masalah: Foto tidak tersimpan
**Solusi**:
1. Cek browser console (F12) saat submit
2. Lihat log "📁 Google Drive folder ID: ..." → harus ada ID
3. Cek Apps Script log (Apps Script editor → Executions)
4. Pastikan `GDRIVE_FOLDER_ID` benar di script

### Masalah: Error "Drive upload error"
**Solusi**:
1. Pastikan folder Google Drive sudah dishare **"Anyone with the link"**
2. Cek folder ID benar (copy dari URL folder)
3. Cek quota Google Drive belum penuh

### Masalah: Foto hilang saat export Excel
**Solusi**:
1. Cek Google Sheets kolom `photos` → harus ada JSON berisi Drive URLs
2. Jika kosong, berarti foto tidak ter-upload ke Drive
3. Coba submit ulang dengan foto baru

---

## 📊 Struktur Data di Google Sheets

### Sheet: submissions (Kolom A-O)
```
A: id
B: branchId
C: userNik
D: userName
E: userRole
F: date
G: createdAt
H: totalScore
I: data (JSON)
J: photos (JSON Drive URLs) ← KOLOM FOTO!
K: notes (JSON)
L: Reason
M: Approval
N: Admin NIK
O: Admin Nama
```

### Contoh isi kolom J (photos):
```json
{
  "sales": ["https://drive.google.com/uc?id=abc123"],
  "trx": ["https://drive.google.com/uc?id=def456", "https://drive.google.com/uc?id=ghi789"]
}
```

---

## 🚀 Checklist Setup Branch Baru

- [ ] Buat Google Spreadsheet baru
- [ ] Share spreadsheet "Anyone with the link" (Viewer)
- [ ] Copy Spreadsheet ID
- [ ] Buat Google Drive folder baru
- [ ] Share folder "Anyone with the link" (Viewer)
- [ ] Copy Folder ID
- [ ] Buka Apps Script dari spreadsheet
- [ ] Copy template `APPS_SCRIPT_BRANCH_TEMPLATE.gs`
- [ ] Edit `BRANCH_SPREADSHEET_ID` dan `GDRIVE_FOLDER_ID`
- [ ] Run `setupBranchSpreadsheet()` sekali
- [ ] Deploy as Web App (Execute: Me, Access: Anyone)
- [ ] Copy deployment URL
- [ ] Daftarkan branch di Super Admin dengan 3 link
- [ ] Test submit dengan foto
- [ ] Cek foto di Google Drive
- [ ] Test export Excel

---

## 💡 Tips

1. **Naming Convention Folder**: Gunakan nama jelas seperti "Foto Toko A417" agar mudah dikelola
2. **Backup**: Apps Script sudah auto-simpan ke Drive, jadi foto aman
3. **Quota**: Setiap toko dapat 20k requests/day (Apps Script) + 15GB storage (Drive gratis)
4. **Performance**: Foto di-compress otomatis jadi ~50-100KB, jadi hemat storage
5. **Security**: Link Drive "Anyone with link" HANYA viewer, tidak bisa edit/delete

---

## 📞 Support

Jika ada masalah:
1. Cek browser console log (F12)
2. Cek Apps Script execution log
3. Pastikan semua link sudah dishare public
4. Test koneksi dari frontend ke Apps Script

**Selamat mencoba! 🎉**
