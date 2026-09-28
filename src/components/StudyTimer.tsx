'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { triggerConfetti } from '@/lib/utils';

interface StudyTimerProps {
  onSessionLogged?: () => void;
}

export function StudyTimer({ onSessionLogged }: StudyTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedAlert, setIsLoggedAlert] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initialSeconds = 25 * 60;
  const progressPercent = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      playBeep();
      triggerConfetti();
      // Log 25 minutes to backend
      fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: 25 }),
      }).then(() => {
        setIsLoggedAlert(true);
        setTimeout(() => setIsLoggedAlert(false), 4000);
        onSessionLogged?.();
      });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, secondsLeft, onSessionLogged]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(initialSeconds);
  };

  const logManual15 = async () => {
    await fetch('/api/study-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes: 15 }),
    });
    setIsLoggedAlert(true);
    setTimeout(() => setIsLoggedAlert(false), 3000);
    onSessionLogged?.();
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="relative">
      {/* Trigger pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:border-slate-600 shadow-sm"
        title="Focus Pomodoro Timer"
      >
        <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
        <span>{timeFormatted}</span>
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-4 rounded-xl border border-slate-700/80 bg-[#121620] shadow-2xl z-50 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Focus Pomodoro
            </span>
            <span className="text-[11px] text-amber-400/90 font-mono">25m deep study</span>
          </div>

          <div className="my-4 text-center">
            <div className="text-3xl font-mono font-bold text-white tracking-wider">
              {timeFormatted}
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 font-bold'
              }`}
            >
              {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isActive ? 'Pause' : 'Start Focus'}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={logManual15}
              className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
            >
              + Quick log 15 mins
            </button>
            {isLoggedAlert && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Logged!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
