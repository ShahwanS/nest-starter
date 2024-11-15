import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      // Check if user exists
      const existingUser = await this.usersService.findByUsername(
        createUserDto.username,
      );
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create user with default role
      const user = await this.usersService.create({
        ...createUserDto,
        password: hashedPassword,
      });

      // Return token and user data
      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByUsername(username);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: any) {
    if (!user || !user.id || !user.role) {
      throw new UnauthorizedException('Invalid user data');
    }
    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
