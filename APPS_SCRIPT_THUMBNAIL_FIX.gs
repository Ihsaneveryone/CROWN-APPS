/**
 * Google Apps Script - Crown Daily Indicators
 * ✅ VERSION: THUMBNAIL FIX - Simpan foto base64 thumbnail langsung ke cells!
 *
 * DEPLOYMENT SETTINGS:
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * FIXES:
 * - ✅ Simpan photosThumbs (40x40 base64) langsung ke kolom photos
 * - ✅ Tidak perlu Google Drive lagi!
 * - ✅ Foto akan muncul di export Excel
 *
 * STRUKTUR KOLOM submissions:
 * A:id | B:branchId | C:userNik | D:userName | E:userRole | F:date | G:createdAt | H:totalScore | I:data | J:photos | K:notes
 *
 * Kolom J (photos) sekarang berisi:
 * {"indicator_id": ["data:image/jpeg;base64,...", "data:image/jpeg;base64,..."], ...}
 */

const SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';

// ─── Helper: Process photosThumbs (langsung simpan base64) ───────────────────
/**
 * PERBAIKAN: Simpan photosThumbs (40x40 thumbnail) langsung ke cells
 *
 * photosThumbs format dari frontend:
 * {
 *   "indicator_id": ["data:image/jpeg;base64,...", "data:image/jpeg;base64,..."],
 *   ...
 * }
 *
 * Simpan langsung sebagai JSON string ke kolom photos!
 */
function processPhotosThumbs(photosThumbs) {
  if (!photosThumbs || typeof photosThumbs !== 'object') return '';

  var thumbMap = {};
  var keys = Object.keys(photosThumbs);

  for (var ki = 0; ki < keys.length; ki++) {
    var indicatorId = keys[ki];
    var photoList = photosThumbs[indicatorId];

    if (!Array.isArray(photoList) || photoList.length === 0) continue;

    var validPhotos = [];
    for (var i = 0; i < photoList.length; i++) {
      var photo = photoList[i];
      // Simpan SEMUA base64 thumbnails (jangan diabaikan!)
      if (typeof photo === 'string' && photo.length > 100) {
        validPhotos.push(photo);
      }
    }

    if (validPhotos.length > 0) {
      thumbMap[indicatorId] = validPhotos;
    }
  }

  return Object.keys(thumbMap).length > 0 ? JSON.stringify(thumbMap) : '';
}

// ─── doGet ────────────────────────────────────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Crown Daily Indicators API - Thumbnail Fix',
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
      case 'deleteSubmissions':
        // ✅ BATCH DELETE support
        if (!params.data || !params.data.ids) throw new Error('Missing "data.ids"');
        result = deleteSubmissions(params.data.ids);
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
 * ✅ FIXED: Simpan photosThumbs langsung ke kolom photos!
 */
function addSubmission(submission) {
  try {
    Logger.log('addSubmission: ' + submission.id);

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('submissions');
    if (!sheet) throw new Error('Sheet "submissions" not found!');

    // Extract role
    var userRole = '';
    if (submission.user && submission.user.role) {
      userRole = String(submission.user.role);
    }
    Logger.log('User role: ' + userRole);

    // Data indikator sebagai JSON
    var dataStr = '';
    if (submission.data) {
      dataStr = JSON.stringify(submission.data);
    }
    Logger.log('Data length: ' + dataStr.length + ' chars');

    // ✅ PERBAIKAN: Simpan photosThumbs (40x40 base64) langsung!
    var photosStr = '';
    if (submission.photosThumbs) {
      photosStr = processPhotosThumbs(submission.photosThumbs);
      Logger.log('✅ Photos thumbnails saved: ' + photosStr.length + ' chars');
      Logger.log('✅ Sample photo data: ' + (photosStr.length > 100 ? photosStr.substring(0, 100) + '...' : photosStr));
    } else {
      Logger.log('⚠️ No photosThumbs in submission!');
    }

    // Notes
    var notesStr = '';
    if (submission.notes && typeof submission.notes === 'object') {
      notesStr = JSON.stringify(submission.notes);
    } else if (submission.notes) {
      notesStr = String(submission.notes);
    }

    // Row: A–K (11 kolom)
    var rowData = [
      submission.id || '',                                    // A: id
      submission.branchId || '',                              // B: branchId
      submission.user ? (submission.user.nik || '') : '',     // C: userNik
      submission.user ? (submission.user.nama || '') : '',    // D: userName
      userRole,                                               // E: userRole
      submission.date || '',                                  // F: date
      submission.createdAt || new Date().toISOString(),       // G: createdAt
      submission.totalScore || 0,                             // H: totalScore
      dataStr,                                                // I: data (JSON)
      photosStr,                                              // J: photos (JSON) ✅ THUMBNAIL BASE64!
      notesStr                                                // K: notes (JSON)
    ];

    sheet.appendRow(rowData);
    Logger.log('✅ Row appended successfully with role: ' + userRole);
    Logger.log('✅ Photos column contains: ' + (photosStr ? 'base64 thumbnails' : 'empty'));

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

// ─── deleteSubmission (single) ────────────────────────────────────────────────
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

// ─── deleteSubmissions (batch) ────────────────────────────────────────────────
function deleteSubmissions(ids) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('submissions');
  if (!sheet) throw new Error('Sheet "submissions" not found!');

  Logger.log('Deleting ' + ids.length + ' submissions...');

  var values = sheet.getDataRange().getValues();
  var rowsToDelete = [];

  // Collect rows to delete
  for (var i = 1; i < values.length; i++) {
    var rowId = values[i][0];
    if (ids.indexOf(rowId) !== -1) {
      rowsToDelete.push(i + 1); // Row numbers are 1-indexed
    }
  }

  // Delete from bottom to top (to avoid index shifting)
  rowsToDelete.sort(function(a, b) { return b - a; });

  for (var j = 0; j < rowsToDelete.length; j++) {
    sheet.deleteRow(rowsToDelete[j]);
  }

  Logger.log('✅ Deleted ' + rowsToDelete.length + ' rows');

  return {
    success: true,
    deletedCount: rowsToDelete.length,
    requestedCount: ids.length
  };
}

// ─── UPDATE HEADER (jalankan sekali jika belum) ───────────────────────────────
function updateSubmissionsHeader() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('submissions');
  if (!sheet) {
    Logger.log('Sheet "submissions" tidak ditemukan!');
    return;
  }

  // Header: 11 kolom (A-K)
  var newHeaders = [
    'id',           // A
    'branchId',     // B
    'userNik',      // C
    'userName',     // D
    'userRole',     // E
    'date',         // F
    'createdAt',    // G
    'totalScore',   // H
    'data',         // I
    'photos',       // J ← BASE64 THUMBNAILS!
    'notes'         // K
  ];

  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);

  Logger.log('✅ Header updated successfully!');
  Logger.log('Total kolom: ' + newHeaders.length);
  Logger.log('Header: ' + newHeaders.join(' | '));
}
