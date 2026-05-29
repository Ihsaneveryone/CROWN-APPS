# 🎯 UPDATE APPS SCRIPT - FINAL (Sesuai Struktur Real)

## ✅ Yang Akan Dilakukan:

1. **TIDAK mengubah** kolom A-AC existing (29 kolom) - Data lama AMAN!
2. **TAMBAH 7 kolom baru** (AD-AJ) untuk Cashier & CS
3. **ISI kolom E (userRole)** yang sekarang masih kosong
4. **Total jadi 36 kolom** (A-AJ)

---

## 📊 Struktur Akhir (36 Kolom):

### A-AC: EXISTING (29 kolom) - TETAP SAMA!
```
A:id | B:branchId | C:userNik | D:userName | E:userRole | F:date | G:createdAt | H:totalScore
I:data | J:photos | K:notes
L:wa_personal | M:no_baru | N:after_sales | O:proteksi | P:google_review | Q:mgb
R:photos | S:notes | T:Proteksi | U:Google Review | V:MGB
W:MGB Foto 1 | X:MGB Foto 2 | Y:MGB Foto 3
Z:Reason | AA:Approval | AB:Admin NIK | AC:Admin Nama
```

### AD-AJ: BARU (7 kolom) - DITAMBAHKAN!
```
AD:cashier-sales-id | AE:cashier-trx | AF:cashier-new-member | AG:cashier-instant-upgrade
AH:cs-greeting | AI:cs-service | AJ:cs-new-member
```

---

## 🔧 Mapping Indikator per Role:

### Advisor (6 indikator):
- L: wa_personal
- M: no_baru
- N: after_sales
- O: proteksi
- P: google_review
- Q: mgb

### Cashier (4 indikator BARU):
- AD: cashier-sales-id
- AE: cashier-trx
- AF: cashier-new-member
- AG: cashier-instant-upgrade

### CS (3 indikator BARU):
- AH: cs-greeting
- AI: cs-service
- AJ: cs-new-member

---

## 🚀 Step-by-Step Update

### Step 1: Backup Spreadsheet

1. **File** → **Make a copy**
2. Rename: `CROWN INDICATOR - BACKUP {tanggal}`
3. **Simpan backup ini!**

---

### Step 2: Update Apps Script

1. **Buka Google Spreadsheet** → **Extensions** → **Apps Script**

2. **GANTI SEMUA code** dengan code dari file: **`APPS_SCRIPT_FINAL_REAL.gs`**
   - Tekan **Ctrl+A** (select all)
   - Tekan **Delete** (hapus semua code lama)
   - **Copy** semua code dari file `APPS_SCRIPT_FINAL_REAL.gs`
   - **Paste** ke Apps Script Editor (Ctrl+V)
   - Tekan **Ctrl+S** (save)

3. **Tunggu message "Script saved"**

---

### Step 3: Tambah 7 Kolom Baru (AD-AJ)

1. **Di Apps Script Editor**, pilih function **`updateSubmissionsHeader`** dari dropdown (toolbar atas)

2. **Klik tombol ▶ Run**

3. **Tunggu** sampai selesai (~5-10 detik)

4. **Buka sheet "submissions"** (klik tab di bawah)

5. **Scroll ke kanan** sampai kolom AD

6. **Verify kolom baru:**
   - AD: cashier-sales-id ✅
   - AE: cashier-trx ✅
   - AF: cashier-new-member ✅
   - AG: cashier-instant-upgrade ✅
   - AH: cs-greeting ✅
   - AI: cs-service ✅
   - AJ: cs-new-member ✅

7. **Total kolom sekarang: 36** (A sampai AJ)

---

### Step 4: Deploy Apps Script

1. **Klik Deploy** → **Manage deployments**

2. **Klik ✏️ (Edit)** pada deployment yang aktif

3. **Version:** Pilih **"New version"**

4. **Description:** Ketik "Role system - real structure"

5. **Klik Deploy**

6. **Tunggu** sampai "Deployment successful"

7. **Verify "Who has access" = "Anyone"**

---

### Step 5: Test Submit Cashier

1. **Clear cache browser** (Ctrl+Shift+R beberapa kali)

2. **Login** sebagai Cashier:
   - NIK: `12345`
   - Nama: `Test Cashier`
   - Role: **Cashier**

3. **Isi 4 indikator Cashier:**
   - Sales ID: `5`
   - Transaksi: `10`
   - New Member: `3`
   - Instant Upgrade: `2`

4. **Klik Submit**

5. **Buka Google Spreadsheet** → sheet "submissions"

6. **Scroll ke baris terakhir** (submission terbaru)

