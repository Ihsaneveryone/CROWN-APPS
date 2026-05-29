# 🔧 Panduan Update Google Apps Script untuk Fitur Role

## 🎯 Tujuan Update

Sistem role sudah diimplementasi di frontend, tapi Apps Script perlu diupdate untuk:
1. **Membaca** kolom `role` dari sheet "indicators" 
2. **Menyimpan** kolom `userRole` ke sheet "submissions"

---

## 📋 Step 1: Akses Apps Script Editor

1. Buka Google Spreadsheet Anda
2. Klik menu **Extensions** → **Apps Script**
3. Anda akan melihat file `Code.gs` (atau beberapa file `.gs`)

---

## 🔍 Step 2: Update STRUKTUR SPREADSHEET

### Sheet "indicators" - Tambah kolom `role`

**⚠️ PENTING:** Struktur di bawah adalah CONTOH LENGKAP. Spreadsheet Anda mungkin **TIDAK punya semua kolom ini**.

**Yang perlu Anda lakukan:**
1. **Cek spreadsheet Anda sekarang** → ada kolom apa saja?
2. **Tambahkan kolom `role` di AKHIR** (kolom terakhir)
3. **Hitung index kolom** `role` Anda (mulai dari 0)

**Contoh struktur LENGKAP (jika punya semua kolom):**

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| branchId | id | name | type | targetValue | targetPhotos | targetText | dropdownOptions | weight | icon | order | isSpecial | specialFormula | placeholder | **role** |

**Contoh struktur SEDERHANA (yang mungkin Anda punya):**

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| branchId | id | name | type | targetValue | targetPhotos | weight | icon | **role** |

**Index kolom role:**
- Jika kolom role di posisi **I** → index = **8**
- Jika kolom role di posisi **N** → index = **13**
- **SESUAIKAN dengan jumlah kolom Anda!**

### Sheet "submissions" - Tambah kolom `userRole`

**Struktur kolom yang benar:**

| A | B | C | D | E | F | ... | userRole |
|---|---|---|---|---|---|-----|----------|
| id | branchId | userNik | userName | **userRole** | date | ... | (tambahkan!) |

**PENTING:** Letakkan kolom `userRole` setelah kolom `userName` (kolom E)

---

## 📝 Step 3: CEK INDEX KOLOM ROLE ANDA

**LANGKAH PENTING SEBELUM EDIT APPS SCRIPT:**

1. Buka Google Spreadsheet → sheet "indicators"
2. Lihat baris pertama (header)
3. Hitung kolom dari kiri:
   - Kolom A = index 0
   - Kolom B = index 1
   - Kolom C = index 2
   - ... dst

**Contoh:**
```
Jika kolom Anda:
A        B    C     D     E            F             G       H     I (ROLE)
branchId | id | name | type | targetValue | targetPhotos | weight | icon | role

Maka index role = 8 (karena kolom I)
```

**✍️ CATAT INDEX ROLE ANDA:** _______

---

## 📝 Step 4: Update Apps Script Code

### A. Cari function `doGet()` atau function yang handle READ indicators

**SEBELUM (tidak ada role) - CONTOH SEDERHANA:**
```javascript
function readIndicators(branchId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('indicators');
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === branchId) {
      result.push({
        id: row[1],
        name: row[2],
        type: row[3],
        targetValue: row[4],
        targetPhotos: row[5],
        weight: row[6],
        icon: row[7]
        // ❌ TIDAK ADA role!
      });
    }
  }
  
  return result;
}
```

**SESUDAH (dengan role) - SESUAIKAN INDEX:**
```javascript
function readIndicators(branchId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('indicators');
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === branchId) {
      result.push({
        id: row[1],
        name: row[2],
        type: row[3],
        targetValue: row[4],
        targetPhotos: row[5],
        weight: row[6],
        icon: row[7],
        role: row[8] // ✅ TAMBAHKAN! Ganti 8 dengan index role Anda
      });
    }
  }
  
  return result;
}
```

**⚠️ PENTING:**
- **Ganti `row[8]` dengan index role Anda yang sudah dicatat di Step 3!**
- Jika kolom role Anda di posisi lain, sesuaikan angkanya

---

### B. Cari function `doPost()` atau function yang handle WRITE submissions

**SEBELUM (tidak ada userRole):**
```javascript
function addSubmission(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('submissions');
  
  var row = [
    data.id,
    data.branchId,
    data.user.nik,
    data.user.nama,
    data.date,
    data.createdAt,
    data.totalScore,
    // ... data lainnya
  ];
  
  sheet.appendRow(row);
  return { success: true };
}
```

