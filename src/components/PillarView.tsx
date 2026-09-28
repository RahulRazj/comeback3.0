'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronDown,
  RotateCw,
  Plus,
  BookOpen,
  Check,
  MessageSquare,
  Star,
  Send,
} from 'lucide-react';
import { Topic, PillarType, TopicStatus, Difficulty, READINESS_LEVELS } from '@/types';
import { triggerConfetti } from '@/lib/utils';

interface PillarViewProps {
  pillar: PillarType;
  topics: Topic[];
  onOpenTopic: (topic: Topic) => void;
  onUpdateTopicStatus: (id: string, newStatus: TopicStatus) => Promise<void>;
  onUpdateConfidence: (id: string, confidence: number) => Promise<void>;
  onSaveNotes?: (id: string, notes: string, intuition: string, pitfalls: string) => Promise<void>;
  onOpenNewTopicModal: (defaultPillar: PillarType) => void;
}

export function PillarView({
  pillar,
  topics,
  onOpenTopic,
  onUpdateTopicStatus,
  onUpdateConfidence,
  onSaveNotes,
  onOpenNewTopicModal,
}: PillarViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [readinessFilter, setReadinessFilter] = useState('ALL');

  // Inline quick commenting state
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [quickCommentText, setQuickCommentText] = useState('');
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

  const pillarTitle =
    pillar === 'dsa'
      ? 'DSA (LeetCode)'
      : pillar === 'system_design'
      ? 'System Design'
      : 'Backend Engineering (.NET SDE2)';

  const pillarSubtitle =
    pillar === 'backend'
      ? 'Targeting SDE2 / Senior .NET Backend Roles (20-25+ LPA) — Core, Daily Work & Production Skills'
      : pillar === 'dsa'
      ? 'Highest Priority — Blind 75 / High-Yield Algorithms & Patterns'
      : 'Fundamental Scaling Blocks & High-Throughput Architecture Case Studies';

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    topics.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [topics]);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
      if (difficultyFilter !== 'ALL' && t.difficulty !== difficultyFilter) return false;
      if (priorityFilter !== 'ALL' && t.priority !== Number(priorityFilter)) return false;
      if (readinessFilter !== 'ALL' && t.confidence !== Number(readinessFilter)) return false;
      if (statusFilter === 'due') {
        if (!t.next_review_at) return false;
        return new Date(t.next_review_at).getTime() <= Date.now();
      }
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.key_intuition.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [topics, categoryFilter, difficultyFilter, statusFilter, priorityFilter, readinessFilter, search]);

  // Stats
  const total = topics.length;
  const completed = topics.filter((t) => t.status === 'completed' || t.status === 'mastered').length;
  const mastered = topics.filter((t) => t.status === 'mastered').length;
  const inProgress = topics.filter((t) => t.status === 'in_progress').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const cycleStatus = async (e: React.MouseEvent, topic: Topic) => {
    e.stopPropagation();
    let next: TopicStatus = 'in_progress';
    if (topic.status === 'pending') next = 'in_progress';
    else if (topic.status === 'in_progress') next = 'completed';
    else if (topic.status === 'completed') next = 'mastered';
    else next = 'pending';

    if (next === 'completed' || next === 'mastered') {
      triggerConfetti();
    }
    await onUpdateTopicStatus(topic.id, next);
  };

  const handleReadinessSelect = async (e: React.ChangeEvent<HTMLSelectElement>, topicId: string) => {
    e.stopPropagation();
    const newLevel = Number(e.target.value);
    await onUpdateConfidence(topicId, newLevel);
  };

  const handleSaveQuickComment = async (topic: Topic) => {
    if (!quickCommentText.trim() || !onSaveNotes) return;
    const updatedNotes = topic.notes
      ? `${topic.notes}\n\n**Comment (${new Date().toLocaleDateString()}):** ${quickCommentText}`
      : `**Comment (${new Date().toLocaleDateString()}):** ${quickCommentText}`;

    await onSaveNotes(topic.id, updatedNotes, topic.key_intuition, topic.pitfalls);
    setJustSavedId(topic.id);
    setQuickCommentText('');
    setActiveCommentId(null);
    setTimeout(() => setJustSavedId(null), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Stats */}
      <div className="p-5 rounded-2xl border border-slate-800/80 bg-[#0c0e15] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {pillar === 'backend' ? 'Target: SDE2 / Senior .NET (20-25+ LPA)' : pillar === 'dsa' ? 'Pillar 1 • Highest Priority' : 'Pillar 2 • Architecture'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Tick to complete • Choose readiness • Comment
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1.5">
              {pillarTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {pillarSubtitle}
            </p>
            <p className="text-xs text-emerald-400 font-mono mt-1">
              {completed} of {total} topics completed ({percentage}%) • {mastered} mastered
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenNewTopicModal(pillar)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Topic</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${pillarTitle} topics, concepts, code...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="1">⭐⭐⭐⭐⭐ Must Know (Daily Core)</option>
            <option value="2">⭐⭐⭐⭐ High Priority</option>
            <option value="3">⭐⭐⭐ Production Standard</option>
            <option value="4">⭐⭐ Good to Know</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Modules ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Readiness Level Filter */}
          <select
            value={readinessFilter}
            onChange={(e) => setReadinessFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Readiness Levels</option>
            {READINESS_LEVELS.map((r) => (
              <option key={r.level} value={r.level}>
                {r.badge} {r.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="mastered">Mastered</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="due">Due for Revision</option>
          </select>
        </div>
      </div>

      {/* Topics List Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0c0e15] overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono uppercase text-slate-500">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">Tick</span>
            <span>Skill / Problem Topic</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline">Module</span>
            <span className="w-40 text-center">Improvement Level</span>
            <span className="w-16 text-center">Actions</span>
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No topics match the selected search or filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredTopics.map((topic) => {
              const isDue = topic.next_review_at && new Date(topic.next_review_at).getTime() <= Date.now();
              const isCommenting = activeCommentId === topic.id;
              const currentReadiness = READINESS_LEVELS.find((r) => r.level === topic.confidence) || READINESS_LEVELS[0];

              const diffColor =
                topic.difficulty === 'Easy'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : topic.difficulty === 'Medium'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-rose-400 bg-rose-500/10';

              return (
                <div
                  key={topic.id}
                  className="px-5 py-3 hover:bg-slate-900/50 transition-colors group select-none space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Quick Tick Checkbox + Title */}
                    <div className="flex items-center gap-3 min-w-0 pr-4 flex-1">
                      <button
                        onClick={(e) => cycleStatus(e, topic)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
                        title={`Click to cycle status: ${topic.status}`}
                      >
                        {topic.status === 'mastered' ? (
                          <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-400/20" />
                        ) : topic.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                        ) : topic.status === 'in_progress' ? (
                          <Clock className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>

                      <div
                        className="min-w-0 cursor-pointer flex-1"
                        onClick={() => onOpenTopic(topic)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate ${
                              topic.status === 'completed' || topic.status === 'mastered'
                                ? 'text-slate-200'
                                : ''
                            }`}
                          >
                            {topic.title}
                          </span>

                          {topic.priority === 1 && (
                            <span className="text-[10px] text-amber-400 font-mono font-bold" title="Must-Know (Highest Priority)">
                              ⭐⭐⭐⭐⭐
                            </span>
                          )}

                          {topic.external_url && (
                            <a
                              href={topic.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-white transition-colors"
                              title="External documentation / link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {isDue && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              DUE
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {topic.summary || topic.key_intuition}
                        </p>
                      </div>
                    </div>

                    {/* Right: Module + Improvement Selector + Comment Button */}
                    <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                      <span className="hidden md:inline text-[11px] text-slate-400 truncate max-w-[140px] font-mono">
                        {topic.category.replace(/^[0-9]+\.\s*/, '')}
                      </span>

                      {/* Interactive Improvement / Readiness Selector */}
                      <div className="w-40" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={topic.confidence || 1}
                          onChange={(e) => handleReadinessSelect(e, topic.id)}
                          className={`w-full px-2 py-1 rounded-lg text-[11px] font-medium border focus:outline-none cursor-pointer ${currentReadiness.color}`}
                          title={currentReadiness.description}
                        >
                          {READINESS_LEVELS.map((r) => (
                            <option key={r.level} value={r.level} className="bg-[#121622] text-slate-200">
                              {r.badge} {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Comment Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCommentId(isCommenting ? null : topic.id);
                          setQuickCommentText('');
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isCommenting
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                        }`}
                        title="Add comment or interview reflection"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {justSavedId === topic.id && (
                        <span className="text-[11px] font-mono text-emerald-400 animate-fade-in">
                          Saved!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline Comment Field (When Toggled) */}
                  {isCommenting && (
                    <div
                      className="ml-10 p-3 rounded-xl border border-indigo-500/30 bg-slate-900/90 flex items-center gap-2 animate-in fade-in duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        placeholder="Add quick comment, interview notes, or reflection (e.g. 'Practiced Task.WhenAll with CancellationToken')..."
                        value={quickCommentText}
                        onChange={(e) => setQuickCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveQuickComment(topic);
                        }}
                        className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveQuickComment(topic)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 active:scale-95"
                      >
                        <Send className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
