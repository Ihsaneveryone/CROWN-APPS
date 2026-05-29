/**
 * =====================================================================
 * CROWN DAILY INDICATORS - MASTER SPREADSHEET APPS SCRIPT (FIXED v2)
 * =====================================================================
 *
 * FIX: Foto upload ke Drive (removed setSharing for permission fix)
 *
 * DEPLOYMENT:
 * - Execute as: Me (your account)
 * - Who has access: Anyone
 *
 * SPREADSHEET ID:
 * - MASTER: 1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0
 *
 * GOOGLE DRIVE FOLDER ID (untuk foto master):
 * - MASTER: 1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU
 *
 * =====================================================================
 */

// ============= KONFIGURASI =============
const MASTER_SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';
const MASTER_GDRIVE_FOLDER_ID = '1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU';

// ============= HELPER FUNCTIONS =============

function openTargetSpreadsheet(spreadsheetId) {
  var sid = spreadsheetId || MASTER_SPREADSHEET_ID;
  return SpreadsheetApp.openById(sid);
}

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

// ============= GOOGLE DRIVE FUNCTIONS =============

// Upload base64 image to Google Drive
function uploadBase64ToDrive(base64Data, filename, folderId) {
  if (!folderId) {
    Logger.log('⚠️ No folderId provided - skipping Drive upload');
    return null;
  }

  try {
    // Parse base64 data
    var parts = base64Data.split(',');
    if (parts.length < 2) {
      Logger.log('❌ Invalid base64 format - missing comma separator');
      return null;
    }

    var mimeType = parts[0].split(';')[0].split(':')[1] || 'image/jpeg';
    var base64String = parts[1];

    // Decode base64
    var bytes = Utilities.base64Decode(base64String);
    var blob = Utilities.newBlob(bytes, mimeType, filename + '.jpg');

    // Upload to Drive
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);

    // ✅ REMOVED setSharing - file inherits folder's public permission
    // Files created in a public folder are automatically accessible
    // file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var driveUrl = 'https://drive.google.com/uc?id=' + file.getId();
    Logger.log('✅ Uploaded to Drive: ' + driveUrl);
    return driveUrl;

  } catch (e) {
    Logger.log('❌ Drive upload error: ' + e.toString());
    Logger.log('Stack: ' + e.stack);
    return null;
  }
}