**SESUDAH (dengan userRole):**
```javascript
function addSubmission(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('submissions');
  
  var row = [
    data.id,
    data.branchId,
    data.user.nik,
    data.user.nama,
    data.user.role || '', // ✅ TAMBAHKAN INI! Role dari user
    data.date,
    data.createdAt,
    data.totalScore,
    // ... data lainnya
  ];
  
  sheet.appendRow(row);
  return { success: true };
}
```

**PENTING:**
- Pastikan urutan kolom di array `row` sesuai dengan header di sheet "submissions"
- Jika struktur submissions Anda berbeda, sesuaikan posisi `data.user.role`

---

### C. Alternative: Dynamic Header Mapping (✅ PALING RECOMMENDED!)

**Kenapa lebih baik?**
- ✅ Tidak perlu hitung index manual
- ✅ Tidak perlu update code jika tambah/hapus kolom
- ✅ Otomatis detect kolom `role` dari header

**Cara kerja:** Baca header (baris 1) sebagai nama kolom, lalu mapping otomatis.

```javascript
function readIndicators(branchId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('indicators');
  var data = sheet.getDataRange().getValues();
  var headers = data[0]; // Baris pertama = header
  
  // Buat map header → index
  var headerMap = {};
  for (var h = 0; h < headers.length; h++) {
    headerMap[headers[h]] = h;
  }
  
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[headerMap['branchId']] === branchId) {
      result.push({
        id: row[headerMap['id']],
        name: row[headerMap['name']],
        type: row[headerMap['type']],
        targetValue: row[headerMap['targetValue']],
        targetPhotos: row[headerMap['targetPhotos']],
        targetText: row[headerMap['targetText']],
        dropdownOptions: row[headerMap['dropdownOptions']],
        weight: row[headerMap['weight']],
        icon: row[headerMap['icon']],
        order: row[headerMap['order']],
        isSpecial: row[headerMap['isSpecial']],
        specialFormula: row[headerMap['specialFormula']],
        placeholder: row[headerMap['placeholder']],
        role: row[headerMap['role']] // ✅ Dynamic! Tidak hardcode index
      });
    }
  }
  
  return result;
}
```

**Keuntungan:**
- ✅ Tidak perlu update kode jika menambah/menghapus kolom
- ✅ Otomatis detect kolom baru
- ✅ Lebih maintainable

---

## 💾 Step 4: Deploy Apps Script

Setelah edit kode:

1. **Save** (Ctrl+S atau File → Save)
2. **Deploy** → **Manage deployments**
3. Click ⚙️ (gear icon) pada deployment yang aktif
4. Klik **New deployment** atau **Update** existing deployment
5. Pastikan **Execute as**: Your account
6. Pastikan **Who has access**: **Anyone** (atau **Anyone, even anonymous**)
   - **PENTING!** Jika tidak "Anyone", aplikasi tidak bisa akses!
7. Click **Deploy**
8. Copy **Web app URL** (jika berubah, update di `src/app/utils/api.ts`)

---

## 🧪 Step 5: Testing

### Test 1: Cek Indicators dengan Role

1. **Clear cache** di browser (Ctrl+Shift+R)
2. **Login** sebagai Advisor
3. **Buka Console** (F12)
4. Cari log: `"Filtered indicators for role: Advisor"`
5. **Expected:** Hanya indikator dengan `role: "Advisor"` yang muncul

### Test 2: Cek Indicators Cashier

1. **Logout** dan **login** sebagai Cashier
2. **Expected:** Hanya muncul 4 indikator (Sales ID, Trx, New Member, Instant Upgrade)

### Test 3: Cek Indicators CS

1. **Logout** dan **login** sebagai CS
2. **Expected:** Hanya muncul 3 indikator (Greeting Customer, Customer Service, New Member)

### Test 4: Submit Data dan Cek Role Tersimpan

1. **Login** sebagai Advisor
2. **Submit** data (isi semua indikator)
3. **Buka Google Spreadsheet** → Sheet "submissions"
4. **Cari row** yang baru saja di-submit
5. **Cek kolom `userRole`** → harus berisi `"Advisor"`

### Test 5: Admin History Filter by Role

1. **Login** sebagai Admin
2. **Buka History** tab
3. **Filter by Role** → pilih "Advisor"
4. **Expected:** Hanya submission dari Advisor yang muncul

---

## 🔍 Debugging

### Jika Indikator Masih Tidak Terfilter

**Cek di Browser Console (F12):**

