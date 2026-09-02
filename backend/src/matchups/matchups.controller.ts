import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MatchupsService } from './matchups.service';
import { GenerateMatchupDto } from './dto/generate-matchup.dto';

@Controller('api/matchups')
export class MatchupsController {
  constructor(private readonly matchupsService: MatchupsService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateMatchups(@Body() dto: GenerateMatchupDto) {
    return await this.matchupsService.generateMatchups(dto);
  }

  @Get('meta-rivalries')
  async getMetaRivalries() {
    return await this.matchupsService.getMetaRivalries();
  }
}
