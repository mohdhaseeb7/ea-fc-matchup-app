'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Shield, Sparkles, Dices, Flame, Heart, History, User, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: 'generator' | 'wheel' | 'derby' | 'favorites' | 'history';
  setActiveTab: (tab: 'generator' | 'wheel' | 'derby' | 'favorites' | 'history') => void;
  onOpenAuthModal: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal }: NavbarProps) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile side drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabSelect = (tab: 'generator' | 'wheel' | 'derby' | 'favorites' | 'history') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems: Array<{
    id: 'generator' | 'wheel' | 'derby' | 'favorites' | 'history';
    label: string;
    icon: typeof Sparkles;
  }> = [
    { id: 'generator', label: 'Match Generator', icon: Sparkles },
    { id: 'wheel', label: 'Mystery Wheel', icon: Dices },
    { id: 'derby', label: 'Derby Hub', icon: Flame },
    { id: 'favorites', label: 'Saved', icon: Heart },
    { id: 'history', label: 'H2H Log', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => handleTabSelect('generator')} 
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

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Desktop Auth & Mobile Menu Button */}
        <div className="flex items-center gap-2">
          {/* User Auth Section */}
          <div className="hidden sm:flex items-center gap-2">
            {session?.user ? (
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl">
                <span className="text-xs font-medium text-zinc-300 truncate max-w-[110px]">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden items-center justify-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Side Drawer Overlay & Panel */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-zinc-950 border-l border-zinc-800/90 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
                <Shield className="w-4 h-4 text-zinc-100" />
              </div>
              <span className="font-bold text-sm text-white tracking-tight">
                EA FC Matchup
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Drawer Navigation Links */}
          <nav className="py-6 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 mb-1">
              Menu Navigation
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer Auth Section */}
        <div className="border-t border-zinc-800/80 pt-4 mt-auto">
          {session?.user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
                <User className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-zinc-200 truncate">
                    {session.user.name || 'User'}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate">
                    {session.user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuthModal();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <User className="w-4 h-4" />
              Sign In to Account
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

