// src/users/dto/update-user.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  name?: string;
  age?: number;
  location?: string;
  interests?: string;
  bio?: string;
  profilePhoto?: string;
}
