// Test function untuk debug Google Sheets connection
export async function testGoogleSheetsConnection() {
  const API_KEY = 'AIzaSyB1cW57M1GVBOFGSzzw0wDkIr_d58L864c';
  const SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';
  const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

  console.log('🧪 Testing Google Sheets API Connection...');
  console.log('API Key:', API_KEY.substring(0, 20) + '...');
  console.log('Spreadsheet ID:', SPREADSHEET_ID);

  try {
    // Test 1: Connection
    const url1 = `${BASE_URL}/${SPREADSHEET_ID}/values/branches!A1:A1?key=${API_KEY}`;
    const response1 = await fetch(url1);

    if (!response1.ok) {
      const error = await response1.json();
      console.error('❌ Connection failed:', error);
      return false;
    }

    console.log('✅ Connection successful!');

    // Test 2: Fetch branches
    const url2 = `${BASE_URL}/${SPREADSHEET_ID}/values/branches?key=${API_KEY}`;
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    const branches = data2.values || [];

    console.log('✅ Branches fetched:', branches.length - 1, 'rows');
    console.log('Branches data:', branches);

    // Test 3: Fetch indicators
    const url3 = `${BASE_URL}/${SPREADSHEET_ID}/values/indicators?key=${API_KEY}`;
    const response3 = await fetch(url3);
    const data3 = await response3.json();
    const indicators = data3.values || [];

    console.log('✅ Indicators fetched:', indicators.length - 1, 'rows');

    const a336Indicators = indicators.slice(1).filter(row => row[0] === 'A336');
    console.log('✅ A336 has', a336Indicators.length, 'indicators');
    console.log('A336 indicators:', a336Indicators);

    if (a336Indicators.length === 0) {
      console.error('❌ NO INDICATORS FOR A336! This will cause blank preview!');
      return false;
    }

    console.log('✅ All tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Auto-run test on import
if (typeof window !== 'undefined') {
  testGoogleSheetsConnection();
}
