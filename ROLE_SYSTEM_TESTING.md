# ✅ End-to-End Testing Checklist - Sistem Role

## 🎯 Tujuan Testing

Memastikan fitur role bekerja sempurna dari login hingga submission data, termasuk:
- ✅ Indikator terfilter per role
- ✅ Submission menyimpan role
- ✅ Admin history bisa filter by role
- ✅ Tidak ada bug atau error

---

## 📋 Pre-requisites (WAJIB!)

Sebelum testing, pastikan:

### 1. Frontend Code Sudah Terupdate ✅

File yang sudah diupdate:
- ✅ `src/app/types.ts` - UserRole type, role field di Indicator & Submission
- ✅ `src/app/utils/roleIndicators.ts` - Default indicators per role
- ✅ `src/app/components/LoginPage.tsx` - Role dropdown
- ✅ `src/app/components/StaffDashboard.tsx` - Filter by role
- ✅ `src/app/components/admin/AdminHistory.tsx` - Role column & filter
- ✅ `src/app/utils/api.ts` - **BARU DIPERBAIKI:** Include `role` field saat read indicators

### 2. Google Spreadsheet Sudah Diupdate

**Sheet "indicators":**
- ✅ Ada kolom `role` (kolom N atau kolom terakhir)
- ✅ Data sudah diisi dengan role: `Advisor`, `Cashier`, `CS`
- ✅ Total 13 indikator:
  - 6 indikator Advisor (Greeting, Promo, Sales ID, Trx, New Member, Instant Upgrade)
  - 4 indikator Cashier (Sales ID, Trx, New Member, Instant Upgrade)
  - 3 indikator CS (Greeting Customer, Customer Service, New Member)

**Sheet "submissions":**
- ✅ Ada kolom `userRole` (setelah kolom `userName`)

### 3. Google Apps Script Sudah Diupdate & Deploy

- ✅ Function `readIndicators()` sudah include `role: row[14]` (atau sesuai index)
- ✅ Function `addSubmission()` sudah include `data.user.role`
- ✅ Apps Script sudah di-deploy ulang
- ✅ Access setting: "Anyone" atau "Anyone, even anonymous"

### 4. Browser Cache Sudah Di-clear

- ✅ Tekan **Ctrl+Shift+R** (force reload + clear cache)
- ✅ Atau buka **Incognito/Private window** untuk testing fresh

---

## 🧪 Test Suite

### Test 1: Login dengan Role Advisor

**Steps:**
1. Buka aplikasi
2. Pilih branch (e.g., A336)
3. Isi NIK: `12345`
4. Isi Nama: `Test Advisor`
5. Pilih Role: **Advisor**
6. Klik **Masuk**

**Expected Results:**
- ✅ Berhasil login
- ✅ Dashboard menampilkan badge "Advisor" di header
- ✅ Muncul **6 indikator** (tidak lebih, tidak kurang):
  1. Greeting
  2. Promo Running
  3. Sales ID
  4. Transaksi
  5. New Member
  6. Instant Upgrade
- ✅ Total bobot = 100% (15+15+20+20+15+15)

**Debug (jika gagal):**
1. Buka Console (F12)
2. Cari log:
   ```
   🎯 Filtering indicators for role: Advisor
   ✅ Filtered indicators: 6
   ```
3. Jika "Filtered indicators: 0" → cek spreadsheet kolom `role` terisi
4. Jika "Filtered indicators: [banyak]" → cek Apps Script return field `role`

---

### Test 2: Login dengan Role Cashier

**Steps:**
1. **Logout** dari dashboard Advisor
2. Kembali ke halaman login
3. Pilih branch (e.g., A336)
4. Isi NIK: `67890`
5. Isi Nama: `Test Cashier`
6. Pilih Role: **Cashier**
7. Klik **Masuk**

**Expected Results:**
- ✅ Berhasil login
- ✅ Dashboard menampilkan badge "Cashier" di header (warna berbeda dari Advisor)
- ✅ Muncul **4 indikator**:
  1. Sales ID
  2. Transaksi
  3. New Member
  4. Instant Upgrade
