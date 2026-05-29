# 🚀 Cara Update Apps Script (EXTEND Columns - BUKAN Ganti!)

## ✅ Struktur BARU (30 Kolom - A sampai AD):

### Metadata (A-H):
```
A:id | B:branchId | C:userNik | D:userName | E:userRole | F:date | G:createdAt | H:totalScore
```

### ADVISOR Indicators (I-Q) - **TETAP** seperti sekarang:
```
I:sales | J:trx | K:basket | L:wa_personal | M:no_baru | N:after_sales | O:proteksi | P:google_review | Q:mgb
```

### CASHIER Indicators (R-U) - **BARU** ditambahkan:
```
R:cashier-sales-id | S:cashier-trx | T:cashier-new-member | U:cashier-instant-upgrade
```

### CS Indicators (V-X) - **BARU** ditambahkan:
```
V:cs-greeting | W:cs-service | X:cs-new-member
```

### Photos & Notes (Y-AD):
```
Y:photos | Z:notes | AA:Reason | AB:Approval | AC:Admin NIK | AD:Admin Nama
```

**TOTAL: 30 kolom (A-AD)**

---

## 📝 Step-by-Step Update

### Step 1: Update Apps Script Code

1. **Buka Google Spreadsheet** → **Extensions** → **Apps Script**

2. **GANTI SEMUA code** dengan code dari file: **`APPS_SCRIPT_EXTENDED_COLUMNS.gs`**
   - Tekan **Ctrl+A** (select all)
   - Tekan **Delete** (hapus semua code lama)
   - **Copy** semua code dari file `APPS_SCRIPT_EXTENDED_COLUMNS.gs`
   - **Paste** ke Apps Script Editor (Ctrl+V)
   - Tekan **Ctrl+S** (save)

3. **Verify code saved:**
   - Lihat ada message "Script saved" di bawah
   - Lihat function dropdown (toolbar atas) → harus ada:
     - `doGet`
     - `doPost`
     - `addSubmission`
     - `updateSubmissionsHeader`
     - `updateSettings`
     - `deleteSubmission`

---

### Step 2: Update Header Spreadsheet (EXTEND ke 30 Kolom)

1. **Di Apps Script Editor**, pilih function **`updateSubmissionsHeader`** dari dropdown

2. **Klik tombol ▶ Run**

3. **Tunggu** sampai selesai (~5-10 detik)

4. **Buka sheet "submissions"** (klik tab di bawah)

5. **Verify header baris 1:**
   - Scroll ke kanan sampai kolom AD
   - **Kolom E** harus "userRole"
   - **Kolom R** harus "cashier-sales-id"
   - **Kolom V** harus "cs-greeting"
   - **Kolom Y** harus "photos"
   - **Kolom AD** harus "Admin Nama"
   - **Total: 30 kolom**

---

### Step 3: Deploy Apps Script

**PENTING!** Tanpa deploy ulang, perubahan tidak akan aktif!

1. **Klik Deploy** (toolbar atas) → **Manage deployments**

2. **Klik ✏️ (Edit icon)** pada deployment yang aktif

3. **Version:** Pilih **"New version"**

4. **Description:** Ketik "Extended columns for role system"

5. **Klik Deploy**

6. **Tunggu** sampai muncul "Deployment successful"

7. **VERIFY:**
   - "Who has access" = **"Anyone"**
   - Jika bukan "Anyone", click Edit → Who has access → pilih "Anyone" → Update

8. **Close** dialog

---

### Step 4: Test Submit Cashier

1. **Clear cache browser** (Ctrl+Shift+R atau F5 beberapa kali)

2. **Login** sebagai Cashier:
   - NIK: `12345` (atau NIK apapun)
   - Nama: `Test Cashier`
   - Role: **Cashier**

3. **Isi 4 indikator Cashier:**
   - Sales ID: `5`
   - Transaksi: `10`
   - New Member: `3`
   - Instant Upgrade: `2`

4. **Klik Submit**

5. **Buka Google Spreadsheet** → sheet "submissions"

