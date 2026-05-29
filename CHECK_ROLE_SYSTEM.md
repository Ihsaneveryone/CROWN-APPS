# ✅ Quick Check: Role System Status

## 🎯 Cara Cek Cepat (5 Menit)

Ikuti langkah ini untuk tahu **PERSIS** apa yang salah:

---

### Check 1: Header Spreadsheet Submissions

1. **Buka spreadsheet** → sheet "submissions"
2. **Screenshot baris 1** (header)
3. **Hitung jumlah kolom**

**✅ BENAR jika:**
- Kolom A = "id"
- Kolom B = "branchId"
- Kolom C = "userNik"
- Kolom D = "userName"
- **Kolom E = "userRole"** ← HARUS ADA DI SINI!
- Kolom F = "date"
- Kolom G = "createdAt"
- Kolom H = "totalScore"
- Kolom I = "data"
- Kolom J = "photos"
- Kolom K = "notes"
- **Total: 11 kolom**

**❌ SALAH jika:**
- Kolom E bukan "userRole" (misalnya "date")
- Tidak ada kolom "userRole"
- Ada kolom "sales", "trx", "basket", dll (ini struktur LAMA!)

**Jika SALAH:**
→ **Jalankan function `updateSubmissionsHeader` di Apps Script!**

---

### Check 2: Isi Data Submission

1. **Buka spreadsheet** → sheet "submissions"
2. **Lihat baris terakhir** (data submission terbaru)
3. **Cek kolom E (userRole)**

**✅ BENAR jika:**
- Kolom E terisi: "Advisor", "Cashier", atau "CS"

**❌ SALAH jika:**
- Kolom E kosong
- Kolom E terisi tapi bukan di posisi E (misalnya di kolom M)

**Jika SALAH:**
→ **Apps Script belum deploy dengan code baru!**

---

### Check 3: Apps Script Code

1. **Buka Apps Script Editor** (Extensions → Apps Script)
2. **Scroll ke function `addSubmission`** (sekitar line 140-220)
3. **Cari baris ini:**

```javascript
var userRole = '';
if (submission.user && submission.user.role) {
  userRole = String(submission.user.role);
}
Logger.log('User role: ' + userRole);
```

**✅ BENAR jika:**
- Ada kode di atas (ekstrak role dari submission.user.role)
- Ada line: `userRole,` dalam array `rowData` di posisi index 4 (kolom E)

**❌ SALAH jika:**
- Tidak ada kode ekstrak userRole
- Array `rowData` tidak punya `userRole`
- Array `rowData` punya `userRole` tapi tidak di index 4

**Jika SALAH:**
→ **Copy code dari `APPS_SCRIPT_ROLE_FINAL.gs` dan deploy ulang!**

---

### Check 4: Apps Script Deployment

1. **Di Apps Script Editor**, klik **Deploy** → **Manage deployments**
2. **Lihat deployment yang aktif**
3. **Cek tanggal/version**

**✅ BENAR jika:**
- Ada deployment dengan version terbaru (hari ini)
- "Who has access" = "Anyone"

**❌ SALAH jika:**
- Deployment version lama (sebelum hari ini)
- Tidak ada deployment aktif

**Jika SALAH:**
→ **Deploy ulang! (Deploy → Edit → New version → Deploy)**

---

### Check 5: Frontend Kirim Role?

1. **Login** ke aplikasi sebagai Cashier
2. **Buka Console browser** (F12)
3. **Isi 1 indikator** (tidak perlu lengkap)
4. **Klik Submit** (biarkan error tidak apa-apa)
5. **Buka tab Network** di Console
6. **Cari POST request** ke Apps Script URL
7. **Klik request** → **Payload** tab
8. **Lihat isi payload**

**✅ BENAR jika:**
Payload ada field:
```json
{
  "action": "addSubmission",
  "data": {
    "user": {
      "nik": "12345",
      "nama": "Test",
      "role": "Cashier"  ← HARUS ADA!
    }
  }
}
```

**❌ SALAH jika:**
- Tidak ada field `role` di `user`
- Field `role` kosong

**Jika SALAH:**
→ **Clear cache browser KERAS (Ctrl+Shift+Delete) dan login ulang!**

---

### Check 6: Console Logs (Debug)

