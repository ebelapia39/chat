import { Controller, Post, UseGuards, Request, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestUser } from './interfaces/request.interface';
import { LocalAuthGuard } from './guards/local-auth.guarв';
import { Public } from 'decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() request: RequestUser) {
    return this.authService.login(request.user);
  }

  @Get('me')
  getProfile(@Req() request: RequestUser) {
    return { user: request.user };
  }
}
