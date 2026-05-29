/**
 * ✅ FUNCTION AUTO FIX HEADER
 *
 * Jalankan function ini SEKALI untuk fix header spreadsheet "submissions"
 *
 * Function ini akan:
 * 1. Cek header saat ini
 * 2. Insert kolom "userRole" di posisi E (antara userName dan date)
 * 3. Shift kolom lainnya ke kanan
 *
 * CARA PAKAI:
 * 1. Copy function ini ke Apps Script Editor (paste di bawah code yang ada)
 * 2. Pilih function "fixSubmissionsHeader" dari dropdown
 * 3. Klik ▶ Run
 * 4. Cek spreadsheet → kolom E harus jadi "userRole"
 */

function fixSubmissionsHeader() {
  const ss = SpreadsheetApp.openById('1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0');
  const sheet = ss.getSheetByName('submissions');

  if (!sheet) {
    Logger.log('❌ Sheet "submissions" tidak ditemukan!');
    return;
  }

  // Get current header (baris 1)
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  const headers = headerRange.getValues()[0];

  Logger.log('📋 Current header:');
  Logger.log(headers.join(' | '));

  // Check apakah sudah ada kolom "userRole"
  const userRoleIndex = headers.indexOf('userRole');

  if (userRoleIndex !== -1) {
    Logger.log('✅ Kolom "userRole" sudah ada di posisi ' + (userRoleIndex + 1) + ' (kolom ' + getColumnLetter(userRoleIndex + 1) + ')');

    // Cek apakah di posisi yang benar (kolom E = index 4)
    if (userRoleIndex === 4) {
      Logger.log('✅ Posisi sudah benar! (kolom E)');
      Logger.log('✅ Header sudah OK! Tidak perlu fix.');
      return;
    } else {
      Logger.log('⚠️ WARNING: userRole ada tapi tidak di kolom E!');
      Logger.log('   Sekarang di kolom ' + getColumnLetter(userRoleIndex + 1) + ', seharusnya di kolom E');
      Logger.log('⚠️ MANUAL FIX REQUIRED: Hapus kolom userRole yang salah posisi, lalu jalankan function ini lagi');
      return;
    }
  }

  // userRole belum ada, kita harus insert
  Logger.log('⚠️ Kolom "userRole" BELUM ADA!');
  Logger.log('🔧 Inserting kolom "userRole" di posisi E (kolom ke-5)...');

  // Expected header positions
  const expectedHeaders = [
    'id',           // A (index 0)
    'branchId',     // B (index 1)
    'userNik',      // C (index 2)
    'userName',     // D (index 3)
    'userRole',     // E (index 4) ← YANG MAU DITAMBAHKAN
    'date',         // F (index 5)
    'createdAt',    // G (index 6)
    'totalScore'    // H (index 7)
  ];

  // Check kolom E saat ini
  const currentColE = headers[4]; // index 4 = kolom E
  Logger.log('📌 Kolom E saat ini: "' + currentColE + '"');

  if (currentColE === 'date') {
    Logger.log('✅ Confirmed: Kolom E = "date" (SALAH!)');
    Logger.log('🔧 Akan insert kolom "userRole" SEBELUM kolom "date"');

    // Insert 1 kolom baru di posisi E (column 5)
    sheet.insertColumnBefore(5);

    // Set header kolom E baru = "userRole"
    sheet.getRange(1, 5).setValue('userRole');

    Logger.log('✅ Kolom "userRole" berhasil ditambahkan di posisi E!');
    Logger.log('✅ Kolom "date" bergeser ke posisi F');

    // Log new header
    const newHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('');
    Logger.log('📋 NEW HEADER:');
    Logger.log(newHeaders.join(' | '));
    Logger.log('');
    Logger.log('✅ DONE! Header sudah diperbaiki!');

  } else {
    Logger.log('⚠️ WARNING: Kolom E bukan "date"!');
    Logger.log('   Header Anda mungkin sudah berbeda dari ekspektasi.');
    Logger.log('   Current header kolom A-H:');
    for (var i = 0; i < 8 && i < headers.length; i++) {
      Logger.log('   ' + getColumnLetter(i + 1) + ': ' + headers[i]);
    }
    Logger.log('');
    Logger.log('⚠️ MANUAL CHECK REQUIRED!');
    Logger.log('   Pastikan header Anda match dengan:');
    Logger.log('   A:id | B:branchId | C:userNik | D:userName | E:userRole | F:date | G:createdAt | H:totalScore');
  }
}

// Helper: Convert column index to letter (1 = A, 2 = B, etc.)
function getColumnLetter(columnIndex) {
  var temp, letter = '';
  while (columnIndex > 0) {
    temp = (columnIndex - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    columnIndex = (columnIndex - temp - 1) / 26;
  }
  return letter;
}
