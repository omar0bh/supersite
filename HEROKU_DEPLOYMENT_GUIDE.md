# 🚀 Heroku Deployment Guide

Complete guide to deploy your separated admin dashboard and public site to Heroku.

---

## 📋 Architecture Overview

You have **3 separate applications** to deploy:

1. **Backend API** (`devsite/server.js`) → Heroku App 1
2. **Public Site** (`devsite/`) → Heroku App 2  
3. **Admin Dashboard** (`admin-dashboard/`) → Heroku App 3

**OR** you can deploy backend to Heroku and frontends to Vercel/Netlify (easier & free).

---

## 🎯 Recommended Approach: Hybrid Deployment

**Best Option:**
- **Backend API** → Heroku
- **Public Site** → Vercel/Netlify (free, easier)
- **Admin Dashboard** → Vercel/Netlify (free, easier)

**OR All on Heroku:**
- All 3 apps on Heroku (3 separate apps)

---

## 📦 Option 1: Backend on Heroku + Frontends on Vercel (Recommended)

### Step 1: Prepare Backend for Heroku

#### 1.1 Create Procfile

Create `devsite/Procfile` (no extension):
```
web: node server.js
```

#### 1.2 Update package.json scripts

Make sure `package.json` has:
```json
"scripts": {
  "start": "node server.js",
  "server": "node server.js"
}
```

#### 1.3 Create .env for Heroku

You'll set environment variables in Heroku dashboard (see below).

---

### Step 2: Deploy Backend to Heroku

```bash
cd "C:\projets react\devsite"

# Login to Heroku (if not already)
heroku login

# Create Heroku app for backend
heroku create yoursite-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SERVER_PORT=3003
heroku config:set GEMINI_API_KEY=your_actual_gemini_key
heroku config:set JWT_SECRET=wgnBUWEfHoilE12EqtpjrTuHzdO2YsWS1YF4YRLqaII=
heroku config:set ADMIN_USERNAME=OMARADMIN
heroku config:set ADMIN_PASSWORD=OMAR0091bh%
heroku config:set ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com
heroku config:set ADMIN_ORIGINS=https://admin.yoursite.com

# Deploy
git init  # if not already a git repo
git add .
git commit -m "Initial commit"
git push heroku main
```

**Note:** Replace `yoursite.com` with your actual domains.

---

### Step 3: Deploy Frontends to Vercel (Free & Easy)

#### 3.1 Deploy Public Site

```bash
cd "C:\projets react\devsite"

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add REACT_APP_API_URL
# Enter: https://yoursite-api.herokuapp.com/api
```

#### 3.2 Deploy Admin Dashboard

```bash
cd "C:\projets react\admin-dashboard"

# Deploy
vercel

# Set environment variable
vercel env add REACT_APP_API_URL
# Enter: https://yoursite-api.herokuapp.com/api
```

---

## 📦 Option 2: All on Heroku (3 Separate Apps)

### Step 1: Prepare Backend

#### 1.1 Create Procfile in `devsite/`
```
web: node server.js
```

#### 1.2 Update server.js to serve static files

Add this to `server.js` after all API routes:

```javascript
// Serve static files from React build (for public site)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}
```

#### 1.3 Update package.json

```json
"scripts": {
  "start": "node server.js",
  "build": "react-scripts build",
  "heroku-postbuild": "npm run build"
}
```

---

### Step 2: Deploy Backend API

```bash
cd "C:\projets react\devsite"

heroku create yoursite-api
heroku config:set NODE_ENV=production
heroku config:set SERVER_PORT=3003
heroku config:set GEMINI_API_KEY=your_key
heroku config:set JWT_SECRET=wgnBUWEfHoilE12EqtpjrTuHzdO2YsWS1YF4YRLqaII=
heroku config:set ADMIN_USERNAME=OMARADMIN
heroku config:set ADMIN_PASSWORD=OMAR0091bh%
heroku config:set ALLOWED_ORIGINS=https://yoursite.herokuapp.com
heroku config:set ADMIN_ORIGINS=https://admin-yoursite.herokuapp.com

git init
git add .
git commit -m "Backend API"
git push heroku main
```

---

### Step 3: Deploy Public Site

```bash
cd "C:\projets react\devsite"

# Create separate Heroku app
heroku create yoursite-public --remote public

# Update .env or build with API URL
# In package.json, add:
"scripts": {
  "build": "REACT_APP_API_URL=https://yoursite-api.herokuapp.com/api react-scripts build"
}

# Create Procfile
echo "web: serve -s build -l 3000" > Procfile

# Install serve
npm install --save-dev serve

# Deploy
git push public main
```

