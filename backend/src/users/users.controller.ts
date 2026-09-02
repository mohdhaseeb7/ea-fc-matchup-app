import { Controller, Post, Get, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register')
  async register(@Body() body: any) {
    return await this.usersService.register(body.email, body.password, body.name);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    return await this.usersService.login(body.email, body.password);
  }

  @Get('favorites')
  async getFavorites() {
    return await this.usersService.getFavorites();
  }

  @Post('favorites')
  async addFavorite(@Body() body: any) {
    return await this.usersService.addFavorite(body.team1Id, body.team2Id, body.notes);
  }

  @Delete('favorites/:id')
  async removeFavorite(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.removeFavorite(id);
  }

  @Get('match-logs')
  async getMatchLogs() {
    return await this.usersService.getMatchLogs();
  }

  @Post('match-logs')
  async addMatchLog(@Body() body: any) {
    return await this.usersService.addMatchLog(body.team1Id, body.team2Id, body.score1, body.score2);
  }
}
