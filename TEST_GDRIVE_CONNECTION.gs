/**
 * =====================================================================
 * TEST GOOGLE DRIVE CONNECTION
 * =====================================================================
 *
 * Script untuk test koneksi ke Google Drive folder
 *
 * CARA PAKAI:
 * 1. Buka Apps Script editor
 * 2. Paste script ini di file baru
 * 3. Ganti FOLDER_ID dengan folder ID Anda
 * 4. Run function testDriveConnection()
 * 5. Cek log output (View → Logs atau Ctrl+Enter)
 *
 * =====================================================================
 */

// ✅ GANTI INI dengan folder ID Anda
const FOLDER_ID = '1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU';

/**
 * Test 1: Akses folder
 */
function testDriveConnection() {
  Logger.log('');
  Logger.log('========================================');
  Logger.log('🧪 TEST GOOGLE DRIVE CONNECTION');
  Logger.log('========================================');
  Logger.log('');

  Logger.log('📁 Folder ID: ' + FOLDER_ID);
  Logger.log('');

  try {
    Logger.log('⏳ Mencoba akses folder...');
    var folder = DriveApp.getFolderById(FOLDER_ID);

    Logger.log('✅ SUKSES! Folder berhasil diakses');
    Logger.log('');
    Logger.log('📊 INFORMASI FOLDER:');
    Logger.log('  - Nama: ' + folder.getName());
    Logger.log('  - URL: ' + folder.getUrl());
    Logger.log('  - Owner: ' + folder.getOwner().getName());

    // Check sharing settings
    var access = folder.getSharingAccess();
    var permission = folder.getSharingPermission();

    Logger.log('');
    Logger.log('🔐 SHARING SETTINGS:');
    Logger.log('  - Access: ' + access);
    Logger.log('  - Permission: ' + permission);

    if (access === DriveApp.Access.ANYONE_WITH_LINK) {
      Logger.log('  ✅ Folder sudah public (Anyone with link)');
    } else {
      Logger.log('  ⚠️ WARNING: Folder belum public!');
      Logger.log('  👉 Set sharing ke "Anyone with the link" (Viewer)');
    }

    // Count files
    var files = folder.getFiles();
    var fileCount = 0;
    while (files.hasNext()) {
      files.next();
      fileCount++;
    }

    Logger.log('');
    Logger.log('📁 ISI FOLDER:');
    Logger.log('  - Total files: ' + fileCount);

    Logger.log('');
    Logger.log('========================================');
    Logger.log('✅ TEST SELESAI - FOLDER SIAP DIPAKAI!');
    Logger.log('========================================');

  } catch (error) {
    Logger.log('');
    Logger.log('========================================');
    Logger.log('❌ ERROR: Tidak bisa akses folder!');
    Logger.log('========================================');
    Logger.log('');
    Logger.log('Error detail: ' + error.toString());
    Logger.log('');
    Logger.log('KEMUNGKINAN PENYEBAB:');
    Logger.log('1. Folder ID salah');
    Logger.log('2. Folder belum dishare ke akun ini');
    Logger.log('3. Folder sudah dihapus');
    Logger.log('');
    Logger.log('SOLUSI:');
    Logger.log('1. Cek folder ID benar: ' + FOLDER_ID);
    Logger.log('2. Buka folder di browser, cek bisa diakses');
    Logger.log('3. Share folder ke akun: ' + Session.getActiveUser().getEmail());
    Logger.log('4. Atau set "Anyone with the link" (Viewer)');
  }
}

/**
 * Test 2: Upload foto dummy
 */
function testUploadPhoto() {
  Logger.log('');
  Logger.log('========================================');
  Logger.log('🧪 TEST UPLOAD FOTO KE DRIVE');
  Logger.log('========================================');
  Logger.log('');

  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);

    // Create dummy image (1x1 pixel base64 PNG)
    var dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    Logger.log('⏳ Membuat file dummy...');

    var parts = dummyBase64.split(',');
    var mimeType = 'image/png';
    var bytes = Utilities.base64Decode(parts[1]);
    var blob = Utilities.newBlob(bytes, mimeType, 'test_photo_' + Date.now() + '.png');

    Logger.log('⏳ Uploading ke Drive...');

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileUrl = 'https://drive.google.com/uc?id=' + file.getId();

    Logger.log('');
    Logger.log('✅ SUKSES! Foto berhasil di-upload');
    Logger.log('');
    Logger.log('📊 FILE INFO:');
    Logger.log('  - Nama: ' + file.getName());
    Logger.log('  - Size: ' + file.getSize() + ' bytes');
    Logger.log('  - URL: ' + fileUrl);
    Logger.log('');
    Logger.log('🌐 Buka URL ini di browser untuk test akses:');
    Logger.log(fileUrl);
    Logger.log('');
    Logger.log('========================================');
    Logger.log('✅ TEST SELESAI - UPLOAD BERHASIL!');
    Logger.log('========================================');
    Logger.log('');
    Logger.log('💡 TIP: Delete file test ini dari Drive setelah selesai');

  } catch (error) {
    Logger.log('');
    Logger.log('========================================');
    Logger.log('❌ ERROR: Upload gagal!');
    Logger.log('========================================');
    Logger.log('');
    Logger.log('Error detail: ' + error.toString());
    Logger.log('');
    Logger.log('KEMUNGKINAN PENYEBAB:');
    Logger.log('1. Tidak punya permission write ke folder');
    Logger.log('2. Folder full atau quota habis');
    Logger.log('3. Drive API disabled');
    Logger.log('');
    Logger.log('SOLUSI:');
    Logger.log('1. Pastikan Anda owner atau editor folder');
    Logger.log('2. Cek quota Drive (drive.google.com/drive/quota)');
    Logger.log('3. Enable Drive API di Apps Script');
  }
}

