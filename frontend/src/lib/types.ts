export interface Team {
  id: number;
  name: string;
  shortName: string;
  league: string;
  country: string;
  starRating: number;
  overallRating: number;
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  primaryPlaystyle: string;
  secondaryPlaystyle?: string | null;
  rivalryTags?: string[];
  keyPlayers: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  badgeTier?: string;
}

export interface TacticalAnalysis {
  attVsDef1: number;
  attVsDef2: number;
  recommendedStrategyTeam1: string;
  recommendedStrategyTeam2: string;
}

export interface MatchupResult {
  team1: Team;
  team2: Team;
  matchupScore: number;
  matchTitle: string;
  description: string;
  ratingDelta: number;
  tacticalAnalysis: TacticalAnalysis;
}

export interface GenerateMatchupParams {
  mode?: 'balanced' | 'rivalry' | 'playstyle_clash' | 'underdog' | 'random_wheel';
  leaguePreference?: 'same_league' | 'different_league' | 'any';
  starRatingFilter?: number;
  maxRatingDelta?: number;
  playstylePreference?: string;
  excludeTeamIds?: number[];
  count?: number;
}

export interface FavoriteMatchup {
  id: number;
  userId?: number;
  team1Id: number;
  team2Id: number;
  team1?: Team;
  team2?: Team;
  notes?: string;
  createdAt: string;
}

export interface MatchLog {
  id: number;
  userId?: number;
  team1Id: number;
  team2Id: number;
  team1?: Team;
  team2?: Team;
  score1: number;
  score2: number;
  winnerTeamId?: number | null;
  createdAt: string;
}
