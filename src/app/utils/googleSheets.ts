/**
 * Google Sheets API Integration
 *
 * Free, multi-device sync alternative to Supabase!
 *
 * Setup:
 * 1. Create Google Spreadsheet
 * 2. Get API Key from Google Cloud Console
 * 3. Enable Google Sheets API
 * 4. Set environment variables or hardcode below
 */

// 🔐 API Configuration
// Option 1: Use environment variables (recommended)
// const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
// const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID || '';

// Option 2: Hardcode for quick testing (ACTIVE!)
const API_KEY = 'AIzaSyB1cW57M1GVBOFGSzzw0wDkIr_d58L864c';
// MASTER spreadsheet: berisi registry branches + settings global.
// Tiap branch boleh punya spreadsheet sendiri (disimpan di kolom spreadsheetId).
export const MASTER_SPREADSHEET_ID = '1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0';
const SPREADSHEET_ID = MASTER_SPREADSHEET_ID;

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

/** Parse spreadsheet ID dari URL Google Sheets atau ID mentah */
export function parseSpreadsheetUrl(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/** Test koneksi spreadsheet — true kalau bisa diakses dengan API key */
export async function testSpreadsheet(spreadsheetId: string): Promise<boolean> {
  if (!spreadsheetId) return false;
  try {
    const url = `${BASE_URL}/${spreadsheetId}?key=${API_KEY}&fields=spreadsheetId,properties.title`;
    const resp = await fetch(url);
    return resp.ok;
  } catch {
    return false;
  }
}

// 📊 Sheet names (tabs in spreadsheet)
export const SHEETS = {
  BRANCHES: 'branches',
  INDICATORS: 'indicators',
  SUBMISSIONS: 'submissions',
  SETTINGS: 'settings',
  USERS: 'users'
} as const;

// 🔧 Helper: Check if API is configured
export function isConfigured(): boolean {
  const configured = !!(API_KEY && SPREADSHEET_ID);
  if (!configured) {
    console.warn('⚠️ Google Sheets API not configured! Set VITE_GOOGLE_SHEETS_API_KEY and VITE_GOOGLE_SHEETS_SPREADSHEET_ID');
  }
  return configured;
}

// 🔧 Helper: Build API URL
function buildUrl(endpoint: string, spreadsheetId?: string): string {
  const sid = spreadsheetId || SPREADSHEET_ID;
  return `${BASE_URL}/${sid}${endpoint}?key=${API_KEY}`;
}

// ============= READ OPERATIONS =============

/**
 * Read data from a sheet
 * @param sheetName - Name of the sheet (e.g., 'branches')
 * @param range - Optional range (e.g., 'A1:F100'), defaults to all data
 * @returns Array of rows, where each row is an array of cell values
 */
export async function readSheet(sheetName: string, range?: string, spreadsheetId?: string): Promise<any[][]> {
  if (!isConfigured()) {
    console.error('❌ Google Sheets not configured');
    return [];
  }

  const fullRange = range ? `${sheetName}!${range}` : sheetName;
  const url = buildUrl(`/values/${fullRange}`, spreadsheetId);

  try {
    console.log(`📖 Reading from Google Sheets: ${sheetName}`);
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Google Sheets API error:', error);
      throw new Error(error.error?.message || 'Failed to read from Google Sheets');
    }

    const data = await response.json();
    const rows = data.values || [];

    console.log(`✅ Read ${rows.length} rows from ${sheetName}`);
    return rows;
  } catch (error) {
    console.error(`❌ Error reading ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Read data from sheet and convert to objects
 * First row is treated as headers
 */
export async function readSheetAsObjects<T = any>(sheetName: string, spreadsheetId?: string): Promise<T[]> {
  const rows = await readSheet(sheetName, undefined, spreadsheetId);

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return dataRows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : '';
    });
    return obj as T;
  });
}

// ============= WRITE OPERATIONS =============

/**
 * Append rows to a sheet
 * @param sheetName - Name of the sheet
 * @param values - Array of rows to append
 */
export async function appendToSheet(sheetName: string, values: any[][], spreadsheetId?: string): Promise<boolean> {
  if (!isConfigured()) {
    console.error('❌ Google Sheets not configured');
    return false;
  }

  const url = buildUrl(`/values/${sheetName}:append`, spreadsheetId) + '&valueInputOption=USER_ENTERED';

  try {
    console.log(`✍️ Appending ${values.length} rows to ${sheetName}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Google Sheets API error:', error);
      throw new Error(error.error?.message || 'Failed to append to Google Sheets');
    }

    console.log(`✅ Appended to ${sheetName} successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error appending to ${sheetName}:`, error);
    return false;
  }
}

/**
 * Update specific range in sheet
 * @param sheetName - Name of the sheet
 * @param range - Range to update (e.g., 'A2:C2')
 * @param values - 2D array of values
 */
