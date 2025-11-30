require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.SERVER_PORT || 3003;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Security: Check if API key is set
if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables!');
  console.error('Please create a .env file with GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration - Only allow specific origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS ).split(',');
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // In development, allow localhost on any port
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
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
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('phone').trim().isLength({ min: 5, max: 20 }).matches(/^[\d\s\+\-\(\)]+$/),
  body('description').trim().isLength({ min: 10, max: 2000 }).escape(),
];

const validateAIRequest = [
  body('prompt')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Prompt must be between 1 and 5000 characters'),
  body('type').optional().isIn(['json', 'text']),
];

// Endpoint to save offer (with validation)
app.post('/api/save-offer', validateOffer, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { name, phone, description } = req.body;

    // Additional sanitization
    const sanitizedName = sanitizeInput(name);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedDescription = sanitizeInput(description);

    // Create the content to append
    const timestamp = new Date().toLocaleString();
    const content = `\n===========================================
Offer Submitted: ${timestamp}
===========================================
Name: ${sanitizedName}
Phone: ${sanitizedPhone}
Description: ${sanitizedDescription}
===========================================\n`;

    // Path to Offers.txt in the src folder
    const filePath = path.join(__dirname, 'src', 'Offers.txt');

    // Ensure the src directory exists
    const srcDir = path.join(__dirname, 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    // Append to file (create if doesn't exist)
    fs.appendFileSync(filePath, content, 'utf8');

    res.json({ success: true, message: 'Offer saved successfully' });
  } catch (error) {
    console.error('Error saving offer:', error);
    res.status(500).json({ error: 'Failed to save offer' });
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

// Endpoint to get all offers (for admin dashboard) - Reads from JSON database
app.get('/api/get-offers', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'offers-database.json');
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      console.log('⚠️  Database file not found, returning empty array');
      return res.json({ success: true, data: [] });
    }

    // Read and parse JSON database
    const data = fs.readFileSync(dbPath, 'utf8');
    const offers = JSON.parse(data);
    
    // Return offers in reverse order (newest first)
    const sortedOffers = offers.sort((a, b) => b.id - a.id);
    
    console.log(`✓ Fetched ${sortedOffers.length} offers from JSON database`);
    
    res.json({ success: true, data: sortedOffers });
  } catch (error) {
    console.error('Error reading offers from JSON database:', error);
    res.status(500).json({ error: 'Failed to read offers', details: error.message });
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
