import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeedService {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seedUsers() {
    const adminRole = await this.roleRepository.findOneBy({ name: 'Super Admin' });
    if (!adminRole) {
      this.logger.error('Super Admin role not found. Cannot seed admin user.');
      return;
    }

    const adminEmail = 'admin@ethiocontent.ai';
    const existingAdmin = await this.userRepository.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
      const admin = this.userRepository.create({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: await bcrypt.hash('adminpassword', 10),
        isActive: true,
        roles: [adminRole],
      });

      await this.userRepository.save(admin);
      this.logger.log(`Seeded admin user: ${adminEmail}`);
    }
  }
}
