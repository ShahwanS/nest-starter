import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/roles.enum';
import * as bcrypt from 'bcrypt';
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    username: 'testuser',
    password: 'hashedPassword',
    role: Role.User,
    name: 'Test User',
    age: 25,
    location: 'Test Location',
    interests: 'reading,coding',
    createdAt: new Date(),
    updatedAt: new Date(),
    bio: 'Test bio',
    profilePhoto: 'default.jpg',
    subscriptionStatus: 'free',
    rating: 0,
    heartsReceived: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await service.signup(createUserDto);

      expect(result).toHaveProperty('access_token');
      expect(result.user).toHaveProperty('username', mockUser.username);
    });

    it('should throw ConflictException if username exists', async () => {
      const createUserDto = {
        username: 'existinguser',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(mockUser);

      await expect(service.signup(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUserWithHash = {
        ...mockUser,
        password: hashedPassword,
      };

      jest
        .spyOn(usersService, 'findByUsername')
        .mockResolvedValue(mockUserWithHash);

      const result = await service.validateUser('testuser', password);

      const { password: _, ...expectedUser } = mockUserWithHash;
      expect(result).toEqual(expectedUser);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(mockUser);

      await expect(
        service.validateUser('testuser', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const result = await service.login(mockUser);
      expect(result).toHaveProperty('access_token');
      expect(result.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException if user data is invalid', async () => {
      await expect(service.login(null)).rejects.toThrow(UnauthorizedException);
    });
  });
});
