import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DrizzleService } from './database/drizzle.service';
import { TeamsController } from './teams/teams.controller';
import { TeamsService } from './teams/teams.service';
import { MatchupsController } from './matchups/matchups.controller';
import { MatchupsService } from './matchups/matchups.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requests per minute per IP
      },
    ]),
  ],
  controllers: [TeamsController, MatchupsController, UsersController],
  providers: [
    DrizzleService,
    TeamsService,
    MatchupsService,
    UsersService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
