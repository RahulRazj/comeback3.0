'use client';

import { useState } from 'react';
import { Inbox, RotateCw, Search } from 'lucide-react';
import type { BacklogEntry } from '@/lib/backlog';
import type { PillarType, Topic, TopicStatus } from '@/types';

interface BacklogViewProps {
  entries: BacklogEntry[];
  onOpenTopic: (topic: Topic) => void;
  onUpdateStatus: (id: string, status: TopicStatus) => Promise<void>;
  onMarkRevision: (id: string) => Promise<void>;
}

const pillarLabels: Record<PillarType, string> = {
  dsa: 'DSA',
  system_design: 'System Design',
  backend: 'Backend',
  ai_agentic: 'AI & Agentic',
};

export function BacklogView({ entries, onOpenTopic, onUpdateStatus, onMarkRevision }: BacklogViewProps) {
  const [search, setSearch] = useState('');
  const [pillar, setPillar] = useState<PillarType | 'all'>('all');
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const needle = search.toLowerCase().trim();
  const filteredEntries = entries.filter(({ topic }) =>
    (pillar === 'all' || topic.pillar === pillar) &&
    (!needle || [topic.title, topic.category, topic.summary].some((text) => text.toLowerCase().includes(needle)))
  );

  const save = async (id: string, action: () => Promise<void>) => {
    setSavingIds((previous) => [...previous, id]);
    setError(null);
    try {
      await action();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save. Please try again.');
    } finally {
      setSavingIds((previous) => previous.filter((topicId) => topicId !== id));
    }
  };

  return (
    <section className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Inbox className="w-5 h-5 text-rose-300" /> Backlog
        </h2>
        <span className="text-xs font-mono text-rose-300">{entries.length} overdue</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            aria-label="Search backlog"
            placeholder="Search backlog..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs text-white"
          />
        </div>
        <select
          aria-label="Filter backlog by pillar"
          value={pillar}
          onChange={(event) => setPillar(event.target.value as PillarType | 'all')}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
        >
          <option value="all">All pillars</option>
          {Object.entries(pillarLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
      {filteredEntries.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {entries.length === 0 ? 'No overdue topics.' : 'No topics match these filters.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs text-left">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 pr-4 font-medium">Question / Topic</th>
                <th className="py-3 pr-4 font-medium">Scheduled</th>
                <th className="py-3 pr-4 font-medium">Overdue</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 font-medium">Revision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEntries.map(({ topic, scheduledDate, daysOverdue }) => {
                const isDue = Boolean(topic.next_review_at && new Date(topic.next_review_at).getTime() <= Date.now());
                const saving = savingIds.includes(topic.id);
                return (
                  <tr key={topic.id} className="hover:bg-slate-900/50">
                    <td className="py-4 pr-4 max-w-sm">
                      <button onClick={() => onOpenTopic(topic)} className="text-left font-semibold text-white hover:text-emerald-300 break-words">
                        {topic.title}
                      </button>
                      <p className="text-slate-400 mt-1">{pillarLabels[topic.pillar]} / {topic.category}</p>
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap text-slate-300">
                      <time dateTime={scheduledDate}>{scheduledDate}</time>
                      <p className="text-slate-500 mt-1">Day {topic.day_target}</p>
                    </td>
                    <td className="py-4 pr-4 text-rose-300 whitespace-nowrap">{daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}</td>
                    <td className="py-4 pr-4">
                      <select
                        aria-label={`Status for ${topic.title}`}
                        value={topic.status}
                        disabled={saving}
                        onChange={(event) => void save(topic.id, () => onUpdateStatus(topic.id, event.target.value as TopicStatus))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="mastered">Mastered</option>
                      </select>
                    </td>
                    <td className="py-4">
                      <button
                        title={isDue ? 'Due for revision' : 'Mark for revision'}
                        aria-label={isDue ? 'Due for revision' : `Mark ${topic.title} for revision`}
                        disabled={saving || isDue}
                        onClick={() => void save(topic.id, () => onMarkRevision(topic.id))}
                        className="p-2 rounded-lg border border-slate-800 text-rose-300 hover:bg-slate-800 disabled:opacity-50"
                      >
                        <RotateCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}