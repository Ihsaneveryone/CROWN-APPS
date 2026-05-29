# 🎯 Role System - Panduan Cepat

## ⚡ Quick Fix: Indikator Tidak Muncul?

### Penyebab:
Indikator lama di Google Sheets **belum punya kolom `role`**

### Solusi Cepat (Pilih salah satu):

---

## ✅ OPSI 1: Update Spreadsheet (RECOMMENDED)

### Langkah:
1. **Buka Google Spreadsheet** Anda
2. **Sheet "indicators"** → Tambah kolom `role` di kolom terakhir (setelah kolom `placeholder`)
3. **Copy data berikut** ke spreadsheet:

#### Headers (Baris 1):
```
id | name | type | targetValue | targetPhotos | targetText | dropdownOptions | weight | icon | order | isSpecial | specialFormula | placeholder | role
```

#### Data ADVISOR (6 baris):
```
advisor-greeting | Greeting | photo | | 1 | | | 15 | | 1 | | | Upload foto greeting customer | Advisor
advisor-promo | Promo Running | photo | | 1 | | | 15 | | 2 | | | Upload foto promo | Advisor
advisor-sales-id | Sales ID | number | 3 | | | | 20 | | 3 | | | Jumlah Sales ID | Advisor
advisor-trx | Transaksi | number | 5 | | | | 20 | | 4 | | | Jumlah transaksi | Advisor
advisor-new-member | New Member | number | 2 | | | | 15 | | 5 | | | Jumlah new member | Advisor
advisor-instant-upgrade | Instant Upgrade | number | 1 | | | | 15 | | 6 | | | Jumlah instant upgrade | Advisor
```

#### Data CASHIER (4 baris):
```
cashier-sales-id | Sales ID | number | 5 | | | | 30 | | 1 | | | Jumlah Sales ID | Cashier
cashier-trx | Transaksi | number | 10 | | | | 35 | | 2 | | | Jumlah transaksi | Cashier
cashier-new-member | New Member | number | 3 | | | | 20 | | 3 | | | Jumlah new member | Cashier
cashier-instant-upgrade | Instant Upgrade | number | 2 | | | | 15 | | 4 | | | Jumlah instant upgrade | Cashier
```

#### Data CS (3 baris):
```
cs-greeting | Greeting Customer | photo | | 1 | | | 30 | | 1 | | | Upload foto greeting | CS
cs-service | Customer Service | photo | | 1 | | | 30 | | 2 | | | Upload foto service | CS
cs-new-member | New Member | number | 5 | | | | 40 | | 3 | | | Jumlah new member | CS
```

4. **HAPUS baris indikator lama** (yang tidak ada rolenya)
5. **Clear browser cache**: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
6. **Test!**

### ⚠️ PENTING:
- Role values harus **exact**: `Advisor`, `Cashier`, `CS` (huruf besar/kecil harus sama!)
- Total weight per role = **100%**
- ID harus **unique** (pakai prefix: advisor-, cashier-, cs-)

---

## ✅ OPSI 2: Pakai Indikator Lama Dulu (Fallback)

Kalau belum sempat update spreadsheet, sistem sudah saya update dengan **fallback otomatis**:

### Yang Terjadi:
- Jika tidak ada indikator dengan role → **Tampilkan indikator tanpa field role**
- Indikator lama bisa dipakai **semua role**

### Cara:
1. **Biarkan** indikator lama di spreadsheet (jangan tambah kolom role)
2. **Clear cache** browser (Ctrl+Shift+R)
3. **Login** dengan role apapun → indikator lama akan muncul

### ⚠️ Kekurangan Opsi Ini:
- **Semua role** lihat indikator yang **sama** (tidak terpisah)
- Submission **tidak tercatat** per role dengan benar
- **TIDAK RECOMMENDED** untuk production

---

## 🧪 Testing

Setelah update spreadsheet, test:

### Test Login Advisor:
- Role: **Advisor**
- Expected: **6 indikator** muncul
- Indikator: Greeting, Promo Running, Sales ID, Transaksi, New Member, Instant Upgrade

### Test Login Cashier:
- Role: **Cashier**
- Expected: **4 indikator** muncul
- Indikator: Sales ID, Transaksi, New Member, Instant Upgrade

### Test Login CS:
- Role: **CS**
- Expected: **3 indikator** muncul
- Indikator: Greeting Customer, Customer Service, New Member

---

## 🔍 Debug

Buka **Browser Console** (tekan F12):

### Log yang Baik:
```
🎯 Filtering indicators for role: Advisor
📊 Total indicators from backend: 13
✅ Filtered indicators for role Advisor : 6
📋 Indicators: ["Greeting (Advisor)", "Promo Running (Advisor)", ...]
```

### Log Warning (Fallback):
```
⚠️ No indicators found for role: Advisor, showing all indicators without role field
```
**Artinya:** Tidak ada indikator dengan role di spreadsheet, pakai fallback (indikator tanpa role)

### Log Error:
```
❌ No allIndicators or user role
```
**Artinya:** Data tidak terload dari backend atau user tidak punya role

---

## 📋 Checklist

- [ ] Backup spreadsheet lama
- [ ] Tambah kolom `role` di sheet "indicators"
- [ ] Copy template (Advisor 6 + Cashier 4 + CS 3 = 13 indikator)
- [ ] Hapus indikator lama tanpa role
- [ ] Verify total weight per role = 100%
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Test login sebagai Advisor → 6 indikator
- [ ] Test login sebagai Cashier → 4 indikator
- [ ] Test login sebagai CS → 3 indikator
- [ ] Test submit data → berhasil

---

## 📞 Masih Error?

Share screenshot:
1. Google Spreadsheet (sheet "indicators")
2. Browser console (F12) saat login
3. Halaman login yang error

---

## 📚 Dokumentasi Lengkap

- [📊 SPREADSHEET_ROLE_GUIDE.md](./SPREADSHEET_ROLE_GUIDE.md) - Panduan lengkap update spreadsheet
- [⚡ QUICK_FIX_INDICATORS.md](./QUICK_FIX_INDICATORS.md) - Troubleshooting indikator tidak muncul

---

**Good luck! 🚀**
