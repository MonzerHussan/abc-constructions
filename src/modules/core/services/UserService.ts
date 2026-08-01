import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import type { CreateUserInput, UpdateUserInput } from '@/modules/core/validators/user-schemas';

export class UserService {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { organizations: true } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(input: CreateUserInput) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new Error('CORE_USER_ALREADY_EXISTS');
    }
    const hashedPassword = input.password ? await bcrypt.hash(input.password, 12) : undefined;
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: hashedPassword,
        phone: input.phone,
        role: input.role || 'OWNER',
      },
    });
    await eventBus.publish({
      name: buildEventName('Core', 'User', 'Created'),
      version: 1,
      payload: { userId: user.id, email: user.email, name: user.name },
      metadata: {
        timestamp: new Date(),
        correlationId: `corr_${user.id}_${Date.now()}`,
        source: 'core',
      },
    });
    logger.info(`User created: ${user.email}`, { userId: user.id });
    return user;
  }

  async update(id: string, input: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('CORE_USER_NOT_FOUND');
    const updated = await prisma.user.update({
      where: { id },
      data: input,
    });
    await eventBus.publish({
      name: buildEventName('Core', 'User', 'Updated'),
      version: 1,
      payload: { userId: id, changes: Object.keys(input) },
      metadata: {
        timestamp: new Date(),
        correlationId: `corr_${id}_${Date.now()}`,
        source: 'core',
      },
    });
    return updated;
  }

  async deactivate(id: string) {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    await eventBus.publish({
      name: buildEventName('Core', 'User', 'Deactivated'),
      version: 1,
      payload: { userId: id },
      metadata: {
        timestamp: new Date(),
        correlationId: `corr_${id}_${Date.now()}`,
        source: 'core',
      },
    });
    return user;
  }

  async findUsersByOrganization(orgId: string) {
    return prisma.userOrganization.findMany({
      where: { organizationId: orgId, isActive: true },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        role: { select: { id: true, name: true, nameAr: true } },
      },
    });
  }
}
