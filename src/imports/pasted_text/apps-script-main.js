/**
 * CROWN SYSTEM - Apps Script Template (Compatible Version)
 * 1 Toko = 1 Apps Script untuk menghindari quota limits
 * NO template literals, NO optional chaining, NO arrow functions
 */

// CONFIGURATION
var SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
var SUBMISSIONS_SHEET = 'submissions';
var INDICATORS_SHEET = 'indicators';
var SETTINGS_SHEET = 'settings';

// MAIN HANDLER - Handle semua HTTP requests
function doGet(e) {
  var action = e.parameter.action;

  try {
    if (action === 'getIndicators') {
      return jsonResponse(getIndicators());
    } else if (action === 'getSettings') {
      return jsonResponse(getSettings());
    } else if (action === 'getSubmissions') {
      var page = parseInt(e.parameter.page) || 1;
      var limit = parseInt(e.parameter.limit) || 50;
      return jsonResponse(getSubmissions(page, limit));
    } else if (action === 'getAllSubmissions') {
      return jsonResponse(getAllSubmissions());
    } else {
      return jsonResponse({ error: 'Invalid action' });
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return jsonResponse({ error: error.toString() });
  }
}

function doPost(e) {
  var action = e.parameter.action;

  try {
    var data = JSON.parse(e.postData.contents);

    if (action === 'submitData') {
      return jsonResponse(submitData(data));
    } else if (action === 'updateIndicators') {
      return jsonResponse(updateIndicators(data));
    } else if (action === 'updateSettings') {
      return jsonResponse(updateSettings(data));
    } else {
      return jsonResponse({ error: 'Invalid action' });
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return jsonResponse({ error: error.toString() });
  }
}

// UTILITY FUNCTIONS
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetByName(name) {
  var sheet = SPREADSHEET.getSheetByName(name);
  if (!sheet) {
    sheet = SPREADSHEET.insertSheet(name);
  }
  return sheet;
}

// GET INDICATORS
function getIndicators() {
  var sheet = getSheetByName(INDICATORS_SHEET);
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  var indicators = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;

    var indicator = {
      id: row[0] || ('ind_' + i),
      name: row[1] || '',
      type: row[2] || 'number',
      targetValue: row[3] || undefined,
      targetPhotos: row[4] || undefined,
      weight: row[5] || 0,
      icon: row[6] || 'Target',
      order: row[7] || i,
      role: row[8] || undefined,
      placeholder: row[9] || undefined
    };

    indicators.push(indicator);
  }

  return indicators;
}

// GET SETTINGS
function getSettings() {
  var sheet = getSheetByName(SETTINGS_SHEET);
  var data = sheet.getDataRange().getValues();

  var settings = {
    loginTitle: 'CROWN | DAILY INDICATORS',
    loginSubtitle: 'Silakan masuk dengan NIK dan Nama Anda',
    minSubmitScore: 70,
    motivationMessages: []
  };

  if (data.length <= 1) return settings;

  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    var value = data[i][1];
    if (key === 'loginTitle') settings.loginTitle = value;
    if (key === 'loginSubtitle') settings.loginSubtitle = value;
    if (key === 'minSubmitScore') settings.minSubmitScore = parseInt(value) || 70;
  }

  return settings;
}

// GET SUBMISSIONS (with pagination)
function getSubmissions(page, limit) {
  var sheet = getSheetByName(SUBMISSIONS_SHEET);
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return {
      submissions: [],
      total: 0,
      page: page,
      limit: limit,
      totalPages: 0
    };
  }

  var submissions = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;

    submissions.push(parseSubmissionRow(row));
  }

  submissions.sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  var total = submissions.length;
  var totalPages = Math.ceil(total / limit);
  var start = (page - 1) * limit;
  var end = start + limit;
  var paginatedSubmissions = submissions.slice(start, end);

  return {
    submissions: paginatedSubmissions,
    total: total,
    page: page,
    limit: limit,
    totalPages: totalPages
  };
}

