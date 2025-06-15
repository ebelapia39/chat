import {
  Controller,
  Post,
  UseGuards,
  Request,
  Req,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestUser } from './interfaces/request.interface';
import { LocalAuthGuard } from './guards/local-auth.guarв';
import { Public } from '../../decorators/public.decorator';
import { RegisterDto } from './dto/register.dto.interface';
import { ResponseMe } from './interfaces/response-me.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() request: RequestUser) {
    return this.authService.login(request.user);
  }

  @Public()
  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Get('me')
  getProfile(@Req() request: RequestUser) {
    return { user: request.user } as ResponseMe;
  }
}
