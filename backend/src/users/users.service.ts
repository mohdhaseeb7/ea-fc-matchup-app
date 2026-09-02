import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async register(email: string, password: string, name: string) {
    if (!email || !password || !name) {
      throw new BadRequestException('Email, password, and name are required');
    }

    const existing = await this.drizzleService.findUserByEmail(email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.drizzleService.createUser({
      email,
      name,
      passwordHash,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(email: string, password: string) {
    const user = await this.drizzleService.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
  }

  async getFavorites(userId?: number) {
    return await this.drizzleService.getFavorites(userId);
  }

  async addFavorite(team1Id: number, team2Id: number, notes?: string, userId?: number) {
    return await this.drizzleService.addFavorite(team1Id, team2Id, userId, notes);
  }

  async removeFavorite(id: number) {
    return await this.drizzleService.removeFavorite(id);
  }

  async getMatchLogs(userId?: number) {
    return await this.drizzleService.getMatchLogs(userId);
  }

  async addMatchLog(team1Id: number, team2Id: number, score1: number, score2: number, userId?: number) {
    return await this.drizzleService.addMatchLog(team1Id, team2Id, score1, score2, userId);
  }
}
