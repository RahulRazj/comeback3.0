const fs = require('fs');
const path = require('path');
const { dsaPhase1, dsaPhase2, dsaPhase3, dsaPhase4, dsaPhase5, convertDsa } = require('./generate-seed');

// 1. Compile DSA
const allDsaRaw = [...dsaPhase1, ...dsaPhase2, ...dsaPhase3, ...dsaPhase4, ...dsaPhase5];
const dsaTopics = allDsaRaw.map((item, idx) => {
  const day = Math.min(90, Math.floor((idx / allDsaRaw.length) * 85) + 1);
  return convertDsa(item, day);
});

// 2. Read System Design and Backend topics from compile-final-seed.js
const compileSeedContent = fs.readFileSync(path.join(__dirname, 'compile-final-seed.js'), 'utf-8');

// Extract all topics by evaluating compile-final-seed.js without writing to disk
// Or simply extract SEED_TOPICS from src/lib/seed-data.ts by stripping the TS import
const seedDataContent = fs.readFileSync(path.join(__dirname, '../src/lib/seed-data.ts'), 'utf-8');
const jsonMatch = seedDataContent.match(/export const SEED_TOPICS: SeedTopic\[\] = (\[[\s\S]*\]);/);

if (!jsonMatch) {
  console.error('Could not find SEED_TOPICS in seed-data.ts');
  process.exit(1);
}

const allTopics = JSON.parse(jsonMatch[1]);
console.log(`Loaded ${allTopics.length} topics for Supabase SQL export.`);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = `-- =========================================================================
-- 90-Day Interview Command Center - Supabase PostgreSQL Schema & Pre-Seed
-- =========================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It will create all tables, indexes, security policies, and pre-seed all 157 topics.

-- 1. App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. Topics Table
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  pillar TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  confidence INTEGER DEFAULT 1,
  day_target INTEGER DEFAULT 1,
  external_url TEXT,
  summary TEXT,
  key_intuition TEXT,
  pitfalls TEXT,
  notes TEXT,
  code_snippet TEXT,
  time_complexity TEXT,
  space_complexity TEXT,
  box INTEGER DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  times_reviewed INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_pillar ON topics(pillar);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_next_review ON topics(next_review_at);

-- 3. Reviews Spaced Repetition Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ NOT NULL,
  confidence_rating INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  box_before INTEGER NOT NULL,
  box_after INTEGER NOT NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_reviews_topic ON reviews(topic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(reviewed_at);

-- 4. Daily Logs Table
CREATE TABLE IF NOT EXISTS daily_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  topics_completed_count INTEGER DEFAULT 0,
  topics_reviewed_count INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  focus_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);

-- Enable Row Level Security (RLS) with full access policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on app_settings') THEN
    CREATE POLICY "Allow all operations on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on topics') THEN
    CREATE POLICY "Allow all operations on topics" ON topics FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on reviews') THEN
    CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on daily_logs') THEN
    CREATE POLICY "Allow all operations on daily_logs" ON daily_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Day 0 App Settings
INSERT INTO app_settings (key, value) VALUES
  ('start_date', '2026-09-29'),
  ('target_days', '90'),
  ('daily_target_topics', '3')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. Pre-seed All 157 Topics
INSERT INTO topics (
  id, pillar, category, title, slug, difficulty, priority, status, confidence,
  day_target, external_url, summary, key_intuition, pitfalls, notes, code_snippet,
  time_complexity, space_complexity, box, created_at, updated_at
) VALUES
`;

const valueRows = allTopics.map((t) => {
  return `(
  ${escapeSql(t.id)},
  ${escapeSql(t.pillar)},
  ${escapeSql(t.category)},
  ${escapeSql(t.title)},
  ${escapeSql(t.slug)},
  ${escapeSql(t.difficulty)},
  ${t.priority || 1},
  ${escapeSql(t.status || 'pending')},
  ${t.confidence || 1},
  ${t.day_target || 1},
  ${escapeSql(t.external_url)},
  ${escapeSql(t.summary)},
  ${escapeSql(t.key_intuition)},
  ${escapeSql(t.pitfalls)},
  ${escapeSql(t.notes)},
  ${escapeSql(t.code_snippet)},
  ${escapeSql(t.time_complexity)},
  ${escapeSql(t.space_complexity)},
  ${t.box || 1},
  NOW(),
  NOW()
)`;
});

sql += valueRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n';

const outputPath = path.join(__dirname, '../supabase-setup.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`Successfully generated ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
