'use client';

import { useState, useEffect } from 'react';
import { Team, MatchupResult } from '../lib/types';
import { Dices, RotateCw } from 'lucide-react';
import MatchupCard from './MatchupCard';

interface WheelSpinnerProps {
  teams: Team[];
  onOpenLogModal: (t1: number, t2: number) => void;
}

export default function WheelSpinner({ teams, onOpenLogModal }: WheelSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMatchup, setSelectedMatchup] = useState<MatchupResult | null>(null);

  const getRandomMatchup = (): MatchupResult | null => {
    if (teams.length < 2) return null;
    const t1 = teams[Math.floor(Math.random() * teams.length)];
    let t2 = teams[Math.floor(Math.random() * teams.length)];
    while (t2.id === t1.id && teams.length > 1) {
      t2 = teams[Math.floor(Math.random() * teams.length)];
    }

    const delta = Math.abs(t1.overallRating - t2.overallRating);
    return {
      team1: t1,
      team2: t2,
      matchupScore: Math.max(75, 100 - delta * 5),
      matchTitle: 'Random Wheel Selection',
      description: 'Randomly drawn matchup for fast decision.',
      ratingDelta: delta,
      tacticalAnalysis: {
        attVsDef1: t1.attackRating - t2.defenseRating,
        attVsDef2: t2.attackRating - t1.defenseRating,
        recommendedStrategyTeam1: `Execute ${t1.primaryPlaystyle} gameplan.`,
        recommendedStrategyTeam2: `Execute ${t2.primaryPlaystyle} gameplan.`,
      },
    };
  };

  useEffect(() => {
    if (teams.length >= 2 && !selectedMatchup) {
      setSelectedMatchup(getRandomMatchup());
    }
  }, [teams]);

  const startSpin = () => {
    if (teams.length < 2 || isSpinning) return;

    setIsSpinning(true);
    let counter = 0;
    const interval = setInterval(() => {
      setSelectedMatchup(getRandomMatchup());
      counter++;

      if (counter >= 12) {
        clearInterval(interval);
        setSelectedMatchup(getRandomMatchup());
        setIsSpinning(false);
      }
    }, 80);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 text-center">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium mb-1.5">
            <Dices className="w-3.5 h-3.5" />
            Mystery Wheel
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Random Match Picker
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">
            Spin to discover an instant randomized team matchup.
          </p>
        </div>

        <button
          onClick={startSpin}
          disabled={isSpinning}
          className="px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'Spinning Wheel...' : 'Spin Matchup Wheel'}
        </button>
      </div>

      {/* Drawn Matchup Display */}
      {selectedMatchup && (
        <div className="text-left">
          <MatchupCard matchup={selectedMatchup} onOpenLogModal={onOpenLogModal} />
        </div>
      )}
    </div>
  );
}
