/**
 * =====================================================================
 * CROWN DAILY INDICATORS - BRANCH TEMPLATE APPS SCRIPT
 * =====================================================================
 *
 * TEMPLATE UNTUK SETIAP TOKO/CABANG BARU
 *
 * CARA SETUP BRANCH BARU:
 * 1. Copy spreadsheet template (atau buat baru dengan sheets: submissions, settings, indicators)
 * 2. Buat Google Drive folder untuk foto toko ini
 * 3. Copy script ini ke Apps Script project spreadsheet tsb
 * 4. Ganti BRANCH_SPREADSHEET_ID dengan ID spreadsheet branch
 * 5. Ganti GDRIVE_FOLDER_ID dengan ID folder Drive untuk foto
 * 6. Deploy as Web App (Execute: Me, Access: Anyone)
 * 7. Copy URL deployment
 * 8. Daftarkan branch di master spreadsheet dengan:
 *    - Branch ID
 *    - Spreadsheet ID
 *    - Apps Script URL
 *    - Google Drive Folder ID
 *
 * DEPLOYMENT:
 * - Execute as: Me (your account)
 * - Who has access: Anyone
 *
 * =====================================================================
 */

// ============= KONFIGURASI - GANTI INI! =============

// 📊 ID Spreadsheet branch ini
const BRANCH_SPREADSHEET_ID = 'PASTE_SPREADSHEET_ID_DISINI';

// 📁 ID Google Drive folder untuk simpan foto branch ini
const GDRIVE_FOLDER_ID = 'PASTE_DRIVE_FOLDER_ID_DISINI';

// ============= HELPER FUNCTIONS =============

// Extract indicator values from submission data
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

// Upload base64 image to Google Drive
function uploadBase64ToDrive(base64Data, filename) {
  if (!GDRIVE_FOLDER_ID) {
    Logger.log('⚠️ GDRIVE_FOLDER_ID not configured - skipping upload');
    return null;
  }

  try {
    var parts = base64Data.split(',');
    if (parts.length < 2) return null;

    var mimeType = parts[0].split(';')[0].split(':')[1] || 'image/jpeg';
    var bytes = Utilities.base64Decode(parts[1]);
    var blob = Utilities.newBlob(bytes, mimeType, filename + '.jpg');

    var folder = DriveApp.getFolderById(GDRIVE_FOLDER_ID);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var driveUrl = 'https://drive.google.com/uc?id=' + file.getId();
    Logger.log('✅ Uploaded: ' + driveUrl);
    return driveUrl;
  } catch (e) {
    Logger.log('❌ Drive upload error: ' + e.toString());
    return null;
  }
}

// Process photos - upload to Drive
function processPhotos(photos, submissionId) {
  if (!photos || typeof photos !== 'object') return '';

  var urlMap = {};
  var keys = Object.keys(photos);

  Logger.log('📸 Processing ' + keys.length + ' photo sets...');

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
      } else if (photo.startsWith('data:')) {
        var filename = submissionId + '_' + indicatorId + '_' + i;
        var url = uploadBase64ToDrive(photo, filename);
        if (url) urls.push(url);
      }
    }

    if (urls.length > 0) {
      urlMap[indicatorId] = urls;
    }
  }

  var result = Object.keys(urlMap).length > 0 ? JSON.stringify(urlMap) : '';
  Logger.log('✅ Photos processed: ' + result.length + ' chars');
  return result;
}

