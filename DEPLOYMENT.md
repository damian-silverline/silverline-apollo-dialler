# Deployment Guide

## Frontend Deployment (Netlify)

### Prerequisites
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Create a [Netlify account](https://netlify.com)
3. Deploy your backend (see Backend Deployment section below)

### Steps

1. **Connect Repository to Netlify**
   - Log in to Netlify
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider and select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
   - (These should be auto-detected from netlify.toml)

3. **Set Environment Variables**
   In Netlify dashboard, go to Site settings → Environment variables:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your frontend

5. **Update Google OAuth Settings**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Update Authorized JavaScript origins: `https://your-netlify-site.netlify.app`
   - Update Authorized redirect URIs to include your Netlify domain

---

## Backend Deployment

Your backend needs to be deployed separately. Here are recommended options:

### Option 1: Railway (Recommended)
1. Create account at [Railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Set environment variables in Railway dashboard:
   ```
   PORT=5001
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback
   SPREADSHEET_ID=your-spreadsheet-id
   BACKEND_URL=https://your-backend.railway.app
   FRONTEND_URL=https://your-netlify-site.netlify.app
   ```
4. Add start script to backend/package.json:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```
5. Deploy

### Option 2: Render
1. Create account at [Render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add environment variables (same as above)
6. Deploy

### Option 3: Heroku
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Create Heroku app: `heroku create your-app-name`
3. Add Procfile to backend directory:
   ```
   web: node server.js
   ```
4. Set environment variables: `heroku config:set VARIABLE=value`
5. Deploy: `git push heroku main`

---

## Post-Deployment Checklist

- [ ] Backend is deployed and accessible
- [ ] Frontend environment variables updated with production backend URL
- [ ] Google OAuth credentials updated with production URLs
- [ ] Google Sheets shared with the Google account used for OAuth
- [ ] Test login flow in production
- [ ] Test lead management features
- [ ] Test notes and disposition updates

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend .env matches your Netlify URL exactly
- Check that Google OAuth redirect URIs include your production URLs

### Google Sheets API Errors
- Verify the spreadsheet is shared with your Google account
- Check that the access token is being properly passed from frontend to backend
- Tokens expire after 1 hour - users will need to re-login

### Build Failures
- Check build logs in Netlify dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set correctly
