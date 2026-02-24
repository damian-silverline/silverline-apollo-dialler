# Quick Deployment Guide

## 🚀 Deploy to Production

### Step 1: Deploy Backend
Choose one platform and deploy your backend first:

**Railway (Easiest):**
```bash
# 1. Push code to GitHub
# 2. Go to railway.app
# 3. Create new project from your repo
# 4. Set environment variables (see backend/.env.example)
# 5. Copy your Railway backend URL
```

**Render:**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`

### Step 2: Deploy Frontend to Netlify
```bash
# 1. Push code to GitHub (if not already done)
# 2. Go to netlify.com
# 3. Import your repository
# 4. Set environment variables:
#    - REACT_APP_BACKEND_URL=https://your-backend-url.com
#    - REACT_APP_GOOGLE_CLIENT_ID=your-client-id
# 5. Deploy
```

### Step 3: Update Google OAuth
Go to [Google Cloud Console](https://console.cloud.google.com):
1. Add your Netlify URL to Authorized JavaScript origins
2. Add `https://your-netlify-site.netlify.app` and `https://your-backend-url.com/auth/google/callback` to Authorized redirect URIs

### Step 4: Test
Visit your Netlify site and test:
- [ ] Login with Google
- [ ] View leads from Google Sheets
- [ ] Add/delete notes
- [ ] Update dispositions

---

## 🛠️ Development Setup

```bash
# Install dependencies
npm run install:all

# Start backend (in one terminal)
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm start
```

Backend runs on http://localhost:5001
Frontend runs on http://localhost:4002

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5001
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5001/auth/google/callback
SPREADSHEET_ID=your-spreadsheet-id
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:4002
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:5001
REACT_APP_GOOGLE_CLIENT_ID=your-client-id
PORT=4002
```

---

## 📚 Full Documentation
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions and troubleshooting.
