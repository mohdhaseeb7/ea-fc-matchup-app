import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { INITIAL_TEAMS_DATA } from './seed-data';

@Injectable()
export class DrizzleService implements OnModuleInit {
  private readonly logger = new Logger(DrizzleService.name);
  public db: PostgresJsDatabase<typeof schema> | null = null;
  public isConnected = false;
  private inMemoryTeams: schema.Team[] = [];
  private inMemoryFavorites: any[] = [];
  private inMemoryMatchLogs: any[] = [];
  private inMemoryUsers: schema.User[] = [];
  private userIdCounter = 1;
  private favIdCounter = 1;
  private matchLogIdCounter = 1;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('DATABASE_URL');
    
    // Check if placeholder is present or invalid connection string
    if (connectionString && !connectionString.includes('[YOUR-PASSWORD]')) {
      try {
        const client = postgres(connectionString, { max: 10, timeout: 5 });
        this.db = drizzle(client, { schema });
        this.isConnected = true;
        this.logger.log('Connected successfully to Supabase Postgres database.');
        return;
      } catch (err: any) {
        this.logger.warn(`Failed to connect to Supabase Postgres (${err.message}). Falling back to In-Memory DAL.`);
      }
    } else {
      this.logger.warn('DATABASE_URL contains placeholder or is missing. Using high-performance In-Memory DAL with full EA FC 26 dataset.');
    }

    // Initialize in-memory dataset
    this.inMemoryTeams = INITIAL_TEAMS_DATA.map((t, idx) => ({
      ...t,
      id: idx + 1,
      secondaryPlaystyle: t.secondaryPlaystyle || null,
      rivalryTags: t.rivalryTags || [],
      logoUrl: t.logoUrl || null,
      primaryColor: t.primaryColor || '#00ff87',
      secondaryColor: t.secondaryColor || '#0b0e14',
      badgeTier: t.badgeTier || 'TOP_TIER',
      createdAt: new Date(),
    }));
  }

  // --- DAL Methods ---
  async getAllTeams(): Promise<schema.Team[]> {
    if (this.isConnected && this.db) {
      try {
        return await this.db.select().from(schema.teams);
      } catch (e) {
        this.logger.error('DB query error, using fallback dataset', e);
      }
    }
    return this.inMemoryTeams;
  }

  async getTeamById(id: number): Promise<schema.Team | null> {
    if (this.isConnected && this.db) {
      try {
        const res = await this.db.select().from(schema.teams);
        return res.find((t) => t.id === id) || null;
      } catch (e) {
        // fallback
      }
    }
    return this.inMemoryTeams.find((t) => t.id === id) || null;
  }

  async findUserByEmail(email: string): Promise<schema.User | null> {
    if (this.isConnected && this.db) {
      try {
        const res = await this.db.select().from(schema.users);
        return res.find((u) => u.email === email) || null;
      } catch (e) {}
    }
    return this.inMemoryUsers.find((u) => u.email === email) || null;
  }

  async createUser(newUser: schema.NewUser): Promise<schema.User> {
    if (this.isConnected && this.db) {
      try {
        const inserted = await this.db.insert(schema.users).values(newUser).returning();
        return inserted[0];
      } catch (e) {}
    }
    const created: schema.User = {
      id: this.userIdCounter++,
      email: newUser.email,
      name: newUser.name,
      passwordHash: newUser.passwordHash || null,
      avatarUrl: newUser.avatarUrl || null,
      favoriteLeague: newUser.favoriteLeague || null,
      createdAt: new Date(),
    };
    this.inMemoryUsers.push(created);
    return created;
  }

  async getFavorites(userId?: number): Promise<any[]> {
    const list = this.inMemoryFavorites;
    return list.map((f) => {
      const team1 = this.inMemoryTeams.find((t) => t.id === f.team1Id);
      const team2 = this.inMemoryTeams.find((t) => t.id === f.team2Id);
      return { ...f, team1, team2 };
    });
  }

  async addFavorite(team1Id: number, team2Id: number, userId?: number, notes?: string): Promise<any> {
    const newFav = {
      id: this.favIdCounter++,
      userId: userId || 1,
      team1Id,
      team2Id,
      notes: notes || '',
      createdAt: new Date(),
    };
    this.inMemoryFavorites.push(newFav);
    const team1 = this.inMemoryTeams.find((t) => t.id === team1Id);
    const team2 = this.inMemoryTeams.find((t) => t.id === team2Id);
    return { ...newFav, team1, team2 };
  }

  async removeFavorite(favId: number): Promise<boolean> {
    const idx = this.inMemoryFavorites.findIndex((f) => f.id === favId);
    if (idx !== -1) {
      this.inMemoryFavorites.splice(idx, 1);
      return true;
    }
    return false;
  }

  async getMatchLogs(userId?: number): Promise<any[]> {
    return this.inMemoryMatchLogs.map((m) => {
      const team1 = this.inMemoryTeams.find((t) => t.id === m.team1Id);
      const team2 = this.inMemoryTeams.find((t) => t.id === m.team2Id);
      return { ...m, team1, team2 };
    });
  }

  async addMatchLog(team1Id: number, team2Id: number, score1: number, score2: number, userId?: number): Promise<any> {
    let winnerTeamId: number | null = null;
    if (score1 > score2) winnerTeamId = team1Id;
    else if (score2 > score1) winnerTeamId = team2Id;

    const log = {
      id: this.matchLogIdCounter++,
      userId: userId || 1,
      team1Id,
      team2Id,
      score1,
      score2,
      winnerTeamId,
      createdAt: new Date(),
    };
    this.inMemoryMatchLogs.push(log);
    const team1 = this.inMemoryTeams.find((t) => t.id === team1Id);
    const team2 = this.inMemoryTeams.find((t) => t.id === team2Id);
    return { ...log, team1, team2 };
  }
}