7. **Verify:**
   - **Kolom E (userRole)** → harus "Cashier" ✅
   - **Kolom AD (cashier-sales-id)** → harus 5 ✅
   - **Kolom AE (cashier-trx)** → harus 10 ✅
   - **Kolom AF (cashier-new-member)** → harus 3 ✅
   - **Kolom AG (cashier-instant-upgrade)** → harus 2 ✅
   - **Kolom L-Q (Advisor indicators)** → harus 0 ✅

---

### Step 6: Test Submit CS

1. **Logout** → **Login** sebagai CS

2. **Isi 3 indikator CS:**
   - Greeting Customer: Upload 1 foto
   - Customer Service: Upload 1 foto
   - New Member: `5`

3. **Submit**

4. **Verify di spreadsheet:**
   - **Kolom E (userRole)** → "CS" ✅
   - **Kolom AH (cs-greeting)** → 1 ✅
   - **Kolom AI (cs-service)** → 1 ✅
   - **Kolom AJ (cs-new-member)** → 5 ✅

---

### Step 7: Test Admin History

1. **Login sebagai Admin**

2. **Buka History**

3. **Verify:**
   - Data Cashier muncul ✅
   - Data CS muncul ✅
   - Kolom "Role" tampil ✅
   - Badge role dengan warna ✅
   - Filter by role berfungsi ✅

---

## ✅ Expected Result

### Data Lama (Advisor):
```
Kolom E (userRole): Kosong atau "Advisor" (jika sudah diisi manual)
Kolom L-Q: Ada nilai (wa_personal, no_baru, dll)
Kolom AD-AJ: 0 (karena belum ada saat submit)
```

### Data Baru Cashier:
```
Kolom E (userRole): "Cashier"
Kolom L-Q: 0 (bukan Advisor)
Kolom AD-AG: Ada nilai (sales-id, trx, new-member, instant-upgrade)
Kolom AH-AJ: 0 (bukan CS)
```

### Data Baru CS:
```
Kolom E (userRole): "CS"
Kolom L-Q: 0 (bukan Advisor)
Kolom AD-AG: 0 (bukan Cashier)
Kolom AH-AJ: Ada nilai (greeting, service, new-member)
```

---

## 🐛 Troubleshooting

### Problem: Kolom E (userRole) masih kosong setelah submit

**Diagnosa:**
1. Buka Console browser (F12) saat submit
2. Cek Network tab → POST request ke Apps Script
3. Lihat Payload → ada field `user.role`?

**Fix:**
- Clear cache browser KERAS (Ctrl+Shift+Delete)
- Login ulang
- Submit ulang

---

### Problem: Data masuk ke kolom yang salah

**Diagnosa:**
1. Buka Apps Script → View → Executions
2. Cari execution `addSubmission` terakhir
3. Lihat Logs → cek "Indicator values"

**Fix:**
- Pastikan ID indikator di spreadsheet "indicators" PERSIS:
  - Cashier: `cashier-sales-id`, `cashier-trx`, `cashier-new-member`, `cashier-instant-upgrade`
  - CS: `cs-greeting`, `cs-service`, `cs-new-member`

---

### Problem: Header tidak bertambah (masih 29 kolom)

**Fix:**
1. Jalankan ulang function `updateSubmissionsHeader`
2. Refresh spreadsheet (F5)
3. Cek baris 1 → scroll ke kanan sampai AD

---

### Problem: Data lama hilang setelah update

**JANGAN PANIK!** Data lama TIDAK akan hilang karena:
- Kita TIDAK mengubah kolom A-AC
- Kita hanya TAMBAH kolom AD-AJ di akhir
- Data lama tetap ada di kolom L-Q

**Verify:**
1. Buka backup spreadsheet yang Anda buat di Step 1
2. Bandingkan dengan spreadsheet sekarang
3. Data lama harus SAMA PERSIS

---

## 📞 Support

Jika error:
1. Screenshot Apps Script Logs (View → Executions)
2. Screenshot spreadsheet baris 1 (header)
3. Screenshot spreadsheet baris terakhir (data terbaru)
4. Screenshot Console browser (F12) saat submit
5. Share semua screenshot

---

## 🎉 Selesai!

Setelah semua step done:
- ✅ Data lama Advisor tetap aman
- ✅ Data baru Cashier masuk ke kolom AD-AG
- ✅ Data baru CS masuk ke kolom AH-AJ
- ✅ Kolom E (userRole) terisi untuk data baru
- ✅ Admin history tampil role
- ✅ Filter by role berfungsi

**Total: 36 kolom (A-AJ)**

**Good luck! 🚀**
