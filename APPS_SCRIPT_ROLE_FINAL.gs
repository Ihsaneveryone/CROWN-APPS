/**
 * Google Apps Script - Crown Daily Indicators
 * ✅ FINAL VERSION: Role System dengan Format JSON Fleksibel
 *
 * DEPLOYMENT SETTINGS:
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * STRUKTUR KOLOM submissions:
 * A:id | B:branchId | C:userNik | D:userName | E:userRole | F:date | G:createdAt | H:totalScore | I:data | J:photos | K:notes
 *
 * PERBEDAAN DARI VERSI SEBELUMNYA:
 * - Kolom I (data): JSON berisi indikator APAPUN dari role MANAPUN (fleksibel!)
 * - Kolom J (photos): JSON berisi foto
 * - Kolom K (notes): JSON berisi catatan
 * - TIDAK ADA kolom hardcoded per indikator (sales, trx, dll)
 * - Semua role (Advisor, Cashier, CS) pakai struktur yang SAMA
 */

const SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';

// Opsional: isi dengan ID folder Google Drive untuk simpan foto sebagai URL
// Kosongkan ('') jika tidak pakai → foto tidak disimpan (tapi data tetap tersimpan)
const GDRIVE_FOLDER_ID = '';

// ─── Helper: upload base64 ke Google Drive, kembalikan URL ───────────────────
function uploadBase64ToDrive(base64Data, filename) {
  if (!GDRIVE_FOLDER_ID) return null;
  try {
    var parts = base64Data.split(',');
    if (parts.length < 2) return null;
    var mimeType = parts[0].split(';')[0].split(':')[1] || 'image/jpeg';
    var bytes = Utilities.base64Decode(parts[1]);
    var blob = Utilities.newBlob(bytes, mimeType, filename + '.jpg');
    var folder = DriveApp.getFolderById(GDRIVE_FOLDER_ID);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://drive.google.com/uc?id=' + file.getId();
  } catch (e) {
    Logger.log('Drive upload error: ' + e.toString());
    return null;
  }
}

// ─── Helper: konversi foto ke URL Drive (strip base64) ───────────────────────
function processPhotos(photos, submissionId) {
  if (!photos || typeof photos !== 'object') return '';
  var urlMap = {};
  var keys = Object.keys(photos);
  for (var ki = 0; ki < keys.length; ki++) {
    var indicatorId = keys[ki];
    var photoList = photos[indicatorId];
    if (!Array.isArray(photoList) || photoList.length === 0) continue;
    var urls = [];
    for (var i = 0; i < photoList.length; i++) {
      var photo = photoList[i];
      if (typeof photo !== 'string') continue;
      if (photo.startsWith('http')) {
        urls.push(photo);
      } else if (photo.startsWith('data:') && GDRIVE_FOLDER_ID) {
        var url = uploadBase64ToDrive(photo, submissionId + '_' + indicatorId + '_' + i);
        if (url) urls.push(url);
      }
      // base64 tanpa Drive → diabaikan (terlalu besar)
    }
    if (urls.length > 0) urlMap[indicatorId] = urls;
  }
  return Object.keys(urlMap).length > 0 ? JSON.stringify(urlMap) : '';
}

