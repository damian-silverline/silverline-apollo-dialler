// Required imports and app initialization
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4002',
  credentials: true
}));

// 6b. Delete a note from a lead
app.delete('/api/leads/:leadId/notes', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { accessToken, timestamp, note } = req.body;

    if (!timestamp || !note) {
      return res.status(400).json({ error: 'timestamp and note are required' });
    }

    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: accessToken });

    const sheetsAPI = google.sheets({ version: 'v4', auth: authClient });
    const rowNumber = parseInt(leadId);

    // Dynamically detect the correct sheet name (same logic as GET /api/leads)
    const metadataResponse = await sheetsAPI.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID
    });
    const availableSheets = metadataResponse.data.sheets.map(s => s.properties.title);
    const leadSheet = metadataResponse.data.sheets.find(s =>
      s.properties.title.toLowerCase().includes('lead')
    );
    const sheetName = leadSheet ? leadSheet.properties.title : metadataResponse.data.sheets[0].properties.title;

    // Get all headers (A1:ZZ1 to cover all columns)
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!A1:ZZ1`
    });

    const headers = response.data.values[0] || [];
    const notesIndex = headers.indexOf('Notes');

    if (notesIndex === -1) {
      return res.status(400).json({ error: 'Notes column not found' });
    }

    // Use the same columnToLetter function as in the lock endpoint
    function columnToLetter(col) {
      let letter = '';
      while (col >= 0) {
        letter = String.fromCharCode((col % 26) + 65) + letter;
        col = Math.floor(col / 26) - 1;
      }
      return letter;
    }

    const notesColLetter = columnToLetter(notesIndex);

    // Get current notes
    const currentNotesResponse = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!${notesColLetter}${rowNumber}`
    });

    const currentNotes = currentNotesResponse.data.values?.[0]?.[0] || '';
    if (!currentNotes) {
      return res.status(404).json({ error: 'No notes found for this lead' });
    }

    // Each note is on its own line, format: [timestamp] note
    const noteLineToDelete = `[${timestamp}] ${note}`;
    const updatedNotesArr = currentNotes
      .split('\n')
      .filter(line => line.trim() !== noteLineToDelete.trim());
    const updatedNotes = updatedNotesArr.join('\n');

    // Update the notes cell
    await sheetsAPI.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!${notesColLetter}${rowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[updatedNotes]]
      }
    });

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// In-memory token store (for demo; use DB in production)
const userTokens = {};

// Endpoint to get Google OAuth URL
app.get('/auth/google/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/spreadsheets'
    ]
  });
  res.json({ url });
});


// 2. Handle OAuth callback (GET - from Google redirect)
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }
    
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens for this user
    const userId = tokens.id_token; // In production, extract from token
    userTokens[userId] = tokens;
    
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    // Redirect to frontend with token and user info
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4002';
    const encodedUser = encodeURIComponent(JSON.stringify(userInfo.data));
    const redirectUrl = `${frontendUrl}?token=${tokens.access_token}&user=${encodedUser}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4002';
    res.redirect(`${frontendUrl}?error=Authentication failed`);
  }
});

// 2b. Handle OAuth callback (POST - from frontend)
app.post('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens for this user
    const userId = tokens.id_token; // In production, extract from token
    userTokens[userId] = tokens;
    
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    res.json({
      success: true,
      user: userInfo.data,
      token: tokens.access_token
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

// 3. Get all leads from spreadsheet
app.get('/api/leads', async (req, res) => {
  try {
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token provided' });
    }
    
    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: accessToken });
    
    const sheetsAPI = google.sheets({ version: 'v4', auth: authClient });
    
    console.log('Fetching from spreadsheet:', process.env.SPREADSHEET_ID);
    
    try {
      // First, get the spreadsheet metadata to see what sheets exist
      const metadataResponse = await sheetsAPI.spreadsheets.get({
        spreadsheetId: process.env.SPREADSHEET_ID
      });
      
      console.log('Available sheets:', metadataResponse.data.sheets.map(s => s.properties.title));
      
      // Try to find a sheet with "Lead" in the name
      const leadSheet = metadataResponse.data.sheets.find(s => 
        s.properties.title.toLowerCase().includes('lead')
      );
      
      const sheetName = leadSheet ? leadSheet.properties.title : metadataResponse.data.sheets[0].properties.title;
      console.log('Using sheet:', sheetName);
      
      const response = await sheetsAPI.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: `'${sheetName}'!A:ZZ`
      });
      
      const rows = response.data.values || [];
      console.log('Retrieved rows:', rows.length);
      
      if (rows.length === 0) {
        return res.json({ leads: [], headers: [], message: 'No data found in spreadsheet' });
      }
      
      const headers = rows[0] || [];
      
      const leads = rows.slice(1).map((row, index) => {
        const lead = {};
        headers.forEach((header, i) => {
          lead[header] = row[i] || '';
        });
        lead.id = index + 2;
        return lead;
      });
      
      res.json({ leads, headers, sheetName });
    } catch (sheetsError) {
      console.error('Google Sheets API Error:', sheetsError.message);
      res.status(500).json({ 
        error: 'Failed to fetch from Google Sheets', 
        details: sheetsError.message,
        hint: 'Make sure the spreadsheet is shared with your Google account'
      });
    }
  } catch (error) {
    console.error('Error fetching leads:', error.message);
    res.status(500).json({ error: 'Failed to fetch leads', details: error.message });
  }
});

// 4. Update a lead record
app.put('/api/leads/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { accessToken, updates } = req.body;
    
    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: accessToken });
    
    const sheetsAPI = google.sheets({ version: 'v4', auth: authClient });
    
    // Dynamically detect the correct sheet name (same logic as GET /api/leads)
    const metadataResponse = await sheetsAPI.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID
    });
    const leadSheet = metadataResponse.data.sheets.find(s =>
      s.properties.title.toLowerCase().includes('lead')
    );
    const sheetName = leadSheet ? leadSheet.properties.title : metadataResponse.data.sheets[0].properties.title;

    // Get current data to determine columns
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!A1:ZZ1`
    });

    const headers = response.data.values[0] || [];

    // Build update values
    const updateValues = [];
    headers.forEach(header => {
      updateValues.push(updates[header] || '');
    });

    // Update the row
    const rowNumber = parseInt(leadId);
    const range = `'${sheetName}'!A${rowNumber}:ZZ${rowNumber}`;

    await sheetsAPI.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: [updateValues]
      }
    });

    res.json({ success: true, message: 'Lead updated successfully' });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// 5. Lock a lead to a user
