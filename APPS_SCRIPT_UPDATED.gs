/**
 * Google Apps Script - Crown Daily Indicators
 * ✅ UPDATED: Dengan Role System
 *
 * DEPLOYMENT SETTINGS:
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * STRUKTUR KOLOM submissions (update header row di spreadsheet!):
 *
 * OPSI 1 (RECOMMENDED): userRole setelah userName
 * A:id | B:branchId | C:userNik | D:userName | E:userRole | F:date | G:createdAt | H:totalScore
 * I:sales | J:trx | K:basket | L:wa_personal | M:no_baru | N:after_sales
 * O:proteksi | P:google_review | Q:mgb | R:photos | S:notes
 *
 * PERUBAHAN DARI VERSI LAMA:
 * - Kolom E (userRole) BARU ditambahkan
 * - Kolom F-S semua bergeser 1 kolom ke kanan (yang tadinya E jadi F, dst)
 */

const SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';

// Opsional: isi dengan ID folder Google Drive untuk simpan foto sebagai URL
// Kosongkan ('') jika tidak pakai → foto tidak disimpan (tapi data tetap tersimpan)
const GDRIVE_FOLDER_ID = '';

// Urutan indikator (sesuai urutan kolom I-Q di spreadsheet - BERGESER dari H-P)
var INDICATOR_ORDER = ['sales', 'trx', 'basket', 'wa_personal', 'no_baru', 'after_sales', 'proteksi', 'google_review', 'mgb'];

// ─── Helper: ekstrak nilai per indikator dari data submission ─────────────────
function extractIndicatorValues(data) {
  var values = {};
  if (!data) return values;

  if (Array.isArray(data)) {
    // Format: [{id:'sales', value:6408950}, ...]
    for (var i = 0; i < data.length; i++) {
      var ind = data[i];
      if (ind && ind.id) {
        values[ind.id] = ind.value != null ? ind.value : 0;
      }
    }
  } else if (typeof data === 'object') {
    // Format: {sales: {value:6408950}, ...} atau {sales: 6408950, ...}
    var keys = Object.keys(data);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      var v = data[key];
      values[key] = (v && typeof v === 'object') ? (v.value != null ? v.value : 0) : (v != null ? v : 0);
    }
  }
  return values;
}

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
      message: 'Crown Daily Indicators API is running! (with Role System)',
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
 * ✅ UPDATED: Menyimpan submission DENGAN ROLE
 *
 * Kolom I–Q = nilai tiap indikator (angka kecil, max ~10 karakter per cell)
 * Kolom R   = foto (URL Drive saja, max ~100 karakter per foto)
 * Kolom S   = notes
 *
 * PERUBAHAN:
 * - Tambah kolom E: userRole (Advisor/Cashier/CS)
 * - Kolom indikator bergeser dari H-P menjadi I-Q
 * - Kolom photos bergeser dari Q menjadi R
 * - Kolom notes bergeser dari R menjadi S
 */
function addSubmission(submission) {
  try {
    Logger.log('addSubmission: ' + submission.id);

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('submissions');
    if (!sheet) throw new Error('Sheet "submissions" not found!');

    // Ekstrak nilai per indikator
    var indValues = extractIndicatorValues(submission.data);

    // Proses foto → URL Drive saja (strip base64)
    var photosStr = processPhotos(submission.photos || {}, submission.id || 'sub');
    Logger.log('Photos stored: ' + photosStr.length + ' chars');

    // Notes
    var notesStr = '';
    if (submission.notes && typeof submission.notes === 'object') {
      notesStr = JSON.stringify(submission.notes);
    } else if (submission.notes) {
      notesStr = String(submission.notes);
    }

    // ✅ EXTRACT ROLE dari submission.user.role
    var userRole = '';
    if (submission.user && submission.user.role) {
      userRole = String(submission.user.role);
    }
    Logger.log('User role: ' + userRole);

    // Row: A–H = metadata (DENGAN userRole di E), I–Q = indikator, R = foto, S = notes
    var rowData = [
      submission.id || '',                                          // A: id
      submission.branchId || '',                                    // B: branchId
      submission.user ? (submission.user.nik || '') : '',           // C: userNik
      submission.user ? (submission.user.nama || '') : '',          // D: userName
      userRole,                                                     // E: userRole ✅ BARU!
      submission.date || '',                                        // F: date (bergeser dari E)
      submission.createdAt || new Date().toISOString(),             // G: createdAt (bergeser dari F)
      submission.totalScore || 0,                                   // H: totalScore (bergeser dari G)
      indValues['sales']          != null ? indValues['sales']          : 0,  // I (bergeser dari H)
      indValues['trx']            != null ? indValues['trx']            : 0,  // J
      indValues['basket']         != null ? indValues['basket']         : 0,  // K
      indValues['wa_personal']    != null ? indValues['wa_personal']    : 0,  // L
      indValues['no_baru']        != null ? indValues['no_baru']        : 0,  // M
      indValues['after_sales']    != null ? indValues['after_sales']    : 0,  // N
      indValues['proteksi']       != null ? indValues['proteksi']       : 0,  // O
      indValues['google_review']  != null ? indValues['google_review']  : 0,  // P
      indValues['mgb']            != null ? indValues['mgb']            : 0,  // Q
      photosStr,                                                    // R: photos (bergeser dari Q)
      notesStr                                                      // S: notes (bergeser dari R)
    ];

    sheet.appendRow(rowData);
    Logger.log('Row appended with role: ' + userRole);

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

  // Header baru dengan userRole di kolom E
  var newHeaders = [
    'id',           // A
    'branchId',     // B
    'userNik',      // C
    'userName',     // D
    'userRole',     // E ← BARU!
    'date',         // F (bergeser dari E)
    'createdAt',    // G (bergeser dari F)
    'totalScore',   // H (bergeser dari G)
    'sales',        // I (bergeser dari H)
    'trx',          // J
    'basket',       // K
    'wa_personal',  // L
    'no_baru',      // M
    'after_sales',  // N
    'proteksi',     // O
    'google_review',// P
    'mgb',          // Q
    'photos',       // R (bergeser dari Q)
    'notes'         // S (bergeser dari R)
  ];

  // Set header row
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);

  Logger.log('✅ Header updated successfully!');
  Logger.log('Total kolom: ' + newHeaders.length);
  Logger.log('Header: ' + newHeaders.join(' | '));
}