- ✅ Total bobot = 100% (30+35+20+15)
- ✅ **TIDAK muncul** indikator Greeting atau Promo (khusus Advisor)

**Debug (jika gagal):**
- Cek Console: `"🎯 Filtering indicators for role: Cashier"`
- Cek spreadsheet: indikator Cashier ada dan role-nya "Cashier" (bukan "cashier" atau typo)

---

### Test 3: Login dengan Role CS

**Steps:**
1. **Logout** dari dashboard Cashier
2. Kembali ke halaman login
3. Pilih branch (e.g., A336)
4. Isi NIK: `11111`
5. Isi Nama: `Test CS`
6. Pilih Role: **CS**
7. Klik **Masuk**

**Expected Results:**
- ✅ Berhasil login
- ✅ Dashboard menampilkan badge "CS" di header
- ✅ Muncul **3 indikator**:
  1. Greeting Customer
  2. Customer Service
  3. New Member
- ✅ Total bobot = 100% (30+30+40)
- ✅ **TIDAK muncul** indikator Sales ID, Transaksi, dll (khusus Advisor/Cashier)

**Debug (jika gagal):**
- Cek Console: `"🎯 Filtering indicators for role: CS"`
- Pastikan spreadsheet ada 3 indikator CS dengan role="CS"

---

### Test 4: Submit Data Advisor

**Steps:**
1. **Login** sebagai Advisor (NIK: 12345)
2. Isi semua indikator:
   - Greeting: Upload 1 foto
   - Promo Running: Upload 1 foto
   - Sales ID: 3
   - Transaksi: 5
   - New Member: 2
   - Instant Upgrade: 1
3. Klik **Submit**

**Expected Results:**
- ✅ Submission berhasil
- ✅ Muncul toast "Data berhasil disimpan!"
- ✅ Total score dihitung otomatis
- ✅ Data muncul di **History** tab

**Verify di Google Spreadsheet:**
1. Buka sheet "submissions"
2. Cari row terakhir (submission terbaru)
3. **Cek kolom `userRole`** → harus berisi `"Advisor"`
4. **Cek kolom data** → semua 6 indikator tersimpan

**Debug (jika gagal):**
- Cek Console (F12) → ada error?
- Cek Network tab → POST request ke Apps Script berhasil?
- Cek Apps Script logs (View → Logs di Apps Script editor)

---

### Test 5: Submit Data Cashier

**Steps:**
1. **Logout** dan **login** sebagai Cashier (NIK: 67890)
2. Isi semua indikator:
   - Sales ID: 5
   - Transaksi: 10
   - New Member: 3
   - Instant Upgrade: 2
3. Klik **Submit**

**Expected Results:**
- ✅ Submission berhasil
- ✅ Role "Cashier" tersimpan di spreadsheet
- ✅ Hanya 4 indikator yang tersimpan (tidak ada Greeting/Promo)

**Verify di Google Spreadsheet:**
- Kolom `userRole` = `"Cashier"`
- Data hanya 4 indikator Cashier

---

### Test 6: Submit Data CS

**Steps:**
1. **Logout** dan **login** sebagai CS (NIK: 11111)
2. Isi semua indikator:
   - Greeting Customer: Upload 1 foto
   - Customer Service: Upload 1 foto
   - New Member: 5
3. Klik **Submit**

**Expected Results:**
- ✅ Submission berhasil
- ✅ Role "CS" tersimpan di spreadsheet
- ✅ Hanya 3 indikator yang tersimpan

**Verify di Google Spreadsheet:**
- Kolom `userRole` = `"CS"`
- Data hanya 3 indikator CS

---

### Test 7: Admin History - Tampil Semua Role

**Steps:**
1. **Login** sebagai Admin
   - NIK: `A336` (atau admin NIK toko Anda)
   - Masukkan **secret code admin**
2. Klik **History** tab (atau Admin Dashboard)

