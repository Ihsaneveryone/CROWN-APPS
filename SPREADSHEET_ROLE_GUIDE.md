# 📊 Panduan Update Google Spreadsheet untuk Role System

## 🎯 Yang Perlu Diubah

Sekarang setiap **Indicator** dan **Submission** perlu punya field **`role`** untuk membedakan data per role.

---

## 📋 1. Update Sheet "indicators"

Tambahkan kolom **`role`** di sheet indicators.

### Struktur Kolom (urutan harus sama):

| id | name | type | targetValue | targetPhotos | targetText | dropdownOptions | weight | icon | order | isSpecial | specialFormula | placeholder | **role** |
|----|------|------|-------------|--------------|------------|----------------|--------|------|-------|-----------|---------------|-------------|----------|

### Contoh Data dengan Role:

```
id                    | name            | type   | targetValue | weight | order | role
advisor-greeting      | Greeting        | photo  |             | 15     | 1     | Advisor
advisor-promo         | Promo Running   | photo  |             | 15     | 2     | Advisor
advisor-sales-id      | Sales ID        | number | 3           | 20     | 3     | Advisor
advisor-trx           | Transaksi       | number | 5           | 20     | 4     | Advisor
advisor-new-member    | New Member      | number | 2           | 15     | 5     | Advisor
advisor-instant-upgrade| Instant Upgrade| number | 1           | 15     | 6     | Advisor

cashier-sales-id      | Sales ID        | number | 5           | 30     | 1     | Cashier
cashier-trx           | Transaksi       | number | 10          | 35     | 2     | Cashier
cashier-new-member    | New Member      | number | 3           | 20     | 3     | Cashier
cashier-instant-upgrade| Instant Upgrade| number | 2           | 15     | 4     | Cashier

cs-greeting           | Greeting Customer| photo |             | 30     | 1     | CS
cs-service            | Customer Service| photo  |             | 30     | 2     | CS
cs-new-member         | New Member      | number | 5           | 40     | 3     | CS
```

### ⚠️ PENTING:

1. **ID harus unique** - gunakan prefix role (advisor-, cashier-, cs-)
2. **Role values**: Harus salah satu dari: `Advisor`, `Cashier`, `CS` (case sensitive!)
3. **Weight total = 100%** untuk setiap role
4. **Hapus indikator lama** yang tidak punya role (atau tambahkan role ke indikator lama)

---

## 📋 2. Update Sheet "submissions"

Tambahkan field **`role`** di dalam object **`user`**.

### Struktur Lama:
```json
{
  "id": "...",
  "branchId": "...",
  "user": {
    "nik": "12345",
    "nama": "John Doe"
  },
  "data": [...],
  "totalScore": 95,
  ...
}
```

### Struktur Baru (dengan role):
```json
{
  "id": "...",
  "branchId": "...",
  "user": {
    "nik": "12345",
    "nama": "John Doe",
    "role": "Advisor"
  },
  "data": [...],
  "totalScore": 95,
  ...
}
```

### Nilai Role yang Valid:
- `"Advisor"`
- `"Cashier"`
- `"CS"`

### ⚠️ Backward Compatibility:
- Submission lama **TANPA field role** masih bisa ditampilkan
- Di admin history, submission tanpa role akan tampil "-"
- Tapi submission **BARU** harus punya role!

---

## 🚀 Quick Start - Copy Template

### Template Indicators (Copy ke Spreadsheet):

**ADVISOR:**
```
advisor-greeting | Greeting | photo | | 1 | | | 15 | | 1 | | | Upload foto greeting customer | Advisor
advisor-promo | Promo Running | photo | | 1 | | | 15 | | 2 | | | Upload foto promo | Advisor
advisor-sales-id | Sales ID | number | 3 | | | | 20 | | 3 | | | Jumlah Sales ID | Advisor
advisor-trx | Transaksi | number | 5 | | | | 20 | | 4 | | | Jumlah transaksi | Advisor
advisor-new-member | New Member | number | 2 | | | | 15 | | 5 | | | Jumlah new member | Advisor
advisor-instant-upgrade | Instant Upgrade | number | 1 | | | | 15 | | 6 | | | Jumlah instant upgrade | Advisor
```