/**
 * Test 3: Full simulation (upload + get URL)
 */
function testFullPhotoFlow() {
  Logger.log('');
  Logger.log('========================================');
  Logger.log('🧪 TEST FULL PHOTO FLOW');
  Logger.log('========================================');
  Logger.log('');
  Logger.log('Mensimulasikan flow submission dengan foto...');
  Logger.log('');

  try {
    // Step 1: Get folder
    Logger.log('📁 Step 1: Akses folder...');
    var folder = DriveApp.getFolderById(FOLDER_ID);
    Logger.log('   ✅ Folder diakses');

    // Step 2: Create dummy photo
    Logger.log('');
    Logger.log('📸 Step 2: Buat dummy photo (base64)...');
    var dummyBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA';
    Logger.log('   ✅ Dummy photo ready');

    // Step 3: Upload
    Logger.log('');
    Logger.log('⬆️ Step 3: Upload ke Drive...');
    var parts = dummyBase64.split(',');
    var bytes = Utilities.base64Decode(parts[1]);
    var blob = Utilities.newBlob(bytes, 'image/jpeg', 'submission_test_' + Date.now() + '.jpg');
    var file = folder.createFile(blob);
    Logger.log('   ✅ File uploaded');

    // Step 4: Set sharing
    Logger.log('');
    Logger.log('🔐 Step 4: Set public sharing...');
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log('   ✅ Sharing set');

    // Step 5: Get URL
    Logger.log('');
    Logger.log('🔗 Step 5: Generate URL...');
    var fileUrl = 'https://drive.google.com/uc?id=' + file.getId();
    Logger.log('   ✅ URL: ' + fileUrl);

    // Step 6: Build JSON (seperti di Apps Script production)
    Logger.log('');
    Logger.log('📦 Step 6: Build photos JSON...');
    var photosJSON = {
      "sales": [fileUrl],
      "trx": [fileUrl]
    };
    var photosStr = JSON.stringify(photosJSON);
    Logger.log('   ✅ JSON: ' + photosStr);

    Logger.log('');
    Logger.log('========================================');
    Logger.log('✅ FULL FLOW TEST BERHASIL!');
    Logger.log('========================================');
    Logger.log('');
    Logger.log('📊 SUMMARY:');
    Logger.log('  - Folder accessible: YES');
    Logger.log('  - Upload works: YES');
    Logger.log('  - Public sharing: YES');
    Logger.log('  - URL generation: YES');
    Logger.log('  - JSON format: YES');
    Logger.log('');
    Logger.log('🎯 PRODUCTION READY!');
    Logger.log('');
    Logger.log('💡 NEXT: Deploy Apps Script dengan GDRIVE_FOLDER_ID');
    Logger.log('💡 TIP: Delete test files dari folder');

  } catch (error) {
    Logger.log('');
    Logger.log('========================================');
    Logger.log('❌ FULL FLOW TEST GAGAL!');
    Logger.log('========================================');
    Logger.log('');
    Logger.log('Error detail: ' + error.toString());
    Logger.log('');
    Logger.log('🔍 DEBUG STEPS:');
    Logger.log('1. Run testDriveConnection() untuk cek folder');
    Logger.log('2. Run testUploadPhoto() untuk cek upload');
    Logger.log('3. Fix issues dan coba lagi');
  }
}

/**
 * Cleanup test files
 */
function cleanupTestFiles() {
  Logger.log('🧹 Cleaning up test files...');
  Logger.log('');

  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var files = folder.getFiles();
    var deletedCount = 0;

    while (files.hasNext()) {
      var file = files.next();
      var fileName = file.getName();

      // Delete files yang namanya dimulai dengan "test_" atau "submission_test_"
      if (fileName.indexOf('test_') === 0 || fileName.indexOf('submission_test_') === 0) {
        Logger.log('  🗑️ Deleting: ' + fileName);
        file.setTrashed(true);
        deletedCount++;
      }
    }

    Logger.log('');
    Logger.log('✅ Cleanup done! Deleted ' + deletedCount + ' test files');

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
  }
}
