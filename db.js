const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;
let useCloudDB = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    useCloudDB = true;
    console.log('✓ Supabase Client initialized successfully. Using Cloud Database.');
  } catch (error) {
    console.error('⚠️ Failed to initialize Supabase Client:', error.message);
  }
} else {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY not found in .env. Falling back to local JSON database.');
}

module.exports = {
  supabase,
  useCloudDB
};
