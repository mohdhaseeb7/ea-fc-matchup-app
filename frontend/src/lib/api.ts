import { Team, MatchupResult, GenerateMatchupParams, FavoriteMatchup, MatchLog } from './types';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function fetchFilterMetadata() {
  try {
    const res = await fetch(`${API_BASE}/api/teams/meta/filters`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch filters');
    return await res.json();
  } catch (err) {
    return {
      leagues: ['Bundesliga', 'International', 'La Liga', 'Ligue 1', 'MLS', 'Premier League', 'Saudi Pro League', 'Serie A'],
      countries: ['Argentina', 'England', 'France', 'Germany', 'Italy', 'Spain'],
      playstyles: ['Counter Attack', 'Fast Break', 'Gegenpress', 'High Press', 'Park The Bus', 'Possession', 'Tiki-Taka', 'Wing Play'],
      starRatings: [5.0, 4.5, 4.0, 3.5],
      totalTeams: 38,
    };
  }
}

export async function fetchTeams(params?: { league?: string; search?: string; minRating?: number }) {
  const query = new URLSearchParams();
  if (params?.league && params.league !== 'all') query.append('league', params.league);
  if (params?.search) query.append('search', params.search);
  if (params?.minRating) query.append('minRating', params.minRating.toString());

  const res = await fetch(`${API_BASE}/api/teams?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch teams');
  return (await res.json()) as Team[];
}

export async function generateMatchups(params: GenerateMatchupParams): Promise<MatchupResult[]> {
  const res = await fetch(`${API_BASE}/api/matchups/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to generate matchups');
  return (await res.json()) as MatchupResult[];
}

export async function fetchMetaRivalries(): Promise<MatchupResult[]> {
  const res = await fetch(`${API_BASE}/api/matchups/meta-rivalries`);
  if (!res.ok) throw new Error('Failed to fetch rivalries');
  return (await res.json()) as MatchupResult[];
}

export async function fetchFavorites(): Promise<FavoriteMatchup[]> {
  const res = await fetch(`${API_BASE}/api/favorites`);
  if (!res.ok) return [];
  return (await res.json()) as FavoriteMatchup[];
}

export async function saveFavorite(team1Id: number, team2Id: number, notes?: string): Promise<FavoriteMatchup> {
  const res = await fetch(`${API_BASE}/api/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team1Id, team2Id, notes }),
  });
  if (!res.ok) throw new Error('Failed to save favorite');
  return (await res.json()) as FavoriteMatchup;
}

export async function deleteFavorite(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/favorites/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchMatchLogs(): Promise<MatchLog[]> {
  const res = await fetch(`${API_BASE}/api/match-logs`);
  if (!res.ok) return [];
  return (await res.json()) as MatchLog[];
}

export async function logMatchResult(team1Id: number, team2Id: number, score1: number, score2: number): Promise<MatchLog> {
  const res = await fetch(`${API_BASE}/api/match-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team1Id, team2Id, score1, score2 }),
  });
  if (!res.ok) throw new Error('Failed to log match result');
  return (await res.json()) as MatchLog;
}
