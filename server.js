require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const app = express();
// Heroku sets PORT automatically, fallback to 3003 for local
const PORT = process.env.PORT || process.env.SERVER_PORT || 3003;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Security: Check if API key is set
if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables!');
  console.error('Please create a .env file with GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

// Validate environment variables
if (!process.env.ALLOWED_ORIGINS) {
  console.warn('⚠️  WARNING: ALLOWED_ORIGINS not set. Using default localhost for development.');
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: ALLOWED_ORIGINS is required in production!');
    process.exit(1);
  }
}

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
     scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https:"]
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration - Separate origins for public and admin
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0)
  : ['http://localhost:3000', 'http://localhost:3001'];

const adminOrigins = process.env.ADMIN_ORIGINS
  ? process.env.ADMIN_ORIGINS.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0)
  : ['http://localhost:3001', 'http://localhost:3002'];

// Combine all allowed origins
const allAllowedOrigins = [...new Set([...allowedOrigins, ...adminOrigins])];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // In development, allow localhost on any port
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    if (allAllowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}. Allowed origins: ${allAllowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // Limit request size

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Stricter limit for AI endpoints
  message: 'Too many AI requests, please try again later.',
});

app.use('/api/', apiLimiter);

// Input sanitization helper
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
};

// Validation middleware
const validateOffer = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('phone').trim().isLength({ min: 5, max: 20 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
];

const validateAIRequest = [
  body('prompt')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Prompt must be between 1 and 5000 characters'),
  body('type').optional().isIn(['json', 'text']),
];

// ============================================
// AUTHENTICATION & SECURITY
// ============================================

// JWT Secret - MUST be set in production
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_' + Date.now();
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('⚠️  WARNING: JWT_SECRET not set! Using insecure default. Set JWT_SECRET in .env for production!');
}

// Admin credentials - Move to environment variables for security
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'OMARADMIN',
  password: process.env.ADMIN_PASSWORD || 'bouhanana2006sh', // ⚠️ CHANGE THIS IN PRODUCTION!
};

// Rate limiter for admin login (stricter)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication middleware for admin endpoints
const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No token provided. Please login first.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token format.' 
      });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Verify it's an admin token
      if (decoded.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Admin access required.' 
        });
      }
      
      req.admin = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Token expired. Please login again.' 
        });
      }
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token.' 
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Authentication failed.' 
    });
  }
};

// Admin login endpoint
app.post('/api/admin/login', adminLoginLimiter, [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { username, password } = req.body;
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          username: username, 
          role: 'admin',
          iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
      );
      
      console.log(`✓ Admin login successful: ${username}`);
      
      res.json({ 
        success: true, 
        token,
        expiresIn: '24h'
      });
    } else {
      console.warn(`⚠️  Failed login attempt for username: ${username}`);
      // Don't reveal which field is wrong for security
      res.status(401).json({ 
        error: 'Invalid credentials', 
        message: 'Username or password is incorrect.' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed', 
      message: 'An error occurred during login.' 
    });
  }
});