**Expected Results:**
- ✅ Tabel history menampilkan **kolom Role**
- ✅ Setiap submission menampilkan badge role (Advisor/Cashier/CS)
- ✅ Warna badge berbeda per role:
  - Advisor: Merah/Orange
  - Cashier: Biru/Green
  - CS: Purple/Pink

**Verify:**
- Cek 3 submission tadi (Test 4, 5, 6) muncul dengan role yang benar
- Badge role jelas terlihat dan warnanya berbeda

---

### Test 8: Admin History - Filter by Role

**Steps:**
1. Masih di halaman Admin History
2. Klik **dropdown filter Role**
3. Pilih **"Advisor"**

**Expected Results:**
- ✅ Tabel hanya menampilkan submission dari Advisor
- ✅ Submission Cashier dan CS tidak muncul

**Test lagi:**
1. Pilih filter **"Cashier"**
   - ✅ Hanya submission Cashier yang muncul
2. Pilih filter **"CS"**
   - ✅ Hanya submission CS yang muncul
3. Pilih filter **"Semua Role"**
   - ✅ Semua submission muncul kembali

**Debug (jika gagal):**
- Cek apakah submission punya field `user.role`
- Cek Console → ada error saat filter?
- Cek `AdminHistory.tsx` logic filter role

---

### Test 9: Backward Compatibility (Submission Lama Tanpa Role)

**Setup:**
1. Tambahkan 1 row manual di sheet "submissions" TANPA role (kolom userRole kosong)
2. Refresh halaman Admin History

**Expected Results:**
- ✅ Submission lama tetap muncul
- ✅ Kolom role menampilkan "-" atau placeholder
- ✅ Tidak ada error atau crash
- ✅ Filter "Semua Role" include submission lama

**Catatan:**
- Ini untuk backward compatibility dengan data lama
- Submission baru WAJIB punya role

---

### Test 10: Validasi Total Bobot Per Role

**Manual Check di Spreadsheet:**

1. **Advisor (6 indikator):**
   - Greeting: 15%
   - Promo: 15%
   - Sales ID: 20%
   - Trx: 20%
   - New Member: 15%
   - Instant Upgrade: 15%
   - **TOTAL = 100%** ✅

2. **Cashier (4 indikator):**
   - Sales ID: 30%
   - Trx: 35%
   - New Member: 20%
   - Instant Upgrade: 15%
   - **TOTAL = 100%** ✅

3. **CS (3 indikator):**
   - Greeting Customer: 30%
   - Customer Service: 30%
   - New Member: 40%
   - **TOTAL = 100%** ✅

**Expected:**
- ✅ Setiap role total bobot = 100%
- ✅ Tidak ada indikator dengan bobot 0% atau >100%

---

## 🐛 Common Issues & Solutions

### Issue 1: Indikator Tidak Muncul (Semua Role)

**Cause:**
- Apps Script tidak return field `role`
- Spreadsheet kolom `role` kosong
- Cache belum di-clear

**Solution:**
1. Cek spreadsheet → kolom `role` terisi?
2. Cek Apps Script → ada `role: row[14]`?
3. Clear cache (Ctrl+Shift+R)
4. Deploy ulang Apps Script

---

### Issue 2: Semua Indikator Muncul untuk Semua Role

**Cause:**
- Frontend filtering tidak jalan
- Apps Script tidak return field `role`
- Bug di `getIndicatorsByRole()` function

**Solution:**
1. Buka Console (F12)
2. Cek log: `"🎯 Filtering indicators for role: [Role]"`
3. Cek log: `"✅ Filtered indicators: X"`
4. Jika X = total indikator (bukan per role) → Apps Script belum update
5. Test endpoint Apps Script langsung:
   ```
   https://script.google.com/.../exec?action=getIndicators&branchId=A336
   ```
   Response HARUS ada field `"role": "Advisor"` di setiap indikator

---

### Issue 3: Role Tidak Tersimpan di Submission

**Cause:**
- Apps Script `addSubmission()` tidak ambil `data.user.role`
- Payload tidak include role

