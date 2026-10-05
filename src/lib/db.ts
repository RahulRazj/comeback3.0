import fs from 'fs';
import path from 'path';
import { SEED_TOPICS, SeedTopic } from './seed-data';
import { AI_SEED_TOPICS } from './ai-seed-data';
import {
  Topic,
  ReviewLog,
  DailyLog,
  PillarType,
  TopicStatus,
  Difficulty,
  DashboardMetrics,
  PillarStats,
  ReviewOutcome,
} from '@/types';

// ==========================================
// FILE-BASED STORE (data/progress.json)
// ==========================================

interface Store {
  settings: Record<string, string>;
  topics: Topic[];
  reviews: ReviewLog[];
  daily_logs: DailyLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'progress.json');

// Survives hot reloads; invalidated when the file changes on disk
declare global {
  // eslint-disable-next-line no-var
  var __progress_cache: { store: Store; mtimeMs: number } | undefined;
}

function seedToTopic(t: SeedTopic, createdIso: string): Topic {
  return {
    id: t.id,
    pillar: t.pillar,
    category: t.category,
    title: t.title,
    slug: t.slug,
    difficulty: t.difficulty,
    priority: t.priority,
    status: 'pending',
    confidence: 1,
    day_target: t.day_target,
    external_url: t.external_url || null,
    summary: t.summary,
    key_intuition: t.key_intuition,
    pitfalls: t.pitfalls,
    notes: t.notes,
    code_snippet: t.code_snippet || null,
    time_complexity: t.time_complexity || null,
    space_complexity: t.space_complexity || null,
    box: 1,
    last_reviewed_at: null,
    next_review_at: null,
    times_reviewed: 0,
    completed_at: null,
    created_at: createdIso,
    updated_at: createdIso,
  };
}

function buildSeedStore(): Store {
  const startDate = new Date().toISOString().split('T')[0];
  const createdIso = new Date().toISOString();

  const topics: Topic[] = [...SEED_TOPICS, ...AI_SEED_TOPICS].map(t => seedToTopic(t, createdIso));

  return {
    // Journey starts on the day the store is created (Day 1)
    settings: {
      start_date: startDate,
      target_days: '90',
      daily_target_topics: '3',
      seeded_ai_agentic: '1',
    },
    topics,
    reviews: [],
    daily_logs: [],
  };
}

function writeStore(store: Store) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // Write to a temp file then rename so a crash never leaves a half-written file
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
  global.__progress_cache = { store, mtimeMs: fs.statSync(DATA_FILE).mtimeMs };
}

function loadStore(): Store {
  if (fs.existsSync(DATA_FILE)) {
    const mtimeMs = fs.statSync(DATA_FILE).mtimeMs;
    let store: Store;
    if (global.__progress_cache && global.__progress_cache.mtimeMs === mtimeMs) {
      store = global.__progress_cache.store;
    } else {
      store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Store;
      global.__progress_cache = { store, mtimeMs };
    }

    // One-time migration: add the AI & Agentic pillar to files created before it existed
    if (!store.settings.seeded_ai_agentic) {
      const existing = new Set(store.topics.map(t => t.id));
      const createdIso = new Date().toISOString();
      for (const t of AI_SEED_TOPICS) {
        if (!existing.has(t.id)) store.topics.push(seedToTopic(t, createdIso));
      }
      store.settings.seeded_ai_agentic = '1';
      writeStore(store);
    }
    return store;
  }

  const store = buildSeedStore();
  writeStore(store);
  return store;
}

// Leitner intervals in days: Box 1: 1d, Box 2: 3d, Box 3: 7d, Box 4: 14d, Box 5: 30d
export const LEITNER_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

function calculateNextReview(fromTimestamp: number, box: number): string {
  const safeBox = Math.min(Math.max(box, 1), 5);
  const intervalDays = LEITNER_INTERVALS_DAYS[safeBox];
  const nextMs = fromTimestamp + intervalDays * 24 * 60 * 60 * 1000;
  return new Date(nextMs).toISOString();
}

function sortTopics(topics: Topic[]): Topic[] {
  return topics.slice().sort((a, b) => (a.priority - b.priority) || (a.day_target - b.day_target));
}

