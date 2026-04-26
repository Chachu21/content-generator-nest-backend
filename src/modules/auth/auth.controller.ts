import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  LocalAuthGuard,
  JwtAccessGuard,
  JwtRefreshGuard,
  GoogleAuthGuard,
  FacebookAuthGuard,
} from './guards/auth.guards';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Public: no JWT required ──────────────────────────────────────────────────

  @Public()
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: Request) {
    return this.authService.refreshTokens(req.user);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@Req() req: Request) {
    return this.authService.googleLogin(req.user);
  }

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  facebookAuth() {}

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  facebookCallback(@Req() req: Request) {
    return this.authService.facebookLogin(req.user);
  }

  // ─── Protected: requires valid access token ───────────────────────────────────

  @UseGuards(JwtAccessGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
