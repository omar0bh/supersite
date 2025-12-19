# 🚀 How to Run Your Project

## ⚠️ Important: You Need TWO Terminals!

Your project has **TWO parts** that need to run separately:
1. **Backend Server** (Node.js/Express) - Port 3003
2. **React Frontend** (React App) - Port 3000

---

## 📋 Step-by-Step Instructions

### Terminal 1: Backend Server

```bash
cd "C:\projets react\devsite"
npm run server
```

**What this does:**
- Starts Express server on port 3003
- Handles all API requests
- You'll see: `✓ Secure server running on http://localhost:3003`

**Keep this terminal open!** Don't close it.

---

### Terminal 2: React Frontend

**IMPORTANT:** Your `package.json` has `"start": "node server.js"` which runs the backend, NOT React!

**To run React, you have two options:**

#### Option A: Use react-scripts directly
```bash
cd "C:\projets react\devsite"
npx react-scripts start
```

#### Option B: Fix package.json (Recommended)

I'll update your package.json to add a proper React start script.

---

## 🔧 Current Problem

Your `package.json` has:
```json
"start": "node server.js"  ← This runs BACKEND, not React!
```

This is why `npm start` tries to start the backend again (and fails because port 3003 is already in use).

---

## ✅ Solution

I'll fix your package.json to have separate scripts:
- `npm run server` → Backend (port 3003)
- `npm run client` → React app (port 3000)
- `npm run dev` → Both together (if you have concurrently)

---

## 🎯 Quick Fix Commands

**Terminal 1 (Backend):**
```bash
cd "C:\projets react\devsite"
npm run server
```

**Terminal 2 (React - use this for now):**
```bash
cd "C:\projets react\devsite"
npx react-scripts start
```

This will:
- Start React on port 3000
- Open browser automatically
- Hot reload on changes

---

## 📊 What You'll See

**Terminal 1 (Backend):**
```
✓ Secure server running on http://localhost:3003
✓ API key loaded: Yes
✓ Allowed origins: http://localhost:3000
```

**Terminal 2 (React):**
```
Compiled successfully!
Local: http://localhost:3000
```

---

## 🎉 Then You Can:

1. Open http://localhost:3000 in browser
2. Test all features
3. Backend API at http://localhost:3003/api

---

## ⚠️ Common Error

**Error: "address already in use :::3003"**

This means the backend is already running! You don't need to run it again.

**Solution:** Just run React in a new terminal with `npx react-scripts start`

---

## 💡 Pro Tip

If you want to run both with one command, use:
```bash
npm run dev
```

But you need `concurrently` installed (which you already have!).

---

## 🎯 Summary

1. **Backend:** Already running OR run `npm run server` in Terminal 1
2. **React:** Run `npx react-scripts start` in Terminal 2
3. **Open:** http://localhost:3000 in browser

That's it! 🚀

