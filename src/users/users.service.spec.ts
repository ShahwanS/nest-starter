import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/roles.enum';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;
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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'password123',
      };

      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockUser);
      const result = await service.findById('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(repo, 'find').mockResolvedValue([mockUser]);
      const users = await service.findAll();
      expect(users).toEqual([mockUser]);
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const updatedUser = { ...mockUser, role: Role.Admin };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(repo, 'save').mockResolvedValue(updatedUser);

      const result = await service.updateRole('1', Role.Admin);
      expect(result.role).toBe(Role.Admin);
    });
  });
});
