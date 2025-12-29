import React, { useState, KeyboardEvent } from 'react';
import { Plus, Check, Trash2, Circle } from 'lucide-react';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onAddTask(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="w-full max-w-sm mt-8 space-y-4">
      {/* Input Area */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Plus className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 sm:text-sm transition-all shadow-sm"
          placeholder="Add a task to focus on..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Task List */}
      <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
              task.completed
                ? 'bg-slate-900/30 border-transparent opacity-60'
                : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50'
            }`}
          >
            <button
              onClick={() => onToggleTask(task.id)}
              className="flex items-center flex-1 gap-3 text-left"
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  task.completed
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'border-slate-500 text-transparent group-hover:border-purple-400'
                }`}
              >
                <Check className={`w-3 h-3 ${task.completed ? 'scale-100' : 'scale-0'} transition-transform`} />
              </div>
              <span
                className={`text-sm font-medium transition-all ${
                  task.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {task.text}
              </span>
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
