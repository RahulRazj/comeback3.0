'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { Topic, DashboardMetrics } from '@/types';

interface CalendarViewProps {
  topics: Topic[];
  metrics: DashboardMetrics | null;
  onOpenTopic: (topic: Topic) => void;
}

export function CalendarView({ topics, metrics, onOpenTopic }: CalendarViewProps) {
  const currentDay = metrics?.currentDay || 1;
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);

  // Group topics by day_target (1 to 90)
  const dayMap = new Map<number, Topic[]>();
  topics.forEach((t) => {
    const d = t.day_target || 1;
    if (!dayMap.has(d)) dayMap.set(d, []);
    dayMap.get(d)!.push(t);
  });

  const selectedTopics = dayMap.get(selectedDay) || [];

  // Group 90 days into 13 weeks
  const weeks = Array.from({ length: 13 }, (_, wIdx) => {
    const startDay = wIdx * 7 + 1;
    const endDay = Math.min(startDay + 6, 90);
    const daysInWeek = Array.from({ length: endDay - startDay + 1 }, (_, dIdx) => startDay + dIdx);
    return {
      weekNum: wIdx + 1,
      startDay,
      endDay,
      days: daysInWeek,
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800/80 bg-[#0c0e15] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              90-Day Trajectory
            </span>
            <span className="text-xs text-slate-400 font-mono">13 Weeks Mastery Program</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1.5">
            Curriculum Calendar & Daily Milestones
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Current Day: <strong className="text-indigo-300 font-mono">Day {currentDay}</strong> of 90 • Tracking daily goal of 3 topics/day
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold">
            Viewing Day {selectedDay}
          </span>
          <button
            onClick={() => setSelectedDay(Math.min(90, selectedDay + 1))}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDay(currentDay)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
          >
            Jump to Today
          </button>
        </div>
      </div>

      {/* Main Grid: 90 Days Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 90 Day Calendar Blocks */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>90-Day Roadmap (Select any day to inspect)</span>
            <span className="font-mono text-[11px] text-slate-500">Day 1 → Day 90</span>
          </h3>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {weeks.map((week) => (
              <div key={week.weekNum} className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 font-medium">
                  Week {week.weekNum} (Days {week.startDay} - {week.endDay})
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {week.days.map((day) => {
                    const dayTopics = dayMap.get(day) || [];
                    const allDone = dayTopics.length > 0 && dayTopics.every((t) => t.status === 'completed' || t.status === 'mastered');
                    const hasItems = dayTopics.length > 0;
                    const isToday = day === currentDay;
                    const isSelected = day === selectedDay;

                    let dayStyle = 'border-slate-800 bg-slate-900/40 text-slate-400';
                    if (allDone) {
                      dayStyle = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
                    } else if (day < currentDay && hasItems) {
                      dayStyle = 'border-amber-500/30 bg-amber-950/10 text-amber-300';
                    } else if (isToday) {
                      dayStyle = 'border-indigo-500 bg-indigo-950/30 text-white shadow-md shadow-indigo-500/20';
                    }

                    if (isSelected) {
                      dayStyle += ' ring-2 ring-indigo-400 font-bold';
                    }

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`p-2.5 rounded-xl border text-center transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-between ${dayStyle}`}
                      >
                        <span className="text-[11px] font-mono">D{day}</span>
                        {hasItems ? (
                          <span className="text-[9px] font-mono mt-1 px-1 rounded bg-black/40">
                            {dayTopics.length} top.
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-600 mt-1">-</span>
                        )}
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Day Targets */}
        <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">
                Day {selectedDay} Syllabus
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {selectedDay === currentDay ? 'Scheduled for Today' : selectedDay < currentDay ? 'Completed Schedule' : 'Upcoming Milestones'}
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {selectedTopics.length} Topics
            </span>
          </div>

          {selectedTopics.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No specific topics pinned to Day {selectedDay}. This is a buffer or review milestone day!
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTopics.map((topic) => {
                const pillarColor =
                  topic.pillar === 'dsa'
                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                    : topic.pillar === 'system_design'
                    ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
                    : topic.pillar === 'ai_agentic'
                    ? 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/10'
                    : 'border-amber-500/30 text-amber-400 bg-amber-500/10';

                return (
                  <div
                    key={topic.id}
                    onClick={() => onOpenTopic(topic)}
                    className="p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${pillarColor}`}>
                        {topic.pillar.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {topic.difficulty}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-white group-hover:text-emerald-300 transition-colors">
                      {topic.title}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {topic.summary || topic.key_intuition}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