function bumpDailyLog(
  store: Store,
  delta: { completed?: number; reviewed?: number; minutes: number }
) {
  const today = new Date().toISOString().split('T')[0];
  let log = store.daily_logs.find(l => l.date === today);
  if (!log) {
    log = {
      id: `log-${today}`,
      date: today,
      topics_completed_count: 0,
      topics_reviewed_count: 0,
      study_time_minutes: 0,
      streak_count: 1,
      created_at: new Date().toISOString(),
    };
    store.daily_logs.push(log);
  }
  log.topics_completed_count += delta.completed ?? 0;
  log.topics_reviewed_count += delta.reviewed ?? 0;
  log.study_time_minutes += delta.minutes;
}

// ==========================================
// EXPORTED REPOSITORY API METHODS
// ==========================================

export async function getTopics(filters?: {
  pillar?: PillarType;
  category?: string;
  status?: TopicStatus;
  difficulty?: Difficulty;
  search?: string;
  dueOnly?: boolean;
}): Promise<Topic[]> {
  const store = loadStore();
  const nowIso = new Date().toISOString();
  const needle = filters?.search?.toLowerCase();

  const result = store.topics.filter(t => {
    if (filters?.pillar && t.pillar !== filters.pillar) return false;
    if (filters?.category && t.category !== filters.category) return false;
    if (filters?.status && t.status !== filters.status) return false;
    if (filters?.difficulty && t.difficulty !== filters.difficulty) return false;
    if (filters?.dueOnly && !(t.next_review_at && t.next_review_at <= nowIso)) return false;
    if (needle) {
      const haystack = [t.title, t.summary, t.category, t.key_intuition, t.notes]
        .join('\n')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  return sortTopics(result);
}

export async function getTopicById(id: string): Promise<Topic | undefined> {
  return loadStore().topics.find(t => t.id === id);
}

export async function createTopic(
  topic: Partial<Topic> & { title: string; pillar: PillarType; category: string }
): Promise<Topic> {
  const store = loadStore();
  const now = new Date().toISOString();
  const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = topic.id || `${topic.pillar}-${slug}-${Date.now().toString().slice(-4)}`;

  if (store.topics.some(t => t.id === id)) {
    throw new Error(`Topic with id ${id} already exists`);
  }

  const created: Topic = {
    id,
    pillar: topic.pillar,
    category: topic.category,
    title: topic.title,
    slug,
    difficulty: topic.difficulty || 'Medium',
    priority: topic.priority ?? 2,
    status: topic.status || 'pending',
    confidence: topic.confidence ?? 1,
    day_target: topic.day_target ?? 1,
    external_url: topic.external_url || null,
    summary: topic.summary || '',
    key_intuition: topic.key_intuition || '',
    pitfalls: topic.pitfalls || '',
    notes: topic.notes || '',
    code_snippet: topic.code_snippet || null,
    time_complexity: topic.time_complexity || null,
    space_complexity: topic.space_complexity || null,
    box: topic.box ?? 1,
    last_reviewed_at: null,
    next_review_at: null,
    times_reviewed: 0,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };

  store.topics.push(created);
  writeStore(store);
  return created;
}

export async function updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | undefined> {
  const store = loadStore();
  const current = store.topics.find(t => t.id === id);
  if (!current) return undefined;

  const now = new Date().toISOString();
  const wasCompleted = Boolean(current.completed_at);
  let completedAt = current.completed_at ?? null;

  if (
    (updates.status === 'completed' || updates.status === 'mastered') &&
    current.status !== 'completed' &&
    current.status !== 'mastered'
  ) {
    completedAt = now;
  } else if (updates.status === 'pending') {
    completedAt = null;
  }

  const updateableKeys: (keyof Topic)[] = [
    'pillar',
    'category',
    'title',
    'difficulty',
    'priority',
    'status',
    'confidence',
    'day_target',
    'external_url',
    'summary',
    'key_intuition',
    'pitfalls',
    'notes',
    'code_snippet',
    'time_complexity',
    'space_complexity',
    'box',
    'next_review_at',
    'last_reviewed_at',
  ];

  const target = current as unknown as Record<string, unknown>;
  for (const key of updateableKeys) {
    if (updates[key] !== undefined) {
      target[key] = updates[key];
    }
  }
  current.completed_at = completedAt;
  current.updated_at = now;

  if (completedAt && !wasCompleted) {
    bumpDailyLog(store, { completed: 1, minutes: 30 });
  }

  writeStore(store);
  return current;
}

export async function deleteTopic(id: string): Promise<boolean> {
  const store = loadStore();
  const index = store.topics.findIndex(t => t.id === id);
  if (index === -1) return false;

  store.topics.splice(index, 1);
  store.reviews = store.reviews.filter(r => r.topic_id !== id);
  writeStore(store);
  return true;
}

// Spaced Repetition Leitner Box execution
export async function recordTopicReview(
  topicId: string,
  confidence: number,
  outcome: ReviewOutcome,
  notes?: string
): Promise<{ topic: Topic; log: ReviewLog }> {
  const store = loadStore();
  const topic = store.topics.find(t => t.id === topicId);
  if (!topic) throw new Error(`Topic with id ${topicId} not found`);

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const boxBefore = topic.box;

  let nextBox = topic.box;
  if (outcome === 'remembered') {
    nextBox = Math.min(5, topic.box + 1);
  } else if (outcome === 'forgot') {
    nextBox = 1;
  } else if (outcome === 'struggled') {
    nextBox = Math.max(1, topic.box - 1);
  }

  const log: ReviewLog = {
    id: `rev-${topicId}-${nowMs}`,
    topic_id: topicId,
    topic_title: topic.title,
    pillar: topic.pillar,
    reviewed_at: nowIso,
    confidence_rating: confidence,
    outcome,
    box_before: boxBefore,
    box_after: nextBox,
    notes: notes || null,
  };
  store.reviews.push(log);

  let newStatus: TopicStatus = topic.status;
  if (newStatus === 'pending') newStatus = 'in_progress';
  if (nextBox >= 4 && confidence >= 4) newStatus = 'mastered';
  else if (newStatus !== 'mastered') newStatus = 'completed';

  topic.box = nextBox;
  topic.confidence = confidence;
  topic.last_reviewed_at = nowIso;
  topic.next_review_at = calculateNextReview(nowMs, nextBox);
  topic.times_reviewed += 1;
  topic.status = newStatus;
  topic.completed_at = topic.completed_at ?? nowIso;
  topic.updated_at = nowIso;

  bumpDailyLog(store, { reviewed: 1, minutes: 15 });
  writeStore(store);

  return { topic, log };
}

export async function getReviewHistory(limit = 20): Promise<ReviewLog[]> {
  return loadStore()
    .reviews.slice()
    .sort((a, b) => b.reviewed_at.localeCompare(a.reviewed_at))
    .slice(0, limit);
}

export async function logStudyTime(minutes: number): Promise<void> {
  const store = loadStore();
  bumpDailyLog(store, { minutes });
  writeStore(store);
}

// ==========================================
// DASHBOARD & ANALYTICS COMPUTATION
// ==========================================

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const store = loadStore();
  const now = new Date();
  const nowIso = now.toISOString();

  const startDateStr = store.settings.start_date || nowIso.split('T')[0];
  const targetDays = parseInt(store.settings.target_days || '90', 10);

  const startMs = new Date(startDateStr).getTime();
  const diffDays = Math.floor((now.getTime() - startMs) / (24 * 60 * 60 * 1000));
  // If start_date is tomorrow, elapsedDays is 0 (Day 0: Kickoff)
  const elapsedDays = diffDays < 0 ? 0 : Math.min(targetDays, diffDays + 1);
  const daysRemaining = Math.max(0, targetDays - elapsedDays);

  const allTopics = sortTopics(store.topics);
  const totalTopics = allTopics.length;
  const completedCount = allTopics.filter(t => t.status === 'completed' || t.status === 'mastered').length;
  const masteredCount = allTopics.filter(t => t.status === 'mastered').length;
  const remainingCount = totalTopics - completedCount;
  const overallPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const expectedCompletedByNow = elapsedDays > 0 ? Math.round((elapsedDays / targetDays) * totalTopics) : 0;
  let paceStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
  if (elapsedDays > 0) {
    if (completedCount >= expectedCompletedByNow + 2) paceStatus = 'ahead';
    else if (completedCount < expectedCompletedByNow - 2) paceStatus = 'behind';
  }

  const topicsNeededPerDay = daysRemaining > 0 ? Number((remainingCount / daysRemaining).toFixed(1)) : 0;

  const buildPillarStats = (pillar: PillarType, title: string): PillarStats => {
    const pTopics = allTopics.filter(t => t.pillar === pillar);
    const total = pTopics.length;
    const completed = pTopics.filter(t => t.status === 'completed' || t.status === 'mastered').length;
    return {
      pillar,
      title,
      total,
      completed,
      inProgress: pTopics.filter(t => t.status === 'in_progress').length,
      mastered: pTopics.filter(t => t.status === 'mastered').length,
      pending: pTopics.filter(t => t.status === 'pending').length,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      dueForReview: pTopics.filter(t => t.next_review_at && t.next_review_at <= nowIso).length,
    };
  };

  const pillars = {
    dsa: buildPillarStats('dsa', 'DSA (LeetCode)'),
    system_design: buildPillarStats('system_design', 'System Design'),
    backend: buildPillarStats('backend', 'Backend (.NET SDE2)'),
    ai_agentic: buildPillarStats('ai_agentic', 'AI & Agentic Full-Stack'),
  };

  const dueForReview = allTopics
    .filter(t => t.next_review_at && t.next_review_at <= nowIso)
    .sort((a, b) => (a.priority - b.priority) || (new Date(a.next_review_at!).getTime() - new Date(b.next_review_at!).getTime()));

  // Today's Focus: in-progress topics plus pending topics near the current curriculum day
  const targetDayBenchmark = elapsedDays === 0 ? 1 : elapsedDays;
  const todaysFocusCandidates = allTopics.filter(
    t => t.status === 'in_progress' || (t.status === 'pending' && t.day_target <= targetDayBenchmark + 3)
  );
  const todaysFocus = (todaysFocusCandidates.length > 0
    ? todaysFocusCandidates
    : allTopics.filter(t => t.status === 'pending')
  ).slice(0, 3);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weeklyCompletedCount = allTopics.filter(t => t.completed_at && t.completed_at >= sevenDaysAgo).length;

  const todayStr = nowIso.split('T')[0];
  const todayLog = store.daily_logs.find(l => l.date === todayStr);
  const todayCompletedCount = todayLog ? todayLog.topics_completed_count : 0;

  const recentLogs = store.daily_logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 40);

  let currentStreak = 0;
  let checkDate = new Date();
  for (let i = 0; i < 40; i++) {
    const curDateStr = checkDate.toISOString().split('T')[0];
    const log = recentLogs.find(l => l.date === curDateStr);
    if (log && (log.topics_completed_count > 0 || log.topics_reviewed_count > 0 || log.study_time_minutes > 0)) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      if (i === 0) {
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
        continue;
      }
      break;
    }
  }

  let longestStreak = currentStreak;
  let running = 0;
  for (const log of recentLogs.slice().reverse()) {
    if (log.topics_completed_count > 0 || log.topics_reviewed_count > 0) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  const recentCompleted = allTopics
    .filter(t => t.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5);

  const upcomingRevisions: DashboardMetrics['upcomingRevisions'] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 1; i <= 7; i++) {
    const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayLabel = i === 1 ? 'Tomorrow' : `${dayNames[targetDate.getDay()]} (${targetDate.getMonth() + 1}/${targetDate.getDate()})`;

    const matchingTopics = allTopics
      .filter(t => t.next_review_at && t.next_review_at.split('T')[0] === dateStr)
      .map(t => ({ id: t.id, title: t.title, pillar: t.pillar, box: t.box }));

    upcomingRevisions.push({ date: dateStr, dayLabel, topics: matchingTopics });
  }

  const logsMap = new Map(recentLogs.map(l => [l.date, l]));
  const heatmapData: { date: string; count: number; minutes: number }[] = [];
  for (let d = 89; d >= 0; d--) {
    const ds = new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const log = logsMap.get(ds);
    heatmapData.push({
      date: ds,
      count: log ? log.topics_completed_count + log.topics_reviewed_count : 0,
      minutes: log ? log.study_time_minutes : 0,
    });
  }

  return {
    totalTopics,
    completedTopics: completedCount,
    remainingTopics: remainingCount,
    masteredTopics: masteredCount,
    overallPercentage,
    currentStreak,
    longestStreak,
    todayCompletedCount,
    weeklyCompletedCount,
    dueForReviewCount: dueForReview.length,
    currentDay: elapsedDays,
    daysRemaining,
    expectedCompletedByNow,
    paceStatus,
    topicsNeededPerDay,
    pillars,
    todaysFocus,
    dueForReview,
    upcomingRevisions,
    recentCompleted,
    heatmapData,
  };
}

export async function resetDatabase(): Promise<void> {
  writeStore(buildSeedStore());
}
