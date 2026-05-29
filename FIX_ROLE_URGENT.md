# 🚨 FIX URGENT: Role System Tidak Jalan

## 🔴 3 Masalah yang Ditemukan:

1. **Kolom userRole di spreadsheet KOSONG** → Role tidak tersimpan
2. **Admin History tidak tampil role** → Filter by role tidak jalan
3. **Staff Dashboard history tampil data rusak** (01/01/1985 | 00.00)

---

## 🔍 ROOT CAUSE:

**Apps Script BELUM di-deploy dengan code yang benar!**

Dari screenshot spreadsheet, kolom `userRole` masih KOSONG meskipun ada data submission. Ini berarti:
- Apps Script masih pakai code LAMA (tidak save role)
- ATAU header spreadsheet salah (role ditulis ke kolom yang salah)
- ATAU function `updateSubmissionsHeader` belum dijalankan

---

## ✅ SOLUSI LENGKAP (15 Menit)

### Step 1: Cek Header Spreadsheet "submissions"

1. **Buka Google Spreadsheet** → sheet "submissions"
2. **Lihat baris 1 (header)**
3. **Harus ada kolom ini (urutan PENTING!):**

```
A     B        C       D        E        F     G         H          I     J      K
id | branchId | userNik | userName | userRole | date | createdAt | totalScore | data | photos | notes
```

**PENTING:**
- **Kolom E** harus "userRole"
- Total **11 kolom** (A sampai K)

**Jika header TIDAK seperti ini atau kolom E bukan "userRole":**
→ **JALANKAN Step 2 dulu!**

---

### Step 2: Update Header dengan Apps Script

1. **Buka Apps Script Editor:**
   - Extensions → Apps Script

2. **GANTI SEMUA CODE** dengan code dari file: `APPS_SCRIPT_ROLE_FINAL.gs`
   - Ctrl+A → Delete (hapus semua code lama)
   - Copy dari file `APPS_SCRIPT_ROLE_FINAL.gs`
   - Paste (Ctrl+V)
   - Save (Ctrl+S)

3. **Jalankan function `updateSubmissionsHeader`:**
   - Pilih function `updateSubmissionsHeader` dari dropdown (toolbar atas)
   - Klik tombol **▶ Run**
   - Tunggu sampai selesai (cek Execution log)

4. **Verify:**
   - Buka sheet "submissions"
   - Cek baris 1 → harus ada kolom `userRole` di posisi E

---

### Step 3: Deploy Apps Script Ulang

**SANGAT PENTING!** Tanpa deploy ulang, perubahan tidak akan aktif!

1. **Klik Deploy** → **Manage deployments**

2. **Klik ✏️ (Edit)** pada deployment yang aktif

3. **Version:** Pilih **"New version"**

4. **Description:** Ketik "Role system fix"

5. **Klik Deploy**

6. **Tunggu** sampai selesai

7. **JANGAN lupa:** Pastikan "Who has access" = **"Anyone"**

---

### Step 4: Test Submit Baru

1. **Clear cache browser** (Ctrl+Shift+R atau F5 beberapa kali)

2. **Login** sebagai Cashier:
   - NIK: 12345 (atau NIK apapun)
   - Nama: Test Cashier
   - Role: **Cashier**

3. **Isi indikator Cashier:**
   - Sales ID: 5
   - Transaksi: 10
   - New Member: 3
   - Instant Upgrade: 2

4. **Submit**

5. **Buka Google Spreadsheet** → sheet "submissions"

6. **Cek baris terakhir** (submission yang baru):
   - **Kolom E (userRole)** → HARUS terisi "Cashier"
   - **Kolom I (data)** → HARUS terisi JSON seperti: `[{"id":"cashier-sales-id","value":5},...]`

**Jika kolom E masih kosong:**
→ Apps Script belum deploy dengan benar! Ulangi Step 2-3!

---

### Step 5: Migrasi Data Lama (OPSIONAL)

**Jika ada data lama yang kolom userRole-nya kosong:**

