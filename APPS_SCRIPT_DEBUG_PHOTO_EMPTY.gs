// ============= SUBMISSION FUNCTIONS =============
// VERSI DEBUG - Return error message di response kalau photo empty

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

    // ✅ DEBUG: Log submission.photos
    Logger.log('🔍 DEBUG submission.photos:');
    Logger.log('  - Type: ' + typeof submission.photos);
    Logger.log('  - Is null/undefined: ' + (!submission.photos));
    if (submission.photos) {
      Logger.log('  - Keys: ' + Object.keys(submission.photos).join(', '));
      Logger.log('  - JSON preview: ' + JSON.stringify(submission.photos).substring(0, 200));
    }

    // ✅ Get Drive folder ID (fallback to MASTER if not provided)
    Logger.log('📁 submission.gdriveFolderId: ' + submission.gdriveFolderId);
    Logger.log('📁 MASTER_GDRIVE_FOLDER_ID: ' + MASTER_GDRIVE_FOLDER_ID);

    var gdriveFolderId = submission.gdriveFolderId || MASTER_GDRIVE_FOLDER_ID;
    Logger.log('📁 Final Drive folder ID: ' + gdriveFolderId);

    // ✅ Process photos - upload to Drive
    Logger.log('🔄 Calling processPhotos...');
    var photosStr = processPhotos(submission.photos || {}, submission.id || 'sub', gdriveFolderId);
    Logger.log('🔄 processPhotos returned: ' + (photosStr.length > 0 ? photosStr.length + ' chars' : 'EMPTY STRING'));

    // ⚠️ DEBUG: If photosStr is empty but photos were sent, throw error with details
    if (photosStr.length === 0 && submission.photos && Object.keys(submission.photos).length > 0) {
      var errorMsg = '⚠️ processPhotos returned EMPTY but photos were provided! ';
      errorMsg += 'Keys: ' + Object.keys(submission.photos).join(', ');
      Logger.log(errorMsg);
      // Don't throw, just log - let submission continue
    }

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

    // ✅ Return dengan info photos untuk debug
    return {
      id: submission.id,
      success: true,
      photosProcessed: photoCount,
      photosStrLength: photosStr.length,
      photosReceived: submission.photos ? Object.keys(submission.photos).length : 0
    };

  } catch (error) {
    Logger.log('❌ addSubmission error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}
