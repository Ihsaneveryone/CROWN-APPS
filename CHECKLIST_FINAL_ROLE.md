# ✅ CHECKLIST LENGKAP - Role System Fix

## STATUS: Cek satu per satu, jangan ada yang kelewat!

---

## ✅ STEP 1: Apps Script Code
**Status:** ✅ SUDAH (user bilang sudah copy paste)

**Verify:**
1. Buka Apps Script Editor
2. Cek ada variable ini:
```javascript
var CASHIER_INDICATORS = {
  'cashier-sales-id': 29,          // AD
  'cashier-trx': 30,               // AE
  'cashier-new-member': 31,        // AF
  'cashier-instant-upgrade': 32    // AG
};

var CS_INDICATORS = {
  'cs-greeting': 33,      // AH
  'cs-service': 34,       // AI
  'cs-new-member': 35     // AJ
};
```

**Jika TIDAK ADA variable di atas:**
→ Code salah! Harus pakai `APPS_SCRIPT_FINAL_REAL.gs`

---

## ✅ STEP 2: Apps Script Deploy
**Status:** ✅ SUDAH (user bilang sudah deploy)

**Verify:**
1. Deploy → Manage deployments
2. Cek ada deployment dengan version baru (hari ini)
3. **PENTING:** "Who has access" = **Anyone**

**Jika deployment version lama:**
→ Deploy ulang dengan "New version"!

---

## ⚠️ STEP 3: Jalankan Function `updateSubmissionsHeader`
**Status:** ❓ BELUM TENTU! (INI YANG SERING KELEWAT!)

**CRITICAL! Function ini HARUS dijalankan untuk tambah 7 kolom baru!**

**Cara:**
1. Di Apps Script Editor
2. Pilih function **`updateSubmissionsHeader`** dari dropdown (di toolbar atas)
3. Klik tombol **▶ Run**
4. Tunggu sampai selesai (5-10 detik)
5. Cek **Execution log** (View → Executions)
6. Harus ada log: **"✅ Header updated! Added 7 new columns (AD-AJ)"**

**Verify berhasil:**
1. Buka Google Spreadsheet → sheet "submissions"
2. **Scroll ke kanan** sampai kolom AD
3. **Harus ada kolom baru:**
   - AD: cashier-sales-id
   - AE: cashier-trx
   - AF: cashier-new-member
   - AG: cashier-instant-upgrade
   - AH: cs-greeting
   - AI: cs-service
   - AJ: cs-new-member

**Jika TIDAK ADA kolom AD-AJ:**
→ **FUNCTION BELUM DIJALANKAN!** Ini penyebab error paling umum!

---

## ⚠️ STEP 4: Cek Spreadsheet "indicators" - Kolom "role"
**Status:** ❓ BELUM TENTU ADA ISI!

**Verify:**
1. Buka sheet "indicators"
2. **Cek ada kolom "role"** (biasanya kolom terakhir)
3. **Cek ISI kolom role untuk SEMUA 13 indikator:**

**HARUS seperti ini (PERSIS!):**

```
id                        | role
--------------------------|--------
wa_personal              | Advisor
no_baru                  | Advisor
after_sales              | Advisor
proteksi                 | Advisor
google_review            | Advisor
mgb                      | Advisor
cashier-sales-id         | Cashier
cashier-trx              | Cashier
cashier-new-member       | Cashier
cashier-instant-upgrade  | Cashier
cs-greeting              | CS
cs-service               | CS
cs-new-member            | CS
```

**PENTING:**
- Role harus **PERSIS** "Advisor", "Cashier", "CS" (huruf besar di awal)
- **TIDAK boleh** "advisor" (huruf kecil)
- **TIDAK boleh** ada spasi

**Jika kolom role KOSONG atau salah:**
→ Isi manual dengan value di atas!

---

## ✅ STEP 5: Frontend Code
**Status:** ✅ SUDAH

File yang sudah diupdate:
- ✅ `src/app/types.ts` - UserRole type
- ✅ `src/app/utils/roleIndicators.ts` - Filter by role
- ✅ `src/app/components/LoginPage.tsx` - Role dropdown + clear cache button
- ✅ `src/app/components/StaffDashboard.tsx` - Filter indicators
- ✅ `src/app/components/admin/AdminHistory.tsx` - Role column + filter
- ✅ `src/app/utils/api.ts` - Include role field (line 339)

**Tidak perlu action!**

---

## ⚠️ STEP 6: Clear Cache di Browser
**Status:** ❓ BELUM! (PENTING!)

**Cara Mudah:**
1. **Buka aplikasi** (halaman login)
2. **Klik tombol** di bawah: **"🧹 Clear Cache & Reset App"**
3. **Tunggu** halaman reload otomatis

**Cara Manual (jika tombol tidak ada):**
1. Tekan **Ctrl+Shift+Delete**
2. Pilih **"All time"**
3. Centang:
   - ✅ Cookies and site data
   - ✅ Cached images and files
4. Klik **Clear data**
5. **Refresh** halaman (F5)

**PENTING:** Tanpa clear cache, indikator tidak akan muncul meski spreadsheet sudah benar!

---

## ⚠️ STEP 7: Test Login + Submit
**Status:** ❓ PERLU DILAKUKAN!

**Test 1: Login Cashier**
1. Clear cache dulu (Step 6)
2. Login dengan:
   - NIK: `12345`
   - Nama: `Test Cashier`
   - Role: **Cashier**
3. **Verify indikator muncul 4:**
   - Sales ID
   - Transaksi
   - New Member
   - Instant Upgrade