// Helper function to safely read/write JSON database
const readOffersDatabase = () => {
  const dbPath = path.join(__dirname, 'offers-database.json');
  try {
    if (!fs.existsSync(dbPath)) {
      return [];
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    if (!data || data.trim().length === 0) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    // Return empty array if file is corrupted
    return [];
  }
};

const writeOffersDatabase = (offers) => {
  const dbPath = path.join(__dirname, 'offers-database.json');
  try {
    // Create backup before writing
    if (fs.existsSync(dbPath)) {
      const backupPath = `${dbPath}.backup`;
      fs.copyFileSync(dbPath, backupPath);
    }
    fs.writeFileSync(dbPath, JSON.stringify(offers, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

// TODO: Add authentication middleware for admin endpoints
// const authenticateAdmin = (req, res, next) => {
//   // Implement JWT/session authentication here
//   // For now, admin endpoints are unprotected (SECURITY RISK)
//   next();
// };

// SAVE OFFER TO JSON DATABASE ONLY
app.post('/api/save-offer', validateOffer, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { name, phone, description, selectedFeatures, totalPrice, estimatedDelivery } = req.body;
    
    const offers = readOffersDatabase();
    const newOffer = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      name: sanitizeInput(name),
      phone: sanitizeInput(phone),
      description: sanitizeInput(description),
      selectedFeatures: selectedFeatures || [],
      totalPrice: totalPrice || 2000,
      estimatedDelivery: estimatedDelivery || '5-7 Days',
      createdAt: new Date().toISOString()
    };
    offers.push(newOffer);
    writeOffersDatabase(offers);
    console.log(`✓ SAVED TO JSON: ${newOffer.name} | Features: ${selectedFeatures?.length || 0} | Price: ${totalPrice || 2000} DH`);
    res.json({ success: true, message: 'Saved to database', offerId: newOffer.id });
  } catch (error) {
    console.error('ERROR saving:', error);
    res.status(500).json({ error: 'Failed to save', message: error.message });
  }
});

// Secure Gemini API Proxy - Project Estimator
app.post('/api/ai/estimate', strictLimiter, validateAIRequest, async (req, res) => {
  try {
    console.log('Received estimate request:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: errors.array()[0]?.msg || 'Invalid prompt',
        details: errors.array() 
      });
    }

    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    console.log('Processing prompt:', prompt);
    const fullPrompt = `
      Act as a web agency expert. Analyze the following project request and provide a detailed estimate.
      Project Description: "${sanitizeInput(prompt)}".

      Output MUST be a single JSON object (only the JSON, no commentary) using the following schema:
      { "package": "STRING (e.g., Basic, Premium, Enterprise)", "price": "STRING (e.g., 5000-8000 DH)", "time": "STRING (e.g., 2 weeks)", "stack": "STRING (e.g., React/Next.js)", "features": "ARRAY of STRING (key features needed)" }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("No content received from AI.");
    }

    let cleanedText = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanedText);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Secure Gemini API Proxy - Copy Generator
app.post('/api/ai/copy', strictLimiter, validateAIRequest, async (req, res) => {
  try {
    console.log('Received copy request:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: errors.array()[0]?.msg || 'Invalid prompt',
        details: errors.array() 
      });
    }

    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    console.log('Processing copy prompt:', prompt);
    const fullPrompt = `Write a high-converting hero section headline and subheadline for a website about: "${sanitizeInput(prompt)}". Format: "HEADLINE | SUBHEADLINE"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "text/plain" }
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("No content received from AI.");
    }

    res.json({ success: true, data: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Secure Gemini API Proxy - Chat
app.post('/api/ai/chat', strictLimiter, async (req, res) => {
  try {
    console.log('Received chat request:', { hasMessages: !!req.body.messages, hasUserMessage: !!req.body.userMessage });
    const { messages, userMessage } = req.body;

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (userMessage.length > 5000) {
      return res.status(400).json({ error: 'Message is too long (max 5000 characters)' });
    }
    
    console.log('Processing chat message:', userMessage.substring(0, 50) + '...');

    const systemPrompt = `
      You are SuperBot, the friendly and knowledgeable AI assistant for SuperTech, a premium web agency in Morocco specializing in AI-infused websites.
      Maintain a professional yet enthusiastic tone.
      (Context: Services include Custom Web Design, AI Integration, Mobile Apps, SEO. Templates: RestoLuxe, EstatePro, LegalMind. Pricing starts at 2000 DH for base templates.)
      Do not repeat the context to the user.
    `;

    const fullHistory = (messages || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: sanitizeInput(msg.text) }]
    }));
    fullHistory.push({ role: 'user', parts: [{ text: sanitizeInput(userMessage) }] });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: fullHistory,
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting right now. Please try again in a moment.";

    res.json({ success: true, data: String(aiText) });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Endpoint to get all offers (for admin dashboard) - PROTECTED
app.get('/api/get-offers', authenticateAdmin, (req, res) => {
  try {
    const offers = readOffersDatabase();
    
    // Return offers in reverse order (newest first)
    const sortedOffers = offers.sort((a, b) => b.id - a.id);
    
    console.log(`✓ Admin ${req.admin.username} fetched ${sortedOffers.length} offers`);
    
    res.json({ success: true, data: sortedOffers });
  } catch (error) {
    console.error('Error reading offers from JSON database:', error);
    res.status(500).json({ error: 'Failed to read offers', details: error.message });
  }
});

// DELETE OFFER ENDPOINT - PROTECTED
app.delete('/api/delete-offer/:id', authenticateAdmin, (req, res) => {
  try {
    const offerId = parseInt(req.params.id);
    
    if (isNaN(offerId)) {
      return res.status(400).json({ error: 'Invalid offer ID' });
    }

    const offers = readOffersDatabase();
    const filteredOffers = offers.filter(offer => offer.id !== offerId);
    
    if (filteredOffers.length === offers.length) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    writeOffersDatabase(filteredOffers);
    console.log(`✓ Admin ${req.admin.username} deleted offer ID: ${offerId}`);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('ERROR deleting offer:', error);
    res.status(500).json({ error: 'Failed to delete', message: error.message });
  }
});

// Test endpoint (removed file content exposure for security)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for undefined API routes (for debugging)
app.use('/api/*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method, 
    path: req.originalUrl,
    availableRoutes: [
      'POST /api/save-offer',
      'POST /api/ai/estimate',
      'POST /api/ai/copy',
      'POST /api/ai/chat',
      'GET /api/test',
      'GET /api/health'
    ]
  });
});

if(process.env.NODE_ENV === 'production'){
  const buildPath = path.join(__dirname, 'build');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✓ Secure server running on http://localhost:${PORT}`);
  console.log(`✓ API key loaded: ${GEMINI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`✓ Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`✓ Available endpoints:`);
  console.log(`  - POST /api/save-offer`);
  console.log(`  - POST /api/ai/estimate`);
  console.log(`  - POST /api/ai/copy`);
  console.log(`  - POST /api/ai/chat`);
  console.log(`  - GET /api/get-offers`);
  console.log(`  - GET /api/test`);
  console.log(`  - GET /api/health`);
});