export async function updateSheet(sheetName: string, range: string, values: any[][], spreadsheetId?: string): Promise<boolean> {
  if (!isConfigured()) {
    console.error('❌ Google Sheets not configured');
    return false;
  }

  const fullRange = `${sheetName}!${range}`;
  const url = buildUrl(`/values/${fullRange}`, spreadsheetId) + '&valueInputOption=USER_ENTERED';

  try {
    console.log(`✏️ Updating ${sheetName} range ${range}`);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Google Sheets API error:', error);
      throw new Error(error.error?.message || 'Failed to update Google Sheets');
    }

    console.log(`✅ Updated ${sheetName} successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${sheetName}:`, error);
    return false;
  }
}

/**
 * Clear specific range in sheet
 * @param sheetName - Name of the sheet
 * @param range - Range to clear (e.g., 'A2:Z100')
 */
export async function clearSheet(sheetName: string, range: string, spreadsheetId?: string): Promise<boolean> {
  if (!isConfigured()) {
    console.error('❌ Google Sheets not configured');
    return false;
  }

  const fullRange = `${sheetName}!${range}`;
  const url = buildUrl(`/values/${fullRange}:clear`, spreadsheetId);

  try {
    console.log(`🗑️ Clearing ${sheetName} range ${range}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Google Sheets API error:', error);
      throw new Error(error.error?.message || 'Failed to clear Google Sheets');
    }

    console.log(`✅ Cleared ${sheetName} successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error clearing ${sheetName}:`, error);
    return false;
  }
}

// ============= HELPER FUNCTIONS =============

/**
 * Find row index by column value
 * @param sheetName - Name of the sheet
 * @param columnIndex - Column index to search (0-based)
 * @param value - Value to find
 * @returns Row index (1-based, null if not found)
 */
export async function findRowIndex(
  sheetName: string,
  columnIndex: number,
  value: string
): Promise<number | null> {
  const rows = await readSheet(sheetName);

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][columnIndex] === value) {
      return i + 1; // 1-based index
    }
  }

  return null;
}

/**
 * Update row by ID
 * Assumes first column is 'id'
 */
export async function updateRowById(
  sheetName: string,
  id: string,
  updatedData: Record<string, any>
): Promise<boolean> {
  const rows = await readSheet(sheetName);

  if (rows.length === 0) {
    console.error('❌ Sheet is empty');
    return false;
  }

  const headers = rows[0];
  const idColumnIndex = headers.indexOf('id');

  if (idColumnIndex === -1) {
    console.error('❌ No "id" column found');
    return false;
  }

  // Find row with matching ID
  const rowIndex = await findRowIndex(sheetName, idColumnIndex, id);

  if (rowIndex === null) {
    console.error(`❌ Row with id "${id}" not found`);
    return false;
  }

  // Build updated row
  const updatedRow = headers.map(header => {
    if (updatedData.hasOwnProperty(header)) {
      return updatedData[header];
    }
    // Keep existing value
    return rows[rowIndex - 1][headers.indexOf(header)];
  });

  // Update the row
  const range = `A${rowIndex}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex}`;
  return await updateSheet(sheetName, range, [updatedRow]);
}

/**
 * Delete row by ID
 * Note: Google Sheets API doesn't support row deletion via values API
 * This function will clear the row instead
 */
export async function deleteRowById(sheetName: string, id: string): Promise<boolean> {
  const rows = await readSheet(sheetName);

  if (rows.length === 0) {
    console.error('❌ Sheet is empty');
    return false;
  }

  const headers = rows[0];
  const idColumnIndex = headers.indexOf('id');

  if (idColumnIndex === -1) {
    console.error('❌ No "id" column found');
    return false;
  }

  const rowIndex = await findRowIndex(sheetName, idColumnIndex, id);

  if (rowIndex === null) {
    console.error(`❌ Row with id "${id}" not found`);
    return false;
  }

  // Clear the row (can't actually delete via values API)
  const range = `A${rowIndex}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex}`;
  return await clearSheet(sheetName, range);
}

/**
 * Convert object to row array based on headers
 */
export function objectToRow(obj: Record<string, any>, headers: string[]): any[] {
  return headers.map(header => {
    const value = obj[header];
    // Convert objects/arrays to JSON string
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value !== undefined ? value : '';
  });
}

/**
 * Get spreadsheet URL for user reference
 */
export function getSpreadsheetUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
}

/**
 * Test connection to Google Sheets
 */
export async function testConnection(): Promise<boolean> {
  if (!isConfigured()) {
    return false;
  }

  try {
    console.log('🧪 Testing Google Sheets connection...');
    await readSheet(SHEETS.BRANCHES, 'A1:A1'); // Read just one cell
    console.log('✅ Google Sheets API connected successfully!');
    console.log('📊 Spreadsheet:', getSpreadsheetUrl());
    return true;
  } catch (error) {
    console.error('❌ Google Sheets connection failed:', error);
    return false;
  }
}