// Process photos - upload base64 to Drive and return URLs
function processPhotos(photos, submissionId, gdriveFolderId) {
  Logger.log('');
  Logger.log('========== PROCESS PHOTOS START ==========');
  Logger.log('📸 submissionId: ' + submissionId);
  Logger.log('📁 gdriveFolderId: ' + gdriveFolderId);
  Logger.log('📦 photos type: ' + typeof photos);

  if (!photos) {
    Logger.log('❌ photos is null/undefined');
    Logger.log('========== PROCESS PHOTOS END (EMPTY) ==========');
    return '';
  }

  if (typeof photos !== 'object') {
    Logger.log('❌ photos is not an object, got: ' + typeof photos);
    Logger.log('========== PROCESS PHOTOS END (EMPTY) ==========');
    return '';
  }

  var keys = Object.keys(photos);
  Logger.log('📋 Photo indicators: ' + keys.join(', ') + ' (' + keys.length + ' total)');

  if (keys.length === 0) {
    Logger.log('❌ No photo keys found');
    Logger.log('========== PROCESS PHOTOS END (EMPTY) ==========');
    return '';
  }

  // ✅ Fallback ke MASTER folder jika tidak ada gdriveFolderId
  var targetFolderId = gdriveFolderId || MASTER_GDRIVE_FOLDER_ID;
  Logger.log('🎯 Target folder ID: ' + targetFolderId);

  if (!targetFolderId) {
    Logger.log('❌ No Drive folder configured (neither branch nor master)');
    Logger.log('========== PROCESS PHOTOS END (NO FOLDER) ==========');
    return '';
  }

  var urlMap = {};
  var totalUploaded = 0;
  var totalFailed = 0;

  for (var ki = 0; ki < keys.length; ki++) {
    var indicatorId = keys[ki];
    var photoList = photos[indicatorId];

    Logger.log('');
    Logger.log('--- Processing indicator: ' + indicatorId + ' ---');
    Logger.log('Type: ' + typeof photoList);
    Logger.log('Is Array: ' + Array.isArray(photoList));

    if (!Array.isArray(photoList)) {
      Logger.log('⚠️ SKIP - not an array');
      continue;
    }

    Logger.log('Array length: ' + photoList.length);

    if (photoList.length === 0) {
      Logger.log('⚠️ SKIP - empty array');
      continue;
    }

    var urls = [];

    for (var i = 0; i < photoList.length; i++) {
      var photo = photoList[i];

      Logger.log('  Photo[' + i + '] type: ' + typeof photo);

      if (typeof photo !== 'string') {
        Logger.log('  ⚠️ SKIP - not a string');
        totalFailed++;
        continue;
      }

      var photoPreview = photo.substring(0, 50);
      Logger.log('  Photo[' + i + '] preview: ' + photoPreview);

      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        Logger.log('  ✅ Already a URL, keeping as-is');
        urls.push(photo);
        totalUploaded++;
      } else if (photo.startsWith('data:image/') || photo.startsWith('data:')) {
        Logger.log('  📤 Base64 detected, uploading...');
        var filename = submissionId + '_' + indicatorId + '_' + i;
        var url = uploadBase64ToDrive(photo, filename, targetFolderId);

        if (url) {
          Logger.log('  ✅ Upload SUCCESS: ' + url);
          urls.push(url);
          totalUploaded++;
        } else {
          Logger.log('  ❌ Upload FAILED');
          totalFailed++;
        }
      } else {
        Logger.log('  ⚠️ SKIP - unknown format (not http/https/data:)');
        totalFailed++;
      }
    }

    if (urls.length > 0) {
      urlMap[indicatorId] = urls;
      Logger.log('✅ Collected ' + urls.length + ' URLs for ' + indicatorId);
    } else {
      Logger.log('⚠️ No URLs collected for ' + indicatorId);
    }
  }

  Logger.log('');
  Logger.log('========== SUMMARY ==========');
  Logger.log('Total uploaded: ' + totalUploaded);
  Logger.log('Total failed: ' + totalFailed);
  Logger.log('Indicators with photos: ' + Object.keys(urlMap).length);

  if (Object.keys(urlMap).length === 0) {
    Logger.log('❌ urlMap is EMPTY - returning empty string');
    Logger.log('========== PROCESS PHOTOS END (NO URLS) ==========');
    return '';
  }

  var resultJSON = JSON.stringify(urlMap);
  Logger.log('✅ Result JSON length: ' + resultJSON.length + ' chars');
  Logger.log('✅ Result JSON preview: ' + resultJSON.substring(0, 200));
  Logger.log('========== PROCESS PHOTOS END (SUCCESS) ==========');
  Logger.log('');

  return resultJSON;
}

