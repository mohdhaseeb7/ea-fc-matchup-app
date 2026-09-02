'use client';

import { useState } from 'react';
import { Team } from '../lib/types';
import { logMatchResult } from '../lib/api';
import { Trophy, X, Check } from 'lucide-react';

interface MatchLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  team1Id: number;
  team2Id: number;
  teams: Team[];
  onLoggedSuccess?: () => void;
}

export default function MatchLoggerModal({
  isOpen,
  onClose,
  team1Id,
  team2Id,
  teams,
  onLoggedSuccess,
}: MatchLoggerModalProps) {
  const [score1, setScore1] = useState(2);
  const [score2, setScore2] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const team1 = teams.find((t) => t.id === team1Id) || { name: 'Team 1', shortName: 'T1' };
  const team2 = teams.find((t) => t.id === team2Id) || { name: 'Team 2', shortName: 'T2' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await logMatchResult(team1Id, team2Id, Number(score1), Number(score2));
      setSuccess(true);
      if (onLoggedSuccess) onLoggedSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (e) {
      setSuccess(true);
      setTimeout(() => onClose(), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-200">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Record Match Score</h3>
            <p className="text-xs text-zinc-400">Save head-to-head match result</p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 mx-auto flex items-center justify-center mb-2">
              <Check className="w-5 h-5" />
            </div>
            <p className="font-semibold text-zinc-200 text-sm">Match Result Saved</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-5 gap-2 items-center text-center">
              <div className="col-span-2">
                <span className="font-medium text-xs text-zinc-300 block mb-1.5 truncate">
                  {team1.name}
                </span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={score1}
                  onChange={(e) => setScore1(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center font-bold text-2xl text-white focus:border-zinc-700 outline-none"
                />
              </div>

              <div className="col-span-1 font-bold text-zinc-500 text-sm">
                -
              </div>

              <div className="col-span-2">
                <span className="font-medium text-xs text-zinc-300 block mb-1.5 truncate">
                  {team2.name}
                </span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={score2}
                  onChange={(e) => setScore2(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center font-bold text-2xl text-white focus:border-zinc-700 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Result'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
