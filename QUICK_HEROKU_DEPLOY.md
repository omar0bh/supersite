# ⚡ Quick Heroku Deployment (Step-by-Step)

Since you've deployed to Heroku before, here's the quick version:

---

## 🎯 Recommended: Backend on Heroku, Frontends on Vercel

**Why?** Vercel is free, easier, and perfect for React apps. Heroku is great for Node.js backend.

---

## 📦 Step 1: Deploy Backend API to Heroku

### 1.1 Prepare Files (Already Done ✅)
- ✅ `Procfile` created
- ✅ `package.json` updated with `"start": "node server.js"`
- ✅ `server.js` uses `process.env.PORT` (Heroku compatible)

### 1.2 Deploy Commands

```bash
cd "C:\projets react\devsite"

# Login to Heroku (if needed)
heroku login

# Create Heroku app
heroku create yoursite-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set GEMINI_API_KEY=your_actual_gemini_key_here
heroku config:set JWT_SECRET=wgnBUWEfHoilE12EqtpjrTuHzdO2YsWS1YF4YRLqaII=
heroku config:set ADMIN_USERNAME=OMARADMIN
heroku config:set ADMIN_PASSWORD=OMAR0091bh%
heroku config:set ALLOWED_ORIGINS=https://yoursite.vercel.app,https://www.yoursite.com
heroku config:set ADMIN_ORIGINS=https://admin-yoursite.vercel.app

# Initialize git (if not already)
git init
git add .
git commit -m "Backend API for Heroku"

# Deploy
git push heroku main
```

### 1.3 Get Your Backend URL

After deployment, Heroku will give you a URL like:
```
https://yoursite-api.herokuapp.com
```

**Save this URL!** You'll need it for frontends.

---

## 🚀 Step 2: Deploy Frontends to Vercel (Free & Easy)

### 2.1 Deploy Public Site

```bash
cd "C:\projets react\devsite"

# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? yoursite-public
# - Directory? ./
# - Override settings? No

# After deployment, set environment variable:
vercel env add REACT_APP_API_URL production
# Enter: https://yoursite-api.herokuapp.com/api

# Redeploy with new env var
vercel --prod
```

### 2.2 Deploy Admin Dashboard

```bash
cd "C:\projets react\admin-dashboard"

# Deploy
vercel

# When prompted:
# - Project name? yoursite-admin
# - Directory? ./

# Set environment variable:
vercel env add REACT_APP_API_URL production
# Enter: https://yoursite-api.herokuapp.com/api

# Redeploy
vercel --prod
```

---

## 🔧 Step 3: Update CORS in Heroku

After you get your Vercel URLs, update CORS:

```bash
# Get your Vercel URLs (they'll be like: yoursite-public.vercel.app)
# Then update Heroku config:

heroku config:set ALLOWED_ORIGINS=https://yoursite-public.vercel.app,https://www.yoursite.com
heroku config:set ADMIN_ORIGINS=https://yoursite-admin.vercel.app

# Restart Heroku app
heroku restart
```

---

## ✅ Quick Checklist

- [ ] Backend deployed to Heroku
- [ ] All environment variables set in Heroku
- [ ] Public site deployed to Vercel
- [ ] Admin dashboard deployed to Vercel
- [ ] `REACT_APP_API_URL` set in both Vercel projects
- [ ] CORS origins updated in Heroku
- [ ] Test login on admin dashboard
- [ ] Test public site features

---

## 🎯 Alternative: All on Heroku (3 Apps)

If you prefer everything on Heroku:

### Backend (same as above)

### Public Site on Heroku:

```bash
cd "C:\projets react\devsite"

# Create separate Heroku app
heroku create yoursite-public --remote public

# Install serve for static files
npm install --save-dev serve

# Create Procfile for public site
echo "web: serve -s build -l \$PORT" > Procfile.public

# Build with API URL
REACT_APP_API_URL=https://yoursite-api.herokuapp.com/api npm run build

# Deploy
git push public main
```

### Admin Dashboard on Heroku:

```bash
cd "C:\projets react\admin-dashboard"

heroku create yoursite-admin --remote admin

npm install --save-dev serve

echo "web: serve -s build -l \$PORT" > Procfile

REACT_APP_API_URL=https://yoursite-api.herokuapp.com/api npm run build

git init
git add .
git commit -m "Admin dashboard"
git push admin main
```

---

## 🆘 Common Issues

### "Application Error" on Heroku
```bash
# Check logs
heroku logs --tail

# Common fixes:
heroku restart
heroku config:set NODE_ENV=production
```

### CORS Errors
- Make sure `ALLOWED_ORIGINS` and `ADMIN_ORIGINS` match your actual URLs
- No trailing slashes in URLs
- Include `https://` prefix

### Environment Variables Not Working
- In Vercel: Go to Project → Settings → Environment Variables
- In Heroku: Go to Settings → Config Vars
- Redeploy after adding env vars

---

## 💡 Pro Tips

1. **Use Heroku for backend only** - Much easier!
2. **Vercel is free** - Perfect for React apps
3. **Custom domains** - Add later in Vercel/Heroku settings
4. **Monitor** - Use `heroku logs --tail` to debug

---

## 📞 Need Help?

If you get stuck:
1. Check `heroku logs --tail` for backend errors
2. Check Vercel deployment logs in dashboard
3. Verify all environment variables are set
4. Make sure CORS URLs match exactly

Good luck! 🚀

