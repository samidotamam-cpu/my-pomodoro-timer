import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Armchair, Settings } from 'lucide-react';
import { CircularTimer } from './components/CircularTimer';
import { Motivation } from './components/Motivation';
import { SettingsModal } from './components/SettingsModal';
import { TaskList, Task } from './components/TaskList';
import { TimerMode, DEFAULT_TIMES, TimerSettings } from './types';

// Helper to format seconds into MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const App: React.FC = () => {
  // Store customizable settings in state, initializing with defaults
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_TIMES);
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES[TimerMode.FOCUS]);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Task state
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Use a ref for the interval to clear it properly
  const timerRef = useRef<number | null>(null);
  
  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);

  // Calculate percentage for the progress ring based on current settings
  const totalTime = settings[mode];
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;

  // Sound Player using Web Audio API
  const playTimerEndSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      // Resume if suspended (browser policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Simple bell-like tone
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5); // Decay pitch

      // Volume envelope
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  }, []);

  const toggleTimer = useCallback(() => {
    if (isActive) {
      stopTimer();
    } else {
      // Initialize audio context on user interaction to handle autoplay policies
      if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      setIsActive(true);
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            playTimerEndSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isActive, stopTimer, playTimerEndSound]);

  const resetTimer = useCallback(() => {
    stopTimer();
    // Reset to the time defined in the current settings
    setTimeLeft(settings[mode]);
  }, [mode, stopTimer, settings]);

  const changeMode = (newMode: TimerMode) => {
    stopTimer();
    setMode(newMode);
    setTimeLeft(settings[newMode]);
  };

  const handleSaveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    // If the timer is not running, update the displayed time immediately
    // to reflect the new setting for the current mode.
    if (!isActive) {
      setTimeLeft(newSettings[mode]);
    }
  };

  // Task Handlers
  const addTask = (text: string) => {
    setTasks(prev => [...prev, { id: crypto.randomUUID(), text, completed: false }]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update document title
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - Lumina Focus`;
  }, [timeLeft]);

  const getModeColor = () => {
    switch (mode) {
      case TimerMode.FOCUS: return 'text-purple-400';
      case TimerMode.SHORT_BREAK: return 'text-teal-400';
      case TimerMode.LONG_BREAK: return 'text-blue-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col items-center justify-center p-6 selection:bg-purple-500 selection:text-white">
      
      {/* Header */}
      <header className="absolute top-6 left-0 right-0 px-6 flex items-center justify-between opacity-90">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
          <h1 className="text-xl font-bold tracking-tight text-slate-200">Lumina</h1>
        </div>
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex flex-col items-center w-full max-w-xl py-12">
        
        {/* Mode Toggles */}
        <div className="flex gap-2 mb-10 bg-slate-800/50 p-1.5 rounded-full backdrop-blur-sm border border-slate-700/50 shadow-lg">
          <button
            onClick={() => changeMode(TimerMode.FOCUS)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === TimerMode.FOCUS 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Brain className="w-4 h-4" /> Focus
          </button>
          <button
            onClick={() => changeMode(TimerMode.SHORT_BREAK)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === TimerMode.SHORT_BREAK 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Coffee className="w-4 h-4" /> Short Break
          </button>
          <button
            onClick={() => changeMode(TimerMode.LONG_BREAK)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === TimerMode.LONG_BREAK 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Armchair className="w-4 h-4" /> Long Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative mb-10">
           <CircularTimer percentage={percentage} size={320} strokeWidth={8}>
              <div className="text-center flex flex-col items-center justify-center">
                <span className={`text-7xl font-bold tracking-tighter tabular-nums ${getModeColor()} drop-shadow-lg transition-colors duration-500`}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-slate-500 text-sm mt-2 uppercase tracking-widest font-semibold">
                  {isActive ? 'Running' : 'Paused'}
                </span>
              </div>
           </CircularTimer>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={toggleTimer}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-900 hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95"
            aria-label={isActive ? "Pause Timer" : "Start Timer"}
          >
            {isActive ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={resetTimer}
            className="group flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200 border border-slate-700 active:scale-95"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-500" />
          </button>
        </div>
        
        {/* Task List Section */}
        <TaskList 
          tasks={tasks}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />

        {/* AI Motivation Section */}
        <Motivation />

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-slate-600 text-xs">
        <p>Stay productive. Take breaks.</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentSettings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;