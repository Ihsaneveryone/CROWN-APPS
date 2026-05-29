# ⚡ Quick Fix: Indikator Tidak Muncul

## 🔥 Masalah: Indikator tidak muncul setelah implementasi role

### Penyebab:
Indikator lama di Google Sheets **belum punya field `role`**, jadi terfilter habis oleh sistem.

---

## ✅ Solusi 1: Update Spreadsheet (RECOMMENDED)

Ikuti panduan lengkap di: **[SPREADSHEET_ROLE_GUIDE.md](./SPREADSHEET_ROLE_GUIDE.md)**

**Quick steps:**
1. Buka Google Spreadsheet Anda
2. Sheet "indicators" → Tambah kolom `role`
3. Copy template berikut:

### 📋 Template untuk Copy-Paste:

**Kolom headers (baris 1):**
```
id | name | type | targetValue | targetPhotos | targetText | dropdownOptions | weight | icon | order | isSpecial | specialFormula | placeholder | role
```

**Data Advisor (6 rows):**
```
advisor-greeting | Greeting | photo | | 1 | | | 15 | | 1 | | | Upload foto greeting customer | Advisor
advisor-promo | Promo Running | photo | | 1 | | | 15 | | 2 | | | Upload foto promo | Advisor
advisor-sales-id | Sales ID | number | 3 | | | | 20 | | 3 | | | Jumlah Sales ID | Advisor
advisor-trx | Transaksi | number | 5 | | | | 20 | | 4 | | | Jumlah transaksi | Advisor
advisor-new-member | New Member | number | 2 | | | | 15 | | 5 | | | Jumlah new member | Advisor
advisor-instant-upgrade | Instant Upgrade | number | 1 | | | | 15 | | 6 | | | Jumlah instant upgrade | Advisor
```

**Data Cashier (4 rows):**
```
cashier-sales-id | Sales ID | number | 5 | | | | 30 | | 1 | | | Jumlah Sales ID | Cashier
cashier-trx | Transaksi | number | 10 | | | | 35 | | 2 | | | Jumlah transaksi | Cashier
cashier-new-member | New Member | number | 3 | | | | 20 | | 3 | | | Jumlah new member | Cashier
cashier-instant-upgrade | Instant Upgrade | number | 2 | | | | 15 | | 4 | | | Jumlah instant upgrade | Cashier
```

**Data CS (3 rows):**
```
cs-greeting | Greeting Customer | photo | | 1 | | | 30 | | 1 | | | Upload foto greeting | CS
cs-service | Customer Service | photo | | 1 | | | 30 | | 2 | | | Upload foto service | CS
cs-new-member | New Member | number | 5 | | | | 40 | | 3 | | | Jumlah new member | CS
```

4. **Hapus baris indikator lama** (yang tidak ada rolenya)
5. Clear browser cache (Ctrl+Shift+R)
6. Test login!

---

## ✅ Solusi 2: Pakai Indikator Lama (Temporary Fallback)

Jika mau pakai indikator lama dulu (tanpa role):

**Sistem sudah saya update dengan fallback:**
- Jika tidak ada indikator dengan role → tampilkan indikator tanpa field role
- Indikator tanpa role bisa dipakai semua role

**Cara:**
1. Biarkan indikator lama di spreadsheet (jangan tambah kolom role)
2. Clear cache browser
3. Login dengan role apapun → indikator lama akan muncul untuk semua role

**⚠️ TIDAK RECOMMENDED karena:**
- Semua role lihat indikator yang sama (tidak terpisah)
- Submission tidak tercatat per role dengan benar

---

## 🧪 Testing

Setelah update spreadsheet, test dengan:

### Test 1: Login sebagai Advisor
```
NIK: 12345
Nama: Test User
Role: Advisor
```
**Expected:** Muncul 6 indikator (Greeting, Promo, Sales ID, Trx, New Member, Instant Upgrade)

### Test 2: Login sebagai Cashier
```
NIK: 12345
Nama: Test User
Role: Cashier
```
**Expected:** Muncul 4 indikator (Sales ID, Trx, New Member, Instant Upgrade)

### Test 3: Login sebagai CS
```
NIK: 12345
Nama: Test User
Role: CS
```
**Expected:** Muncul 3 indikator (Greeting Customer, Customer Service, New Member)

---

## 🔍 Debug

Jika masih tidak muncul, buka **Browser Console** (F12):

1. Login ke aplikasi
2. Buka Console tab
3. Cari pesan:
   - ✅ Good: `"Loaded X indicators for role: [Role]"`
   - ⚠️ Warning: `"No indicators found for role"`
   - ❌ Error: `"Failed to load indicators"`

4. Share screenshot console ke developer untuk investigasi

---

## 📞 Support

Jika masih error setelah ikuti panduan:
1. Screenshot Google Spreadsheet (sheet "indicators")
2. Screenshot browser console (F12)
3. Screenshot halaman login yang error
4. Share ke developer

---

**Quick Links:**
- [📊 Panduan Lengkap Spreadsheet](./SPREADSHEET_ROLE_GUIDE.md)
- [📖 README Utama](./README.md)
- [🚀 Setup Lokal](./SETUP_LOKAL.md)
