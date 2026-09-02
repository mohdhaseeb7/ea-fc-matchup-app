import { pgTable, serial, text, integer, real, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  league: text('league').notNull(),
  country: text('country').notNull(),
  starRating: real('star_rating').notNull(), // e.g. 5.0, 4.5, 4.0
  overallRating: integer('overall_rating').notNull(), // e.g. 85
  attackRating: integer('attack_rating').notNull(),
  midfieldRating: integer('midfield_rating').notNull(),
  defenseRating: integer('defense_rating').notNull(),
  primaryPlaystyle: text('primary_playstyle').notNull(), // e.g., "Counter Attack", "Tiki-Taka", "Gegenpress", "Wing Play"
  secondaryPlaystyle: text('secondary_playstyle'),
  rivalryTags: jsonb('rivalry_tags').$type<string[]>().default([]),
  keyPlayers: text('key_players').notNull(),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').default('#00ff87'),
  secondaryColor: text('secondary_color').default('#0b0e14'),
  badgeTier: text('badge_tier').default('TOP_TIER'), // META, TOP_TIER, MID_TIER, DARK_HORSE, UNDERDOG
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),
  favoriteLeague: text('favorite_league'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const favoriteMatchups = pgTable('favorite_matchups', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  team1Id: integer('team1_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  team2Id: integer('team2_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const matchLogs = pgTable('match_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  team1Id: integer('team1_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  team2Id: integer('team2_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  score1: integer('score1').notNull(),
  score2: integer('score2').notNull(),
  winnerTeamId: integer('winner_team_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FavoriteMatchup = typeof favoriteMatchups.$inferSelect;
export type MatchLog = typeof matchLogs.$inferSelect;
