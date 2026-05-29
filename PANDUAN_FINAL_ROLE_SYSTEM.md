# 🎯 PANDUAN FINAL: Role System dengan Format JSON

## 📋 Ringkasan Perubahan

### ❌ Struktur Lama (SALAH):
```
id | branchId | userNik | userName | date | ... | sales | trx | basket | wa_personal | ...
```
**Masalah:** Kolom hardcoded untuk indikator spesifik, tidak fleksibel untuk semua role.

### ✅ Struktur Baru (BENAR):
```
id | branchId | userNik | userName | userRole | date | ... | data | photos | notes
```
**Keuntungan:** 
- Kolom "data" berisi JSON → bisa menampung indikator APAPUN dari role MANAPUN
- Advisor, Cashier, CS pakai struktur SAMA
- Fleksibel untuk tambah role baru

---

## 🔧 Langkah-Langkah Update

### Step 1: Update Apps Script

1. **Buka Apps Script Editor** (Extensions → Apps Script)
2. **Hapus semua code lama** (Ctrl+A → Delete)
3. **Copy code dari file:** `APPS_SCRIPT_ROLE_FINAL.gs`
4. **Paste** ke Apps Script Editor (Ctrl+V)
5. **Save** (Ctrl+S)

---

### Step 2: Update Header Sheet "submissions"

1. Di Apps Script Editor, **pilih function** `updateSubmissionsHeader` dari dropdown
2. **Klik ▶ Run**
3. Tunggu sampai selesai
4. **Buka sheet "submissions"**
5. **Cek header row** harus jadi:

```
id | branchId | userNik | userName | userRole | date | createdAt | totalScore | data | photos | notes
```

**Total: 11 kolom**

---

### Step 3: Deploy Apps Script Ulang

1. **Klik Deploy** → **Manage deployments**
2. **Klik ✏️ Edit** pada deployment aktif
3. **Version:** Pilih **New version**
4. **Description:** "Role system with JSON format"
5. **Klik Deploy**
6. Selesai!

---

### Step 4: Setup Indikator di Sheet "indicators"

**PENTING:** Setiap role harus punya indikator sendiri dengan kolom `role` terisi!

#### Contoh Data Lengkap (13 indikator total):

```
branchId | id                     | name             | type   | targetValue | targetPhotos | weight | icon | role
---------|------------------------|------------------|--------|-------------|--------------|--------|------|----------
A336     | advisor-greeting       | Greeting         | photo  |             | 1            | 15     |      | Advisor
A336     | advisor-promo          | Promo Running    | photo  |             | 1            | 15     |      | Advisor
A336     | advisor-sales-id       | Sales ID         | number | 3           |              | 20     |      | Advisor
A336     | advisor-trx            | Transaksi        | number | 5           |              | 20     |      | Advisor
A336     | advisor-new-member     | New Member       | number | 2           |              | 15     |      | Advisor
A336     | advisor-instant-upgrade| Instant Upgrade  | number | 1           |              | 15     |      | Advisor
A336     | cashier-sales-id       | Sales ID         | number | 5           |              | 30     |      | Cashier
A336     | cashier-trx            | Transaksi        | number | 10          |              | 35     |      | Cashier
A336     | cashier-new-member     | New Member       | number | 3           |              | 20     |      | Cashier
A336     | cashier-instant-upgrade| Instant Upgrade  | number | 2           |              | 15     |      | Cashier
A336     | cs-greeting            | Greeting Customer| photo  |             | 1            | 30     |      | CS
A336     | cs-service             | Customer Service | photo  |             | 1            | 30     |      | CS
A336     | cs-new-member          | New Member       | number | 5           |              | 40     |      | CS
```

**Catatan:**
- ID harus unique dengan prefix role: `advisor-`, `cashier-`, `cs-`
- Role harus persis: `Advisor`, `Cashier`, atau `CS` (case-sensitive)
- Total weight per role = 100%

---

### Step 5: Migrasi Data Lama (OPSIONAL)

**Jika ada data submission lama**, jalankan function `migrateOldSubmissions`:

1. Di Apps Script Editor, **pilih function** `migrateOldSubmissions`
2. **Klik ▶ Run**
3. **Cek Execution Log** untuk progress
4. Data lama akan di-convert ke format JSON

**⚠️ BACKUP spreadsheet dulu sebelum migrasi!**

---

### Step 6: Clear Cache & Test

1. **Clear cache browser** (Ctrl+Shift+R)
2. **Test Login Advisor:**
   - Login dengan role: Advisor
   - Expected: Muncul 6 indikator Advisor