// ─── doGet ────────────────────────────────────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Crown Daily Indicators API - Role System (JSON Format)',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── doPost ───────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    if (!action) throw new Error('Missing "action"');

    var result;
    switch (action) {
      case 'addSubmission':
        if (!params.data) throw new Error('Missing "data"');
        result = addSubmission(params.data);
        break;
      case 'updateSettings':
        result = updateSettings(params.data);
        break;
      case 'deleteSubmission':
        result = deleteSubmission(params.data);
        break;
      default:
        throw new Error('Invalid action: ' + action);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result, timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('doPost error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString(), timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── addSubmission ────────────────────────────────────────────────────────────
/**
 * ✅ FINAL: Menyimpan submission DENGAN ROLE (Format JSON Fleksibel)
 *
 * STRUKTUR:
 * A:id | B:branchId | C:userNik | D:userName | E:userRole | F:date | G:createdAt | H:totalScore | I:data | J:photos | K:notes
 *
 * Format kolom "data" (I):
 * - Advisor: [{"id":"advisor-greeting","value":1}, {"id":"advisor-promo","value":1}, ...]
 * - Cashier: [{"id":"cashier-sales-id","value":5}, {"id":"cashier-trx","value":10}, ...]
 * - CS: [{"id":"cs-greeting","value":1}, {"id":"cs-service","value":1}, ...]
 */
function addSubmission(submission) {
  try {
    Logger.log('addSubmission: ' + submission.id);

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('submissions');
    if (!sheet) throw new Error('Sheet "submissions" not found!');

    // ✅ Extract role dari submission.user.role
    var userRole = '';
    if (submission.user && submission.user.role) {
      userRole = String(submission.user.role);
    }
    Logger.log('User role: ' + userRole);

    // ✅ Data indikator sebagai JSON (fleksibel untuk semua role)
    var dataStr = '';
    if (submission.data) {
      dataStr = JSON.stringify(submission.data);
    }
    Logger.log('Data length: ' + dataStr.length + ' chars');

    // ✅ Proses foto → URL Drive saja (strip base64)
    var photosStr = processPhotos(submission.photos || {}, submission.id || 'sub');
    Logger.log('Photos stored: ' + photosStr.length + ' chars');

    // ✅ Notes
    var notesStr = '';
    if (submission.notes && typeof submission.notes === 'object') {
      notesStr = JSON.stringify(submission.notes);
    } else if (submission.notes) {
      notesStr = String(submission.notes);
    }

    // Row: A–K (11 kolom total)
    var rowData = [
      submission.id || '',                                    // A: id
      submission.branchId || '',                              // B: branchId
      submission.user ? (submission.user.nik || '') : '',     // C: userNik
      submission.user ? (submission.user.nama || '') : '',    // D: userName
      userRole,                                               // E: userRole ✅
      submission.date || '',                                  // F: date
      submission.createdAt || new Date().toISOString(),       // G: createdAt
      submission.totalScore || 0,                             // H: totalScore
      dataStr,                                                // I: data (JSON) ✅
      photosStr,                                              // J: photos (JSON)
      notesStr                                                // K: notes (JSON)
    ];

    sheet.appendRow(rowData);
    Logger.log('✅ Row appended successfully with role: ' + userRole);

    return { id: submission.id, success: true };

  } catch (error) {
    Logger.log('addSubmission error: ' + error.toString());
    throw error;
  }
}

// ─── updateSettings ───────────────────────────────────────────────────────────
function updateSettings(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('settings');
  if (!sheet) throw new Error('Sheet "settings" not found!');

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.branchId) {
      sheet.getRange(i + 1, 1, 1, 6).setValues([[
        data.branchId,
        data.loginTitle || '',
        data.loginSubtitle || '',
        data.minScore || 80,
        values[i][4],
        new Date().toISOString()
      ]]);
      return { success: true };
    }
  }
  sheet.appendRow([data.branchId, data.loginTitle || '', data.loginSubtitle || '', data.minScore || 80, new Date().toISOString(), new Date().toISOString()]);
  return { success: true };
}

// ─── deleteSubmission ─────────────────────────────────────────────────────────
function deleteSubmission(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('submissions');
  if (!sheet) throw new Error('Sheet "submissions" not found!');

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      return { success: true, deleted: data.id };
    }
  }
  throw new Error('Submission not found: ' + data.id);
}

// ─── UPDATE HEADER SUBMISSIONS (JALANKAN SEKALI!) ─────────────────────────────
/**
 * ✅ JALANKAN FUNCTION INI SEKALI untuk update header sheet "submissions"
 *
 * Header baru: Format JSON fleksibel untuk semua role
 *
 * Cara pakai:
 *   1. Pilih fungsi "updateSubmissionsHeader" dari dropdown
 *   2. Klik ▶ Run
 *   3. Cek sheet "submissions" → header sudah berubah
 */