1. Login ke aplikasi
2. Buka tab **Console**
3. Cari log:
   - `"🔍 ===== GET INDICATORS DEBUG ====="`
   - `"📥 Total indicators from Sheets: X"`
   - `"🎯 Filtering indicators for role: [Role]"`
   - `"✅ Filtered indicators: X"`

**Jika "Filtered indicators: 0":**
- ✅ Cek spreadsheet kolom `role` sudah terisi (Advisor, Cashier, CS)
- ✅ Cek Apps Script sudah update dan deploy ulang
- ✅ Cek tidak ada typo di role (case-sensitive! Harus "Advisor", bukan "advisor")

**Jika "Filtered indicators: [banyak]" tapi masih salah:**
- ✅ Cek Apps Script benar-benar return field `role`
- ✅ Test endpoint Apps Script langsung:
  ```
  https://script.google.com/.../exec?action=getIndicators&branchId=A336
  ```
  Response harus include field `"role": "Advisor"`

### Jika Submission Tidak Menyimpan Role

1. **Cek payload** yang dikirim (Console → Network tab → cari POST request ke Apps Script)
2. **Expected payload:**
   ```json
   {
     "action": "addSubmission",
     "data": {
       "user": {
         "nik": "12345",
         "nama": "Test User",
         "role": "Advisor"  ← HARUS ADA!
       }
     }
   }
   ```

3. **Jika payload benar tapi tidak tersimpan:**
   - Cek Apps Script `addSubmission()` function
   - Pastikan `data.user.role` diambil dan ditulis ke kolom yang benar
   - Cek header sheet "submissions" ada kolom `userRole`

---

## 📊 Struktur Data Lengkap

### Indicators Sheet (dengan role):

```
branchId | id              | name            | type   | targetValue | targetPhotos | weight | role
---------|-----------------|-----------------|--------|-------------|--------------|--------|----------
A336     | advisor-greeting| Greeting        | photo  |             | 1            | 15     | Advisor
A336     | advisor-promo   | Promo Running   | photo  |             | 1            | 15     | Advisor
A336     | cashier-sales-id| Sales ID        | number | 5           |              | 30     | Cashier
A336     | cs-greeting     | Greeting Cust   | photo  |             | 1            | 30     | CS
```

### Submissions Sheet (dengan userRole):

```
id      | branchId | userNik | userName    | userRole | date       | totalScore
--------|----------|---------|-------------|----------|------------|------------
sub-001 | A336     | 12345   | Test User   | Advisor  | 2026-05-28 | 85
sub-002 | A336     | 67890   | Test Staff  | Cashier  | 2026-05-28 | 90
```

---

## ⚠️ CATATAN PENTING

1. **Case-sensitive!** 
   - Role di spreadsheet harus persis: `Advisor`, `Cashier`, `CS`
   - Bukan: `advisor`, `ADVISOR`, atau `Adv`

2. **Deploy ulang Apps Script!**
   - Setiap kali edit code, **HARUS deploy ulang** agar perubahan aktif
   - Jangan lupa pilih "Anyone" di access settings

3. **Clear cache setelah update!**
   - Aplikasi punya cache 5 menit
   - Clear cache browser (Ctrl+Shift+R) atau tunggu 5 menit

4. **Index kolom Apps Script:**
   - Jika spreadsheet berbeda struktur, sesuaikan index
   - Atau gunakan dynamic header mapping (recommended)

---

## ✅ Checklist Update

- [ ] Tambah kolom `role` di sheet "indicators" (kolom N)
- [ ] Isi kolom `role` dengan nilai: Advisor, Cashier, atau CS
- [ ] Tambah kolom `userRole` di sheet "submissions" (setelah userName)
- [ ] Update Apps Script: function readIndicators (tambah `role: row[14]`)
- [ ] Update Apps Script: function addSubmission (tambah `data.user.role`)
- [ ] Save Apps Script (Ctrl+S)
- [ ] Deploy Apps Script (pilih "Anyone")
- [ ] Clear cache browser (Ctrl+Shift+R)
- [ ] Test login Advisor → hanya muncul 6 indikator Advisor
- [ ] Test login Cashier → hanya muncul 4 indikator Cashier
- [ ] Test login CS → hanya muncul 3 indikator CS
- [ ] Test submit data → role tersimpan di sheet "submissions"
- [ ] Test admin history → filter by role berfungsi

---

## 🆘 Support

Jika masih error setelah ikuti panduan:

1. **Screenshot** Google Spreadsheet (sheet "indicators" dan "submissions")
2. **Screenshot** Apps Script code (function readIndicators dan addSubmission)
3. **Screenshot** browser console (F12) saat login
4. **Share** ke developer untuk investigasi lebih lanjut

---

**Selamat mengupdate! 🎉**