// ============= API HANDLERS =============

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Crown Daily Indicators - Master API (FIXED v2)',
      version: '1.2',
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
    var targetSpreadsheetId = params.spreadsheetId || null;

    Logger.log('📥 Action: ' + action + ' | Spreadsheet: ' + (targetSpreadsheetId || 'MASTER'));

    switch (action) {
      case 'addSubmission':
        if (!params.data) throw new Error('Missing data');
        result = addSubmission(params.data, targetSpreadsheetId);
        break;

      case 'deleteSubmissions':
        if (!params.data || !params.data.ids) throw new Error('Missing data.ids');
        result = deleteSubmissions(params.data.ids, targetSpreadsheetId);
        break;

      case 'updateSettings':
        if (!params.data) throw new Error('Missing data');
        result = updateSettings(params.data, targetSpreadsheetId);
        break;

      case 'updateIndicators':
        if (!params.data) throw new Error('Missing data');
        result = updateIndicators(params.data, targetSpreadsheetId);
        break;

      case 'createBranch':
        if (!params.data) throw new Error('Missing data');
        result = createBranch(params.data);
        break;

      case 'updateBranchAdmin':
        if (!params.data) throw new Error('Missing data');
        result = updateBranchAdmin(params.data);
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
    Logger.log('Stack: ' + error.stack);
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

function addSubmission(submission, spreadsheetId) {
  try {
    Logger.log('');
    Logger.log('========================================');
    Logger.log('📝 ADD SUBMISSION START');
    Logger.log('========================================');
    Logger.log('Submission ID: ' + submission.id);
    Logger.log('Branch ID: ' + submission.branchId);

    var ss = openTargetSpreadsheet(spreadsheetId);
    var sheet = ss.getSheetByName('submissions');
    if (!sheet) throw new Error('Sheet "submissions" not found');

    // Extract user data
    var userRole = '';
    if (submission.user && submission.user.role) {
      userRole = String(submission.user.role);
    }

    // Extract indicator values
    var indValues = extractIndicatorValues(submission.data);

    // ✅ Get Drive folder ID (fallback to MASTER if not provided)
    Logger.log('📁 submission.gdriveFolderId: ' + submission.gdriveFolderId);
    Logger.log('📁 MASTER_GDRIVE_FOLDER_ID: ' + MASTER_GDRIVE_FOLDER_ID);

    var gdriveFolderId = submission.gdriveFolderId || MASTER_GDRIVE_FOLDER_ID;
    Logger.log('📁 Final Drive folder ID: ' + gdriveFolderId);

    // ✅ Process photos - upload to Drive
    Logger.log('🔄 Calling processPhotos...');
    var photosStr = processPhotos(submission.photos || {}, submission.id || 'sub', gdriveFolderId);
    Logger.log('🔄 processPhotos returned: ' + (photosStr.length > 0 ? photosStr.length + ' chars' : 'EMPTY STRING'));

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

    // ✅ Build row data dengan indicator values
    var INDICATOR_IDS = [
      'wa_personal', 'no_baru', 'after_sales', 'proteksi', 'google_review', 'mgb',
      'cashier-sales-id', 'cashier-trx', 'cashier-new-member', 'cashier-instant-upgrade',
      'cs-greeting', 'cs-service', 'cs-new-member'
    ];

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
      photosStr,  // ✅ Column J - DRIVE URLs JSON
      notesStr,
      reason,
      approval,
      adminNik,
      adminNama
    ];

    // Append indicator values
    for (var idx = 0; idx < INDICATOR_IDS.length; idx++) {
      var indicatorId = INDICATOR_IDS[idx];
      rowData.push(indValues[indicatorId] || '');
    }

    Logger.log('📊 Row data length: ' + rowData.length);
    Logger.log('📊 Column J (photos) value: ' + (photosStr.length > 0 ? photosStr.substring(0, 100) + '...' : 'EMPTY'));

    sheet.appendRow(rowData);

    var photoCount = 0;
    if (photosStr.length > 0) {
      try {
        var parsed = JSON.parse(photosStr);
        photoCount = Object.keys(parsed).length;
      } catch (e) {
        Logger.log('⚠️ Could not parse photosStr for counting');
      }
    }

    Logger.log('✅ Submission saved with ' + photoCount + ' photo sets');
    Logger.log('========================================');
    Logger.log('📝 ADD SUBMISSION END');
    Logger.log('========================================');
    Logger.log('');

    return { id: submission.id, success: true };

  } catch (error) {
    Logger.log('❌ addSubmission error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

function deleteSubmissions(ids, spreadsheetId) {
  try {
    Logger.log('🗑️ Deleting ' + ids.length + ' submissions...');

    var ss = openTargetSpreadsheet(spreadsheetId);
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

function updateSettings(data, spreadsheetId) {
  try {
    var ss = openTargetSpreadsheet(spreadsheetId);
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

function getSettings(branchId, spreadsheetId) {
  try {
    var ss = openTargetSpreadsheet(spreadsheetId);
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

function updateIndicators(data, spreadsheetId) {
  try {
    Logger.log('🔄 Updating indicators...');

    var ss = openTargetSpreadsheet(spreadsheetId);
    var sheet = ss.getSheetByName('indicators');
    if (!sheet) throw new Error('Sheet "indicators" not found');

    sheet.clear();

    var headers = ['branchId', 'roleId', 'id', 'name', 'type', 'targetValue', 'targetPhotos', 'weight', 'icon', 'placeholder', 'createdAt', 'role'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    var indicators = data.indicators || [];
    var branchId = data.branchId || 'default';

    for (var i = 0; i < indicators.length; i++) {
      var ind = indicators[i];
      sheet.appendRow([
        branchId,
        ind.role || '',           // roleId (Column B)
        ind.id || '',             // id (Column C)
        ind.name || '',           // name (Column D)
        ind.type || 'number',     // type (Column E)
        ind.targetValue || 0,     // targetValue (Column F)
        ind.targetPhotos || 0,    // targetPhotos (Column G)
        ind.weight || 0,          // weight (Column H)
        ind.icon || '',           // icon (Column I)
        ind.placeholder || '',    // placeholder (Column J) - NEW
        ind.createdAt || new Date().toISOString(), // createdAt (Column K)
        ind.role || ''            // role (Column L)
      ]);
    }

    Logger.log('✅ Updated ' + indicators.length + ' indicators');
    return { success: true, count: indicators.length };

  } catch (error) {
    Logger.log('❌ updateIndicators error: ' + error.toString());
    throw error;
  }
}

function getIndicators(spreadsheetId) {
  try {
    var ss = openTargetSpreadsheet(spreadsheetId);
    var sheet = ss.getSheetByName('indicators');
    if (!sheet) return [];

    var values = sheet.getDataRange().getValues();
    var indicators = [];

    for (var i = 1; i < values.length; i++) {
      indicators.push({
        branchId: values[i][0],      // Column A
        roleId: values[i][1],        // Column B
        id: values[i][2],            // Column C
        name: values[i][3],          // Column D
        type: values[i][4],          // Column E
        targetValue: values[i][5],   // Column F
        targetPhotos: values[i][6],  // Column G
        weight: values[i][7],        // Column H
        icon: values[i][8],          // Column I
        placeholder: values[i][9],   // Column J (NEW)
        createdAt: values[i][10],    // Column K
        role: values[i][11]          // Column L
      });
    }

    return indicators;

  } catch (error) {
    Logger.log('❌ getIndicators error: ' + error.toString());
    return [];
  }
}

// ============= BRANCH MANAGEMENT =============

function createBranch(branchData) {
  try {
    Logger.log('🏢 Creating branch: ' + branchData.id);

    var ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    var sheet = ss.getSheetByName('branches');
    if (!sheet) throw new Error('Sheet "branches" not found');

    sheet.appendRow([
      branchData.id || '',
      branchData.nik || '',
      branchData.name || '',
      branchData.displayName || '',
      branchData.adminName || '',
      branchData.spreadsheetId || '',
      branchData.appsScriptUrl || '',
      branchData.gdriveFolderId || '',
      new Date().toISOString(),
      ''
    ]);

    Logger.log('✅ Branch created');
    return { success: true };

  } catch (error) {
    Logger.log('❌ createBranch error: ' + error.toString());
    throw error;
  }
}

function updateBranchAdmin(data) {
  try {
    Logger.log('👤 Updating admin for branch: ' + data.branchId);

    var ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    var sheet = ss.getSheetByName('branches');
    if (!sheet) throw new Error('Sheet "branches" not found');

    var values = sheet.getDataRange().getValues();

    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === data.branchId) {
        sheet.getRange(i + 1, 5).setValue(data.adminName);
        sheet.getRange(i + 1, 10).setValue(data.lastNameChange || new Date().toISOString());
        Logger.log('✅ Admin updated');
        return { success: true };
      }
    }

    throw new Error('Branch not found: ' + data.branchId);

  } catch (error) {
    Logger.log('❌ updateBranchAdmin error: ' + error.toString());
    throw error;
  }
}

// ============= SETUP FUNCTIONS =============

function setupSubmissionsHeader() {
  var ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
  var sheet = ss.getSheetByName('submissions');

  if (!sheet) {
    sheet = ss.insertSheet('submissions');
  }

  var headers = [
    'id',
    'branchId',
    'userNik',
    'userName',
    'userRole',
    'date',
    'createdAt',
    'totalScore',
    'data',
    'photos',
    'notes',
    'Reason',
    'Approval',
    'Admin NIK',
    'Admin Nama',
    'wa_personal',
    'no_baru',
    'after_sales',
    'proteksi',
    'google_review',
    'mgb',
    'cashier-sales-id',
    'cashier-trx',
    'cashier-new-member',
    'cashier-instant-upgrade',
    'cs-greeting',
    'cs-service',
    'cs-new-member'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

  Logger.log('✅ Submissions header setup complete (28 columns)');
}

// ============= TEST FUNCTIONS =============

/**
 * Test 1: Verify Drive folder accessible
 * Pilih function ini dari dropdown dan klik Run
 */
function testDriveFolderAccess() {
  var folderId = '1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU';

  Logger.log('🧪 Testing Drive folder access...');
  Logger.log('📁 Folder ID: ' + folderId);

  try {
    var folder = DriveApp.getFolderById(folderId);
    Logger.log('✅ Folder found!');
    Logger.log('📝 Folder name: ' + folder.getName());

    // Try to list files
    var files = folder.getFiles();
    var count = 0;
    while (files.hasNext() && count < 5) {
      var file = files.next();
      Logger.log('  📄 File: ' + file.getName());
      count++;
    }

    Logger.log('✅ Test PASSED - Folder accessible!');
    return true;

  } catch (e) {
    Logger.log('❌ Test FAILED - Cannot access folder!');
    Logger.log('Error: ' + e.toString());
    return false;
  }
}

/**
 * Test 2: Test actual photo upload
 * Pilih function ini dari dropdown dan klik Run
 */
function testPhotoUpload() {
  var folderId = '1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU';

  // Tiny 1x1 red pixel PNG as base64
  var testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  Logger.log('🧪 Testing photo upload to Drive...');
  Logger.log('📁 Folder ID: ' + folderId);

  try {
    var url = uploadBase64ToDrive(testBase64, 'test_photo', folderId);

    if (url) {
      Logger.log('✅ Upload SUCCESS!');
      Logger.log('🔗 Photo URL: ' + url);
      Logger.log('');
      Logger.log('✅ Test PASSED - Photo upload works!');
      return url;
    } else {
      Logger.log('❌ Upload returned null');
      Logger.log('❌ Test FAILED');
      return null;
    }

  } catch (e) {
    Logger.log('❌ Test FAILED - Upload error!');
    Logger.log('Error: ' + e.toString());
    Logger.log('Stack: ' + e.stack);
    return null;
  }
}

/**
 * Test 3: Test processPhotos with mock data
 * Pilih function ini dari dropdown dan klik Run
 */
function testProcessPhotos() {
  var folderId = '1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU';

  // Mock photos object (like what frontend sends)
  var mockPhotos = {
    'wa_personal': [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
    ],
    'mgb': [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
    ]
  };

  Logger.log('🧪 Testing processPhotos function...');
  Logger.log('📁 Folder ID: ' + folderId);
  Logger.log('📸 Mock photos: ' + Object.keys(mockPhotos).join(', '));

  try {
    var result = processPhotos(mockPhotos, 'TEST_123', folderId);

    Logger.log('');
    Logger.log('📊 Result:');
    Logger.log('  Length: ' + result.length + ' chars');

    if (result.length > 0) {
      Logger.log('  Content: ' + result);

      var parsed = JSON.parse(result);
      Logger.log('  Indicators with photos: ' + Object.keys(parsed).length);

      for (var key in parsed) {
        Logger.log('    - ' + key + ': ' + parsed[key].length + ' photo(s)');
      }

      Logger.log('');
      Logger.log('✅ Test PASSED - processPhotos works!');
      return result;

    } else {
      Logger.log('❌ Result is EMPTY STRING');
      Logger.log('❌ Test FAILED');
      return null;
    }

  } catch (e) {
    Logger.log('❌ Test FAILED - processPhotos error!');
    Logger.log('Error: ' + e.toString());
    Logger.log('Stack: ' + e.stack);
    return null;
  }
}
