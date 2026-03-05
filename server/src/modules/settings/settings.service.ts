import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  get() {
    return this.prisma.settings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' }
    });
  }

  update(data: any) {
    return this.prisma.settings.update({
      where: { id: 'singleton' },
      data
    });
  }

  async getAutomationTokenStatus() {
    const settings = await this.get();
    const automation = (settings.automation_json || {}) as any;
    const dbToken = typeof automation.token === 'string' ? automation.token.trim() : '';
    const envToken = process.env.AUTOMATION_API_TOKEN?.trim() || '';

    return {
      source: dbToken ? 'db' : envToken ? 'env' : null,
      configured: Boolean(dbToken || envToken),
      last_rotated_at: automation.last_rotated_at || null,
      updated_by: automation.updated_by || null
    };
  }

  async rotateAutomationToken(updatedBy?: string) {
    const token = randomBytes(48).toString('hex');
    const now = new Date().toISOString();
    await this.prisma.settings.upsert({
      where: { id: 'singleton' },
      update: {
        automation_json: {
          token,
          last_rotated_at: now,
          updated_by: updatedBy || null
        }
      },
      create: {
        id: 'singleton',
        automation_json: {
          token,
          last_rotated_at: now,
          updated_by: updatedBy || null
        }
      }
    });

    return {
      token,
      generated_at: now
    };
  }
}
