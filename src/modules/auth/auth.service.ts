import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Email/Password ──────────────────────────────────────────────────────────

  async signup(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.generateTokenPair(user);
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email, true);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Return user without password
    const { password, ...result } = user as any;
    return result;
  }

  async login(user: any) {
    return this.generateTokenPair(user);
  }

  // ─── Refresh Token ────────────────────────────────────────────────────────────

  async refreshTokens(user: any) {
    // user is set by JwtRefreshStrategy
    const fullUser = await this.usersService.findOne(user.id);
    return this.generateTokenPair(fullUser);
  }

  // ─── OAuth ───────────────────────────────────────────────────────────────────

  async googleLogin(profile: any) {
    const user = await this.usersService.findOrCreateOAuthUser({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      googleId: profile.id,
      avatarUrl: profile.photos?.[0]?.value,
    });
    return this.generateTokenPair(user);
  }

  async facebookLogin(profile: any) {
    const user = await this.usersService.findOrCreateOAuthUser({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      facebookId: profile.id,
      avatarUrl: profile.photos?.[0]?.value,
    });
    return this.generateTokenPair(user);
  }

  // ─── Token Generation ─────────────────────────────────────────────────────────

  private generateTokenPair(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((r: any) => r.name) ?? [],
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('auth.jwt.accessSecret'),
      expiresIn: this.config.getOrThrow('auth.jwt.accessExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('auth.jwt.refreshSecret'),
      expiresIn: this.config.getOrThrow('auth.jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
      },
    };
  }
}
