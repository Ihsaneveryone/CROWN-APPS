# ⚡ QUICK FIX: Indikator Tidak Terfilter Per Role

## 🔴 Error:
```
⚠️ No indicators found for role: Advisor, showing all indicators without role field
```

## 🎯 Penyebab:
Spreadsheet **"indicators"** belum ada kolom `role` atau kolom `role` masih kosong.

## ✅ Solusi (5 Menit):

### Step 1: Buka Google Spreadsheet

1. Buka spreadsheet Anda (ID: `1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0`)
2. Klik tab/sheet **"indicators"** (di bawah)

---

### Step 2: Tambah Kolom "role"

1. **Klik kolom terakhir** (kolom paling kanan yang ada data)
2. **Klik kanan** → **Insert 1 column right**
3. **Isi header** (baris 1) dengan: `role`

**Atau lebih mudah:**
- Klik cell di kolom kosong sebelah kanan (misalnya cell I1)
- Ketik: `role`
- Enter

---

### Step 3: Isi Data Role

Sekarang isi kolom `role` untuk setiap indikator:

#### Untuk Indikator Advisor (6 indikator):
```
Greeting        → role: Advisor
Promo Running   → role: Advisor
Sales ID        → role: Advisor
Transaksi       → role: Advisor
New Member      → role: Advisor
Instant Upgrade → role: Advisor
```

#### Untuk Indikator Cashier (4 indikator baru):
```
Sales ID        → role: Cashier
Transaksi       → role: Cashier
New Member      → role: Cashier
Instant Upgrade → role: Cashier
```

#### Untuk Indikator CS (3 indikator baru):
```
Greeting Customer → role: CS
Customer Service  → role: CS
New Member        → role: CS
```

**⚠️ PENTING:**
- Role harus **case-sensitive**: `Advisor` (bukan `advisor` atau `ADVISOR`)
- Ketik **persis**: `Advisor`, `Cashier`, atau `CS`

---

### Step 4: Contoh Isi Spreadsheet

Setelah diisi, spreadsheet "indicators" harus seperti ini:

```
branchId | id                  | name          | type   | targetValue | targetPhotos | weight | icon | role
---------|---------------------|---------------|--------|-------------|--------------|--------|------|----------
A336     | advisor-greeting    | Greeting      | photo  |             | 1            | 15     |      | Advisor
A336     | advisor-promo       | Promo Running | photo  |             | 1            | 15     |      | Advisor
A336     | advisor-sales-id    | Sales ID      | number | 3           |              | 20     |      | Advisor
A336     | advisor-trx         | Transaksi     | number | 5           |              | 20     |      | Advisor
A336     | advisor-new-member  | New Member    | number | 2           |              | 15     |      | Advisor
A336     | advisor-instant     | Instant Upgrade| number| 1           |              | 15     |      | Advisor
A336     | cashier-sales-id    | Sales ID      | number | 5           |              | 30     |      | Cashier
A336     | cashier-trx         | Transaksi     | number | 10          |              | 35     |      | Cashier
A336     | cashier-new-member  | New Member    | number | 3           |              | 20     |      | Cashier
A336     | cashier-instant     | Instant Upgrade| number| 2           |              | 15     |      | Cashier
A336     | cs-greeting         | Greeting Cust | photo  |             | 1            | 30     |      | CS
A336     | cs-service          | Customer Service| photo|             | 1            | 30     |      | CS
A336     | cs-new-member       | New Member    | number | 5           |              | 40     |      | CS
```

**Tips:**
- Pakai ID unique dengan prefix role: `advisor-`, `cashier-`, `cs-`
- Total weight per role = 100%

---

### Step 5: Save & Test

1. **Tekan Ctrl+S** (save spreadsheet)
2. **Kembali ke aplikasi**
3. **Clear cache browser** (Ctrl+Shift+R atau F5)
4. **Login** sebagai Advisor
5. **Cek** → harus muncul **6 indikator Advisor saja**

---

## 🧪 Testing

### Test 1: Login Advisor
1. Login dengan role: **Advisor**
2. **Expected:** Muncul 6 indikator (Greeting, Promo, Sales ID, Trx, New Member, Instant Upgrade)
3. **Jika masih error:** Cek Console (F12) → ada log apa?

### Test 2: Login Cashier
1. Logout → Login dengan role: **Cashier**
2. **Expected:** Muncul 4 indikator (Sales ID, Trx, New Member, Instant Upgrade)

### Test 3: Login CS
1. Logout → Login dengan role: **CS**
2. **Expected:** Muncul 3 indikator (Greeting Customer, Customer Service, New Member)

---

## 🔍 Debug

Jika masih tidak jalan, buka **Console** (F12) dan cari log:

```
🔍 ===== GET INDICATORS DEBUG =====
Branch ID: A336
Cache key: indicators_A336
📡 Fetching indicators from Google Sheets (NO CACHE)...
📥 Total indicators from Sheets: 13
🔍 Filtered for branch A336: 13 indicators
```

**Cek apakah ada log:**
```
📊 RAW Sales indicator dari Google Sheets:
  - role: Advisor
```

**Jika role: undefined** → kolom `role` di spreadsheet masih kosong atau typo

---

## 📞 Jika Masih Error

Screenshot ini dan share:
1. **Spreadsheet "indicators"** (baris 1-5)
2. **Browser Console** (F12) setelah login
3. **Screenshot halaman** yang muncul error

---

**Setelah fix ini, Apps Script perlu diupdate juga untuk WRITE role saat submit data!**
Tapi untuk sekarang, indikator sudah bisa terfilter per role. ✅
