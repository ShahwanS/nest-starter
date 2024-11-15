import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '../common/enums/roles.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
      };

      const expectedResponse = {
        user: mockUser,
        access_token: 'jwt-token',
      };

      jest.spyOn(authService, 'signup').mockResolvedValue(expectedResponse);

      const result = await controller.signup(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signup).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const expectedResponse = {
        user: mockUser,
        access_token: 'jwt-token',
      };

      const req = {
        user: mockUser,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResponse);

      const result = await controller.login(req);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });
});