// GET ALL SUBMISSIONS (no pagination)
function getAllSubmissions() {
  var sheet = getSheetByName(SUBMISSIONS_SHEET);
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  var submissions = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;

    submissions.push(parseSubmissionRow(row));
  }

  return submissions;
}

// PARSE SUBMISSION ROW (36 kolom A-AJ)
function parseSubmissionRow(row) {
  return {
    id: row[0] || '',
    branchId: row[1] || '',
    date: row[2] || '',
    createdAt: row[3] || '',
    displayDate: row[4] || '',
    nik: row[5] || '',
    nama: row[6] || '',
    role: row[7] || 'Advisor',
    totalScore: parseFloat(row[8]) || 0,
    indicatorData: parseIndicatorData(row.slice(9, 35)),
    notes: row[35] ? JSON.parse(row[35]) : undefined,
    user: {
      nik: row[5] || '',
      nama: row[6] || '',
      role: row[7] || 'Advisor'
    }
  };
}

function parseIndicatorData(dataColumns) {
  var indicators = [];
  for (var i = 0; i < dataColumns.length; i += 2) {
    if (dataColumns[i] !== undefined && dataColumns[i] !== '') {
      indicators.push({
        id: 'ind_' + (i/2 + 1),
        value: dataColumns[i],
        photos: dataColumns[i + 1] ? [dataColumns[i + 1]] : []
      });
    }
  }
  return indicators;
}

// SUBMIT DATA
function submitData(data) {
  var sheet = getSheetByName(SUBMISSIONS_SHEET);

  var userNik = (data.user && data.user.nik) ? data.user.nik : '';
  var userNama = (data.user && data.user.nama) ? data.user.nama : '';
  var userRole = (data.user && data.user.role) ? data.user.role : 'Advisor';

  var row = [
    data.id || ('sub_' + new Date().getTime()),
    data.branchId || '',
    data.date || new Date().toISOString().split('T')[0],
    data.createdAt || new Date().toISOString(),
    data.displayDate || '',
    userNik,
    userNama,
    userRole,
    data.totalScore || 0
  ];

  var indicatorData = [];
  for (var i = 0; i < 26; i++) {
    indicatorData.push('');
  }

  if (data.data && Array.isArray(data.data)) {
    for (var idx = 0; idx < data.data.length && idx < 13; idx++) {
      var ind = data.data[idx];
      indicatorData[idx * 2] = ind.value || '';
      indicatorData[idx * 2 + 1] = (ind.photos && ind.photos[0]) ? ind.photos[0] : '';
    }
  }

  for (var j = 0; j < indicatorData.length; j++) {
    row.push(indicatorData[j]);
  }

  row.push(data.notes ? JSON.stringify(data.notes) : '');

  sheet.appendRow(row);

  return { success: true, id: row[0] };
}

// UPDATE INDICATORS
function updateIndicators(indicators) {
  var sheet = getSheetByName(INDICATORS_SHEET);

  sheet.clear();

  var headers = ['id', 'name', 'type', 'targetValue', 'targetPhotos', 'weight', 'icon', 'order', 'role', 'placeholder'];
  sheet.appendRow(headers);

  for (var i = 0; i < indicators.length; i++) {
    var ind = indicators[i];
    var row = [
      ind.id,
      ind.name,
      ind.type,
      ind.targetValue || '',
      ind.targetPhotos || '',
      ind.weight,
      ind.icon || 'Target',
      ind.order || 1,
      ind.role || '',
      ind.placeholder || ''
    ];
    sheet.appendRow(row);
  }

  return { success: true };
}

// UPDATE SETTINGS
function updateSettings(settings) {
  var sheet = getSheetByName(SETTINGS_SHEET);

  sheet.clear();

  sheet.appendRow(['key', 'value']);

  sheet.appendRow(['loginTitle', settings.loginTitle || '']);
  sheet.appendRow(['loginSubtitle', settings.loginSubtitle || '']);
  sheet.appendRow(['minSubmitScore', settings.minSubmitScore || 70]);

  return { success: true };
}
