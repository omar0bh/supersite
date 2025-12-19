# 🔧 Fix CORS Error - Quick Solution

## Problem
Your frontend (`https://supersite-b36dcfb401af.herokuapp.com`) is trying to connect to your backend (`https://supertech-37365290ed5d.herokuapp.com`), but the backend is blocking it due to CORS.

## ✅ Solution: Update Backend CORS Settings

Run this command to add your frontend URL to the allowed origins:

```bash
heroku config:set ALLOWED_ORIGINS=https://supersite-b36dcfb401af.herokuapp.com --app supertech-37365290ed5d
```

**If you have multiple frontend URLs, separate them with commas:**

```bash
heroku config:set ALLOWED_ORIGINS=https://supersite-b36dcfb401af.herokuapp.com,https://www.yoursite.com --app supertech-37365290ed5d
```

---

## 📋 Step-by-Step:

1. **Open PowerShell/Terminal**

2. **Update the backend CORS:**
   ```bash
   heroku config:set ALLOWED_ORIGINS=https://supersite-b36dcfb401af.herokuapp.com --app supertech-37365290ed5d
   ```

3. **Restart the backend (to apply changes):**
   ```bash
   heroku restart --app supertech-37365290ed5d
   ```

4. **Verify it worked:**
   ```bash
   heroku config --app supertech-37365290ed5d
   ```
   You should see `ALLOWED_ORIGINS` with your frontend URL.

5. **Test the feedback form again** - It should work now! ✅

---

## 🎯 What This Does:

- Tells your backend to accept requests from your frontend URL
- Fixes the CORS error
- Allows the feedback form to submit successfully

---

## ⚠️ If You Have an Admin Dashboard Too:

If you also deployed an admin dashboard, add it to `ADMIN_ORIGINS`:

```bash
heroku config:set ADMIN_ORIGINS=https://your-admin-app.herokuapp.com --app supertech-37365290ed5d
```

---

## ✅ After Running the Command:

1. Wait a few seconds for Heroku to restart
2. Refresh your frontend page
3. Try submitting feedback again
4. It should work! 🎉

