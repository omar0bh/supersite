# 🔧 .env File Troubleshooting

## Issue Found: .env file not being read

The validation script shows that **NO environment variables are being loaded** from your `.env` file.

---

## Common Problems & Solutions

### Problem 1: File Location
**Check:** Is `.env` in the `devsite` folder?
- ✅ Correct: `C:\projets react\devsite\.env`
- ❌ Wrong: `C:\projets react\.env`

### Problem 2: File Format Issues

**Common mistakes:**
- ❌ Spaces around `=` sign: `KEY = value` (WRONG!)
- ❌ Quotes around values: `KEY="value"` (Sometimes causes issues)
- ❌ Empty lines with spaces
- ❌ Comments on same line: `KEY=value # comment` (Can cause issues)

**✅ Correct format:**
```env
KEY=value
ANOTHER_KEY=another_value
# This is a comment
```

### Problem 3: File Encoding
- Make sure file is saved as **UTF-8** (not UTF-16 or other)
- No BOM (Byte Order Mark)

### Problem 4: File Name
- Must be exactly `.env` (not `.env.txt` or `env`)
- Check if Windows is hiding the extension

---

## ✅ Correct .env File Format

Create/update your `.env` file in `devsite` folder with this exact format:

```env
SERVER_PORT=3003
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_key_here
ALLOWED_ORIGINS=http://localhost:3000
ADMIN_ORIGINS=http://localhost:3001,http://localhost:3002
JWT_SECRET=wgnBUWEfHoilE12EqtpjrTuHzdO2YsWS1YF4YRLqaII=
ADMIN_USERNAME=OMARADMIN
ADMIN_PASSWORD=your_secure_password_here
REACT_APP_API_URL=http://localhost:3003/api
```

**Important:**
- No spaces around `=`
- No quotes (unless value has spaces)
- One variable per line
- Replace `your_actual_gemini_key_here` with your real key
- Replace `your_secure_password_here` with a secure password

---

## 🔍 How to Check Your File

1. **Open `.env` in a text editor** (VS Code, Notepad++)
2. **Check for:**
   - Spaces around `=` signs
   - Extra quotes
   - Empty lines
   - Special characters

3. **Save as UTF-8 encoding**

---

## 🧪 Test After Fixing

Run the validation script again:
```bash
node check-env.js
```

You should see all ✅ green checkmarks!

---

## Still Having Issues?

Share:
1. The first 5-10 lines of your `.env` file (hide sensitive values)
2. Any error messages you're seeing
3. Where the `.env` file is located

