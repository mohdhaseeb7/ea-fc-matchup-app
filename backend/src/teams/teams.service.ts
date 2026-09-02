import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import { Team } from '../database/schema';

@Injectable()
export class TeamsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAllTeams(query?: {
    league?: string;
    country?: string;
    minRating?: number;
    maxRating?: number;
    search?: string;
    playstyle?: string;
  }): Promise<Team[]> {
    let teams = await this.drizzleService.getAllTeams();

    if (query?.league && query.league !== 'all') {
      teams = teams.filter((t) => t.league.toLowerCase() === query.league.toLowerCase());
    }

    if (query?.country && query.country !== 'all') {
      teams = teams.filter((t) => t.country.toLowerCase() === query.country.toLowerCase());
    }

    if (query?.playstyle && query.playstyle !== 'all') {
      teams = teams.filter(
        (t) =>
          t.primaryPlaystyle.toLowerCase().includes(query.playstyle.toLowerCase()) ||
          (t.secondaryPlaystyle && t.secondaryPlaystyle.toLowerCase().includes(query.playstyle.toLowerCase())),
      );
    }

    if (query?.minRating) {
      teams = teams.filter((t) => t.overallRating >= Number(query.minRating));
    }

    if (query?.maxRating) {
      teams = teams.filter((t) => t.overallRating <= Number(query.maxRating));
    }

    if (query?.search) {
      const s = query.search.toLowerCase();
      teams = teams.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.shortName.toLowerCase().includes(s) ||
          t.keyPlayers.toLowerCase().includes(s),
      );
    }

    return teams;
  }

  async getTeamById(id: number): Promise<Team> {
    const team = await this.drizzleService.getTeamById(id);
    if (!team) throw new NotFoundException(`Team with ID ${id} not found`);
    return team;
  }

  async getFilterMetadata() {
    const teams = await this.drizzleService.getAllTeams();
    const leagues = Array.from(new Set(teams.map((t) => t.league))).sort();
    const countries = Array.from(new Set(teams.map((t) => t.country))).sort();
    const playstyles = Array.from(new Set(teams.map((t) => t.primaryPlaystyle))).sort();

    return {
      leagues,
      countries,
      playstyles,
      starRatings: [5.0, 4.5, 4.0, 3.5],
      totalTeams: teams.length,
    };
  }
}