3. **Test Login Cashier:**
   - Login dengan role: Cashier
   - Expected: Muncul 4 indikator Cashier
4. **Test Login CS:**
   - Login dengan role: CS
   - Expected: Muncul 3 indikator CS

---

### Step 7: Test Submit Data

1. **Login sebagai Advisor**
2. **Isi semua 6 indikator**
3. **Submit**
4. **Buka sheet "submissions"**
5. **Cek baris terakhir:**
   - Kolom E (userRole) → harus "Advisor"
   - Kolom I (data) → harus berisi JSON seperti:
     ```json
     [{"id":"advisor-greeting","value":1},{"id":"advisor-promo","value":1},...]
     ```

6. **Test untuk Cashier dan CS juga!**

---

## 📊 Contoh Data Submission

### Advisor Submission:
```
id: sub-001
branchId: A336
userNik: 12345
userName: John Doe
userRole: Advisor
date: 2026-05-28
totalScore: 95
data: [
  {"id":"advisor-greeting","value":1},
  {"id":"advisor-promo","value":1},
  {"id":"advisor-sales-id","value":3},
  {"id":"advisor-trx","value":5},
  {"id":"advisor-new-member","value":2},
  {"id":"advisor-instant-upgrade","value":1}
]
```

### Cashier Submission:
```
id: sub-002
branchId: A336
userNik: 67890
userName: Jane Smith
userRole: Cashier
date: 2026-05-28
totalScore: 90
data: [
  {"id":"cashier-sales-id","value":5},
  {"id":"cashier-trx","value":10},
  {"id":"cashier-new-member","value":3},
  {"id":"cashier-instant-upgrade","value":2}
]
```

### CS Submission:
```
id: sub-003
branchId: A336
userNik: 11111
userName: Bob Lee
userRole: CS
date: 2026-05-28
totalScore: 88
data: [
  {"id":"cs-greeting","value":1},
  {"id":"cs-service","value":1},
  {"id":"cs-new-member","value":5}
]
```

---

## ✅ Checklist Final

- [ ] Apps Script di-update dengan code dari APPS_SCRIPT_ROLE_FINAL.gs
- [ ] Function updateSubmissionsHeader sudah dijalankan
- [ ] Header sheet "submissions" = 11 kolom (id sampai notes)
- [ ] Apps Script sudah di-deploy ulang
- [ ] Sheet "indicators" sudah ada 13 indikator (6 Advisor + 4 Cashier + 3 CS)
- [ ] Kolom "role" di indicators terisi dengan benar
- [ ] Data lama di-migrasi (jika ada)
- [ ] Clear cache browser
- [ ] Test login Advisor → 6 indikator
- [ ] Test login Cashier → 4 indikator
- [ ] Test login CS → 3 indikator
- [ ] Test submit Advisor → data tersimpan dengan role
- [ ] Test submit Cashier → data tersimpan dengan role
- [ ] Test submit CS → data tersimpan dengan role
- [ ] Admin history → kolom role muncul & filter by role jalan

---

## 🔍 Troubleshooting

### Data tidak tersimpan dengan role

**Cek:**
1. Apps Script Logs (View → Executions)
2. Cari log: "User role: Advisor" (atau Cashier/CS)
3. Jika kosong → payload dari frontend tidak include role

**Fix:**
- Pastikan frontend sudah clear cache
- Cek Console browser → ada error?

### Indikator tidak terfilter

**Cek:**
1. Sheet "indicators" → kolom "role" terisi?
2. Console browser → ada log "Filtered indicators: 6" (atau 4/3)?
3. Jika 0 → spreadsheet belum benar

**Fix:**
- Isi kolom "role" dengan benar (Advisor/Cashier/CS)
- Clear cache (Ctrl+Shift+R)

### Format JSON error di spreadsheet

**Cek:**
1. Kolom "data" → isinya JSON yang valid?
2. Buka online JSON validator, paste isi kolom "data"

**Fix:**
- Jangan edit manual kolom "data"
- Biarkan Apps Script yang handle

---

## 🎉 Selesai!

Setelah semua checklist terpenuhi, sistem role Anda sudah:
- ✅ Support 3 role (Advisor, Cashier, CS)
- ✅ Setiap role punya indikator sendiri
- ✅ Submission tersimpan dengan role
- ✅ Admin bisa filter by role
- ✅ Fleksibel untuk tambah role baru

---

**Next:** Deploy ke production (Vercel/Netlify) dan training user! 🚀