**Saat login sebagai Advisor:**

1. **Buka Console** (F12)
2. **Login** sebagai Advisor
3. **Cari log:**

```
🎯 Filtering indicators for role: Advisor
✅ Filtered indicators: 6
```

**✅ BENAR jika:**
- Log muncul
- "Filtered indicators: 6" (atau 4 untuk Cashier, 3 untuk CS)

**❌ SALAH jika:**
- Log "Filtered indicators: 0"
- Error "No indicators found for role"

**Jika SALAH:**
→ **Spreadsheet "indicators" kolom "role" belum terisi!**

---

### Check 7: Admin History Tampil Role?

1. **Login sebagai Admin**
2. **Buka History**
3. **Lihat tabel submission**

**✅ BENAR jika:**
- Ada kolom "Role"
- Badge role (Advisor/Cashier/CS) muncul dengan warna
- Filter dropdown "Role" ada

**❌ SALAH jika:**
- Tidak ada kolom "Role"
- Badge tidak muncul (tampil "-")
- Filter tidak ada

**Jika SALAH:**
→ **Data submission tidak punya field role! Kembali ke Check 2.**

---

## 📊 DIAGNOSIS HASIL

### Skenario A: Check 1 SALAH
**Problem:** Header spreadsheet belum diupdate
**Fix:** Jalankan `updateSubmissionsHeader` di Apps Script

### Skenario B: Check 1 BENAR, Check 2 SALAH
**Problem:** Apps Script tidak menyimpan role
**Fix:** 
1. Verify Check 3 (code benar?)
2. Verify Check 4 (sudah deploy?)
3. Deploy ulang Apps Script

### Skenario C: Check 1-4 BENAR, Check 5 SALAH
**Problem:** Frontend tidak kirim role
**Fix:** Clear cache browser + login ulang

### Skenario D: Check 1-5 BENAR, Check 2 tetap SALAH
**Problem:** Apps Script error saat save
**Fix:** 
1. Buka Apps Script → View → Executions
2. Cari execution function `addSubmission` yang gagal
3. Lihat error message
4. Screenshot dan share

### Skenario E: Check 6 SALAH
**Problem:** Indikator tidak punya kolom role
**Fix:** 
1. Buka spreadsheet "indicators"
2. Tambah kolom "role" di akhir
3. Isi dengan "Advisor", "Cashier", atau "CS"

### Skenario F: Semua BENAR tapi Check 7 SALAH
**Problem:** Data lama tidak punya role
**Fix:**
1. Submit data BARU untuk test
2. Refresh admin history
3. Data baru harus muncul dengan role
4. Data lama tetap tidak ada role (normal)

---

## 🎯 Quick Command untuk Check

**Paste di Browser Console (F12) saat di aplikasi:**

```javascript
// CHECK: User session ada role?
const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
console.log('👤 User session:', userSession);
console.log('🎭 User role:', userSession.role);

// CHECK: Indicators punya role?
// (Jalankan setelah login)
console.log('📊 Check localStorage indicators cache:');
const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('indicators_'));
cacheKeys.forEach(key => {
  const cached = JSON.parse(localStorage.getItem(key) || '{}');
  if (cached.data && Array.isArray(cached.data)) {
    const hasRole = cached.data.some(ind => ind.role !== undefined);
    console.log(`  ${key}: ${cached.data.length} indicators, hasRole: ${hasRole}`);
    if (hasRole) {
      const sample = cached.data.find(ind => ind.role);
      console.log(`  Sample: ${sample.id} → role: ${sample.role}`);
    }
  }
});
```

**Expected output jika BENAR:**
```
👤 User session: {branchId: "A336", nik: "12345", nama: "Test", role: "Advisor", ...}
🎭 User role: Advisor
📊 Check localStorage indicators cache:
  indicators_A336: 13 indicators, hasRole: true
  Sample: advisor-greeting → role: Advisor
```

---

## ✅ SUMMARY

**Jika semua Check 1-7 BENAR:**
→ Role system sudah jalan! Tinggal submit data baru untuk test.

**Jika ada yang SALAH:**
→ Ikuti panduan di **FIX_ROLE_URGENT.md** step-by-step!

---

**Good luck! 🚀**
