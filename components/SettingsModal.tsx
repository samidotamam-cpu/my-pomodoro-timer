import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { TimerMode, TimerSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: TimerSettings;
  onSave: (newSettings: TimerSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}) => {
  // Local state for the inputs (in minutes)
  const [localTimes, setLocalTimes] = useState({
    [TimerMode.FOCUS]: currentSettings[TimerMode.FOCUS] / 60,
    [TimerMode.SHORT_BREAK]: currentSettings[TimerMode.SHORT_BREAK] / 60,
    [TimerMode.LONG_BREAK]: currentSettings[TimerMode.LONG_BREAK] / 60,
  });

  // Sync local state when modal opens or settings change externally
  useEffect(() => {
    if (isOpen) {
      setLocalTimes({
        [TimerMode.FOCUS]: currentSettings[TimerMode.FOCUS] / 60,
        [TimerMode.SHORT_BREAK]: currentSettings[TimerMode.SHORT_BREAK] / 60,
        [TimerMode.LONG_BREAK]: currentSettings[TimerMode.LONG_BREAK] / 60,
      });
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleChange = (mode: TimerMode, value: string) => {
    const numVal = parseInt(value, 10);
    if (!isNaN(numVal) && numVal > 0) {
      setLocalTimes((prev) => ({ ...prev, [mode]: numVal }));
    }
  };

  const handleSave = () => {
    onSave({
      [TimerMode.FOCUS]: localTimes[TimerMode.FOCUS] * 60,
      [TimerMode.SHORT_BREAK]: localTimes[TimerMode.SHORT_BREAK] * 60,
      [TimerMode.LONG_BREAK]: localTimes[TimerMode.LONG_BREAK] * 60,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white">Timer Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Focus Duration (minutes)</label>
            <input
              type="number"
              value={localTimes[TimerMode.FOCUS]}
              onChange={(e) => handleChange(TimerMode.FOCUS, e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Short Break (minutes)</label>
            <input
              type="number"
              value={localTimes[TimerMode.SHORT_BREAK]}
              onChange={(e) => handleChange(TimerMode.SHORT_BREAK, e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Long Break (minutes)</label>
            <input
              type="number"
              value={localTimes[TimerMode.LONG_BREAK]}
              onChange={(e) => handleChange(TimerMode.LONG_BREAK, e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-900/50 border-t border-slate-800 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};