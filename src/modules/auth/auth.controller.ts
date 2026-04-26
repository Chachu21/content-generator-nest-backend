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
import { ApiTags, ApiBody, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import {
  LocalAuthGuard,
  JwtAccessGuard,
  JwtRefreshGuard,
  GoogleAuthGuard,
  FacebookAuthGuard,
} from './guards/auth.guards';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Public ───────────────────────────────────────────────────────────────────

  @Public()
  @ResponseMessage('Account created successfully')
  @Post('signup')
  @ApiOperation({ summary: 'Register a new account' })
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Public()
  @ResponseMessage('Logged in successfully')
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Public()
  @ResponseMessage('Tokens refreshed successfully')
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get new access + refresh token pair' })
  @ApiBody({
    schema: {
      properties: {
        refreshToken: { type: 'string', description: 'Your refresh token (or pass via Authorization header)' },
      },
    },
  })
  refresh(@Req() req: Request) {
    return this.authService.refreshTokens(req.user);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  googleAuth() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  googleCallback(@Req() req: Request) {
    return this.authService.googleLogin(req.user);
  }

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  @ApiOperation({ summary: 'Redirect to Facebook OAuth' })
  facebookAuth() {}

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  facebookCallback(@Req() req: Request) {
    return this.authService.facebookLogin(req.user);
  }

  // ─── Protected ────────────────────────────────────────────────────────────────

  @UseGuards(JwtAccessGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@Req() req: Request) {
    return req.user;
  }
}