4. **Jika muncul indikator Advisor juga:**
   → Cache belum clear atau indicators sheet kolom role salah!

**Test 2: Submit Cashier**
1. Isi semua 4 indikator Cashier
2. Submit
3. **Buka spreadsheet** → sheet "submissions"
4. **Scroll ke baris terakhir** (data terbaru)
5. **Verify:**
   - Kolom E (userRole) = **"Cashier"** ✅
   - Kolom AD = nilai sales-id ✅
   - Kolom AE = nilai trx ✅
   - Kolom AF = nilai new-member ✅
   - Kolom AG = nilai instant-upgrade ✅
   - Kolom L-Q (Advisor) = **0** ✅

**Jika kolom E kosong:**
→ Apps Script belum deploy dengan benar!

**Jika data masuk ke kolom salah:**
→ Function `updateSubmissionsHeader` belum dijalankan!

---

## 🐛 COMMON ERRORS & FIX

### Error: "⚠️ No indicators found for role: Advisor"
**Penyebab:**
- Cache belum clear ATAU
- Spreadsheet "indicators" kolom "role" kosong ATAU
- Kolom "role" salah ketik (advisor vs Advisor)

**Fix:**
1. Clear cache browser (Step 6)
2. Cek spreadsheet "indicators" kolom role (Step 4)
3. Login ulang

---

### Error: Data submission fields tercampur (role = tanggal, dll)
**Penyebab:**
- Session lama di localStorage corrupted

**Fix:**
1. Clear cache dengan tombol "Clear Cache & Reset App"
2. Login ulang

---

### Error: Kolom E (userRole) kosong setelah submit
**Penyebab:**
- Apps Script belum deploy dengan code baru ATAU
- Deploy masih version lama

**Fix:**
1. Deploy ulang Apps Script
2. Pastikan pilih "New version"
3. Clear cache browser
4. Submit ulang

---

### Error: Data masuk ke kolom yang salah
**Penyebab:**
- Function `updateSubmissionsHeader` BELUM dijalankan!
- Spreadsheet masih 29 kolom, belum 36 kolom

**Fix:**
1. Jalankan function `updateSubmissionsHeader` (Step 3)
2. Verify kolom AD-AJ sudah ada
3. Submit ulang

---

## 📊 EXPECTED RESULT (Setelah semua step)

### Spreadsheet "submissions":
- **Total kolom:** 36 (A sampai AJ)
- **Kolom AD-AJ:** Ada header baru (cashier-sales-id, dll)

### Data submission Cashier baru:
```
E (userRole): Cashier
L-Q (Advisor): 0, 0, 0, 0, 0, 0
AD: 5 (sales-id)
AE: 10 (trx)
AF: 3 (new-member)
AG: 2 (instant-upgrade)
AH-AJ (CS): 0, 0, 0
```

### Admin History:
- ✅ Kolom "Role" muncul
- ✅ Badge role dengan warna
- ✅ Filter by role berfungsi

---

## 🎯 QUICK DIAGNOSTIC

**Paste di browser console (F12) setelah login:**

```javascript
console.log('=== DIAGNOSTIC ROLE SYSTEM ===');

// 1. User session
const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
console.log('1️⃣ User session:', userSession);
console.log('   Role:', userSession.role);

// 2. Indicators cache
const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('indicators_'));
console.log('2️⃣ Indicators cache keys:', cacheKeys);
cacheKeys.forEach(key => {
  const cached = JSON.parse(localStorage.getItem(key) || '{}');
  if (cached.data && Array.isArray(cached.data)) {
    console.log(`   ${key}: ${cached.data.length} indicators`);
    const sample = cached.data.find(ind => ind.role);
    if (sample) {
      console.log(`   Sample: ${sample.id} → role: ${sample.role}`);
    } else {
      console.log('   ⚠️ NO ROLE FIELD!');
    }
  }
});

console.log('===========================');
```

**Expected output jika BENAR:**
```
1️⃣ User session: {role: "Cashier", ...}
   Role: Cashier
2️⃣ Indicators cache keys: ["indicators_A336"]
   indicators_A336: 13 indicators
   Sample: cashier-sales-id → role: Cashier
```

**Jika output salah:**
→ Clear cache dan login ulang!

---

## ✅ FINAL CHECKLIST

Centang jika sudah dilakukan:

- [ ] Apps Script code = `APPS_SCRIPT_FINAL_REAL.gs` ✅
- [ ] Apps Script sudah deploy ✅
- [ ] **Function `updateSubmissionsHeader` sudah dijalankan** ⚠️ PENTING!
- [ ] Spreadsheet "submissions" punya kolom AD-AJ ⚠️ VERIFY!
- [ ] Spreadsheet "indicators" kolom "role" terisi dengan benar ⚠️ VERIFY!
- [ ] Browser cache sudah clear ⚠️ WAJIB!
- [ ] Test login Cashier → indikator muncul 4 saja
- [ ] Test submit Cashier → data masuk kolom AD-AG
- [ ] Kolom E (userRole) terisi "Cashier"

**Jika SEMUA centang:**
→ Role system 100% jalan! 🎉

**Jika ada yang belum:**
→ Ikuti step yang belum dilakukan!

---

**Screenshot yang dibutuhkan untuk debug:**
1. Apps Script Executions log (View → Executions)
2. Spreadsheet "submissions" baris 1 (scroll sampai kolom AJ)
3. Spreadsheet "indicators" kolom role
4. Browser console diagnostic output
5. Error message di aplikasi
