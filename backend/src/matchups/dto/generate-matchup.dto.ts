import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

export class GenerateMatchupDto {
  @IsString()
  @IsOptional()
  mode?: 'balanced' | 'rivalry' | 'playstyle_clash' | 'underdog' | 'random_wheel' = 'balanced';

  @IsString()
  @IsOptional()
  leaguePreference?: 'same_league' | 'different_league' | 'any' = 'any';

  @IsNumber()
  @IsOptional()
  starRatingFilter?: number = 0; // 0 = any, 5.0, 4.5, 4.0, 3.5

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(20)
  maxRatingDelta?: number = 3;

  @IsString()
  @IsOptional()
  playstylePreference?: string = 'any';

  @IsArray()
  @IsOptional()
  excludeTeamIds?: number[] = [];

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  count?: number = 3;
}
