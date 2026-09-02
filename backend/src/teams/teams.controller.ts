import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('api/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async getAllTeams(
    @Query('league') league?: string,
    @Query('country') country?: string,
    @Query('minRating') minRating?: number,
    @Query('maxRating') maxRating?: number,
    @Query('search') search?: string,
    @Query('playstyle') playstyle?: string,
  ) {
    return await this.teamsService.getAllTeams({
      league,
      country,
      minRating,
      maxRating,
      search,
      playstyle,
    });
  }

  @Get('meta/filters')
  async getFilterMetadata() {
    return await this.teamsService.getFilterMetadata();
  }

  @Get(':id')
  async getTeamById(@Param('id', ParseIntPipe) id: number) {
    return await this.teamsService.getTeamById(id);
  }
}
