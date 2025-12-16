# 🚀 Guide: Separating Admin Dashboard

This guide will help you separate your admin dashboard into a separate website/application.

---

## Why Separate?

✅ **Security:** Admin interface not exposed in public bundle  
✅ **Performance:** Smaller public site, faster loading  
✅ **Maintenance:** Update admin without affecting public site  
✅ **Scalability:** Scale independently  
✅ **Access Control:** Easier to restrict admin access  

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│   Public Site   │         │  Admin Dashboard │
│  (yoursite.com) │         │ (admin.yoursite) │
└────────┬────────┘         └────────┬────────┘
         │                            │
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Backend API  │
              │ (api.yoursite)│
              └───────────────┘
```

---

## Step-by-Step Implementation

### Step 1: Create New Admin Project

```bash
# Create new React app for admin
npx create-react-app admin-dashboard
cd admin-dashboard

# Install dependencies
npm install lucide-react
```

### Step 2: Copy/Move Admin Components

**⚠️ IMPORTANT: Different actions for different files!**

**Files to COPY (not move - public site still needs them):**
- `src/components/ui/Button.jsx` → **COPY** to `admin-dashboard/src/components/ui/Button.jsx`
  - *Why copy?* Public site uses Button in Hero, Contact, Navbar, etc.
  
- `src/components/ui/GlobalStyles.jsx` → **COPY** to `admin-dashboard/src/components/ui/GlobalStyles.jsx`
  - *Why copy?* Both sites need styling

**Files to MOVE (cut - public site won't need them):**
- `src/components/pages/AdminDashboard.jsx` → **MOVE** to `admin-dashboard/src/components/AdminDashboard.jsx`
  - *Why move?* Only used in admin, we'll remove it from public site

**After copying/moving, update imports in AdminDashboard.jsx:**
```javascript
// Change from:
import { API_ENDPOINTS } from '../../config/api';
import Button from '../ui/Button';

// To:
import { API_ENDPOINTS } from '../config/api';
import Button from './ui/Button';
```

### Step 3: Create Admin API Config

Create `admin-dashboard/src/config/api.js`:
```javascript
// Admin Dashboard API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

export const API_ENDPOINTS = {
  GET_OFFERS: `${API_BASE_URL}/get-offers`,
  DELETE_OFFER: `${API_BASE_URL}/delete-offer`,
  // Add login endpoint when you implement authentication
  LOGIN: `${API_BASE_URL}/admin/login`,
};
```

### Step 4: Update Backend Authentication

**⚠️ IMPORTANT: Update the EXISTING `server.js` in your CURRENT project (devsite/server.js)**
**You do NOT need to create a new server! The same backend serves both public site and admin.**

**Add to `server.js` (in your current devsite project):**

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin credentials (move to environment variables or database)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'OMARADMIN',
  password: process.env.ADMIN_PASSWORD || 'bouhanana2006sh' // Change this!
};

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign(
        { username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protect admin endpoints
app.get('/api/get-offers', authenticateAdmin, (req, res) => {
  // ... existing code
});

app.delete('/api/delete-offer/:id', authenticateAdmin, (req, res) => {
  // ... existing code
});
```

### Step 5: Update Admin Dashboard with Authentication

**Update `admin-dashboard/src/components/AdminDashboard.jsx`:**

```javascript
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  
  // Login function
  const handleLogin = async (username, password) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  // Add token to all API requests
  const fetchRequests = async () => {
    const response = await fetch(API_ENDPOINTS.GET_OFFERS, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // ... rest of code
  };
  
  // ... rest of component
};
```

### Step 6: Update CORS Configuration

**Update `server.js`:**

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

// Add admin origin
const adminOrigins = process.env.ADMIN_ORIGINS
  ? process.env.ADMIN_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed (public or admin)
    if (allowedOrigins.includes(origin) || adminOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

### Step 7: Environment Variables

**Public site `.env`:**
```env
REACT_APP_API_URL=https://api.yoursite.com/api
```

**Admin dashboard `.env`:**
```env
REACT_APP_API_URL=https://api.yoursite.com/api
```

**Backend `.env`:**
```env
ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com
ADMIN_ORIGINS=https://admin.yoursite.com
JWT_SECRET=your_secret_key_here
ADMIN_USERNAME=OMARADMIN
ADMIN_PASSWORD=your_secure_password_here
```

### Step 8: Remove Admin from Public Site

**Update `src/App.jsx`:**

```javascript
// Remove these imports:
// import AdminDashboard from './components/pages/AdminDashboard';

// Remove admin route logic:
// if (currentPage === 'admin') { ... }

// Remove from Navbar (if admin link exists)
```

### Step 9: Deploy

**Option A: Same Server, Different Routes**
- Public: `yoursite.com` → serves React build
- Admin: `admin.yoursite.com` → serves admin React build
- API: `api.yoursite.com` → serves Express server

**Option B: Separate Servers**
- Public: Deploy to Vercel/Netlify
- Admin: Deploy to separate Vercel/Netlify project
- API: Deploy to Railway/Render/Heroku

---

## Quick Start Checklist

- [ ] Create new admin React app
- [ ] Move AdminDashboard component
- [ ] Update API configuration
- [ ] Add JWT authentication to backend
- [ ] Update admin dashboard to use tokens
- [ ] Update CORS for admin domain
- [ ] Remove admin from public site
- [ ] Test locally
- [ ] Deploy public site
- [ ] Deploy admin dashboard
- [ ] Update DNS/subdomain configuration

---

## Security Best Practices

1. ✅ **Never store credentials in frontend code**
2. ✅ **Use environment variables for secrets**
3. ✅ **Implement JWT with expiration**
4. ✅ **Use HTTPS everywhere**
5. ✅ **Add rate limiting to admin endpoints**
6. ✅ **Log admin access attempts**
7. ✅ **Use strong passwords**
8. ✅ **Consider 2FA for admin access**

---

## Need Help?

If you need help implementing any of these steps, let me know!

