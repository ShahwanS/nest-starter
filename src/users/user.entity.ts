// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/common/enums/roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  interests: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ default: 'free' })
  subscriptionStatus: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  heartsReceived: number;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;
}
