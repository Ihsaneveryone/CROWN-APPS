/**
 * CROWN SYSTEM - Apps Script Template
 * 1 Toko = 1 Apps Script untuk menghindari quota limits
 */

// CONFIGURATION
const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const SUBMISSIONS_SHEET = 'submissions';
const INDICATORS_SHEET = 'indicators';
const SETTINGS_SHEET = 'settings';

// MAIN HANDLER - Handle semua HTTP requests
function doGet(e) {
  const action = e.parameter.action;

  try {
    switch(action) {
      case 'getIndicators':
        return jsonResponse(getIndicators());

      case 'getSettings':
        return jsonResponse(getSettings());

      case 'getSubmissions':
        const page = parseInt(e.parameter.page) || 1;
        const limit = parseInt(e.parameter.limit) || 50;
        return jsonResponse(getSubmissions(page, limit));

      case 'getAllSubmissions':
        return jsonResponse(getAllSubmissions());

      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

function doPost(e) {
  const action = e.parameter.action;

  try {
    const data = JSON.parse(e.postData.contents);

    switch(action) {
      case 'submitData':
        return jsonResponse(submitData(data));

      case 'updateIndicators':
        return jsonResponse(updateIndicators(data));

      case 'updateSettings':
        return jsonResponse(updateSettings(data));

      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

// UTILITY FUNCTIONS
function jsonResponse(data, status) {
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
  const sheet = getSheetByName(INDICATORS_SHEET);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const indicators = [];

  for (var i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const indicator = {
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
  const sheet = getSheetByName(SETTINGS_SHEET);
  const data = sheet.getDataRange().getValues();

  const settings = {
    loginTitle: 'CROWN | DAILY INDICATORS',
    loginSubtitle: 'Silakan masuk dengan NIK dan Nama Anda',
    minSubmitScore: 70,
    motivationMessages: []
  };

  if (data.length <= 1) return settings;

  for (var i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    if (key === 'loginTitle') settings.loginTitle = value;
    if (key === 'loginSubtitle') settings.loginSubtitle = value;
    if (key === 'minSubmitScore') settings.minSubmitScore = parseInt(value) || 70;
  }

  return settings;
}

// GET SUBMISSIONS (with pagination)
function getSubmissions(page, limit) {
  const sheet = getSheetByName(SUBMISSIONS_SHEET);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return {
      submissions: [],
      total: 0,
      page: page,
      limit: limit,
      totalPages: 0
    };
  }

  const submissions = [];
  for (var i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    submissions.push(parseSubmissionRow(row));
  }

  submissions.sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const total = submissions.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedSubmissions = submissions.slice(start, end);

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
  const sheet = getSheetByName(SUBMISSIONS_SHEET);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const submissions = [];
  for (var i = 1; i < data.length; i++) {
    const row = data[i];
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
  const indicators = [];
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
  const sheet = getSheetByName(SUBMISSIONS_SHEET);

  const row = [
    data.id || ('sub_' + new Date().getTime()),
    data.branchId || '',
    data.date || new Date().toISOString().split('T')[0],
    data.createdAt || new Date().toISOString(),
    data.displayDate || '',
    (data.user && data.user.nik) || '',
    (data.user && data.user.nama) || '',
    (data.user && data.user.role) || 'Advisor',
    data.totalScore || 0
  ];

  const indicatorData = new Array(26).fill('');
  if (data.data && Array.isArray(data.data)) {
    data.data.forEach(function(ind, idx) {
      if (idx < 13) {
        indicatorData[idx * 2] = ind.value || '';
        indicatorData[idx * 2 + 1] = ind.photos && ind.photos[0] ? ind.photos[0] : '';
      }
    });
  }
  row.push.apply(row, indicatorData);

  row.push(data.notes ? JSON.stringify(data.notes) : '');

  sheet.appendRow(row);

  return { success: true, id: row[0] };
}

// UPDATE INDICATORS
function updateIndicators(indicators) {
  const sheet = getSheetByName(INDICATORS_SHEET);

  sheet.clear();

  const headers = ['id', 'name', 'type', 'targetValue', 'targetPhotos', 'weight', 'icon', 'order', 'role', 'placeholder'];
  sheet.appendRow(headers);

  indicators.forEach(function(ind) {
    const row = [
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
  });

  return { success: true };
}

// UPDATE SETTINGS
function updateSettings(settings) {
  const sheet = getSheetByName(SETTINGS_SHEET);

  sheet.clear();

  sheet.appendRow(['key', 'value']);

  sheet.appendRow(['loginTitle', settings.loginTitle || '']);
  sheet.appendRow(['loginSubtitle', settings.loginSubtitle || '']);
  sheet.appendRow(['minSubmitScore', settings.minSubmitScore || 70]);

  return { success: true };
}
