import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  Post,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Get current user's profile
  @Get('me')
  @Roles(Role.User, Role.Admin)
  async getProfile(@Request() req) {
    if (!req.user) {
      throw new NotFoundException('Profile not found');
    }
    return req.user;
  }
  // Get all users (Admin only)
  @Get()
  @Roles(Role.Admin)
  async findAll() {
    return this.usersService.findAll();
  }

  // Get specific user
  @Get(':id')
  @Roles(Role.User, Role.Admin)
  async findOne(@Request() req, @Param('id') id: string) {
    // Users can only view their own profile, Admins can view any profile
    if (req.user.id !== id && req.user.role !== Role.Admin) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.usersService.findById(id);
  }

  // Update user profile
  @Put(':id')
  @Roles(Role.User, Role.Admin)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Users can only update their own profile, Admins can update any profile
    if (req.user.id !== id && req.user.role !== Role.Admin) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  // Update user role (Admin only)
  @Put(':id/role')
  @Roles(Role.Admin)
  async updateRole(
    @Request() req,
    @Param('id') id: string,
    @Body('role') role: Role,
  ) {
    // Prevent admin from changing their own role
    if (req.user.id === id) {
      throw new ForbiddenException('You cannot change your own role');
    }

    // Validate role value
    if (!Object.values(Role).includes(role)) {
      throw new ForbiddenException('Invalid role');
    }

    return this.usersService.updateRole(id, role);
  }

  // Delete user (Admin only)
  @Delete(':id')
  @Roles(Role.Admin)
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