**OPSI A: Isi Manual (CEPAT - Recommended untuk data sedikit)**

1. Buka sheet "submissions"
2. Filter kolom E (userRole) → kosong
3. Isi manual berdasarkan NIK staff:
   - NIK tertentu → Advisor
   - NIK tertentu → Cashier
   - NIK tertentu → CS

**OPSI B: Hapus Data Lama (Jika tidak penting)**

1. Backup spreadsheet dulu!
2. Hapus semua row dengan userRole kosong
3. Mulai fresh dengan data baru

**OPSI C: Pakai Function Migrasi (ADVANCED)**

⚠️ **BACKUP DULU sebelum jalankan!**

1. Di Apps Script Editor, pilih function `migrateOldSubmissions`
2. Klik ▶ Run
3. Tunggu sampai selesai (bisa lama jika data banyak)
4. Cek Execution log untuk progress

**CATATAN:** Migrasi akan set userRole = kosong ('') karena data lama tidak punya info role. Anda tetap harus isi manual atau hapus.

---

### Step 6: Test Admin History & Filter

1. **Clear cache browser** (Ctrl+Shift+R)

2. **Login sebagai Admin**
   - NIK: A336 (atau admin NIK Anda)
   - Secret code admin

3. **Buka History/Riwayat**

4. **Cek:**
   - Kolom "Role" muncul di tabel? ✅
   - Filter dropdown "Role" ada? ✅

5. **Test Filter:**
   - Pilih "Cashier" dari dropdown role
   - **Expected:** Hanya submission dengan role Cashier yang muncul
   - **Jika "Tidak ada data":** Berarti belum ada submission Cashier (test submit dulu di Step 4)

---

### Step 7: Fix Data Rusak di Staff Dashboard

**Masalah:** Tampil "Selasa (01/01/1985 | 00.00)"

**Penyebab:** Data lama format berbeda atau parsing error

**Fix:**

Data rusak ini kemungkinan dari:
1. **Data lama** dengan struktur berbeda
2. **Kolom bergeser** karena update header

**Solusi:**

**OPSI 1: Hapus data rusak**
1. Buka sheet "submissions"
2. Cari row dengan date "1985" atau date aneh
3. Hapus row tersebut

**OPSI 2: Fix di code (Backward compatibility)**
Saya sudah tambahkan fallback di code, tapi data lama dengan struktur berbeda tetap akan error.

**BEST PRACTICE:**
- **Hapus semua data lama** (backup dulu!)
- **Mulai fresh** dengan struktur baru
- **Test submit baru** untuk semua role

---

## 🧪 TESTING CHECKLIST

Setelah semua step di atas, test satu per satu:

### ✅ Test 1: Submit Advisor

- [ ] Login sebagai Advisor
- [ ] Isi 6 indikator Advisor
- [ ] Submit
- [ ] Buka spreadsheet → kolom E (userRole) = "Advisor"
- [ ] Buka spreadsheet → kolom I (data) berisi JSON

### ✅ Test 2: Submit Cashier

- [ ] Login sebagai Cashier
- [ ] Isi 4 indikator Cashier
- [ ] Submit
- [ ] Buka spreadsheet → kolom E (userRole) = "Cashier"

### ✅ Test 3: Submit CS

- [ ] Login sebagai CS
- [ ] Isi 3 indikator CS
- [ ] Submit
- [ ] Buka spreadsheet → kolom E (userRole) = "CS"

### ✅ Test 4: Admin History

- [ ] Login sebagai Admin
- [ ] Buka History
- [ ] Kolom "Role" muncul
- [ ] Badge role (Advisor/Cashier/CS) muncul dengan warna berbeda

### ✅ Test 5: Filter by Role

- [ ] Pilih filter "Advisor" → hanya data Advisor muncul
- [ ] Pilih filter "Cashier" → hanya data Cashier muncul
- [ ] Pilih filter "CS" → hanya data CS muncul
- [ ] Pilih filter "Semua Role" → semua data muncul

### ✅ Test 6: Staff Dashboard History

