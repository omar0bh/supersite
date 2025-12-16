# 🚀 Setup Instructions

## ✅ Step 1: Dependencies Installed
You've already done this! Great job! ✅

---

## ✅ Step 2: Environment Files Created
I've created both `.env` files for you! ✅

### Files Created:
- ✅ `devsite/.env` - Backend configuration
- ✅ `admin-dashboard/.env` - Admin dashboard configuration

---

## ⚠️ IMPORTANT: Update These Values

### In `devsite/.env`:

1. **GEMINI_API_KEY** - Replace `your_gemini_api_key_here` with your actual Gemini API key
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```

2. **ADMIN_PASSWORD** - ⚠️ **CHANGE THIS!** Don't use the default password
   ```env
   ADMIN_PASSWORD=your_secure_password_here
   ```

3. **JWT_SECRET** - ✅ Already generated and set! (Keep this secret!)

---

## 🧪 Step 3: Test Everything

### Terminal 1 - Start Backend:
```bash
cd "C:\projets react\devsite"
npm run server
```

**Expected output:**
```
✓ Secure server running on http://localhost:3003
✓ API key loaded: Yes
✓ Allowed origins: http://localhost:3000
```

### Terminal 2 - Start Public Site:
```bash
cd "C:\projets react\devsite"
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

### Terminal 3 - Start Admin Dashboard:
```bash
cd "C:\projets react\admin-dashboard"
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3001
```

---

## 🌐 Access URLs

- **Public Site:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3001
- **Backend API:** http://localhost:3003

---

## 🔐 Test Admin Login

1. Go to http://localhost:3001
2. Login with:
   - **Username:** `OMARADMIN`
   - **Password:** (whatever you set in `.env`)

---

## ⚠️ Common Issues

### "GEMINI_API_KEY is not set"
- Make sure you updated `GEMINI_API_KEY` in `devsite/.env`
- Restart the backend server

### "CORS blocked origin"
- Check that `ALLOWED_ORIGINS` and `ADMIN_ORIGINS` match your URLs
- Make sure ports match (3000 for public, 3001 for admin)

### "Failed to connect to server"
- Make sure backend is running on port 3003
- Check `REACT_APP_API_URL` in admin-dashboard `.env`

---

## 🎉 You're Ready!

Once all three servers are running, you're good to go! 🚀

