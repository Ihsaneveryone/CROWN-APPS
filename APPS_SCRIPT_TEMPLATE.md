# 📋 Template Apps Script untuk Setiap Spreadsheet Toko

## ⚠️ PENTING: Kenapa Setiap Toko Butuh Apps Script Sendiri?

Google Apps Script memiliki **quota limits** per project:
- **20,000 URL Fetch calls** per hari
- **Execution time limits** 
- **Concurrent execution limits**

Jika satu Apps Script melayani semua toko (10+ toko), maka:
- ❌ Akan cepat kena quota limit
- ❌ Satu toko error, semua toko kena impact
- ❌ Tidak scalable untuk pertumbuhan

Dengan **1 Toko = 1 Apps Script**:
- ✅ Setiap toko punya quota sendiri (20k calls per hari)
- ✅ Error di satu toko tidak mempengaruhi toko lain
- ✅ Scalable - bisa tambah 100+ toko tanpa masalah
- ✅ Performance lebih baik (tidak ada bottleneck)

---

## 🚀 Cara Setup Apps Script untuk Toko Baru

### Step 1: Buka Spreadsheet Toko

1. Buka Google Spreadsheet toko yang baru dibuat
2. Pastikan sudah ada tab: **submissions**, **indicators**, **settings**

### Step 2: Buka Apps Script Editor

1. Klik menu **Extensions** > **Apps Script**
2. Akan terbuka editor Apps Script baru

### Step 3: Copy Template Code

Hapus semua code yang ada, lalu **copy-paste** code berikut:

```javascript
/**
 * CROWN SYSTEM - Apps Script Template
 * 1 Toko = 1 Apps Script untuk menghindari quota limits
 * 
 * INSTRUKSI:
 * 1. Copy code ini ke Apps Script editor spreadsheet toko Anda
 * 2. Save (Ctrl+S)
 * 3. Deploy sebagai Web App
 * 4. Copy URL deployment ke form Super Admin
 */

// ============================================
// CONFIGURATION
// ============================================

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const SUBMISSIONS_SHEET = 'submissions';
const INDICATORS_SHEET = 'indicators';
const SETTINGS_SHEET = 'settings';

// ============================================
// MAIN HANDLER - Handle semua HTTP requests
// ============================================

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getIndicators':
        return jsonResponse(getIndicators());
      
      case 'getSettings':
        return jsonResponse(getSettings());
      
      case 'getSubmissions':
        const page = parseInt(e.parameter.page) || 1;
        const limit = parseInt(e.parameter.limit) || 50;
        return jsonResponse(getSubmissions(page, limit));
      
      case 'getAllSubmissions':
        return jsonResponse(getAllSubmissions());
      
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

function doPost(e) {
  const action = e.parameter.action;
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    switch(action) {
      case 'submitData':
        return jsonResponse(submitData(data));
      
      case 'updateIndicators':
        return jsonResponse(updateIndicators(data));
      
      case 'updateSettings':
        return jsonResponse(updateSettings(data));
      
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function jsonResponse(data, status = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetByName(name) {
  let sheet = SPREADSHEET.getSheetByName(name);
  if (!sheet) {
    // Create sheet if not exists
    sheet = SPREADSHEET.insertSheet(name);
  }
  return sheet;
}

// ============================================
// GET INDICATORS
// ============================================

function getIndicators() {
  const sheet = getSheetByName(INDICATORS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return []; // No data or header only
  
  const headers = data[0];
  const indicators = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    const indicator = {
      id: row[0] || ('ind_' + i),
      name: row[1] || '',
      type: row[2] || 'number',
      targetValue: row[3] || undefined,
      targetPhotos: row[4] || undefined,
      weight: row[5] || 0,
      icon: row[6] || 'Target',
      order: row[7] || i,
      role: row[8] || undefined,
      placeholder: row[9] || undefined
    };
    
    indicators.push(indicator);
  }
  
  return indicators;
}

// ============================================
// GET SETTINGS
// ============================================

function getSettings() {
  const sheet = getSheetByName(SETTINGS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const settings = {
    loginTitle: 'CROWN | DAILY INDICATORS',
    loginSubtitle: 'Silakan masuk dengan NIK dan Nama Anda',
    minSubmitScore: 70,
    motivationMessages: []
  };
  
  if (data.length <= 1) return settings;
  
  // Parse settings from key-value pairs
  for (let i = 1; i < data.length; i++) {
    const [key, value] = data[i];
    if (key === 'loginTitle') settings.loginTitle = value;
    if (key === 'loginSubtitle') settings.loginSubtitle = value;
    if (key === 'minSubmitScore') settings.minSubmitScore = parseInt(value) || 70;
  }
  
  return settings;
}

// ============================================
// GET SUBMISSIONS (with pagination)
// ============================================

function getSubmissions(page = 1, limit = 50) {
  const sheet = getSheetByName(SUBMISSIONS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return {
      submissions: [],
      total: 0,
      page: page,
      limit: limit,
      totalPages: 0
    };
  }
  
  const submissions = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    submissions.push(parseSubmissionRow(row));
  }
  
  // Sort by date descending
  submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const total = submissions.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedSubmissions = submissions.slice(start, end);
  
  return {
    submissions: paginatedSubmissions,
    total: total,
    page: page,
    limit: limit,
    totalPages: totalPages
  };
}

// ============================================
// GET ALL SUBMISSIONS (no pagination)
// ============================================

function getAllSubmissions() {
  const sheet = getSheetByName(SUBMISSIONS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const submissions = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    submissions.push(parseSubmissionRow(row));
  }
  
  return submissions;
}

// ============================================
// PARSE SUBMISSION ROW (36 kolom A-AJ)
// ============================================

function parseSubmissionRow(row) {
  return {
    id: row[0] || '',
    branchId: row[1] || '',
    date: row[2] || '',
    createdAt: row[3] || '',
    displayDate: row[4] || '',
    nik: row[5] || '',
    nama: row[6] || '',
    role: row[7] || 'Advisor',
    totalScore: parseFloat(row[8]) || 0,
    // Indicator data columns (9-34 = 26 kolom untuk max 13 indikator dengan value+photo)
    indicatorData: parseIndicatorData(row.slice(9, 35)),
    // Notes columns (35-36)
    notes: row[35] ? JSON.parse(row[35]) : undefined,
    user: {
      nik: row[5] || '',
      nama: row[6] || '',
      role: row[7] || 'Advisor'
    }
  };
}

function parseIndicatorData(dataColumns) {
  // Parse indicator data dari kolom
  // Format: value1, photo1, value2, photo2, ...
  const indicators = [];
  for (let i = 0; i < dataColumns.length; i += 2) {
    if (dataColumns[i] !== undefined && dataColumns[i] !== '') {
      indicators.push({
        id: 'ind_' + (i/2 + 1),
        value: dataColumns[i],
        photos: dataColumns[i + 1] ? [dataColumns[i + 1]] : []
      });
    }
  }
  return indicators;
}

// ============================================
// SUBMIT DATA
// ============================================

function submitData(data) {
  const sheet = getSheetByName(SUBMISSIONS_SHEET);
  
  // Prepare row data (36 kolom A-AJ)
  const row = [
    data.id || ('sub_' + new Date().getTime()),
    data.branchId || '',
    data.date || new Date().toISOString().split('T')[0],
    data.createdAt || new Date().toISOString(),
    data.displayDate || '',
    data.user?.nik || '',
    data.user?.nama || '',
    data.user?.role || 'Advisor',
    data.totalScore || 0
  ];
  
  // Add indicator data (26 kolom untuk max 13 indikator)
  const indicatorData = new Array(26).fill('');
  if (data.data && Array.isArray(data.data)) {
    data.data.forEach((ind, idx) => {
      if (idx < 13) {
        indicatorData[idx * 2] = ind.value || '';
        indicatorData[idx * 2 + 1] = ind.photos && ind.photos[0] ? ind.photos[0] : '';
      }
    });
  }
  row.push(...indicatorData);
  
  // Add notes (1 kolom)
  row.push(data.notes ? JSON.stringify(data.notes) : '');
  
  // Append row
  sheet.appendRow(row);
  
  return { success: true, id: row[0] };
}

// ============================================
// UPDATE INDICATORS
// ============================================

function updateIndicators(indicators) {
  const sheet = getSheetByName(INDICATORS_SHEET);
  
  // Clear existing data
  sheet.clear();
  
  // Write headers
  const headers = ['id', 'name', 'type', 'targetValue', 'targetPhotos', 'weight', 'icon', 'order', 'role', 'placeholder'];
  sheet.appendRow(headers);
  
  // Write indicator data
  indicators.forEach(ind => {
    const row = [
      ind.id,
      ind.name,
      ind.type,
      ind.targetValue || '',
      ind.targetPhotos || '',
      ind.weight,
      ind.icon || 'Target',
      ind.order || 1,
      ind.role || '',
      ind.placeholder || ''
    ];
    sheet.appendRow(row);
  });
  
  return { success: true };
}

// ============================================
// UPDATE SETTINGS
// ============================================

function updateSettings(settings) {
  const sheet = getSheetByName(SETTINGS_SHEET);
  
  // Clear existing data
  sheet.clear();
  
  // Write headers
  sheet.appendRow(['key', 'value']);
  
  // Write settings
  sheet.appendRow(['loginTitle', settings.loginTitle || '']);
  sheet.appendRow(['loginSubtitle', settings.loginSubtitle || '']);
  sheet.appendRow(['minSubmitScore', settings.minSubmitScore || 70]);
  
  return { success: true };
}
```