- [ ] Login sebagai Advisor
- [ ] Tab "History"
- [ ] Data muncul dengan tanggal yang BENAR
- [ ] Score muncul dengan benar
- [ ] TIDAK ada tanggal "01/01/1985"

---

## 🔍 TROUBLESHOOTING

### Problem: Kolom userRole masih kosong setelah submit

**Diagnosa:**
1. **Buka Browser Console (F12)** saat submit
2. **Cek Network tab** → cari POST request ke Apps Script
3. **Klik request** → lihat **Payload**
4. **Cari** field `user.role` → ada isinya?

**Jika `user.role` ADA di payload tapi tidak tersimpan:**
→ Apps Script belum deploy dengan benar!

**Fix:**
- Pastikan code di Apps Script = code dari `APPS_SCRIPT_ROLE_FINAL.gs`
- Deploy ulang (jangan lupa pilih "New version"!)
- Clear cache browser

**Jika `user.role` TIDAK ADA di payload:**
→ Bug di frontend (tapi seharusnya sudah ada, saya sudah cek)

**Fix:**
- Clear cache browser KERAS (Ctrl+Shift+Delete → Clear all)
- Login ulang

---

### Problem: Filter by Role tidak jalan (selalu "Tidak ada data")

**Penyebab:**
- Data lama tidak punya field role
- Semua kolom userRole kosong

**Fix:**
1. **Cek spreadsheet** → ada data dengan userRole terisi?
2. **Jika semua kosong:** Submit data baru dulu (test di Step 4)
3. **Clear cache** browser (Ctrl+Shift+R)
4. **Refresh** halaman admin

---

### Problem: Data rusak (01/01/1985)

**Penyebab:**
- Data lama dengan struktur berbeda
- Kolom bergeser setelah update header

**Fix:**
1. **Backup spreadsheet** (File → Make a copy)
2. **Hapus semua data lama** di sheet "submissions" (kecuali header row 1)
3. **Submit data baru** untuk test
4. **Verify** data baru tampil dengan benar

---

### Problem: Apps Script error saat deploy

**Error:** "Authorization required"
→ **Fix:** Click "Review permissions" → Allow

**Error:** "Script function not found"
→ **Fix:** Pastikan code sudah di-save (Ctrl+S)

**Error:** "Deployment not found"
→ **Fix:** Buat deployment baru (Deploy → New deployment)

---

## 📞 EMERGENCY SUPPORT

Jika masih error setelah semua step:

**Screenshot yang perlu disiapkan:**
1. **Google Spreadsheet** → sheet "submissions" baris 1 (header)
2. **Google Spreadsheet** → sheet "submissions" baris terakhir (data terbaru)
3. **Apps Script Editor** → screenshot code function `addSubmission` (baris 140-220)
4. **Browser Console (F12)** saat submit → tab Console dan Network
5. **Admin History** → screenshot tampilan

**Info yang perlu dicatat:**
1. Sudah jalankan `updateSubmissionsHeader`? (Ya/Tidak)
2. Sudah deploy ulang? (Ya/Tidak)
3. Apps Script URL berubah? (Ya/Tidak)
4. Ada error di Console browser? (Screenshot)

---

## ✅ HASIL AKHIR YANG DIHARAPKAN

Setelah semua fix:

1. **Spreadsheet "submissions":**
   ```
   id | branchId | userNik | userName | userRole | date | ... | data | photos | notes
   sub-001 | A336 | 12345 | John | Advisor | 2026-05-28 | ... | [{"id":"advisor-greeting"...}] | ... | ...
   sub-002 | A336 | 67890 | Jane | Cashier | 2026-05-28 | ... | [{"id":"cashier-sales-id"...}] | ... | ...
   ```

2. **Admin History:**
   - Kolom "Role" muncul
   - Badge role dengan warna berbeda
   - Filter by role berfungsi

3. **Staff Dashboard:**
   - Indikator terfilter per role
   - History tampil dengan tanggal benar
   - Submit data tersimpan dengan role

---

**SELAMAT! Role system sekarang berjalan sempurna! 🎉**
