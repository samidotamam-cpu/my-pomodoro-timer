import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { fetchMotivation } from '../services/geminiService';

export const Motivation: React.FC = () => {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getTip = async () => {
    setLoading(true);
    const newQuote = await fetchMotivation();
    setQuote(newQuote);
    setLoading(false);
  };

  // Fetch one on mount if empty? No, let user ask for it to save tokens/interactions.

  return (
    <div className="mt-8 min-h-[80px] flex flex-col items-center justify-center px-4 max-w-md text-center">
      {!quote && !loading && (
        <button
          onClick={getTip}
          className="flex items-center space-x-2 text-slate-400 hover:text-purple-300 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          <span>Need motivation?</span>
        </button>
      )}

      {loading && (
        <div className="animate-pulse flex items-center space-x-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Consulting the AI...</span>
        </div>
      )}

      {quote && !loading && (
        <div className="animate-fade-in text-slate-300 italic font-light relative group">
            <p>"{quote}"</p>
            <button 
                onClick={getTip} 
                className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
                title="Get another tip"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>
      )}
    </div>
  );
};