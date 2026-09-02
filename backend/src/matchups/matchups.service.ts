import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import { GenerateMatchupDto } from './dto/generate-matchup.dto';
import { Team } from '../database/schema';

export interface MatchupResult {
  team1: Team;
  team2: Team;
  matchupScore: number;
  matchTitle: string;
  description: string;
  ratingDelta: number;
  tacticalAnalysis: {
    attVsDef1: number; // team1 att - team2 def
    attVsDef2: number; // team2 att - team1 def
    recommendedStrategyTeam1: string;
    recommendedStrategyTeam2: string;
  };
}

@Injectable()
export class MatchupsService {
  private readonly logger = new Logger(MatchupsService.name);

  constructor(private drizzleService: DrizzleService) {}

  async generateMatchups(dto: GenerateMatchupDto): Promise<MatchupResult[]> {
    const allTeams = await this.drizzleService.getAllTeams();
    const excludeSet = new Set(dto.excludeTeamIds || []);

    let candidates = allTeams.filter((t) => !excludeSet.has(t.id));

    // Star rating filter if specified
    if (dto.starRatingFilter && dto.starRatingFilter > 0) {
      candidates = candidates.filter((t) => Math.abs(t.starRating - dto.starRatingFilter!) <= 0.5);
    }

    if (candidates.length < 2) {
      // Fall back to all teams if candidates too small
      candidates = allTeams;
    }

    const mode = dto.mode || 'balanced';
    const matchups: MatchupResult[] = [];
    const usedPairs = new Set<string>();

    const targetCount = dto.count || 3;

    // Execute matching based on mode
    if (mode === 'rivalry') {
      const rivalryPairs = this.findRivalryPairs(candidates, targetCount);
      matchups.push(...rivalryPairs);
    } else if (mode === 'underdog') {
      const underdogPairs = this.findUnderdogPairs(candidates, targetCount);
      matchups.push(...underdogPairs);
    } else if (mode === 'playstyle_clash') {
      const playstylePairs = this.findPlaystyleClashPairs(candidates, targetCount);
      matchups.push(...playstylePairs);
    } else if (mode === 'random_wheel') {
      const randomPairs = this.findRandomPairs(candidates, targetCount);
      matchups.push(...randomPairs);
    } else {
      // Default: balanced matchup
      const balancedPairs = this.findBalancedPairs(candidates, dto, targetCount);
      matchups.push(...balancedPairs);
    }

    // Fill up if targetCount not reached
    if (matchups.length < targetCount) {
      const fallback = this.findRandomPairs(allTeams, targetCount - matchups.length);
      for (const m of fallback) {
        const pairKey = [m.team1.id, m.team2.id].sort().join('-');
        if (!usedPairs.has(pairKey)) {
          usedPairs.add(pairKey);
          matchups.push(m);
        }
      }
    }

    return matchups.slice(0, targetCount);
  }

  private findBalancedPairs(candidates: Team[], dto: GenerateMatchupDto, count: number): MatchupResult[] {
    const results: MatchupResult[] = [];
    const maxDelta = dto.maxRatingDelta ?? 3;
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      for (let j = i + 1; j < shuffled.length; j++) {
        const t1 = shuffled[i];
        const t2 = shuffled[j];

        // League preference check
        if (dto.leaguePreference === 'same_league' && t1.league !== t2.league) continue;
        if (dto.leaguePreference === 'different_league' && t1.league === t2.league) continue;

        const delta = Math.abs(t1.overallRating - t2.overallRating);
        if (delta <= maxDelta) {
          const score = Math.max(70, 100 - delta * 6);
          results.push(this.buildMatchupResult(t1, t2, score, 'Balanced Showdown', `Super close matchup! Only ${delta} overall rating point difference.`));
          if (results.length >= count * 2) break;
        }
      }
      if (results.length >= count * 2) break;
    }