6. **Cek baris terakhir** (submission terbaru):
   - **Kolom E (userRole)** → harus "Cashier" ✅
   - **Kolom R (cashier-sales-id)** → harus 5 ✅
   - **Kolom S (cashier-trx)** → harus 10 ✅
   - **Kolom T (cashier-new-member)** → harus 3 ✅
   - **Kolom U (cashier-instant-upgrade)** → harus 2 ✅
   - **Kolom I-Q (Advisor indicators)** → harus 0 (karena ini Cashier, bukan Advisor)

---

### Step 5: Test Submit CS

1. **Logout** → **Login** sebagai CS:
   - Role: **CS**

2. **Isi 3 indikator CS:**
   - Greeting Customer: Upload 1 foto
   - Customer Service: Upload 1 foto
   - New Member: `5`

3. **Submit**

4. **Cek spreadsheet:**
   - **Kolom E (userRole)** → "CS" ✅
   - **Kolom V (cs-greeting)** → 1 ✅
   - **Kolom W (cs-service)** → 1 ✅
   - **Kolom X (cs-new-member)** → 5 ✅
   - **Kolom I-Q & R-U** → 0 (karena ini CS)

---

### Step 6: Test Admin History

1. **Login sebagai Admin**

2. **Buka History**

3. **Verify:**
   - Data Cashier muncul ✅
   - Data CS muncul ✅
   - Kolom "Role" tampil (Advisor/Cashier/CS) ✅
   - Filter by role berfungsi ✅

---

## 🔍 Troubleshooting

### Problem: Header masih 29 kolom (bukan 30)

**Penyebab:** Function `updateSubmissionsHeader` belum dijalankan

**Fix:**
1. Jalankan function `updateSubmissionsHeader` di Apps Script
2. Refresh spreadsheet
3. Cek baris 1 → harus 30 kolom

---

### Problem: Kolom userRole masih kosong setelah submit

**Penyebab:** Apps Script belum deploy dengan code baru

**Fix:**
1. Verify code di Apps Script = code dari `APPS_SCRIPT_EXTENDED_COLUMNS.gs`
2. Deploy ulang (jangan lupa "New version"!)
3. Clear cache browser
4. Submit ulang

---

### Problem: Data Cashier masuk ke kolom Advisor

**Penyebab:** Mapping indicator salah di Apps Script

**Diagnosa:**
1. Buka Apps Script Logs (View → Executions)
2. Cari execution `addSubmission` yang terakhir
3. Lihat log "Indicator values extracted"
4. Screenshot dan share

**Fix:**
- Pastikan ID indikator di spreadsheet "indicators" sesuai:
  - Cashier: `cashier-sales-id`, `cashier-trx`, `cashier-new-member`, `cashier-instant-upgrade`
  - CS: `cs-greeting`, `cs-service`, `cs-new-member`

---

### Problem: Error "Script function not found"

**Penyebab:** Code belum di-save

**Fix:**
1. Di Apps Script Editor, tekan Ctrl+S
2. Tunggu message "Script saved"
3. Ulangi deploy

---

### Problem: Admin history tidak tampil role

**Penyebab:** Data lama tidak punya userRole

**Fix:**
1. Submit data BARU untuk test (Step 4 & 5)
2. Refresh admin history
3. Data baru harus muncul dengan role
4. Data lama (userRole kosong) akan tampil "-" atau tidak terfilter

---

## ✅ Checklist Final

- [ ] Apps Script code di-update dengan `APPS_SCRIPT_EXTENDED_COLUMNS.gs`
- [ ] Function `updateSubmissionsHeader` sudah dijalankan
- [ ] Header spreadsheet = 30 kolom (A-AD)
- [ ] Apps Script sudah di-deploy ulang (New version)
- [ ] "Who has access" = "Anyone"
- [ ] Browser cache sudah di-clear
- [ ] Test submit Cashier → kolom R-U terisi
- [ ] Test submit CS → kolom V-X terisi
- [ ] Admin history tampil role dengan benar
- [ ] Filter by role berfungsi

---

## 🎉 Selesai!

Setelah semua checklist done, role system sudah berjalan dengan:
- ✅ Data lama tetap aman (kolom I-Q tidak berubah)
- ✅ Data baru Cashier masuk ke kolom R-U
- ✅ Data baru CS masuk ke kolom V-X
- ✅ Role tersimpan di kolom E
- ✅ Admin bisa filter by role

---

**Good luck! 🚀**