function updateSubmissionsHeader() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('submissions');
  if (!sheet) {
    Logger.log('Sheet "submissions" tidak ditemukan!');
    return;
  }

  // Header baru: 11 kolom (A-K)
  var newHeaders = [
    'id',           // A
    'branchId',     // B
    'userNik',      // C
    'userName',     // D
    'userRole',     // E ← Role: Advisor/Cashier/CS
    'date',         // F
    'createdAt',    // G
    'totalScore',   // H
    'data',         // I ← JSON: indikator apapun dari role manapun
    'photos',       // J ← JSON: foto
    'notes'         // K ← JSON: catatan
  ];

  // Set header row
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);

  Logger.log('✅ Header updated successfully!');
  Logger.log('Total kolom: ' + newHeaders.length);
  Logger.log('Header: ' + newHeaders.join(' | '));
}

// ─── MIGRASI DATA LAMA (OPSIONAL) ─────────────────────────────────────────────
/**
 * OPSIONAL: Migrasi data lama (kolom per indikator) ke format baru (JSON)
 *
 * Jalankan jika ada data lama dengan kolom terpisah:
 * id | branchId | userNik | userName | date | createdAt | totalScore | sales | trx | basket | ...
 *
 * Akan convert ke format baru:
 * id | branchId | userNik | userName | userRole | date | createdAt | totalScore | data | photos | notes
 */
function migrateOldSubmissions() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('submissions');
  if (!sheet) { Logger.log('Sheet tidak ditemukan!'); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { Logger.log('Tidak ada data untuk dimigrasi.'); return; }

  Logger.log('Memulai migrasi ' + (lastRow - 1) + ' baris...');

  // Asumsikan struktur lama: A-G metadata, H-P indikator, Q photos, R notes
  var OLD_INDICATOR_COLS = ['sales','trx','basket','wa_personal','no_baru','after_sales','proteksi','google_review','mgb'];

  var migrated = 0, errors = 0;

  for (var row = 2; row <= lastRow; row++) {
    try {
      var oldRow = sheet.getRange(row, 1, 1, 18).getValues()[0]; // A-R (18 kolom)

      // Ekstrak metadata
      var id = oldRow[0];
      var branchId = oldRow[1];
      var userNik = oldRow[2];
      var userName = oldRow[3];
      var date = oldRow[4];
      var createdAt = oldRow[5];
      var totalScore = oldRow[6];

      // Ekstrak data indikator dari kolom H-P (index 7-15)
      var dataArray = [];
      for (var i = 0; i < OLD_INDICATOR_COLS.length; i++) {
        var indId = OLD_INDICATOR_COLS[i];
        var indValue = oldRow[7 + i]; // kolom H = index 7
        if (indValue && indValue !== 0) {
          dataArray.push({
            id: indId,
            value: parseFloat(indValue) || 0
          });
        }
      }

      var photosStr = String(oldRow[16] || ''); // kolom Q
      var notesStr = String(oldRow[17] || '');  // kolom R

      // Tulis format baru ke kolom A-K
      var newRow = [
        id,                           // A
        branchId,                     // B
        userNik,                      // C
        userName,                     // D
        '',                           // E: userRole (kosong karena data lama tidak punya)
        date,                         // F
        createdAt,                    // G
        totalScore,                   // H
        JSON.stringify(dataArray),    // I: data
        photosStr,                    // J: photos
        notesStr                      // K: notes
      ];

      sheet.getRange(row, 1, 1, newRow.length).setValues([newRow]);

      // Hapus kolom lama (L-R) jika ada
      // (Opsional, bisa skip jika mau keep backup)

      migrated++;
      if (row % 20 === 0) {
        Logger.log('Progress: ' + migrated + '/' + (lastRow - 1));
        Utilities.sleep(100);
      }

    } catch (e) {
      errors++;
      Logger.log('Row ' + row + ' ERROR: ' + e.toString());
    }
  }

  Logger.log('=== MIGRASI SELESAI ===');
  Logger.log('Berhasil: ' + migrated + ' baris');
  Logger.log('Error: ' + errors + ' baris');
}
