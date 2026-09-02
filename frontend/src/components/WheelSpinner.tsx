'use client';

import { useState } from 'react';
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
  const [currentTeam1Display, setCurrentTeam1Display] = useState<string>('???');
  const [currentTeam2Display, setCurrentTeam2Display] = useState<string>('???');

  const startSpin = () => {
    if (teams.length < 2 || isSpinning) return;

    setIsSpinning(true);
    setSelectedMatchup(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomT1 = teams[Math.floor(Math.random() * teams.length)];
      const randomT2 = teams[Math.floor(Math.random() * teams.length)];
      setCurrentTeam1Display(randomT1.name);
      setCurrentTeam2Display(randomT2.name);
      counter++;

      if (counter > 20) {
        clearInterval(interval);
        const t1 = teams[Math.floor(Math.random() * teams.length)];
        let t2 = teams[Math.floor(Math.random() * teams.length)];
        while (t2.id === t1.id && teams.length > 1) {
          t2 = teams[Math.floor(Math.random() * teams.length)];
        }

        const delta = Math.abs(t1.overallRating - t2.overallRating);
        const result: MatchupResult = {
          team1: t1,
          team2: t2,
          matchupScore: 90,
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

        setSelectedMatchup(result);
        setIsSpinning(false);
      }
    }, 90);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
          <Dices className="w-3.5 h-3.5" />
          Mystery Wheel
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Random Match Picker
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Spin to pick two teams instantly.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl max-w-xl mx-auto mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-9 gap-3 items-center my-4">
          <div className="sm:col-span-4 bg-zinc-950 p-5 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center min-h-[110px]">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">TEAM A</span>
            <span className={`font-bold text-lg ${isSpinning ? 'text-zinc-400 animate-pulse' : 'text-white'}`}>
              {currentTeam1Display}
            </span>
          </div>

          <div className="sm:col-span-1 flex justify-center">
            <span className="text-xs font-bold text-zinc-500">VS</span>
          </div>

          <div className="sm:col-span-4 bg-zinc-950 p-5 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center min-h-[110px]">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">TEAM B</span>
            <span className={`font-bold text-lg ${isSpinning ? 'text-zinc-400 animate-pulse' : 'text-white'}`}>
              {currentTeam2Display}
            </span>
          </div>
        </div>

        <button
          onClick={startSpin}
          disabled={isSpinning}
          className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'Spinning...' : 'Spin Matchup Wheel'}
        </button>
      </div>

      {selectedMatchup && (
        <div className="text-left mt-8">
          <MatchupCard matchup={selectedMatchup} onOpenLogModal={onOpenLogModal} />
        </div>
      )}
    </div>
  );
}
