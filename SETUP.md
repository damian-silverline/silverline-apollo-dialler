# Setup Guide for Silverline Apollo Dialer

## Quick Start

This guide will help you set up the Silverline Apollo Dialer application quickly.

## Step 1: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" and create a new project called "Silverline Apollo Dialer"
3. Wait for the project to be created, then select it
4. In the left sidebar, go to "APIs & Services" > "Library"
5. Search for and enable these APIs:
   - Google Sheets API
   - Google+ API
6. Go to "APIs & Services" > "Credentials"
7. Click "Create Credentials" > "OAuth client ID"
8. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the app name: "Silverline Apollo Dialer"
   - Add your email as a test user
9. Create OAuth 2.0 Client ID (Web application):
   - Name: "Silverline Dialer Web"
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
10. Copy your Client ID and Client Secret

## Step 2: Get Your Spreadsheet ID

1. Open your Google Sheets link
2. The Spreadsheet ID is in the URL: 
   `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
3. Copy this ID

## Step 3: Setup Backend Environment

```bash
cd backend
cp .env.example .env
nano .env  # or use your preferred editor
```

Fill in the .env file:
```
PORT=5000
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_client_secret>
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
SPREADSHEET_ID=<your_spreadsheet_id>
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## Step 4: Setup Frontend Environment

```bash
cd frontend
cp .env.example .env
nano .env  # or use your preferred editor
```

Fill in the .env file:
```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=<your_client_id>
```

## Step 5: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

You should see: `Backend server running on port 5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```

The browser will automatically open to `http://localhost:3000`

## Step 6: Test the Application

1. Click "Login with Google"
2. Select your Google account
3. Grant permissions when prompted
4. You should see your leads from the spreadsheet

## Spreadsheet Format

Make sure your Google Sheets has these column headers:
- First Name
- Last Name
- Phone
- Email
- Title
- Company
- Industry
- Company Size
- Website
- Notes
- Disposition
- Last Call Date
- Locked By

## Features Overview

### Lead List
- Search leads by name, phone, or company
- Filter by disposition status
- Click any lead to view details

### Lead Details
- **Lock to Me**: Assign the lead to yourself
- **Contact Info**: View phone, email, title
- **Company Info**: View company details and website
- **Call Info**: See last call date and update disposition
- **Notes**: Add timestamped notes that sync to the spreadsheet
- **Disposition**: Track call outcomes

### Sync with Google Sheets
- All changes (notes, disposition, lock status) automatically update your spreadsheet
- Call dates are logged automatically

## Troubleshooting

### "Failed to authenticate" error
- Check that your Client ID and Client Secret are correct
- Verify redirect URIs match exactly in Google Console
- Make sure the Google+ API is enabled

### "Failed to load leads" error
- Verify your Spreadsheet ID is correct
- Make sure your Google account has access to the spreadsheet
- Check that the column headers match exactly

### Port already in use
- Change PORT in backend .env to a different port (e.g., 5001)
- Change the port in frontend .env for REACT_APP_BACKEND_URL accordingly

### Need to debug?

Backend logs are in the terminal where you ran `npm run dev`
Frontend errors appear in the browser console (F12)

## Production Deployment

When deploying to production:

1. Use HTTPS everywhere
2. Store secrets in environment variables securely
3. Update FRONTEND_URL and BACKEND_URL in .env files
4. Build frontend: `cd frontend && npm run build`
5. Deploy to your hosting service

## Support

For issues, check the main README.md for more information.