**CASHIER:**
```
cashier-sales-id | Sales ID | number | 5 | | | | 30 | | 1 | | | Jumlah Sales ID | Cashier
cashier-trx | Transaksi | number | 10 | | | | 35 | | 2 | | | Jumlah transaksi | Cashier
cashier-new-member | New Member | number | 3 | | | | 20 | | 3 | | | Jumlah new member | Cashier
cashier-instant-upgrade | Instant Upgrade | number | 2 | | | | 15 | | 4 | | | Jumlah instant upgrade | Cashier
```

**CS (Customer Service):**
```
cs-greeting | Greeting Customer | photo | | 1 | | | 30 | | 1 | | | Upload foto greeting | CS
cs-service | Customer Service | photo | | 1 | | | 30 | | 2 | | | Upload foto customer service | CS
cs-new-member | New Member | number | 5 | | | | 40 | | 3 | | | Jumlah new member | CS
```

---

## 🔧 Cara Update Spreadsheet:

### Langkah 1: Backup Data Lama
1. Buat copy spreadsheet sebagai backup
2. Simpan dengan nama: `[Nama Spreadsheet] - Backup Before Role`

### Langkah 2: Update Sheet "indicators"
1. Tambah kolom `role` di kolom terakhir
2. Copy paste template di atas
3. **HAPUS indikator lama** yang tidak punya role
4. Verify: Total weight setiap role = 100%

### Langkah 3: (Optional) Update Sheet "submissions"
- Submission lama tetap bisa digunakan
- Submission baru otomatis punya field role
- Tidak perlu update manual kecuali mau lihat role di data lama

### Langkah 4: Test di Aplikasi
1. Clear cache browser (Ctrl+Shift+R)
2. Login dengan role "Advisor" → harus muncul 6 indikator
3. Login dengan role "Cashier" → harus muncul 4 indikator
4. Login dengan role "CS" → harus muncul 3 indikator

---

## ❓ Troubleshooting

### "Indikator tidak muncul sama sekali"

**Penyebab:** Indikator di spreadsheet belum ada atau belum punya field role

**Solusi:**
1. Cek spreadsheet → sheet "indicators" 
2. Pastikan ada data dengan kolom `role`
3. Pastikan value role: `Advisor`, `Cashier`, atau `CS` (case sensitive!)
4. Refresh aplikasi (Ctrl+Shift+R)

### "Muncul indikator dari role lain"

**Penyebab:** Typo di field role atau role tidak match

**Solusi:**
1. Cek spreadsheet → pastikan role exact match
2. Valid values: `Advisor`, `Cashier`, `CS` (huruf besar kecil harus sama!)
3. Hapus spasi sebelum/sesudah nama role

### "Total score tidak 100%"

**Penyebab:** Weight tidak dijumlahkan dengan benar

**Solusi:**
1. Hitung total weight setiap role
2. Advisor: 15+15+20+20+15+15 = 100%
3. Cashier: 30+35+20+15 = 100%
4. CS: 30+30+40 = 100%

---

## 📝 Checklist Setup

- [ ] Backup spreadsheet lama
- [ ] Tambah kolom `role` di sheet "indicators"
- [ ] Copy template indicators (Advisor, Cashier, CS)
- [ ] Hapus indikator lama tanpa role
- [ ] Verify total weight = 100% per role
- [ ] Test login sebagai Advisor → 6 indikator muncul
- [ ] Test login sebagai Cashier → 4 indikator muncul
- [ ] Test login sebagai CS → 3 indikator muncul
- [ ] Test submit data → role tersimpan di submission

---

## 💡 Tips

1. **Gunakan ID dengan prefix role** (advisor-, cashier-, cs-) untuk mudah dibedakan
2. **Jangan campur indikator antar role** - setiap role punya indikator sendiri
3. **Total weight harus 100%** per role, bukan 100% untuk semua role
4. **Case sensitive!** - `Advisor` ≠ `advisor` ≠ `ADVISOR`

---

**Selamat mencoba! Jika masih error, share screenshot spreadsheet Anda!** 🚀