### Step 4: Save Code

1. Klik **File** > **Save** (atau Ctrl+S)
2. Beri nama project: `CROWN - [Nama Toko]`

### Step 5: Deploy sebagai Web App

1. Klik **Deploy** > **New deployment**
2. Klik icon **gear** ⚙️ di sebelah "Select type"
3. Pilih **Web app**
4. Isi konfigurasi:
   - **Description**: `CROWN API for [Nama Toko]`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
5. Klik **Deploy**
6. Authorize aplikasi (ikuti wizard Google)
7. **COPY URL DEPLOYMENT** yang muncul
   - Format: `https://script.google.com/macros/s/AKfycbx.../exec`

### Step 6: Masukkan URL ke Super Admin Dashboard

1. Login ke Super Admin Dashboard
2. Buat cabang baru
3. Paste **URL Deployment** yang sudah di-copy ke field "URL Apps Script Deployment"
4. Lengkapi data lainnya (NIK, Nama, Admin, Spreadsheet URL)
5. Klik **Buat Cabang**

---

## 🔄 Update Apps Script (Jika Ada Perubahan Code)

Jika ada update template code:

1. Buka Apps Script editor spreadsheet toko
2. Ganti code dengan versi terbaru
3. Save (Ctrl+S)
4. Klik **Deploy** > **Manage deployments**
5. Klik icon **edit** (pensil) di deployment yang aktif
6. Ubah **Version** menjadi **New version**
7. Klik **Deploy**
8. **URL deployment tetap sama** - tidak perlu update di Super Admin

---

## ✅ Testing Apps Script

Test apakah Apps Script sudah jalan dengan baik:

1. Buka URL deployment di browser dengan parameter:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=getIndicators
   ```

2. Jika berhasil, akan muncul response JSON
3. Jika error, cek:
   - Apakah spreadsheet sudah ada tab submissions, indicators, settings?
   - Apakah Apps Script sudah di-deploy dengan akses "Anyone"?
   - Apakah sudah authorize aplikasi?

---

## 📊 Quota Monitoring

Setiap Apps Script punya quota sendiri. Monitor di:
**Apps Script Editor** > **Executions** 

Quota default per project:
- 20,000 URL Fetch calls per hari
- 6 min/execution time limit
- 30 concurrent executions

Dengan setup ini, **setiap toko bisa handle 20,000 requests per hari** - lebih dari cukup untuk operasional normal!

---

## 🆘 Troubleshooting

### Error: "Script function not found: doGet"
- Pastikan code sudah di-save
- Re-deploy dengan version baru

### Error: "Authorization required"
- Re-deploy dan authorize ulang
- Pastikan "Who has access" = Anyone

### Error: "Exception: Service Spreadsheets failed"
- Cek apakah spreadsheet masih accessible
- Cek apakah nama sheet sudah benar (submissions, indicators, settings)

---

**Template ini dibuat untuk CROWN System - Daily Indicators Management**
