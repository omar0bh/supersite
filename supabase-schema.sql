-- ====================================================================
-- SUPARSITE PREMIUM: DATABASE SCHEMA MIGRATION SCRIPT FOR SUPABASE
-- ====================================================================
-- Go to your Supabase Dashboard -> SQL Editor, paste this code, and run it!
-- ====================================================================

-- 1. CREATE LEADS (OFFERS) TABLE
CREATE TABLE IF NOT EXISTS leads (
    id BIGINT PRIMARY KEY, -- Using JS Date.now() timestamp as unique ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    timestamp TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    description TEXT NOT NULL,
    preferred_contact TEXT,
    selected_features JSONB DEFAULT '[]'::jsonb,
    total_price NUMERIC DEFAULT 2000,
    estimated_delivery TEXT DEFAULT '5-7 Days',
    status TEXT DEFAULT 'new' NOT NULL, -- CRM Lead Stages: 'new', 'contacted', 'proposal_sent', 'won', 'completed'
    notes TEXT DEFAULT '' NOT NULL      -- CRM Admin Notes
);

-- Create index on status for fast CRM searches
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 2. CREATE FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT PRIMARY KEY, -- Using JS Date.now() timestamp as unique ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    timestamp TEXT NOT NULL,
    name TEXT NOT NULL,
    feedback TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    show_on_site BOOLEAN DEFAULT false NOT NULL
);

-- Create index on show_on_site for fast public review queries
CREATE INDEX IF NOT EXISTS idx_feedback_show_on_site ON feedback(show_on_site) WHERE show_on_site = true;

-- 3. CREATE TEMPLATES TABLE (CMS FEATURE)
CREATE TABLE IF NOT EXISTS templates (
    id BIGINT PRIMARY KEY, -- Using JS Date.now() or custom id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    cat TEXT NOT NULL,
    color TEXT DEFAULT 'from-gray-700 to-gray-900',
    "desc" TEXT NOT NULL,
    image TEXT,
    visitors TEXT DEFAULT '5K+',
    conversion TEXT DEFAULT '4.0%',
    tech TEXT[] DEFAULT '{}'::text[],
    sub_demos JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_templates_cat ON templates(cat);

-- ====================================================================
-- ✓ Database setup completed successfully!
-- Now, copy your Supabase URL and Service Key into your devsite/.env file:
--   SUPABASE_URL=https://your-project-id.supabase.co
--   SUPABASE_KEY=your-supabase-service-role-key
-- ====================================================================
