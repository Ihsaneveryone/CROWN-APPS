/**
 * Google Apps Script - Crown Daily Indicators
 * ✅ FINAL VERSION: Role System dengan KOLOM TERPISAH (Extend existing)
 *
 * DEPLOYMENT SETTINGS:
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * STRUKTUR KOLOM submissions (EXTEND dari struktur lama):
 * A:id | B:branchId | C:userNik | D:userName | E:userRole | F:date | G:createdAt | H:totalScore
 *
 * ADVISOR (9 kolom):
 * I:sales | J:trx | K:basket | L:wa_personal | M:no_baru | N:after_sales | O:proteksi | P:google_review | Q:mgb
 *
 * CASHIER (4 kolom BARU):
 * R:cashier-sales-id | S:cashier-trx | T:cashier-new-member | U:cashier-instant-upgrade
 *
 * CS (3 kolom BARU):
 * V:cs-greeting | W:cs-service | X:cs-new-member
 *
 * Y:photos | Z:notes | AA:Reason | AB:Approval | AC:Admin NIK | AD:Admin Nama
 *
 * TOTAL: 30 kolom (A-AD)
 */

const SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';

// Opsional: isi dengan ID folder Google Drive untuk simpan foto sebagai URL
const GDRIVE_FOLDER_ID = '';

// ─── MAPPING: Indicator ID → Column Index ────────────────────────────────────
// ADVISOR indicators (index 8-16, kolom I-Q)
var ADVISOR_INDICATORS = {
  'sales': 8,
  'trx': 9,
  'basket': 10,
  'wa_personal': 11,
  'no_baru': 12,
  'after_sales': 13,
  'proteksi': 14,
  'google_review': 15,
  'mgb': 16
};

// CASHIER indicators (index 17-20, kolom R-U) - BARU!
var CASHIER_INDICATORS = {
  'cashier-sales-id': 17,
  'cashier-trx': 18,
  'cashier-new-member': 19,
  'cashier-instant-upgrade': 20
};

// CS indicators (index 21-23, kolom V-X) - BARU!
var CS_INDICATORS = {
  'cs-greeting': 21,
  'cs-service': 22,
  'cs-new-member': 23
};