app.post('/api/leads/:leadId/lock', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { accessToken, userEmail } = req.body;


    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: accessToken });

    const sheetsAPI = google.sheets({ version: 'v4', auth: authClient });
    const rowNumber = parseInt(leadId);

    // Dynamically detect the correct sheet name (same logic as GET /api/leads)
    const metadataResponse = await sheetsAPI.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID
    });
    const availableSheets = metadataResponse.data.sheets.map(s => s.properties.title);
    console.log('Available sheets (lock):', availableSheets);
    const leadSheet = metadataResponse.data.sheets.find(s =>
      s.properties.title.toLowerCase().includes('lead')
    );
    const sheetName = leadSheet ? leadSheet.properties.title : metadataResponse.data.sheets[0].properties.title;
    console.log('Using sheet (lock):', sheetName);

    // Get all headers (A1:ZZ1 to cover all columns)
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!A1:ZZ1`
    });

    const headers = (response.data && response.data.values && response.data.values[0]) ? response.data.values[0] : [];
    const lockedByIndex = headers.indexOf('Locked By');

    if (lockedByIndex === -1) {
      return res.status(400).json({ error: 'Locked By column not found' });
    }

    // Support columns beyond Z (AA, AB, etc.)
    function columnToLetter(col) {
      let letter = '';
      while (col >= 0) {
        letter = String.fromCharCode((col % 26) + 65) + letter;
        col = Math.floor(col / 26) - 1;
      }
      return letter;
    }


    // DEBUG: Log sheetName and lockedByIndex before using them
    console.log('DEBUG: About to use sheetName:', typeof sheetName, sheetName, 'lockedByIndex:', lockedByIndex, 'rowNumber:', rowNumber);
    const updateRange = `'${sheetName}'!${columnToLetter(lockedByIndex)}${rowNumber}`;
    console.log('DEBUG: updateRange:', updateRange);

    await sheetsAPI.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      resource: {
        values: [[userEmail]]
      }
    });

    res.json({ success: true, message: 'Lead locked successfully' });
  } catch (error) {
    console.error('Error locking lead:', error);
    // Return full error details for debugging
    res.status(500).json({
      error: 'Failed to lock lead',
      message: error.message,
      stack: error.stack,
      full: error
    });
  }
});

// 6. Add note to lead
app.post('/api/leads/:leadId/notes', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { accessToken, note, timestamp } = req.body;

    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: accessToken });

    const sheetsAPI = google.sheets({ version: 'v4', auth: authClient });
    const rowNumber = parseInt(leadId);

    // Dynamically detect the correct sheet name (same logic as GET /api/leads)
    const metadataResponse = await sheetsAPI.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID
    });
    const availableSheets = metadataResponse.data.sheets.map(s => s.properties.title);
    const leadSheet = metadataResponse.data.sheets.find(s =>
      s.properties.title.toLowerCase().includes('lead')
    );
    const sheetName = leadSheet ? leadSheet.properties.title : metadataResponse.data.sheets[0].properties.title;

    // Get all headers (A1:ZZ1 to cover all columns)
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!A1:ZZ1`
    });

    const headers = response.data.values[0] || [];
    const notesIndex = headers.indexOf('Notes');

    if (notesIndex === -1) {
      return res.status(400).json({ error: 'Notes column not found' });
    }

    // Use the same columnToLetter function as in the lock endpoint
    function columnToLetter(col) {
      let letter = '';
      while (col >= 0) {
        letter = String.fromCharCode((col % 26) + 65) + letter;
        col = Math.floor(col / 26) - 1;
      }
      return letter;
    }

    const notesColLetter = columnToLetter(notesIndex);

    const currentNotesResponse = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!${notesColLetter}${rowNumber}`
    });

    const currentNotes = currentNotesResponse.data.values?.[0]?.[0] || '';
    const newNotes = currentNotes ? `${currentNotes}\n[${timestamp}] ${note}` : `[${timestamp}] ${note}`;

    const updateRange = `'${sheetName}'!${notesColLetter}${rowNumber}`;

    await sheetsAPI.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      resource: {
        values: [[newNotes]]
      }
    });

    res.json({ success: true, message: 'Note added successfully' });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// 7. Update disposition
app.post('/api/leads/:leadId/disposition', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { accessToken, disposition, timestamp } = req.body;
    
    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: accessToken });
    
    const sheetsAPI = google.sheets({ version: 'v4', auth: authClient });
    
    const rowNumber = parseInt(leadId);
    
    // Dynamically detect the correct sheet name (same logic as GET /api/leads)
    const metadataResponse = await sheetsAPI.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID
    });
    const leadSheet = metadataResponse.data.sheets.find(s =>
      s.properties.title.toLowerCase().includes('lead')
    );
    const sheetName = leadSheet ? leadSheet.properties.title : metadataResponse.data.sheets[0].properties.title;

    // Get headers to find disposition and last call columns
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!A1:ZZ1`
    });

    const headers = response.data.values[0] || [];
    const dispositionIndex = headers.indexOf('Disposition');
    const lastCallIndex = headers.indexOf('Last Call Date');

    // Support columns beyond Z (AA, AB, etc.)
    function columnToLetter(col) {
      let letter = '';
      while (col >= 0) {
        letter = String.fromCharCode((col % 26) + 65) + letter;
        col = Math.floor(col / 26) - 1;
      }
      return letter;
    }

    const updates = [];
    if (dispositionIndex !== -1) {
      updates.push({
        range: `'${sheetName}'!${columnToLetter(dispositionIndex)}${rowNumber}`,
        values: [[disposition]]
      });
    }

    if (lastCallIndex !== -1) {
      updates.push({
        range: `'${sheetName}'!${columnToLetter(lastCallIndex)}${rowNumber}`,
        values: [[timestamp]]
      });
    }

    if (updates.length > 0) {
      await sheetsAPI.spreadsheets.batchUpdate({
        spreadsheetId: process.env.SPREADSHEET_ID,
        resource: {
          data: updates,
          valueInputOption: 'RAW'
        }
      });
    }

    res.json({ success: true, message: 'Disposition updated successfully' });
  } catch (error) {
    console.error('Error updating disposition:', error);
    res.status(500).json({ error: 'Failed to update disposition' });
  }
});

// Debug: Show all headers and first row
app.get('/api/debug/headers', async (req, res) => {
  try {
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token provided' });
    }
    
    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: accessToken });
    
    const sheetsAPI = google.sheets({ version: 'v4', auth: authClient });
    
    // Get metadata to find all sheets
    const metadataResponse = await sheetsAPI.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID
    });
    
    const sheets = metadataResponse.data.sheets.map(s => ({
      title: s.properties.title,
      sheetId: s.properties.sheetId
    }));
    
    // Find the Lead sheet
    const leadSheet = sheets.find(s => s.title.toLowerCase().includes('lead'));
    const sheetName = leadSheet ? leadSheet.title : sheets[0].title;
    
    // Get all data from the sheet
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${sheetName}'!A1:Z2`
    });
    
    const rows = response.data.values || [];
    const headers = rows[0] || [];
    const firstDataRow = rows[1] || [];
    
    res.json({
      availableSheets: sheets,
      usingSheet: sheetName,
      headers: headers,
      headerCount: headers.length,
      firstRow: firstDataRow,
      headerMapping: headers.map((h, i) => ({
        index: i,
        header: h,
        value: firstDataRow[i] || 'EMPTY'
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