**Solution:**
1. Buka Console → Network tab
2. Cari POST request ke Apps Script
3. Cek Request Payload → ada `"user": { "role": "..." }`?
4. Jika TIDAK ada → bug di `StaffDashboard.tsx` (seharusnya sudah fixed)
5. Jika ADA tapi tidak tersimpan → Apps Script belum update

---

### Issue 4: Filter Role di Admin History Tidak Jalan

**Cause:**
- Submission tidak punya field `user.role`
- Bug di filtering logic

**Solution:**
1. Cek Console → ada error?
2. Cek submission data → ada field `role`?
3. Cek `api.ts` line 600-603 → sudah include `role: sub.userRole || sub.role`?
4. Test filter dengan submission yang baru (pasti ada role)

---

## 📊 Expected Data Flow

```
1. USER LOGIN
   ↓
   [LoginPage.tsx] → pilih role (Advisor/Cashier/CS)
   ↓
   [BranchPage.tsx] → save role ke user session
   ↓

2. LOAD INDICATORS
   ↓
   [api.ts getIndicators()] → fetch dari Google Sheets via Apps Script
   ↓
   Apps Script → read sheet "indicators", return data WITH "role" field
   ↓
   [api.ts] → parse data, include "role: ind.role" ✅
   ↓
   [StaffDashboard.tsx] → filter indicators by user.role
   ↓
   [roleIndicators.ts getIndicatorsByRole()] → return hanya indikator matching role
   ↓
   Display ke UI → staff lihat indikator sesuai role-nya
   ↓

3. SUBMIT DATA
   ↓
   [StaffDashboard.tsx] → buat submission object WITH user.role
   ↓
   [api.ts addSubmission()] → kirim ke Apps Script via POST
   ↓
   Apps Script → write ke sheet "submissions" WITH userRole column ✅
   ↓
   Data tersimpan dengan role
   ↓

4. ADMIN HISTORY
   ↓
   [AdminHistory.tsx] → fetch submissions
   ↓
   [api.ts getSubmissions()] → read sheet "submissions", parse userRole
   ↓
   Display dengan kolom role + filter dropdown
   ↓
   Admin bisa filter by role
```

---

## ✅ Final Checklist

Setelah semua test, pastikan:

- [ ] Test 1 PASSED: Login Advisor → 6 indikator
- [ ] Test 2 PASSED: Login Cashier → 4 indikator
- [ ] Test 3 PASSED: Login CS → 3 indikator
- [ ] Test 4 PASSED: Submit Advisor → role tersimpan
- [ ] Test 5 PASSED: Submit Cashier → role tersimpan
- [ ] Test 6 PASSED: Submit CS → role tersimpan
- [ ] Test 7 PASSED: Admin history tampil kolom role
- [ ] Test 8 PASSED: Filter by role berfungsi
- [ ] Test 9 PASSED: Backward compatibility OK
- [ ] Test 10 PASSED: Total bobot per role = 100%
- [ ] Console TIDAK ada error merah
- [ ] Network tab TIDAK ada failed request
- [ ] Apps Script deployed dengan "Anyone" access

---

## 🎉 Selamat!

Jika semua test PASSED, sistem role Anda sudah **production-ready**! 🚀

**Next Steps:**
- Deploy ke production (Vercel/Netlify)
- Training user cara pakai sistem role
- Monitor submission data untuk memastikan role tercatat dengan benar

---

**Dokumentasi terkait:**
- [APPS_SCRIPT_UPDATE_GUIDE.md](./APPS_SCRIPT_UPDATE_GUIDE.md) - Panduan update Apps Script
- [SPREADSHEET_ROLE_GUIDE.md](./SPREADSHEET_ROLE_GUIDE.md) - Panduan setup spreadsheet
- [QUICK_FIX_INDICATORS.md](./QUICK_FIX_INDICATORS.md) - Troubleshooting cepat
- [README_ROLE_SYSTEM.md](./README_ROLE_SYSTEM.md) - Overview sistem role
