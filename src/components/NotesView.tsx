'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Save,
  Check,
  Copy,
  Sparkles,
  AlertTriangle,
  Code2,
  ExternalLink,
  Edit3,
  BookOpen,
} from 'lucide-react';
import { Topic, PillarType } from '@/types';

interface NotesViewProps {
  topics: Topic[];
  onSaveNotes: (topicId: string, notes: string, intuition: string, pitfalls: string) => Promise<void>;
}

export function NotesView({ topics, onSaveNotes }: NotesViewProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.id || '');
  const [pillarFilter, setPillarFilter] = useState<'ALL' | PillarType>('ALL');
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  // Local edit states
  const [editNotes, setEditNotes] = useState(activeTopic?.notes || '');
  const [editIntuition, setEditIntuition] = useState(activeTopic?.key_intuition || '');
  const [editPitfalls, setEditPitfalls] = useState(activeTopic?.pitfalls || '');

  const filteredTopics = topics.filter((t) => {
    if (pillarFilter !== 'ALL' && t.pillar !== pillarFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectTopic = (t: Topic) => {
    setSelectedTopicId(t.id);
    setEditNotes(t.notes || '');
    setEditIntuition(t.key_intuition || '');
    setEditPitfalls(t.pitfalls || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!activeTopic) return;
    await onSaveNotes(activeTopic.id, editNotes, editIntuition, editPitfalls);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    setIsEditing(false);
  };

  const handleCopyCode = () => {
    if (activeTopic?.code_snippet) {
      navigator.clipboard.writeText(activeTopic.code_snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Topic Selector Pane */}
        <div className="w-80 flex-shrink-0 flex flex-col p-4 rounded-2xl border border-slate-800/90 bg-[#0c0e15] shadow-lg">
          {/* Header & Pillar Filter */}
          <div className="space-y-3 pb-3 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Notes Library
              </h2>
              <span className="text-[10px] font-mono text-slate-500">
                {filteredTopics.length} topics
              </span>
            </div>

            {/* Pillar Tabs */}
            <div className="flex rounded-lg bg-slate-900 p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setPillarFilter('ALL')}
                className={`flex-1 py-1 rounded text-center transition-all ${
                  pillarFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPillarFilter('dsa')}
                className={`flex-1 py-1 rounded text-center transition-all ${
                  pillarFilter === 'dsa' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
                }`}
              >
                DSA
              </button>
              <button
                onClick={() => setPillarFilter('system_design')}
                className={`flex-1 py-1 rounded text-center transition-all ${
                  pillarFilter === 'system_design' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400'
                }`}
              >
                Sys
              </button>
              <button
                onClick={() => setPillarFilter('backend')}
                className={`flex-1 py-1 rounded text-center transition-all ${
                  pillarFilter === 'backend' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
                }`}
              >
                BE
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg text-xs bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>

          {/* Topics List */}
          <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 pr-1">
            {filteredTopics.map((topic) => {
              const isSelected = activeTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'border-indigo-500/50 bg-indigo-950/20 text-white'
                      : 'border-transparent hover:border-slate-800 hover:bg-slate-900/50 text-slate-400'
                  }`}
                >
                  <div className="font-semibold truncate">{topic.title}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                    <span className="capitalize">{topic.pillar.replace('_', ' ')}</span>
                    <span>{topic.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Rich Notes Viewer / Editor */}
        <div className="flex-1 flex flex-col p-6 rounded-2xl border border-slate-800/90 bg-[#0c0e15] shadow-xl overflow-y-auto">
          {activeTopic ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {activeTopic.pillar.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• {activeTopic.category}</span>
                    <span className="text-xs font-mono text-slate-400">• Box {activeTopic.box}</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
                    {activeTopic.title}
                    {activeTopic.external_url && (
                      <a
                        href={activeTopic.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Open external problem link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Notes</span>
                    </button>
                  )}
                  {savedSuccess && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                  Core Summary
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeTopic.summary}
                </p>
              </div>

              {/* Key Intuition Callout */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-transparent">
                <div className="text-xs font-mono uppercase text-indigo-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Key Intuition & Mental Model
                </div>
                {isEditing ? (
                  <textarea
                    value={editIntuition}
                    onChange={(e) => setEditIntuition(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-lg text-xs bg-black/60 border border-indigo-500/40 text-white focus:outline-none"
                  />
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeTopic.key_intuition}
                  </p>
                )}
              </div>

              {/* Pitfalls to Avoid */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-orange-950/10 to-transparent">
                <div className="text-xs font-mono uppercase text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Pitfalls & Edge Cases
                </div>
                {isEditing ? (
                  <textarea
                    value={editPitfalls}
                    onChange={(e) => setEditPitfalls(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-lg text-xs bg-black/60 border border-amber-500/40 text-white focus:outline-none"
                  />
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeTopic.pitfalls || 'No specific edge cases noted.'}
                  </p>
                )}
              </div>

              {/* Reference Code / Architecture Snippet */}
              {activeTopic.code_snippet && (
                <div className="p-4 rounded-xl border border-slate-800 bg-[#07080d]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <div className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      Reference Implementation / Blueprint
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto p-2 bg-black/40 rounded-lg">
                    <code>{activeTopic.code_snippet}</code>
                  </pre>
                </div>
              )}

              {/* Detailed Markdown Notes */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Personal Engineering Notes
                </div>
                {isEditing ? (
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={8}
                    className="w-full p-3 rounded-xl text-xs bg-black/60 border border-slate-700 text-white font-mono focus:outline-none focus:border-slate-500"
                    placeholder="Write detailed notes, trade-offs, diagram links, or interview reflections..."
                  />
                ) : (
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/20 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {activeTopic.notes || 'No detailed notes logged yet. Click "Edit Notes" to add your findings!'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a topic on the left to inspect and edit notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
