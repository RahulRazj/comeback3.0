const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Please set SUPABASE_URL and SUPABASE_SECRET_KEY in your environment or .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

// Read SEED_TOPICS from seed-data.ts
const seedDataContent = fs.readFileSync(path.join(__dirname, '../src/lib/seed-data.ts'), 'utf-8');
const jsonMatch = seedDataContent.match(/export const SEED_TOPICS: SeedTopic\[\] = (\[[\s\S]*\]);/);
if (!jsonMatch) {
  console.error('Could not parse SEED_TOPICS from seed-data.ts');
  process.exit(1);
}
const topics = JSON.parse(jsonMatch[1]);

async function seed() {
  console.log(`Starting Supabase direct seed with ${topics.length} topics...`);

  // 1. Seed app_settings
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { error: settingsErr } = await supabase.from('app_settings').upsert([
    { key: 'start_date', value: tomorrow },
    { key: 'target_days', value: '90' },
    { key: 'daily_target_topics', value: '3' },
  ]);

  if (settingsErr) {
    console.error('Failed to seed app_settings:', settingsErr.message);
    if (settingsErr.message.includes('relation "public.app_settings" does not exist')) {
      console.log('\n⚠️ Please run the CREATE TABLE SQL script in Supabase SQL editor first!\n');
    }
    return;
  }
  console.log('✅ app_settings seeded (Start Date = Tomorrow, Day 0 Kickoff).');

  // 2. Batch seed topics (chunks of 40)
  const chunkSize = 40;
  for (let i = 0; i < topics.length; i += chunkSize) {
    const chunk = topics.slice(i, i + chunkSize).map(t => ({
      id: t.id,
      pillar: t.pillar,
      category: t.category,
      title: t.title,
      slug: t.slug,
      difficulty: t.difficulty,
      priority: t.priority || 1,
      status: 'pending',
      confidence: 1,
      day_target: t.day_target || 1,
      external_url: t.external_url || null,
      summary: t.summary || '',
      key_intuition: t.key_intuition || '',
      pitfalls: t.pitfalls || '',
      notes: t.notes || '',
      code_snippet: t.code_snippet || null,
      time_complexity: t.time_complexity || null,
      space_complexity: t.space_complexity || null,
      box: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error: topicsErr } = await supabase.from('topics').upsert(chunk);
    if (topicsErr) {
      console.error(`Error seeding chunk ${i} - ${i + chunk.length}:`, topicsErr.message);
      return;
    }
    console.log(`✅ Seeded topics ${i + 1} to ${Math.min(i + chunkSize, topics.length)} / ${topics.length}`);
  }

  console.log('\n🎉 All 157 topics successfully seeded into Supabase!');
}

seed();
