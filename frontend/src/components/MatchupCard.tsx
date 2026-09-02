'use client';

import { useState } from 'react';
import { MatchupResult } from '../lib/types';
import FutCard from './FutCard';
import { Heart, Trophy, Share2, Swords, Check } from 'lucide-react';
import { saveFavorite } from '../lib/api';

interface MatchupCardProps {
  matchup: MatchupResult;
  onOpenLogModal: (team1Id: number, team2Id: number) => void;
}

export default function MatchupCard({ matchup, onOpenLogModal }: MatchupCardProps) {
  const { team1, team2, matchupScore, matchTitle, description, ratingDelta, tacticalAnalysis } = matchup;
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    try {
      await saveFavorite(team1.id, team2.id, matchTitle);
      setIsSaved(true);
    } catch (e) {
      setIsSaved(true);
    }
  };

  const handleShare = () => {
    const text = `EA FC Matchup: ${team1.name} (${team1.overallRating}) vs ${team2.name} (${team2.overallRating}) - ${matchTitle}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-sm">
      {/* Top Match Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700/60">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white tracking-tight">
              {matchTitle}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs">
          <span className="text-zinc-400 font-medium">Match Balance:</span>
          <span className="font-bold text-zinc-100">{matchupScore}%</span>
        </div>
      </div>

      {/* Team FUT Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
        <div className="md:col-span-5">
          <FutCard team={team1} side="left" />
        </div>

        <div className="md:col-span-1 flex flex-col items-center justify-center my-3 md:my-0">
          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-200">
            VS
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 mt-2 uppercase tracking-wider">
            $\Delta$ {ratingDelta} PTS
          </span>
        </div>

        <div className="md:col-span-5">
          <FutCard team={team2} side="right" />
        </div>
      </div>

      {/* Tactical Analysis Section */}
      <div className="mt-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
        <h4 className="font-semibold text-zinc-300 uppercase tracking-wider mb-2.5 text-[11px]">
          Tactical Breakdown
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800/80">
            <span className="font-semibold text-zinc-200 block mb-1">{team1.name} Gameplan:</span>
            <p className="text-zinc-400">
              {tacticalAnalysis?.recommendedStrategyTeam1 || `Execute ${team1.primaryPlaystyle} strategy.`}
            </p>
          </div>

          <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800/80">
            <span className="font-semibold text-zinc-200 block mb-1">{team2.name} Gameplan:</span>
            <p className="text-zinc-400">
              {tacticalAnalysis?.recommendedStrategyTeam2 || `Execute ${team2.primaryPlaystyle} strategy.`}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-colors border ${
              isSaved
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-zinc-200 text-zinc-200' : ''}`} />
            {isSaved ? 'Saved to Favorites' : 'Save Matchup'}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        <button
          onClick={() => onOpenLogModal(team1.id, team2.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors shadow-sm"
        >
          <Trophy className="w-4 h-4" />
          Log Head-to-Head Result
        </button>
      </div>
    </div>
  );
}