---

### Step 4: Deploy Admin Dashboard

```bash
cd "C:\projets react\admin-dashboard"

heroku create yoursite-admin --remote admin

# Create Procfile
echo "web: serve -s build -l 3000" > Procfile

# Install serve
npm install --save-dev serve

# Update package.json build script
"build": "REACT_APP_API_URL=https://yoursite-api.herokuapp.com/api react-scripts build"

# Deploy
git init
git add .
git commit -m "Admin dashboard"
git push admin main
```

---

## 🔧 Required Heroku Configuration

### Environment Variables (Set in Heroku Dashboard)

Go to: **Settings → Config Vars**

**For Backend API:**
```
NODE_ENV=production
SERVER_PORT=3003
GEMINI_API_KEY=your_actual_key
JWT_SECRET=wgnBUWEfHoilE12EqtpjrTuHzdO2YsWS1YF4YRLqaII=
ADMIN_USERNAME=OMARADMIN
ADMIN_PASSWORD=OMAR0091bh%
ALLOWED_ORIGINS=https://yoursite.herokuapp.com,https://www.yoursite.com
ADMIN_ORIGINS=https://admin-yoursite.herokuapp.com
```

**For Public Site:**
```
REACT_APP_API_URL=https://yoursite-api.herokuapp.com/api
```

**For Admin Dashboard:**
```
REACT_APP_API_URL=https://yoursite-api.herokuapp.com/api
```

---

## 📝 Important Files to Create

### 1. Procfile (for backend)

Create `devsite/Procfile`:
```
web: node server.js
```

### 2. Update server.js for production

Add at the end of `server.js`:

```javascript
// Serve static files in production (if serving React build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}
```

---

## 🚀 Quick Deployment Steps (Recommended: Backend on Heroku)

### 1. Deploy Backend

```bash
cd "C:\projets react\devsite"

# Create Procfile
echo web: node server.js > Procfile

# Initialize git (if needed)
git init
git add .
git commit -m "Backend API"

# Create Heroku app
heroku create yoursite-api

# Set all environment variables
heroku config:set NODE_ENV=production
heroku config:set GEMINI_API_KEY=your_key
heroku config:set JWT_SECRET=wgnBUWEfHoilE12EqtpjrTuHzdO2YsWS1YF4YRLqaII=
heroku config:set ADMIN_USERNAME=OMARADMIN
heroku config:set ADMIN_PASSWORD=OMAR0091bh%
heroku config:set ALLOWED_ORIGINS=https://yoursite.vercel.app
heroku config:set ADMIN_ORIGINS=https://admin-yoursite.vercel.app

# Deploy
git push heroku main
```

### 2. Get Backend URL

After deployment, your backend will be at:
```
https://yoursite-api.herokuapp.com
```

### 3. Deploy Frontends to Vercel

**Public Site:**
```bash
cd "C:\projets react\devsite"
vercel
# When asked for environment variables:
# REACT_APP_API_URL = https://yoursite-api.herokuapp.com/api
```

**Admin Dashboard:**
```bash
cd "C:\projets react\admin-dashboard"
vercel
# When asked for environment variables:
# REACT_APP_API_URL = https://yoursite-api.herokuapp.com/api
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend API is running on Heroku
- [ ] Environment variables set correctly
- [ ] CORS origins updated with actual URLs
- [ ] Frontends can connect to backend API
- [ ] Admin login works
- [ ] Public site works
- [ ] Test all features

---

## 🔍 Troubleshooting

### "Application Error" on Heroku
- Check logs: `heroku logs --tail`
- Verify environment variables are set
- Check Procfile exists and is correct

### CORS Errors
- Update `ALLOWED_ORIGINS` and `ADMIN_ORIGINS` with actual URLs
- Restart Heroku app: `heroku restart`

### API Not Found
- Check backend URL is correct
- Verify `REACT_APP_API_URL` in frontend apps
- Check Heroku app is running: `heroku ps`

---

## 💡 Pro Tips

1. **Use Heroku for backend only** - Frontends are easier on Vercel/Netlify
2. **Set up custom domains** - Point yoursite.com to Vercel, api.yoursite.com to Heroku
3. **Enable Heroku Postgres** - For production database (free tier available)
4. **Set up monitoring** - Use Heroku metrics to monitor your API

---

## 📞 Need Help?

If you get stuck:
1. Check Heroku logs: `heroku logs --tail`
2. Verify all environment variables are set
3. Make sure Procfile exists
4. Check CORS origins match your actual URLs

Good luck with deployment! 🚀

