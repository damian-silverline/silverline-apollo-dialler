# Quick Reference Guide

## Project Overview

Silverline Apollo Dialer is a full-stack application consisting of:
- **Backend**: Node.js/Express server with Google Sheets API integration
- **Frontend**: React UI for lead management and calling

## Directory Structure

```
/
├── backend/                    # Express server
│   ├── server.js              # Main server with all API routes
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment template
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Login.js      # Google OAuth login
│   │   │   ├── DialerUI.js   # Main dialer interface
│   │   │   ├── LeadCard.js   # Lead list item
│   │   │   └── LeadDetails.js # Lead detail/edit view
│   │   ├── App.js            # Root component with auth
│   │   └── index.js          # React entry point
│   ├── public/
│   │   └── index.html        # HTML template
│   └── package.json          # Frontend dependencies
├── .vscode/                   # VS Code config
│   ├── tasks.json            # Development tasks
│   └── launch.json           # Debug configuration
├── .github/
│   └── copilot-instructions.md # Project guidelines
├── README.md                 # Full documentation
├── SETUP.md                  # Setup guide
└── package.json             # Root package (workspaces)
```

## Key Files Explained

### Backend (server.js)
- **Authentication**: Google OAuth 2.0 endpoints
- **Leads API**: CRUD operations for lead data
- **Notes**: Add timestamped notes to leads
- **Disposition**: Track call outcomes
- **Locking**: Assign leads to users

### Frontend Components
- **Login**: Handles Google SSO authentication
- **DialerUI**: Main interface with lead list and filtering
- **LeadCard**: Individual lead preview in list
- **LeadDetails**: Full lead information and interactions

## Environment Variables

### Backend (.env)
```
PORT=5000
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
SPREADSHEET_ID=your_spreadsheet_id
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```

## Development Commands

### From root directory:
```bash
npm run install:all        # Install all dependencies
npm run dev:backend        # Start backend dev server (port 5000)
npm run dev:frontend       # Start frontend dev server (port 3000)
```

### From backend:
```bash
cd backend
npm run dev                # Start with nodemon
npm start                  # Start normally
```

### From frontend:
```bash
cd frontend
npm start                  # Start dev server
npm run build              # Build for production
```

## API Endpoints

### Authentication
- `GET /auth/google/url` → Get OAuth authorization URL
- `POST /auth/google/callback` → Exchange code for tokens

### Leads
- `GET /api/leads?accessToken=TOKEN` → Fetch all leads
- `PUT /api/leads/:leadId` → Update lead data
- `POST /api/leads/:leadId/lock` → Lock lead to user
- `POST /api/leads/:leadId/notes` → Add note to lead
- `POST /api/leads/:leadId/disposition` → Update disposition

### Health
- `GET /health` → Check backend status

## Feature Overview

### Lead Management
✅ View all leads from spreadsheet
✅ Search by name, phone, or company
✅ Filter by disposition status
✅ Lock leads to prevent double-calling

### Call Tracking
✅ Log last call date automatically
✅ Track disposition (4 options)
✅ Add timestamped notes
✅ View call history in notes

### Data Sync
✅ All changes update Google Sheets
✅ Read-write access with OAuth
✅ Real-time synchronization
✅ User-specific locking

### Security
✅ Google OAuth authentication
✅ Token-based API access
✅ User email verification
✅ Secure credential storage

## Google Sheets Integration

### Required Columns
The spreadsheet must have these exact column headers:
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

### Data Flow
1. User logs in with Google
2. Backend requests Sheets API access
3. Frontend reads lead data from Sheets
4. Changes (notes, disposition) write back to Sheets
5. Lock status and call dates update in Sheets

## Common Tasks

### Add a new field to leads
1. Add column to Google Sheets
2. Update backend column mapping in server.js
3. Update LeadDetails.js to display the field

### Change appearance/styling
- Modify CSS files in `frontend/src/components/*.css`
- Main colors: #667eea, #764ba2

### Add new disposition option
1. Add to SELECT options in LeadDetails.js
2. Update backend disposition endpoint
3. Add CSS class in LeadCard.css for badge styling

## Troubleshooting Checklist

- [ ] Environment variables set correctly
- [ ] Google OAuth credentials valid and enabled APIs
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Spreadsheet ID is correct
- [ ] Column headers match exactly (case-sensitive)
- [ ] User has edit access to spreadsheet

## Performance Notes

- Leads load all at once (consider pagination for 1000+ leads)
- Notes are appended, not indexed (search is basic text search)
- Lock mechanism is simple (no timeout, manual unlock in sheet)
- OAuth tokens refresh automatically

## Security Considerations

- Never commit .env files
- Use HTTPS in production
- Implement rate limiting for APIs
- Add CSRF protection
- Validate all user inputs
- Use secure session storage

## Next Steps

1. Set up Google OAuth credentials
2. Configure environment variables
3. Start both services
4. Test login and lead loading
5. Connect to your spreadsheet
6. Test notes and disposition updates

For detailed setup, see SETUP.md