    return results.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private findRivalryPairs(candidates: Team[], count: number): MatchupResult[] {
    const results: MatchupResult[] = [];
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      for (let j = i + 1; j < shuffled.length; j++) {
        const t1 = shuffled[i];
        const t2 = shuffled[j];

        const t1Tags: string[] = Array.isArray(t1.rivalryTags) ? t1.rivalryTags : [];
        const t2Tags: string[] = Array.isArray(t2.rivalryTags) ? t2.rivalryTags : [];

        const sharedTag = t1Tags.find((tag) => t2Tags.includes(tag));
        if (sharedTag) {
          results.push(
            this.buildMatchupResult(
              t1,
              t2,
              98,
              `${sharedTag}`,
              `Historic derby clash! High stakes battle between ${t1.name} and ${t2.name}.`,
            ),
          );
        }
      }
    }

    if (results.length < count) {
      // Add top league rivals
      const sameLeague = this.findBalancedPairs(candidates, { leaguePreference: 'same_league' }, count - results.length);
      results.push(...sameLeague);
    }

    return results.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private findPlaystyleClashPairs(candidates: Team[], count: number): MatchupResult[] {
    const results: MatchupResult[] = [];
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      for (let j = i + 1; j < shuffled.length; j++) {
        const t1 = shuffled[i];
        const t2 = shuffled[j];

        if (t1.primaryPlaystyle !== t2.primaryPlaystyle) {
          const title = `${t1.primaryPlaystyle} vs ${t2.primaryPlaystyle}`;
          const delta = Math.abs(t1.overallRating - t2.overallRating);
          if (delta <= 4) {
            results.push(
              this.buildMatchupResult(
                t1,
                t2,
                92,
                title,
                `Tactical battle! ${t1.name}'s ${t1.primaryPlaystyle} against ${t2.name}'s ${t2.primaryPlaystyle}.`,
              ),
            );
          }
        }
      }
    }

    return results.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private findUnderdogPairs(candidates: Team[], count: number): MatchupResult[] {
    const results: MatchupResult[] = [];
    const giants = candidates.filter((t) => t.overallRating >= 84);
    const underdogs = candidates.filter((t) => t.overallRating <= 79);

    if (giants.length === 0 || underdogs.length === 0) {
      return this.findBalancedPairs(candidates, { maxRatingDelta: 6 }, count);
    }

    for (const giant of giants) {
      for (const underdog of underdogs) {
        const delta = giant.overallRating - underdog.overallRating;
        results.push(
          this.buildMatchupResult(
            giant,
            underdog,
            88,
            'David vs Goliath Challenge',
            `Can ${underdog.name} (+${delta} handicap challenge) pull off a miracle against ${giant.name}?`,
          ),
        );
      }
    }

    return results.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private findRandomPairs(candidates: Team[], count: number): MatchupResult[] {
    const results: MatchupResult[] = [];
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const t1 = shuffled[i];
      const t2 = shuffled[i + 1];
      const delta = Math.abs(t1.overallRating - t2.overallRating);
      results.push(
        this.buildMatchupResult(
          t1,
          t2,
          85,
          'Mystery Wheel Pick',
          `Random draw! ${t1.name} (${t1.overallRating}) vs ${t2.name} (${t2.overallRating}).`,
        ),
      );
      if (results.length >= count) break;
    }

    return results;
  }

  private buildMatchupResult(t1: Team, t2: Team, baseScore: number, matchTitle: string, description: string): MatchupResult {
    const attVsDef1 = t1.attackRating - t2.defenseRating;
    const attVsDef2 = t2.attackRating - t1.defenseRating;

    return {
      team1: t1,
      team2: t2,
      matchupScore: baseScore,
      matchTitle,
      description,
      ratingDelta: Math.abs(t1.overallRating - t2.overallRating),
      tacticalAnalysis: {
        attVsDef1,
        attVsDef2,
        recommendedStrategyTeam1: attVsDef1 > 0 ? `Exploit ${t2.shortName}'s defense with fast wing play` : `Maintain tight defensive shape against ${t2.shortName}`,
        recommendedStrategyTeam2: attVsDef2 > 0 ? `Press high against ${t1.shortName}'s backline` : `Use counter attacks against ${t1.shortName}`,
      },
    };
  }

  async getMetaRivalries(): Promise<MatchupResult[]> {
    const allTeams = await this.drizzleService.getAllTeams();
    return this.findRivalryPairs(allTeams, 6);
  }
}
