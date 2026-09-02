'use client';

import { useSession, signOut } from 'next-auth/react';
import { Shield, Sparkles, Dices, Flame, Heart, History, User, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: 'generator' | 'wheel' | 'derby' | 'favorites' | 'history';
  setActiveTab: (tab: 'generator' | 'wheel' | 'derby' | 'favorites' | 'history') => void;
  onOpenAuthModal: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('generator')} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
            <Shield className="w-4 h-4 text-zinc-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">
              EA FC Matchup
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              v27
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'generator'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Match Generator
          </button>

          <button
            onClick={() => setActiveTab('wheel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'wheel'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            Mystery Wheel
          </button>

          <button
            onClick={() => setActiveTab('derby')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'derby'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Derby Hub
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Saved
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            H2H Log
          </button>
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl">
              <span className="text-xs font-medium text-zinc-300 truncate max-w-[110px]">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                title="Sign Out"
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
