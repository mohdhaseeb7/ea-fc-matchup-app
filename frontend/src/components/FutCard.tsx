'use client';

import { useState } from 'react';
import { Team } from '../lib/types';
import { Star, Zap, Users } from 'lucide-react';

interface FutCardProps {
  team: Team;
  side?: 'left' | 'right';
}

export default function FutCard({ team }: FutCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-zinc-100 flex flex-col justify-between min-h-[350px] shadow-sm hover:border-zinc-700 transition-all">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-4xl text-white tracking-tight">
              {team.overallRating}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{team.starRating.toFixed(1)}</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mt-1">
            {team.shortName} • {team.league}
          </span>
        </div>

        {/* Team Official Logo or Short Name Crest */}
        {team.logoUrl && !imgError ? (
          <div className="w-12 h-12 rounded-xl bg-zinc-950/80 p-1.5 border border-zinc-800 flex items-center justify-center shadow-inner">
            <img
              src={team.logoUrl}
              alt={`${team.name} logo`}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
        ) : (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base border shadow-inner"
            style={{
              backgroundColor: team.primaryColor ? `${team.primaryColor}20` : '#27272a',
              borderColor: team.primaryColor || '#3f3f46',
              color: team.primaryColor || '#ffffff',
            }}
          >
            {team.shortName}
          </div>
        )}
      </div>

      {/* Team Name & Playstyle */}
      <div className="my-4">
        <h3 className="font-bold text-2xl text-white tracking-tight truncate">
          {team.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700/60">
            <Zap className="w-3 h-3 text-zinc-400" />
            {team.primaryPlaystyle}
          </span>
        </div>
      </div>

      {/* Stat Grid (ATT / MID / DEF) */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/90 my-1 text-center">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">ATT</span>
          <span className="font-bold text-lg text-zinc-100">{team.attackRating}</span>
        </div>
        <div className="border-x border-zinc-800">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">MID</span>
          <span className="font-bold text-lg text-zinc-100">{team.midfieldRating}</span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">DEF</span>
          <span className="font-bold text-lg text-zinc-100">{team.defenseRating}</span>
        </div>
      </div>

      {/* Key Players */}
      <div className="mt-3 pt-3 border-t border-zinc-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-medium text-[11px] mb-1">
          <Users className="w-3.5 h-3.5 text-zinc-500" />
          <span>Key Players:</span>
        </div>
        <p className="text-zinc-300 font-medium truncate">{team.keyPlayers}</p>
      </div>
    </div>
  );
}
