import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../common/enums/roles.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
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

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      const req = { user: mockUser };
      const result = await controller.getProfile(req);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if no user found', async () => {
      const req = { user: null };
      await expect(controller.getProfile(req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [mockUser];
      jest.spyOn(usersService, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user if admin', async () => {
      const adminReq = {
        user: { ...mockUser, role: Role.Admin },
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await controller.findOne(adminReq, mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should return a user if accessing own profile', async () => {
      const req = {
        user: mockUser,
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await controller.findOne(req, mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw ForbiddenException if accessing other user profile', async () => {
      const req = {
        user: mockUser,
      };

      await expect(controller.findOne(req, 'other-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update user if admin', async () => {
      const adminReq = {
        user: { ...mockUser, role: Role.Admin },
      };

      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update(adminReq, mockUser.id, updateDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update if updating own profile', async () => {
      const req = {
        user: mockUser,
      };

      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update(req, mockUser.id, updateDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw ForbiddenException if updating other user profile', async () => {
      const req = {
        user: mockUser,
      };

      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      await expect(
        controller.update(req, 'other-id', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
