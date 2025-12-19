# 🔧 Fix Admin Dashboard CORS Error

## ✅ Fixed in Code:
- Updated `admin-dashboard/src/config/api.js` to automatically detect production and use the correct backend URL

## 🚀 Next Steps - Update Heroku Backend:

You need to add the new admin dashboard URL to the backend's `ADMIN_ORIGINS` environment variable.

### Run these commands:

```bash
# Navigate to backend project
cd "C:\projets react\devsite"

# Add the new admin dashboard URL to ADMIN_ORIGINS
heroku config:set ADMIN_ORIGINS=https://admindashboardforsupersite-6cb8c1917d4f.herokuapp.com --app supertech-37365290ed5d

# If you already have ADMIN_ORIGINS set, you need to include both URLs:
# heroku config:set ADMIN_ORIGINS=https://old-admin-url.herokuapp.com,https://admindashboardforsupersite-6cb8c1917d4f.herokuapp.com --app supertech-37365290ed5d

# Restart the backend
heroku restart --app supertech-37365290ed5d
```

### Verify the config:

```bash
heroku config --app supertech-37365290ed5d
```

You should see `ADMIN_ORIGINS` with your admin dashboard URL.

---

## 📝 After Updating:

1. **Rebuild and redeploy admin dashboard:**
   ```bash
   cd "C:\projets react\admin-dashboard"
   npm run build
   git add .
   git commit -m "Fix API config for production"
   git push heroku master
   ```

2. **Test the login:**
   - Go to: https://admindashboardforsupersite-6cb8c1917d4f.herokuapp.com
   - Try logging in
   - CORS error should be gone! ✅

---

## 🔍 What Was Fixed:

1. **Admin Dashboard API Config:**
   - Now automatically detects production vs development
   - Uses `https://supertech-37365290ed5d.herokuapp.com/api` in production
   - Uses `http://localhost:3003/api` in development

2. **Backend CORS:**
   - Needs to include the admin dashboard URL in `ADMIN_ORIGINS`
   - This allows the admin dashboard to make API calls to the backend

---

## ✅ Expected Result:

After running the Heroku commands:
- ✅ CORS error will be fixed
- ✅ Admin login will work
- ✅ All API calls from admin dashboard will succeed

