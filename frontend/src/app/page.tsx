'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MatchupCard from '../components/MatchupCard';
import WheelSpinner from '../components/WheelSpinner';
import MatchLoggerModal from '../components/MatchLoggerModal';
import AuthModal from '../components/AuthModal';
import {
  Team,
  MatchupResult,
  FavoriteMatchup,
  MatchLog,
  GenerateMatchupParams,
} from '../lib/types';
import {
  fetchFilterMetadata,
  fetchTeams,
  generateMatchups,
  fetchMetaRivalries,
  fetchFavorites,
  fetchMatchLogs,
  deleteFavorite,
} from '../lib/api';
import {
  Sparkles,
  Swords,
  SlidersHorizontal,
  Shield,
  RotateCcw,
  Trophy,
  Heart,
  History,
  Trash2,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'wheel' | 'derby' | 'favorites' | 'history'>('generator');

  // Generator Filters
  const [mode, setMode] = useState<'balanced' | 'rivalry' | 'playstyle_clash' | 'underdog' | 'random_wheel'>('balanced');
  const [starRatingFilter, setStarRatingFilter] = useState<number>(0);
  const [leaguePreference, setLeaguePreference] = useState<'same_league' | 'different_league' | 'any'>('any');
  const [maxRatingDelta, setMaxRatingDelta] = useState<number>(3);
  const [selectedPlaystyle, setSelectedPlaystyle] = useState<string>('any');

  // Data
  const [teams, setTeams] = useState<Team[]>([]);
  const [matchups, setMatchups] = useState<MatchupResult[]>([]);
  const [metaRivalries, setMetaRivalries] = useState<MatchupResult[]>([]);
  const [currentDerbyIndex, setCurrentDerbyIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<FavoriteMatchup[]>([]);
  const [matchLogs, setMatchLogs] = useState<MatchLog[]>([]);
  const [filterMeta, setFilterMeta] = useState<any>(null);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [logModalOpen, setLogModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [selectedLogPair, setSelectedLogPair] = useState<{ team1Id: number; team2Id: number }>({ team1Id: 1, team2Id: 2 });

  // Initial Load
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [teamsData, meta, rivalries, favs, logs] = await Promise.all([
          fetchTeams(),
          fetchFilterMetadata(),
          fetchMetaRivalries(),
          fetchFavorites(),
          fetchMatchLogs(),
        ]);
        setTeams(teamsData);
        setFilterMeta(meta);
        setMetaRivalries(rivalries);
        setFavorites(favs);
        setMatchLogs(logs);

        // Generate default initial matchups
        const initialMatchups = await generateMatchups({ mode: 'balanced', count: 3 });
        setMatchups(initialMatchups);
      } catch (err) {
        console.error(err);
      }
    }
    loadInitialData();
  }, []);

  const handleGenerate = async (customParams?: Partial<GenerateMatchupParams>) => {
    setLoading(true);

    const params: GenerateMatchupParams = {
      mode: customParams?.mode || mode,
      starRatingFilter: customParams?.starRatingFilter ?? starRatingFilter,
      leaguePreference: customParams?.leaguePreference || leaguePreference,
      maxRatingDelta: customParams?.maxRatingDelta ?? maxRatingDelta,
      playstylePreference: customParams?.playstylePreference || selectedPlaystyle,
      count: 3,
    };

    try {
      const results = await generateMatchups(params);
      setMatchups(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNextDerby = () => {
    if (metaRivalries.length === 0) return;
    setCurrentDerbyIndex((prev) => (prev + 1) % metaRivalries.length);
  };

  const handleOpenLogModal = (team1Id: number, team2Id: number) => {
    setSelectedLogPair({ team1Id, team2Id });
    setLogModalOpen(true);
  };

  const handleRefreshFavorites = async () => {
    const res = await fetchFavorites();
    setFavorites(res);
  };

  const handleRefreshLogs = async () => {
    const res = await fetchMatchLogs();
    setMatchLogs(res);
  };

  const handleDeleteFav = async (id: number) => {
    await deleteFavorite(id);
    handleRefreshFavorites();
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans">
      {/* Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAuthModal={() => setAuthModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* --- TAB 1: MATCH GENERATOR --- */}
        {activeTab === 'generator' && (
          <div>
            {/* Hero Header */}
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                EA FC 27 Matchmaking Engine
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Discover Balanced Team Matchups
              </h1>
              <p className="text-zinc-400 text-sm mt-2">
                Quickly discover exciting team-vs-team matches based on league, rating delta, playstyle, and rivalries.
              </p>
            </div>

            {/* Filter Panel */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Match Preferences
              </div>

              {/* Mode Selection Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
                {[
                  { id: 'balanced', label: 'Balanced (5★)', icon: Shield },
                  { id: 'playstyle_clash', label: 'Playstyle Clash', icon: Zap },
                  { id: 'underdog', label: 'David vs Goliath', icon: Swords },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id as any)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium transition-colors border ${
                        active
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Filter Selectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Star Tier
                  </label>
                  <select
                    value={starRatingFilter}
                    onChange={(e) => setStarRatingFilter(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none"
                  >
                    <option value={0}>Any Star Rating</option>
                    <option value={5.0}>5.0 Stars (Elite Giants)</option>
                    <option value={4.5}>4.5 Stars (Top Tier)</option>
                    <option value={4.0}>4.0 Stars (Mid Tier)</option>
                    <option value={3.5}>3.5 Stars (Underdogs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    League Preference
                  </label>
                  <select
                    value={leaguePreference}
                    onChange={(e) => setLeaguePreference(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none"
                  >
                    <option value="any">Any (Cross-League or Same)</option>
                    <option value="same_league">Same League Only</option>
                    <option value="different_league">Cross-League Only</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-zinc-400">Max Overall Delta</label>
                    <span className="font-semibold text-xs text-zinc-200">
                      ±{maxRatingDelta} PTS
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={maxRatingDelta}
                    onChange={(e) => setMaxRatingDelta(Number(e.target.value))}
                    className="w-full accent-zinc-200 cursor-pointer mt-1"
                  />
                </div>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Finding Matchups...' : 'Generate Matchups'}
              </button>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base text-zinc-200">
                Suggested Matchups ({matchups.length})
              </h2>
              <button
                onClick={() => handleGenerate()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium hover:text-zinc-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reroll
              </button>
            </div>

            {/* Matchup Cards */}
            <div className="space-y-6">
              {matchups.map((m, idx) => (
                <MatchupCard key={idx} matchup={m} onOpenLogModal={handleOpenLogModal} />
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: MYSTERY WHEEL --- */}
        {activeTab === 'wheel' && (
          <WheelSpinner teams={teams} onOpenLogModal={handleOpenLogModal} />
        )}

        {/* --- TAB 3: DERBY HUB --- */}
        {activeTab === 'derby' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Historic Rivalry Clashes {metaRivalries.length > 0 ? `• Derby ${currentDerbyIndex + 1} of ${metaRivalries.length}` : ''}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Derby Classics
                </h2>
                <p className="text-zinc-400 text-xs mt-1">
                  Discover iconic football rivalries and classic derby clashes.
                </p>
              </div>

              <button
                onClick={handleNextDerby}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Generate Another Derby
              </button>
            </div>

            {metaRivalries.length > 0 && metaRivalries[currentDerbyIndex] ? (
              <MatchupCard matchup={metaRivalries[currentDerbyIndex]} onOpenLogModal={handleOpenLogModal} />
            ) : (
              <div className="bg-zinc-900/60 border border-zinc-800 p-10 rounded-2xl text-center text-xs text-zinc-400">
                Loading derby matchups...
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: SAVED FAVORITES --- */}
        {activeTab === 'favorites' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Saved Matchups
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Your pinned team clashes</p>
              </div>
              <button
                onClick={handleRefreshFavorites}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300"
              >
                Refresh
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-zinc-900/60 border border-zinc-800 p-10 rounded-2xl text-center">
                <Heart className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm text-zinc-300">No Favorites Saved</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Click "Save" on any matchup card to pin them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((fav) => (
                  <div key={fav.id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-xs text-zinc-200">
                        {fav.team1?.name || `Team ${fav.team1Id}`} vs {fav.team2?.name || `Team ${fav.team2Id}`}
                      </span>
                      <button
                        onClick={() => handleDeleteFav(fav.id)}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 mb-3 text-xs">
                      <div>
                        <span className="font-medium text-zinc-200 block">{fav.team1?.name}</span>
                        <span className="text-[10px] text-zinc-500">Rating: {fav.team1?.overallRating}</span>
                      </div>
                      <span className="font-bold text-zinc-500">VS</span>
                      <div className="text-right">
                        <span className="font-medium text-zinc-200 block">{fav.team2?.name}</span>
                        <span className="text-[10px] text-zinc-500">Rating: {fav.team2?.overallRating}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenLogModal(fav.team1Id, fav.team2Id)}
                      className="w-full py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white"
                    >
                      Log Score
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 5: HEAD-TO-HEAD HISTORY --- */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Head-to-Head History
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Recorded game night match scores</p>
              </div>
              <button
                onClick={handleRefreshLogs}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300"
              >
                Refresh Log
              </button>
            </div>

            {matchLogs.length === 0 ? (
              <div className="bg-zinc-900/60 border border-zinc-800 p-10 rounded-2xl text-center">
                <History className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm text-zinc-300">No Match Logs Saved</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Click "Log Match Score" on any matchup card to track game results.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matchLogs.map((log) => (
                  <div key={log.id} className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-medium text-xs text-zinc-200">
                        {log.team1?.name || `Team ${log.team1Id}`} vs {log.team2?.name || `Team ${log.team2Id}`}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 font-semibold text-sm text-zinc-100">
                      <span>{log.score1}</span>
                      <span className="text-zinc-600">-</span>
                      <span>{log.score2}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full border-t border-zinc-800/60 py-5 text-center text-xs text-zinc-500">
        <p>EA FC Matchup Discovery — Minimal modern design</p>
      </footer>

      {/* Modals */}
      <MatchLoggerModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        team1Id={selectedLogPair.team1Id}
        team2Id={selectedLogPair.team2Id}
        teams={teams}
        onLoggedSuccess={handleRefreshLogs}
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
