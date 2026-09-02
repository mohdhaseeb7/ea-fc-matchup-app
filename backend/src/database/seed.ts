import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as schema from './schema';
import { INITIAL_TEAMS_DATA } from './seed-data';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.log('DATABASE_URL is not configured with actual credentials. Skipping remote seed.');
    return;
  }

  try {
    console.log('Connecting to database for seeding...');
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });

    console.log('Clearing existing teams...');
    await db.delete(schema.teams);

    console.log(`Inserting ${INITIAL_TEAMS_DATA.length} teams...`);
    for (const teamData of INITIAL_TEAMS_DATA) {
      await db.insert(schema.teams).values({
        name: teamData.name,
        shortName: teamData.shortName,
        league: teamData.league,
        country: teamData.country,
        starRating: teamData.starRating,
        overallRating: teamData.overallRating,
        attackRating: teamData.attackRating,
        midfieldRating: teamData.midfieldRating,
        defenseRating: teamData.defenseRating,
        primaryPlaystyle: teamData.primaryPlaystyle,
        secondaryPlaystyle: teamData.secondaryPlaystyle || null,
        rivalryTags: teamData.rivalryTags || [],
        keyPlayers: teamData.keyPlayers,
        logoUrl: teamData.logoUrl || null,
        primaryColor: teamData.primaryColor || '#00ff87',
        secondaryColor: teamData.secondaryColor || '#0b0e14',
        badgeTier: teamData.badgeTier || 'TOP_TIER',
      });
    }

    console.log('Database seeding complete!');
    await client.end();
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

seed();
