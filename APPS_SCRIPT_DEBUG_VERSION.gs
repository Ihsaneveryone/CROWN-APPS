/**
 * Google Apps Script - Crown Daily Indicators
 * ✅ DEBUG VERSION - Dengan LOG LENGKAP untuk tracking bug
 *
 * DEPLOYMENT SETTINGS:
 * - Execute as: Me
 * - Who has access: Anyone
 */

const SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';
const GDRIVE_FOLDER_ID = '';

// ─── MAPPING: Indicator ID → Column Index ────────────────────────────────────
// ADVISOR indicators (existing columns L-Q, index 11-16)
var ADVISOR_INDICATORS = {
  'wa_personal': 11,      // L
  'no_baru': 12,          // M
  'after_sales': 13,      // N
  'proteksi': 14,         // O
  'google_review': 15,    // P
  'mgb': 16               // Q
};

// CASHIER indicators (NEW columns AD-AG, index 29-32)
var CASHIER_INDICATORS = {
  'cashier-sales-id': 29,          // AD
  'cashier-trx': 30,               // AE
  'cashier-new-member': 31,        // AF
  'cashier-instant-upgrade': 32    // AG
};

// CS indicators (NEW columns AH-AJ, index 33-35)
var CS_INDICATORS = {
  'cs-greeting': 33,      // AH
  'cs-service': 34,       // AI
  'cs-new-member': 35     // AJ
};

