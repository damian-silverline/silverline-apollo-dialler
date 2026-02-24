# Silverline Apollo Dialer

A professional custom dialer UI for lead management and calling with Google Sheets integration.

## Features

- **Google SSO Login**: Secure authentication with Google accounts
- **Lead Management**: Browse and manage leads from Google Sheets
- **Lead Locking**: Assign leads to specific users to prevent conflicts
- **Call Tracking**: Log call dates and times automatically
- **Notes System**: Add timestamped notes to leads that sync with Google Sheets
- **Disposition Tracking**: Track call outcomes (Not Answered, Not Interested, More Info, Meeting Booked)
- **Company Information**: Display company details and contact information
- **Real-time Sync**: Changes sync instantly with Google Sheets

## Project Structure

```
/
├── backend/           # Node.js Express server
│   ├── server.js      # Main server file
│   ├── package.json   # Backend dependencies
│   └── .env.example   # Environment variables template
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js           # Google SSO login
│   │   │   ├── DialerUI.js        # Main dialer interface
│   │   │   ├── LeadCard.js        # Lead list item
│   │   │   └── LeadDetails.js     # Lead detail view
│   │   ├── App.js                 # Root component
│   │   └── index.js               # Entry point
│   ├── package.json   # Frontend dependencies
│   └── .env.example   # Environment variables template
└── README.md          # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google OAuth 2.0 credentials
- Google Sheets with proper column headers

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API and Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Set authorized JavaScript origins to `http://localhost:3000`
6. Set authorized redirect URIs to `http://localhost:5000/auth/google/callback`
7. Copy your Client ID and Client Secret

### 2. Spreadsheet Setup

Your Google Sheets should have the following columns:
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
- Disposition (Not Answered, Not Interested, More Info, Meeting Booked)
- Last Call Date
- Locked By

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

Environment variables needed:
```
PORT=5000
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
SPREADSHEET_ID=your_spreadsheet_id
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your credentials
npm install
npm start
```

Environment variables needed:
```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## API Endpoints

### Authentication
- `GET /auth/google/url` - Get Google OAuth URL
- `POST /auth/google/callback` - Handle OAuth callback

### Leads
- `GET /api/leads?accessToken=token` - Get all leads
- `PUT /api/leads/:leadId` - Update lead data
- `POST /api/leads/:leadId/lock` - Lock lead to user
- `POST /api/leads/:leadId/notes` - Add note to lead
- `POST /api/leads/:leadId/disposition` - Update disposition

## Google Sheets Integration

The application uses the Google Sheets API to:
- Read lead data from your spreadsheet
- Write notes and updates back to the spreadsheet
- Track call dates and dispositions
- Maintain lead lock status

## Security Considerations

- Store `.env` files securely and never commit them to version control
- Use HTTPS in production
- Implement rate limiting on backend endpoints
- Add proper error handling and validation
- Refresh access tokens before expiration

## Troubleshooting

### OAuth Issues
- Verify your Client ID and Client Secret are correct
- Check that redirect URIs match exactly in Google Console
- Clear browser cookies and try again

### Google Sheets API Errors
- Ensure the Sheets API is enabled in Google Cloud Console
- Verify your spreadsheet ID is correct
- Check that column names match exactly (case-sensitive)

### Connection Issues
- Ensure both backend and frontend are running
- Check that ports 5000 and 3000 are not in use
- Verify firewall settings allow local connections

## Deployment

This application is ready for production deployment. See detailed guides:

- **[Quick Start Guide](./QUICK_START.md)** - Fast deployment steps
- **[Full Deployment Guide](./DEPLOYMENT.md)** - Comprehensive deployment instructions

### Quick Deploy:
1. Deploy backend to Railway/Render/Heroku
2. Deploy frontend to Netlify
3. Update environment variables with production URLs
4. Update Google OAuth settings with production domains

## Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## License

This project is proprietary and confidential.

## Support

For issues or feature requests, please contact the development team.
