import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationSeedService {
  private readonly logger = new Logger(OrganizationSeedService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async seedOrganizations() {
    const orgs = [
      {
        name: 'Ethio Coffee Exporters',
        slug: 'ethio-coffee',
        industry: 'Agriculture/Export',
        description: 'Leading exporter of premium Ethiopian coffee beans.',
        address: 'Addis Ababa, Bole',
      },
      {
        name: 'Simien Mountains Tours',
        slug: 'simien-tours',
        industry: 'Tourism',
        description: 'Guided tours and trekking in the Simien Mountains National Park.',
        address: 'Gondar, Ethiopia',
      },
      {
        name: 'Addis Tech Hub',
        slug: 'addis-tech',
        industry: 'Technology',
        description: 'Coworking space and incubator for Addis Ababa startups.',
        address: 'Addis Ababa, Kazanchis',
      },
    ];

    for (const orgData of orgs) {
      const existingOrg = await this.organizationRepository.findOne({
        where: { slug: orgData.slug },
      });
      if (!existingOrg) {
        await this.organizationRepository.save(this.organizationRepository.create(orgData));
        this.logger.log(`Organization ${orgData.name} seeded`);
      }
    }
  }
}
