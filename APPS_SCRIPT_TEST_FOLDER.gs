// ============= TEST FUNCTIONS =============
// Paste ini ke Apps Script dan run untuk test

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
    Logger.log('🔓 Can create files: ' + folder.isWriterOrBetter());

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