// ============= API HANDLERS =============

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Crown Daily Indicators - Branch API',
      branch: 'Template',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    if (!action) throw new Error('Missing action');

    var result;

    Logger.log('📥 Action: ' + action);

    switch (action) {
      case 'addSubmission':
        if (!params.data) throw new Error('Missing data');
        result = addSubmission(params.data);
        break;

      case 'deleteSubmissions':
        if (!params.data || !params.data.ids) throw new Error('Missing data.ids');
        result = deleteSubmissions(params.data.ids);
        break;

      case 'updateSettings':
        if (!params.data) throw new Error('Missing data');
        result = updateSettings(params.data);
        break;

      case 'updateIndicators':
        if (!params.data) throw new Error('Missing data');
        result = updateIndicators(params.data);
        break;

      case 'getIndicators':
        result = getIndicators();
        break;

      case 'getSettings':
        result = getSettings(params.branchId);
        break;

      default:
        throw new Error('Invalid action: ' + action);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ doPost error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============= SUBMISSION FUNCTIONS =============

function addSubmission(submission) {
  try {
    Logger.log('📝 addSubmission: ' + submission.id);

    var ss = SpreadsheetApp.openById(BRANCH_SPREADSHEET_ID);
    var sheet = ss.getSheetByName('submissions');
    if (!sheet) throw new Error('Sheet "submissions" not found');

    // Extract user data
    var userRole = '';
    if (submission.user && submission.user.role) {
      userRole = String(submission.user.role);
    }

    // Process photos - upload to Drive
    var photosStr = processPhotos(submission.photos || {}, submission.id || 'sub');

    // Process notes
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

    // Build row data
    var rowData = [
      submission.id || '',
      submission.branchId || '',
      submission.user ? (submission.user.nik || '') : '',
      submission.user ? (submission.user.nama || '') : '',
      userRole,
      submission.date || '',
      submission.createdAt || new Date().toISOString(),
      submission.totalScore || 0,
      JSON.stringify(submission.data || {}),
      photosStr,
      notesStr,
      reason,
      approval,
      adminNik,
      adminNama
    ];

    sheet.appendRow(rowData);

    var photoCount = photosStr.length > 0 ? Object.keys(JSON.parse(photosStr)).length : 0;
    Logger.log('✅ Submission saved with ' + photoCount + ' photo sets');

    return { id: submission.id, success: true, photoCount: photoCount };

  } catch (error) {
    Logger.log('❌ addSubmission error: ' + error.toString());
    throw error;
  }
}

function deleteSubmissions(ids) {
  try {
    Logger.log('🗑️ Deleting ' + ids.length + ' submissions...');

    var ss = SpreadsheetApp.openById(BRANCH_SPREADSHEET_ID);
    var sheet = ss.getSheetByName('submissions');
    if (!sheet) throw new Error('Sheet "submissions" not found');

    var values = sheet.getDataRange().getValues();
    var rowsToDelete = [];

    for (var i = 1; i < values.length; i++) {
      var rowId = values[i][0];
      if (ids.indexOf(rowId) !== -1) {
        rowsToDelete.push(i + 1);
      }
    }

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

  } catch (error) {
    Logger.log('❌ deleteSubmissions error: ' + error.toString());
    throw error;
  }
}

// ============= SETTINGS FUNCTIONS =============

function updateSettings(data) {
  try {
    var ss = SpreadsheetApp.openById(BRANCH_SPREADSHEET_ID);
    var sheet = ss.getSheetByName('settings');
    if (!sheet) throw new Error('Sheet "settings" not found');

    var values = sheet.getDataRange().getValues();
    var branchId = data.branchId || 'default';

    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === branchId) {
        sheet.getRange(i + 1, 1, 1, 6).setValues([[
          branchId,
          data.loginTitle || '',
          data.loginSubtitle || '',
          data.minSubmitScore || 80,
          values[i][4],
          new Date().toISOString()
        ]]);
        return { success: true };
      }
    }

    sheet.appendRow([
      branchId,
      data.loginTitle || '',
      data.loginSubtitle || '',
      data.minSubmitScore || 80,
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    return { success: true };

  } catch (error) {
    Logger.log('❌ updateSettings error: ' + error.toString());
    throw error;
  }
}

function getSettings(branchId) {
  try {
    var ss = SpreadsheetApp.openById(BRANCH_SPREADSHEET_ID);
    var sheet = ss.getSheetByName('settings');
    if (!sheet) return null;

    var values = sheet.getDataRange().getValues();
    var targetBranchId = branchId || 'default';

    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === targetBranchId) {
        return {
          branchId: values[i][0],
          loginTitle: values[i][1],
          loginSubtitle: values[i][2],
          minSubmitScore: values[i][3],
          createdAt: values[i][4],
          updatedAt: values[i][5]
        };
      }
    }

    return null;

  } catch (error) {
    Logger.log('❌ getSettings error: ' + error.toString());
    return null;
  }
}