// Kolom tambahan
var PHOTOS_COL = 24;  // Y
var NOTES_COL = 25;   // Z
var REASON_COL = 26;  // AA
var APPROVAL_COL = 27; // AB
var ADMIN_NIK_COL = 28; // AC
var ADMIN_NAMA_COL = 29; // AD

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
      message: 'Crown Daily Indicators API - Role System (Extended Columns)',
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
 * ✅ FINAL: Menyimpan submission DENGAN ROLE (Extended Columns)
 *
 * Struktur: 30 kolom (A-AD)
 * - A-H: metadata (dengan userRole di E)
 * - I-Q: Advisor indicators (9 kolom)
 * - R-U: Cashier indicators (4 kolom BARU)
 * - V-X: CS indicators (3 kolom BARU)
 * - Y-AD: photos, notes, expanded notes fields
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

    // ✅ Ekstrak nilai per indikator
    var indValues = extractIndicatorValues(submission.data);
    Logger.log('Indicator values extracted: ' + JSON.stringify(indValues));

    // ✅ Proses foto → URL Drive saja (strip base64)
    var photosStr = processPhotos(submission.photos || {}, submission.id || 'sub');
    Logger.log('Photos stored: ' + photosStr.length + ' chars');

    // ✅ Notes - Extract fields jika ada
    var notesStr = '';
    var reason = '';
    var approval = '';
    var adminNik = '';
    var adminNama = '';

    if (submission.notes && typeof submission.notes === 'object') {
      reason = submission.notes.reason || '';
      approval = submission.notes.approval || '';
      adminNik = submission.notes.adminNik || '';
      adminNama = submission.notes.adminNama || '';
      notesStr = JSON.stringify(submission.notes);
    } else if (submission.notes) {
      notesStr = String(submission.notes);
    }

    // ✅ Build row dengan 30 kolom (A-AD)
    // Initialize semua kolom dengan 0 atau ''
    var rowData = new Array(30);

    // A-H: Metadata
    rowData[0] = submission.id || '';                                    // A: id
    rowData[1] = submission.branchId || '';                              // B: branchId
    rowData[2] = submission.user ? (submission.user.nik || '') : '';     // C: userNik
    rowData[3] = submission.user ? (submission.user.nama || '') : '';    // D: userName
    rowData[4] = userRole;                                               // E: userRole ✅
    rowData[5] = submission.date || '';                                  // F: date
    rowData[6] = submission.createdAt || new Date().toISOString();       // G: createdAt
    rowData[7] = submission.totalScore || 0;                             // H: totalScore

    // I-Q: ADVISOR indicators (index 8-16)
    rowData[8] = indValues['sales'] != null ? indValues['sales'] : 0;
    rowData[9] = indValues['trx'] != null ? indValues['trx'] : 0;
    rowData[10] = indValues['basket'] != null ? indValues['basket'] : 0;
    rowData[11] = indValues['wa_personal'] != null ? indValues['wa_personal'] : 0;
    rowData[12] = indValues['no_baru'] != null ? indValues['no_baru'] : 0;
    rowData[13] = indValues['after_sales'] != null ? indValues['after_sales'] : 0;
    rowData[14] = indValues['proteksi'] != null ? indValues['proteksi'] : 0;
    rowData[15] = indValues['google_review'] != null ? indValues['google_review'] : 0;
    rowData[16] = indValues['mgb'] != null ? indValues['mgb'] : 0;

    // R-U: CASHIER indicators (index 17-20) ✅ BARU!
    rowData[17] = indValues['cashier-sales-id'] != null ? indValues['cashier-sales-id'] : 0;
    rowData[18] = indValues['cashier-trx'] != null ? indValues['cashier-trx'] : 0;
    rowData[19] = indValues['cashier-new-member'] != null ? indValues['cashier-new-member'] : 0;
    rowData[20] = indValues['cashier-instant-upgrade'] != null ? indValues['cashier-instant-upgrade'] : 0;

    // V-X: CS indicators (index 21-23) ✅ BARU!
    rowData[21] = indValues['cs-greeting'] != null ? indValues['cs-greeting'] : 0;
    rowData[22] = indValues['cs-service'] != null ? indValues['cs-service'] : 0;
    rowData[23] = indValues['cs-new-member'] != null ? indValues['cs-new-member'] : 0;

    // Y-AD: Photos, Notes, Expanded notes
    rowData[24] = photosStr;       // Y: photos
    rowData[25] = notesStr;        // Z: notes
    rowData[26] = reason;          // AA: Reason
    rowData[27] = approval;        // AB: Approval
    rowData[28] = adminNik;        // AC: Admin NIK
    rowData[29] = adminNama;       // AD: Admin Nama

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
 * Header EXTENDED: 30 kolom (A-AD)
 * - Kolom lama tetap ada (backward compatible)
 * - Tambah kolom baru untuk Cashier & CS
 *
 * Cara pakai:
 *   1. Pilih fungsi "updateSubmissionsHeader" dari dropdown
 *   2. Klik ▶ Run
 *   3. Cek sheet "submissions" → header sudah 30 kolom
 */
function updateSubmissionsHeader() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('submissions');
  if (!sheet) {
    Logger.log('Sheet "submissions" tidak ditemukan!');
    return;
  }

  // Header EXTENDED: 30 kolom (A-AD)
  var newHeaders = [
    // A-H: Metadata
    'id',                    // A
    'branchId',              // B
    'userNik',               // C
    'userName',              // D
    'userRole',              // E ← Role: Advisor/Cashier/CS
    'date',                  // F
    'createdAt',             // G
    'totalScore',            // H

    // I-Q: ADVISOR indicators (9 kolom)
    'sales',                 // I
    'trx',                   // J
    'basket',                // K
    'wa_personal',           // L
    'no_baru',               // M
    'after_sales',           // N
    'proteksi',              // O
    'google_review',         // P
    'mgb',                   // Q

    // R-U: CASHIER indicators (4 kolom BARU)
    'cashier-sales-id',      // R
    'cashier-trx',           // S
    'cashier-new-member',    // T
    'cashier-instant-upgrade', // U

    // V-X: CS indicators (3 kolom BARU)
    'cs-greeting',           // V
    'cs-service',            // W
    'cs-new-member',         // X

    // Y-AD: Photos, Notes, Expanded
    'photos',                // Y
    'notes',                 // Z
    'Reason',                // AA
    'Approval',              // AB
    'Admin NIK',             // AC
    'Admin Nama'             // AD
  ];

  // Set header row
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);

  Logger.log('✅ Header updated successfully!');
  Logger.log('Total kolom: ' + newHeaders.length);
  Logger.log('Header: ' + newHeaders.join(' | '));
}
