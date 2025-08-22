import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { CasbinService } from '../casbinconfig/casbin.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private casbinService: CasbinService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ID为 ${id} 的用户不存在`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async updateRoles(id: number, updateUserRolesDto: UpdateUserRolesDto): Promise<User> {
    const user = await this.findOne(id);
    
    // Remove old roles from Casbin
    for (const role of user.roles) {
      await this.casbinService.removeRoleForUser(user.username, role);
    }

    // Add new roles to Casbin
    for (const role of updateUserRolesDto.roles) {
      await this.casbinService.addRoleForUser(user.username, role);
    }

    user.roles = updateUserRolesDto.roles;
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    
    // Remove all roles from Casbin
    for (const role of user.roles) {
      await this.casbinService.removeRoleForUser(user.username, role);
    }

    await this.usersRepository.remove(user);
  }
} 