// ─── Helper: ekstrak nilai per indikator dari data submission ─────────────────
function extractIndicatorValues(data) {
  var values = {};
  if (!data) return values;

  if (Array.isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      var ind = data[i];
      if (ind && ind.id) {
        values[ind.id] = ind.value != null ? ind.value : 0;
      }
    }
  } else if (typeof data === 'object') {
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
      message: 'Crown Daily Indicators API - DEBUG VERSION',
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
 * ✅ DEBUG VERSION: Dengan LOG LENGKAP
 */
function addSubmission(submission) {
  try {
    Logger.log('');
    Logger.log('========================================');
    Logger.log('🔍 DEBUG addSubmission START');
    Logger.log('========================================');
    Logger.log('📦 Submission ID: ' + submission.id);

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('submissions');
    if (!sheet) throw new Error('Sheet "submissions" not found!');

    // ✅ DEBUG: Log full submission object
    Logger.log('');
    Logger.log('📋 FULL SUBMISSION OBJECT:');
    Logger.log(JSON.stringify(submission, null, 2));

    // ✅ Extract role dari submission.user.role
    var userRole = '';
    Logger.log('');
    Logger.log('🔍 EXTRACTING USER ROLE:');
    Logger.log('   submission.user = ' + JSON.stringify(submission.user));

    if (submission.user && submission.user.role) {
      userRole = String(submission.user.role);
      Logger.log('   ✅ User role extracted: "' + userRole + '"');
    } else {
      Logger.log('   ❌ WARNING: submission.user.role NOT FOUND!');
      if (!submission.user) {
        Logger.log('      submission.user is NULL or UNDEFINED');
      } else {
        Logger.log('      submission.user exists but role is: ' + submission.user.role);
      }
    }

    // ✅ Ekstrak nilai per indikator
    var indValues = extractIndicatorValues(submission.data);
    Logger.log('');
    Logger.log('📊 INDICATOR VALUES:');
    Logger.log(JSON.stringify(indValues, null, 2));

    // ✅ Proses foto → URL Drive saja (strip base64)
    var photosStr = processPhotos(submission.photos || {}, submission.id || 'sub');
    Logger.log('');
    Logger.log('📸 PHOTOS: ' + photosStr.length + ' chars');

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

    // ✅ Data JSON (untuk backward compatibility)
    var dataStr = '';
    if (submission.data) {
      dataStr = JSON.stringify(submission.data);
    }

    // ✅ Build row dengan 36 kolom (A-AJ)
    Logger.log('');
    Logger.log('🏗️ BUILDING ROW DATA (36 columns):');
    var rowData = new Array(36);

    // A-H: Metadata (8 kolom)
    rowData[0] = submission.id || '';                                    // A: id
    rowData[1] = submission.branchId || '';                              // B: branchId
    rowData[2] = submission.user ? (submission.user.nik || '') : '';     // C: userNik
    rowData[3] = submission.user ? (submission.user.nama || '') : '';    // D: userName
    rowData[4] = userRole;                                               // E: userRole ⚠️ CRITICAL!
    rowData[5] = submission.date || '';                                  // F: date
    rowData[6] = submission.createdAt || new Date().toISOString();       // G: createdAt
    rowData[7] = submission.totalScore || 0;                             // H: totalScore

    Logger.log('   A (id): ' + rowData[0]);
    Logger.log('   B (branchId): ' + rowData[1]);
    Logger.log('   C (userNik): ' + rowData[2]);
    Logger.log('   D (userName): ' + rowData[3]);
    Logger.log('   E (userRole): "' + rowData[4] + '" ⚠️ CRITICAL!');
    Logger.log('   F (date): ' + rowData[5]);
    Logger.log('   G (createdAt): ' + rowData[6]);
    Logger.log('   H (totalScore): ' + rowData[7]);

    // I-K: Data, Photos, Notes (backward compatibility)
    rowData[8] = dataStr;          // I: data (JSON)
    rowData[9] = photosStr;        // J: photos (JSON)
    rowData[10] = notesStr;        // K: notes (JSON)

    // L-Q: ADVISOR indicators (6 kolom) - index 11-16
    rowData[11] = indValues['wa_personal'] != null ? indValues['wa_personal'] : 0;
    rowData[12] = indValues['no_baru'] != null ? indValues['no_baru'] : 0;
    rowData[13] = indValues['after_sales'] != null ? indValues['after_sales'] : 0;
    rowData[14] = indValues['proteksi'] != null ? indValues['proteksi'] : 0;
    rowData[15] = indValues['google_review'] != null ? indValues['google_review'] : 0;
    rowData[16] = indValues['mgb'] != null ? indValues['mgb'] : 0;

    // R-AC: Existing columns (duplikat & expanded) - index 17-28
    rowData[17] = photosStr;       // R: photos (duplikat)
    rowData[18] = notesStr;        // S: notes (duplikat)
    rowData[19] = indValues['proteksi'] != null ? indValues['proteksi'] : 0;  // T: Proteksi
    rowData[20] = indValues['google_review'] != null ? indValues['google_review'] : 0; // U: Google Review
    rowData[21] = indValues['mgb'] != null ? indValues['mgb'] : 0;  // V: MGB
    rowData[22] = '';              // W: MGB Foto 1
    rowData[23] = '';              // X: MGB Foto 2
    rowData[24] = '';              // Y: MGB Foto 3
    rowData[25] = reason;          // Z: Reason
    rowData[26] = approval;        // AA: Approval
    rowData[27] = adminNik;        // AB: Admin NIK
    rowData[28] = adminNama;       // AC: Admin Nama

    // AD-AG: CASHIER indicators (4 kolom BARU) - index 29-32
    rowData[29] = indValues['cashier-sales-id'] != null ? indValues['cashier-sales-id'] : 0;
    rowData[30] = indValues['cashier-trx'] != null ? indValues['cashier-trx'] : 0;
    rowData[31] = indValues['cashier-new-member'] != null ? indValues['cashier-new-member'] : 0;
    rowData[32] = indValues['cashier-instant-upgrade'] != null ? indValues['cashier-instant-upgrade'] : 0;

    // AH-AJ: CS indicators (3 kolom BARU) - index 33-35
    rowData[33] = indValues['cs-greeting'] != null ? indValues['cs-greeting'] : 0;
    rowData[34] = indValues['cs-service'] != null ? indValues['cs-service'] : 0;
    rowData[35] = indValues['cs-new-member'] != null ? indValues['cs-new-member'] : 0;

    Logger.log('');
    Logger.log('📊 INDICATOR VALUES IN ROW:');
    Logger.log('   L (wa_personal): ' + rowData[11]);
    Logger.log('   M (no_baru): ' + rowData[12]);
    Logger.log('   N (after_sales): ' + rowData[13]);
    Logger.log('   AD (cashier-sales-id): ' + rowData[29]);
    Logger.log('   AE (cashier-trx): ' + rowData[30]);
    Logger.log('   AH (cs-greeting): ' + rowData[33]);

    Logger.log('');
    Logger.log('💾 APPENDING ROW TO SHEET...');
    Logger.log('   Total columns: ' + rowData.length);

    sheet.appendRow(rowData);

    Logger.log('✅ Row appended successfully!');
    Logger.log('');
    Logger.log('========================================');
    Logger.log('🔍 DEBUG addSubmission END');
    Logger.log('========================================');
    Logger.log('');

    return { id: submission.id, success: true };

  } catch (error) {
    Logger.log('');
    Logger.log('❌❌❌ ERROR IN addSubmission ❌❌❌');
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    Logger.log('');
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
