require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { supabase, useCloudDB } = require('./db');
const { sendTelegramNotification, sendEmailNotification } = require('./notifications');

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
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://supersite-b48c.onrender.com", "wss:", "ws:"]
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
    // In development, allow localhost and 127.0.0.1 on any port (devsite + admin-dashboard)
    if (process.env.NODE_ENV === 'development' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
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

// Root Status Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Supertech API Server is running successfully.',
    timestamp: new Date().toISOString()
  });
});

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

const validateFeedback = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('feedback').trim().isLength({ min: 10, max: 2000 }),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
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
  password: process.env.ADMIN_PASSWORD || 'OMAR0091bh%', // ⚠️ CHANGE THIS IN PRODUCTION!
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

// Helper functions for feedback database
const readFeedbackDatabase = () => {
  const dbPath = path.join(__dirname, 'feedback-database.json');
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
    console.error('Error reading feedback database:', error);
    return [];
  }
};

const writeFeedbackDatabase = (feedback) => {
  const dbPath = path.join(__dirname, 'feedback-database.json');
  try {
    // Create backup before writing
    if (fs.existsSync(dbPath)) {
      const backupPath = `${dbPath}.backup`;
      fs.copyFileSync(dbPath, backupPath);
    }
    fs.writeFileSync(dbPath, JSON.stringify(feedback, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing feedback database:', error);
    throw error;
  }
};

// TODO: Add authentication middleware for admin endpoints
// const authenticateAdmin = (req, res, next) => {
//   // Implement JWT/session authentication here
//   // For now, admin endpoints are unprotected (SECURITY RISK)
//   next();
// };

// SAVE OFFER TO CLOUD DATABASE (WITH JSON FALLBACK & TELEGRAM ALERTS)
app.post('/api/save-offer', validateOffer, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { name, phone, description, estimatedDelivery, preferredContact, email } = req.body;
    
    let selectedFeatures = req.body.selectedFeatures;
    let totalPrice = req.body.totalPrice;

    // Fallback if sent inside nested pricing object
    if (req.body.pricing) {
      if (totalPrice === undefined) totalPrice = req.body.pricing.total;
      if (selectedFeatures === undefined) {
        selectedFeatures = req.body.pricing.features
          ? req.body.pricing.features.map(f => typeof f === 'object' ? f : { name: f, price: 0 })
          : [];
      }
    }
    
    const newOffer = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      name: sanitizeInput(name),
      phone: sanitizeInput(phone),
      description: sanitizeInput(description),
      preferredContact: sanitizeInput(preferredContact || ''),
      email: email ? sanitizeInput(email) : '',
      selectedFeatures: selectedFeatures || [],
      totalPrice: totalPrice || 2000,
      estimatedDelivery: estimatedDelivery || '5-7 Days',
      createdAt: new Date().toISOString(),
      status: 'new',
      notes: ''
    };

    let savedToCloud = false;

    if (useCloudDB && supabase) {
      try {
        const { error } = await supabase
          .from('leads')
          .insert([
            {
              id: newOffer.id,
              timestamp: newOffer.timestamp,
              name: newOffer.name,
              phone: newOffer.phone,
              email: newOffer.email,
              description: newOffer.description,
              preferred_contact: newOffer.preferredContact,
              selected_features: newOffer.selectedFeatures,
              total_price: newOffer.totalPrice,
              estimated_delivery: newOffer.estimatedDelivery,
              status: 'new',
              notes: ''
            }
          ]);

        if (error) throw error;
        console.log(`✓ Saved to Supabase: ${newOffer.name}`);
        savedToCloud = true;
      } catch (err) {
        console.error('⚠️ Supabase save failed, falling back to local JSON database:', err.message);
      }
    }

    // Always log to local JSON f development as fallback
    const offers = readOffersDatabase();
    offers.push(newOffer);
    writeOffersDatabase(offers);
    console.log(`✓ SAVED TO JSON: ${newOffer.name} | Features: ${selectedFeatures?.length || 0} | Price: ${totalPrice || 2000} DH`);

    // Send Telegram Notification
    const servicesText = selectedFeatures && selectedFeatures.length > 0 
      ? selectedFeatures.map(f => `• ${f.name} (+${f.price} DH)`).join('\n')
      : 'Base Template Package';

    const cleanPhone = newOffer.phone.replace(/\D/g, '');
    const telegramMessage = `🔔 *New Lead Received!*\n\n` +
      `👤 *Client*: ${newOffer.name}\n` +
      `📞 *Phone*: ${newOffer.phone}\n` +
      `📧 *Email*: ${newOffer.email || 'None'}\n` +
      `💬 *Contact Pref*: ${newOffer.preferredContact || 'WhatsApp'}\n\n` +
      `💼 *Project Description*:\n"${newOffer.description}"\n\n` +
      `🛠️ *Features*:\n${servicesText}\n\n` +
      `💰 *Total Price*: *${newOffer.totalPrice} DH*\n` +
      `⏱️ *Delivery Time*: ${newOffer.estimatedDelivery}\n\n` +
      `--------------------\n` +
      `🔗 [Open WhatsApp Chat](https://wa.me/${cleanPhone})`;

    sendTelegramNotification(telegramMessage);

    // Send Email Notification
    const emailSubject = `🔔 New Lead on SuperSite: ${newOffer.name} (${newOffer.totalPrice} DH)`;
    const emailText = `New Lead Received!\n\n` +
      `Client Name: ${newOffer.name}\n` +
      `Phone Number: ${newOffer.phone}\n` +
      `Email Address: ${newOffer.email || 'None'}\n` +
      `Preferred Contact: ${newOffer.preferredContact || 'WhatsApp'}\n\n` +
      `Project Description:\n"${newOffer.description}"\n\n` +
      `Selected Features:\n${servicesText}\n\n` +
      `Total Estimated Price: ${newOffer.totalPrice} DH\n` +
      `Estimated Delivery: ${newOffer.estimatedDelivery}\n\n` +
      `WhatsApp Link: https://wa.me/${cleanPhone}`;

    const servicesHtml = selectedFeatures && selectedFeatures.length > 0 
      ? selectedFeatures.map(f => `<li><strong>${f.name}</strong>: +${f.price} DH</li>`).join('')
      : '<li>Base Template Package</li>';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e90ff; border-bottom: 2px solid #1e90ff; padding-bottom: 10px; margin-top: 0;">🔔 New Lead Received!</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; font-weight: bold; width: 180px;">Client Name:</td>
            <td style="padding: 10px;">${newOffer.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Phone Number:</td>
            <td style="padding: 10px;"><a href="tel:${newOffer.phone}" style="color: #1e90ff; text-decoration: none;">${newOffer.phone}</a></td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; font-weight: bold;">Email Address:</td>
            <td style="padding: 10px;">${newOffer.email ? `<a href="mailto:${newOffer.email}" style="color: #1e90ff; text-decoration: none;">${newOffer.email}</a>` : 'None'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Preferred Contact:</td>
            <td style="padding: 10px; text-transform: capitalize;">${newOffer.preferredContact || 'WhatsApp'}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; font-weight: bold;">Total Price:</td>
            <td style="padding: 10px; font-size: 18px; color: #3fe0c5; font-weight: bold;">${newOffer.totalPrice} DH</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Delivery Time:</td>
            <td style="padding: 10px;">${newOffer.estimatedDelivery}</td>
          </tr>
        </table>

        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #1e90ff; background-color: #f4f8ff; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #333;">💼 Project Description:</h3>
          <p style="margin: 0; font-style: italic; color: #555; white-space: pre-wrap;">"${newOffer.description}"</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #333;">🛠️ Selected Features & Components:</h3>
          <ul style="padding-left: 20px; color: #555;">
            ${servicesHtml}
          </ul>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://wa.me/${cleanPhone}" style="background-color: #3fe0c5; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(63, 224, 197, 0.3);">
            💬 Open WhatsApp Chat
          </a>
        </div>
      </div>
    `;

    sendEmailNotification(emailSubject, emailText, emailHtml);

    res.json({ success: true, message: 'Saved successfully', offerId: newOffer.id, cloud: savedToCloud });
  } catch (error) {
    console.error('ERROR saving:', error);
    res.status(500).json({ error: 'Failed to save', message: error.message });
  }
});

// SAVE FEEDBACK TO CLOUD DATABASE (WITH JSON FALLBACK & TELEGRAM ALERTS)
app.post('/api/save-feedback', validateFeedback, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { name, feedback, rating } = req.body;
    
    const newFeedback = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      name: sanitizeInput(name),
      feedback: sanitizeInput(feedback),
      rating: parseInt(rating, 10),
      showOnSite: false,
      createdAt: new Date().toISOString()
    };

    let savedToCloud = false;

    if (useCloudDB && supabase) {
      try {
        const { error } = await supabase
          .from('feedback')
          .insert([
            {
              id: newFeedback.id,
              timestamp: newFeedback.timestamp,
              name: newFeedback.name,
              feedback: newFeedback.feedback,
              rating: newFeedback.rating,
              show_on_site: false
            }
          ]);

        if (error) throw error;
        console.log(`✓ Feedback saved to Supabase: ${newFeedback.name}`);
        savedToCloud = true;
      } catch (err) {
        console.error('⚠️ Supabase feedback save failed, falling back to local JSON:', err.message);
      }
    }

    const feedbackList = readFeedbackDatabase();
    feedbackList.push(newFeedback);
    writeFeedbackDatabase(feedbackList);
    console.log(`✓ FEEDBACK SAVED: ${newFeedback.name} | Rating: ${rating}/5`);

    // Send Telegram Notification
    const stars = '⭐'.repeat(newFeedback.rating);
    const telegramMessage = `💬 *New Feedback Received!*\n\n` +
      `👤 *Name*: ${newFeedback.name}\n` +
      `⭐ *Rating*: ${newFeedback.rating}/5 (${stars})\n\n` +
      `📝 *Review*:\n"${newFeedback.feedback}"\n\n` +
      `--------------------\n` +
      `Manage this testimonial inside your Admin Dashboard!`;

    sendTelegramNotification(telegramMessage);

    // Send Email Notification
    const feedbackSubject = `💬 New Review Received on SuperSite from ${newFeedback.name}`;
    const feedbackText = `New Feedback Received!\n\n` +
      `Name: ${newFeedback.name}\n` +
      `Rating: ${newFeedback.rating}/5\n\n` +
      `Review:\n"${newFeedback.feedback}"`;

    const feedbackHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e90ff; border-bottom: 2px solid #1e90ff; padding-bottom: 10px; margin-top: 0;">💬 New Feedback Received!</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 10px;">${newFeedback.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Rating:</td>
            <td style="padding: 10px; font-size: 16px; color: #ffbc00;">${'★'.repeat(newFeedback.rating)}${'☆'.repeat(5 - newFeedback.rating)} (${newFeedback.rating}/5)</td>
          </tr>
        </table>

        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #1e90ff; background-color: #f4f8ff; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #333;">📝 Review Content:</h3>
          <p style="margin: 0; font-style: italic; color: #555; white-space: pre-wrap;">"${newFeedback.feedback}"</p>
        </div>

        <p style="color: #777; font-size: 12px; margin-top: 30px;">
          To approve or hide this testimonial, log in to your Admin Dashboard.
        </p>
      </div>
    `;

    sendEmailNotification(feedbackSubject, feedbackText, feedbackHtml);

    res.json({ success: true, message: 'Feedback saved successfully', feedbackId: newFeedback.id, cloud: savedToCloud });
  } catch (error) {
    console.error('ERROR saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback', message: error.message });
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
      You are SuperBot, the friendly and knowledgeable AI assistant for SuperSite, a premium web agency in Morocco specializing in AI-infused websites.
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

// Endpoint to get all offers (for admin dashboard) - PROTECTED (CRM COMPATIBLE)
app.get('/api/get-offers', authenticateAdmin, async (req, res) => {
  try {
    let offers = [];
    let source = 'local';

    if (useCloudDB && supabase) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        
        offers = data.map(item => ({
          id: item.id,
          timestamp: item.timestamp,
          name: item.name,
          phone: item.phone,
          email: item.email,
          description: item.description,
          preferredContact: item.preferred_contact,
          selectedFeatures: item.selected_features,
          totalPrice: item.total_price,
          estimatedDelivery: item.estimated_delivery,
          createdAt: item.created_at || new Date(item.id).toISOString(),
          status: item.status || 'new',
          notes: item.notes || ''
        }));
        
        source = 'supabase';
        console.log(`✓ Fetched ${offers.length} offers from Supabase`);
      } catch (err) {
        console.error('⚠️ Failed to fetch from Supabase, falling back to local JSON:', err.message);
      }
    }

    if (offers.length === 0) {
      const localOffers = readOffersDatabase();
      // Ensure status and notes keys exist even on local fallback for CRM continuity
      offers = localOffers.map(o => ({
        ...o,
        status: o.status || 'new',
        notes: o.notes || ''
      })).sort((a, b) => b.id - a.id);
    }
    
    res.json({ success: true, data: offers, source });
  } catch (error) {
    console.error('Error reading offers:', error);
    res.status(500).json({ error: 'Failed to read offers', details: error.message });
  }
});

// DELETE OFFER ENDPOINT - PROTECTED
app.delete('/api/delete-offer/:id', authenticateAdmin, async (req, res) => {
  try {
    const offerId = parseInt(req.params.id);
    if (isNaN(offerId)) {
      return res.status(400).json({ error: 'Invalid offer ID' });
    }

    let deletedFromCloud = false;

    if (useCloudDB && supabase) {
      try {
        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', offerId);

        if (error) throw error;
        deletedFromCloud = true;
        console.log(`✓ Deleted offer ID ${offerId} from Supabase`);
      } catch (err) {
        console.error('⚠️ Failed to delete from Supabase:', err.message);
      }
    }

    const offers = readOffersDatabase();
    const filteredOffers = offers.filter(offer => offer.id !== offerId);
    
    if (filteredOffers.length === offers.length && !deletedFromCloud) {
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

// GET FEEDBACK (for admin dashboard) - PROTECTED
app.get('/api/get-feedback', authenticateAdmin, async (req, res) => {
  try {
    let feedbackList = [];
    let source = 'local';

    if (useCloudDB && supabase) {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        
        feedbackList = data.map(item => ({
          id: item.id,
          timestamp: item.timestamp,
          name: item.name,
          feedback: item.feedback,
          rating: item.rating,
          showOnSite: item.show_on_site,
          createdAt: item.created_at || new Date(item.id).toISOString()
        }));
        
        source = 'supabase';
        console.log(`✓ Fetched ${feedbackList.length} reviews from Supabase`);
      } catch (err) {
        console.error('⚠️ Failed to fetch feedback from Supabase:', err.message);
      }
    }

    if (feedbackList.length === 0) {
      const localFeedback = readFeedbackDatabase();
      feedbackList = localFeedback.sort((a, b) => b.id - a.id);
    }

    res.json({ success: true, data: feedbackList, source });
  } catch (error) {
    console.error('Error reading feedback:', error);
    res.status(500).json({ error: 'Failed to read feedback', details: error.message });
  }
});

// GET FEATURED FEEDBACK (public - for "What clients say" on frontend)
app.get('/api/featured-feedback', async (req, res) => {
  try {
    let featured = [];

    if (useCloudDB && supabase) {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('show_on_site', true)
          .order('id', { ascending: false });

        if (error) throw error;
        
        featured = data.map(item => ({
          id: item.id,
          timestamp: item.timestamp,
          name: item.name,
          feedback: item.feedback,
          rating: item.rating,
          showOnSite: true,
          createdAt: item.created_at
        }));
        
        console.log(`✓ Fetched ${featured.length} featured feedback from Supabase`);
      } catch (err) {
        console.error('⚠️ Failed to fetch featured feedback from Supabase:', err.message);
      }
    }

    if (featured.length === 0) {
      const feedbackList = readFeedbackDatabase();
      const localFeatured = feedbackList.filter((f) => f.showOnSite === true);
      featured = localFeatured.sort((a, b) => b.id - a.id);
    }

    res.json({ success: true, data: featured });
  } catch (error) {
    console.error('Error reading featured feedback:', error);
    res.status(500).json({ error: 'Failed to read featured feedback', details: error.message });
  }
});

// Toggle feedback show-on-site (admin only) - POST with id in body
app.post('/api/set-feedback-show-on-site', authenticateAdmin, async (req, res) => {
  try {
    const idRaw = req.body && (req.body.id !== undefined) ? req.body.id : null;
    const id = idRaw !== null && /^\d+$/.test(String(idRaw)) ? parseInt(String(idRaw), 10) : NaN;
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid feedback id' });

    let updatedShowOnSite = null;

    if (useCloudDB && supabase) {
      try {
        const { data, error: selectErr } = await supabase
          .from('feedback')
          .select('show_on_site')
          .eq('id', id)
          .single();

        if (selectErr) throw selectErr;

        const nextStatus = !data.show_on_site;

        const { error: updateErr } = await supabase
          .from('feedback')
          .update({ show_on_site: nextStatus })
          .eq('id', id);

        if (updateErr) throw updateErr;

        updatedShowOnSite = nextStatus;
        console.log(`✓ Toggled feedback ${id} in Supabase to show_on_site = ${nextStatus}`);
      } catch (err) {
        console.error('⚠️ Failed to toggle feedback in Supabase:', err.message);
      }
    }

    const feedbackList = readFeedbackDatabase();
    const index = feedbackList.findIndex((f) => String(f.id) === String(id));
    if (index === -1 && updatedShowOnSite === null) return res.status(404).json({ error: 'Feedback not found' });
    
    if (index !== -1) {
      feedbackList[index].showOnSite = updatedShowOnSite !== null ? updatedShowOnSite : !feedbackList[index].showOnSite;
      writeFeedbackDatabase(feedbackList);
      updatedShowOnSite = feedbackList[index].showOnSite;
    }

    console.log(`✓ Admin toggled feedback ${id} showOnSite = ${updatedShowOnSite}`);
    res.json({ success: true, showOnSite: updatedShowOnSite });
  } catch (error) {
    console.error('Error toggling show-on-site:', error);
    res.status(500).json({ error: 'Failed to update', details: error.message });
  }
});

// DELETE FEEDBACK (admin only) - POST with id in body
app.post('/api/delete-feedback', authenticateAdmin, async (req, res) => {
  try {
    const idRaw = req.body && (req.body.id !== undefined) ? req.body.id : null;
    if (idRaw === null || idRaw === '') return res.status(400).json({ error: 'Feedback id required' });

    let deletedFromCloud = false;

    if (useCloudDB && supabase) {
      try {
        const { error } = await supabase
          .from('feedback')
          .delete()
          .eq('id', idRaw);

        if (error) throw error;
        deletedFromCloud = true;
        console.log(`✓ Deleted feedback ${idRaw} from Supabase`);
      } catch (err) {
        console.error('⚠️ Failed to delete feedback from Supabase:', err.message);
      }
    }

    const feedbackList = readFeedbackDatabase();
    const index = feedbackList.findIndex((f) => String(f.id) === String(idRaw));
    if (index === -1 && !deletedFromCloud) return res.status(404).json({ error: 'Feedback not found' });
    
    if (index !== -1) {
      feedbackList.splice(index, 1);
      writeFeedbackDatabase(feedbackList);
    }
    
    console.log(`✓ Admin deleted feedback ${idRaw}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback', details: error.message });
  }
});

// CRM ROUTE - UPDATE LEAD STATUS (PROTECTED)
app.post('/api/admin/update-lead-status', authenticateAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: 'Lead ID and status are required' });
    }

    let updatedInCloud = false;

    if (useCloudDB && supabase) {
      try {
        const { error } = await supabase
          .from('leads')
          .update({ status: status })
          .eq('id', id);

        if (error) throw error;
        updatedInCloud = true;
      } catch (err) {
        console.error('⚠️ Failed to update lead status in Supabase:', err.message);
      }
    }

    // Also update local JSON
    const offers = readOffersDatabase();
    const index = offers.findIndex(o => String(o.id) === String(id));
    if (index !== -1) {
      offers[index].status = status;
      writeOffersDatabase(offers);
    }

    console.log(`✓ Admin updated lead ${id} status to: ${status}`);
    res.json({ success: true, message: 'Status updated successfully', status });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update lead status' });
  }
});



// CRM ROUTE - UPDATE LEAD NOTES (PROTECTED)
app.post('/api/admin/update-lead-notes', authenticateAdmin, async (req, res) => {
  try {
    const { id, notes } = req.body;
    if (!id || notes === undefined) {
      return res.status(400).json({ error: 'Lead ID and notes are required' });
    }

    let updatedInCloud = false;

    if (useCloudDB && supabase) {
      try {
        const { error } = await supabase
          .from('leads')
          .update({ notes: notes })
          .eq('id', id);

        if (error) throw error;
        updatedInCloud = true;
      } catch (err) {
        console.error('⚠️ Failed to update lead notes in Supabase:', err.message);
      }
    }

    // Also update local JSON
    const offers = readOffersDatabase();
    const index = offers.findIndex(o => String(o.id) === String(id));
    if (index !== -1) {
      offers[index].notes = notes;
      writeOffersDatabase(offers);
    }

    console.log(`✓ Admin updated lead ${id} notes`);
    res.json({ success: true, message: 'Notes updated successfully', notes });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ error: 'Failed to update lead notes' });
  }
});

// ============================================
// TEMPLATE CMS DATABASE & CRUD ROUTES
// ============================================

// Helper functions for templates database
const readTemplatesDatabase = () => {
  const dbPath = path.join(__dirname, 'templates-database.json');
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
    console.error('Error reading templates database:', error);
    return [];
  }
};

const writeTemplatesDatabase = (templates) => {
  const dbPath = path.join(__dirname, 'templates-database.json');
  try {
    if (fs.existsSync(dbPath)) {
      const backupPath = `${dbPath}.backup`;
      fs.copyFileSync(dbPath, backupPath);
    }
    fs.writeFileSync(dbPath, JSON.stringify(templates, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing templates database:', error);
    throw error;
  }
};

// GET ALL TEMPLATES (PUBLIC)
app.get('/api/get-templates', async (req, res) => {
  try {
    let templatesList = [];
    let source = 'local';

    if (useCloudDB && supabase) {
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          templatesList = data.map(item => ({
            id: item.id,
            name: item.name,
            cat: item.cat,
            color: item.color,
            desc: item.desc,
            image: item.image,
            visitors: item.visitors,
            conversion: item.conversion,
            tech: item.tech,
            subDemos: item.sub_demos || []
          }));
          source = 'supabase';
        }
      } catch (err) {
        console.error('⚠️ Failed to fetch templates from Supabase, fallback to JSON:', err.message);
      }
    }

    if (templatesList.length === 0) {
      templatesList = readTemplatesDatabase();
    }

    res.json({ success: true, data: templatesList, source });
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// SAVE/EDIT TEMPLATE (ADMIN ONLY)
app.post('/api/admin/save-template', authenticateAdmin, async (req, res) => {
  try {
    const { id, name, cat, color, desc, image, visitors, conversion, tech, subDemos } = req.body;
    if (!name || !cat || !desc) {
      return res.status(400).json({ error: 'Name, Category, and Description are required' });
    }

    const templateId = id ? parseInt(id, 10) : Date.now();
    const newTemplate = {
      id: templateId,
      name: sanitizeInput(name),
      cat: sanitizeInput(cat),
      color: sanitizeInput(color || 'from-gray-700 to-gray-900'),
      desc: sanitizeInput(desc),
      image: image ? sanitizeInput(image) : '',
      visitors: visitors ? sanitizeInput(visitors) : '5K+',
      conversion: conversion ? sanitizeInput(conversion) : '4.0%',
      tech: Array.isArray(tech) ? tech.map(sanitizeInput) : [],
      subDemos: Array.isArray(subDemos) ? subDemos : []
    };

    let savedToCloud = false;

    if (useCloudDB && supabase) {
      try {
        const { error } = await supabase
          .from('templates')
          .upsert({
            id: newTemplate.id,
            name: newTemplate.name,
            cat: newTemplate.cat,
            color: newTemplate.color,
            desc: newTemplate.desc,
            image: newTemplate.image,
            visitors: newTemplate.visitors,
            conversion: newTemplate.conversion,
            tech: newTemplate.tech,
            sub_demos: newTemplate.subDemos
          });

        if (!error) {
          savedToCloud = true;
          console.log(`✓ Saved template ${newTemplate.name} to Supabase`);
        } else {
          throw error;
        }
      } catch (err) {
        console.error('⚠️ Failed to save template to Supabase, fallback to JSON:', err.message);
      }
    }

    // Save to JSON
    const templatesList = readTemplatesDatabase();
    const existingIndex = templatesList.findIndex(t => String(t.id) === String(templateId));
    if (existingIndex !== -1) {
      templatesList[existingIndex] = newTemplate;
    } else {
      templatesList.push(newTemplate);
    }
    writeTemplatesDatabase(templatesList);
    
    console.log(`✓ Admin saved template ID: ${newTemplate.id} (${newTemplate.name})`);
    res.json({ success: true, data: newTemplate, cloud: savedToCloud });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// DELETE TEMPLATE (ADMIN ONLY)
app.post('/api/admin/delete-template', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Template ID is required' });

    let deletedFromCloud = false;

    if (useCloudDB && supabase) {
      try {
        const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', id);

        if (!error) {
          deletedFromCloud = true;
          console.log(`✓ Deleted template ID ${id} from Supabase`);
        }
      } catch (err) {
        console.error('⚠️ Failed to delete template from Supabase:', err.message);
      }
    }

    const templatesList = readTemplatesDatabase();
    const filtered = templatesList.filter(t => String(t.id) !== String(id));
    if (filtered.length === templatesList.length && !deletedFromCloud) {
      return res.status(404).json({ error: 'Template not found' });
    }

    writeTemplatesDatabase(filtered);
    console.log(`✓ Admin deleted template ID: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
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
      'POST /api/save-feedback',
      'POST /api/admin/login',
      'GET /api/get-offers',
      'GET /api/get-feedback',
      'GET /api/featured-feedback',
      'POST /api/set-feedback-show-on-site',
      'POST /api/delete-feedback',
      'DELETE /api/delete-offer/:id',
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
  console.log(`  - GET /api/get-feedback`);
  console.log(`  - GET /api/test`);
  console.log(`  - GET /api/health`);
});