// ============= INDICATORS FUNCTIONS =============

function updateIndicators(indicators) {
  try {
    Logger.log('📝 Updating ' + indicators.length + ' indicators...');

    var ss = SpreadsheetApp.openById(BRANCH_SPREADSHEET_ID);
    var sheet = ss.getSheetByName('indicators');
    if (!sheet) throw new Error('Sheet "indicators" not found');

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }

    for (var i = 0; i < indicators.length; i++) {
      var ind = indicators[i];
      sheet.appendRow([
        ind.branchId || '',
        ind.id || '',
        ind.name || '',
        ind.type || 'number',
        ind.targetValue || '',
        ind.targetPhotos || '',
        ind.weight || 0,
        ind.icon || '',
        ind.role || '',
        ind.createdAt || new Date().toISOString()
      ]);
    }

    Logger.log('✅ Indicators updated');
    return { success: true, count: indicators.length };

  } catch (error) {
    Logger.log('❌ updateIndicators error: ' + error.toString());
    throw error;
  }
}

function getIndicators() {
  try {
    var ss = SpreadsheetApp.openById(BRANCH_SPREADSHEET_ID);
    var sheet = ss.getSheetByName('indicators');
    if (!sheet) return [];

    var values = sheet.getDataRange().getValues();
    var indicators = [];

    for (var i = 1; i < values.length; i++) {
      indicators.push({
        branchId: values[i][0],
        id: values[i][1],
        name: values[i][2],
        type: values[i][3],
        targetValue: values[i][4],
        targetPhotos: values[i][5],
        weight: values[i][6],
        icon: values[i][7],
        role: values[i][8],
        createdAt: values[i][9]
      });
    }

    return indicators;

  } catch (error) {
    Logger.log('❌ getIndicators error: ' + error.toString());
    return [];
  }
}

// ============= SETUP FUNCTIONS =============

/**
 * RUN THIS ONCE after copying template to setup sheets
 */
function setupBranchSpreadsheet() {
  var ss = SpreadsheetApp.openById(BRANCH_SPREADSHEET_ID);

  // Setup submissions sheet
  var subSheet = ss.getSheetByName('submissions');
  if (!subSheet) {
    subSheet = ss.insertSheet('submissions');
  }

  var subHeaders = [
    'id', 'branchId', 'userNik', 'userName', 'userRole',
    'date', 'createdAt', 'totalScore', 'data', 'photos',
    'notes', 'Reason', 'Approval', 'Admin NIK', 'Admin Nama'
  ];

  subSheet.getRange(1, 1, 1, subHeaders.length).setValues([subHeaders]);
  subSheet.getRange(1, 1, 1, subHeaders.length).setFontWeight('bold');

  // Setup settings sheet
  var setSheet = ss.getSheetByName('settings');
  if (!setSheet) {
    setSheet = ss.insertSheet('settings');
  }

  var setHeaders = ['branchId', 'loginTitle', 'loginSubtitle', 'minSubmitScore', 'createdAt', 'updatedAt'];
  setSheet.getRange(1, 1, 1, setHeaders.length).setValues([setHeaders]);
  setSheet.getRange(1, 1, 1, setHeaders.length).setFontWeight('bold');

  // Setup indicators sheet
  var indSheet = ss.getSheetByName('indicators');
  if (!indSheet) {
    indSheet = ss.insertSheet('indicators');
  }

  var indHeaders = [
    'branchId', 'id', 'name', 'type', 'targetValue',
    'targetPhotos', 'weight', 'icon', 'role', 'createdAt'
  ];

  indSheet.getRange(1, 1, 1, indHeaders.length).setValues([indHeaders]);
  indSheet.getRange(1, 1, 1, indHeaders.length).setFontWeight('bold');

  Logger.log('✅ Branch spreadsheet setup complete!');
  Logger.log('📊 Created sheets: submissions, settings, indicators');
}
