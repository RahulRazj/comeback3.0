'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { PillarType, Difficulty, Topic } from '@/types';

interface NewTopicModalProps {
  isOpen: boolean;
  defaultPillar?: PillarType;
  onClose: () => void;
  onCreateTopic: (topic: Partial<Topic> & { title: string; pillar: PillarType; category: string }) => Promise<void>;
}

export function NewTopicModal({
  isOpen,
  defaultPillar = 'dsa',
  onClose,
  onCreateTopic,
}: NewTopicModalProps) {
  const [pillar, setPillar] = useState<PillarType>(defaultPillar);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [dayTarget, setDayTarget] = useState(26);
  const [externalUrl, setExternalUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [keyIntuition, setKeyIntuition] = useState('');
  const [pitfalls, setPitfalls] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;

    setIsSubmitting(true);
    try {
      await onCreateTopic({
        title,
        pillar,
        category,
        difficulty,
        day_target: Number(dayTarget),
        external_url: externalUrl || null,
        summary,
        key_intuition: keyIntuition,
        pitfalls,
        code_snippet: codeSnippet || null,
        notes: `### ${title}\n- Added to custom curriculum.\n- Category: ${category}`,
        priority: pillar === 'dsa' ? 1 : pillar === 'system_design' ? 2 : 3,
        status: 'pending',
        confidence: 0,
        box: 1,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/80 bg-[#0f121a] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0c0e15] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Add New Topic / Problem
              </h2>
              <p className="text-xs text-slate-400">
                Extend your 90-day learning curriculum with persistent storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Pillar Selector */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1.5">
              Curriculum Pillar *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPillar('dsa')}
                className={`py-2 rounded-xl border text-center transition-all ${
                  pillar === 'dsa'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                DSA (LeetCode)
              </button>
              <button
                type="button"
                onClick={() => setPillar('system_design')}
                className={`py-2 rounded-xl border text-center transition-all ${
                  pillar === 'system_design'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                System Design
              </button>
              <button
                type="button"
                onClick={() => setPillar('backend')}
                className={`py-2 rounded-xl border text-center transition-all ${
                  pillar === 'backend'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                Backend Engineering
              </button>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                Title / Problem Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Subarray Sum Equals K"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                Category / Pattern *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Prefix Sum / Sliding Window"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          {/* Difficulty & Target Day */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                Target Curriculum Day (1-90)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={dayTarget}
                onChange={(e) => setDayTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                External URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://leetcode.com/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Core Concept Summary
            </label>
            <input
              type="text"
              placeholder="Crisp 1-line definition of the problem or architecture"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
            />
          </div>

          {/* Key Intuition */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Key Intuition (&quot;Aha!&quot; Moment)
            </label>
            <textarea
              rows={2}
              placeholder="Crucial pattern recognition, time/space trade-off, or invariant..."
              value={keyIntuition}
              onChange={(e) => setKeyIntuition(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
            />
          </div>

          {/* Pitfalls */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Pitfalls & Edge Cases
            </label>
            <input
              type="text"
              placeholder="Common traps, integer overflow, empty inputs..."
              value={pitfalls}
              onChange={(e) => setPitfalls(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
            />
          </div>

          {/* Code Snippet */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Code Snippet / Reference Diagram
            </label>
            <textarea
              rows={4}
              placeholder="TypeScript / Python code or ASCII diagram..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Add to Curriculum'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
