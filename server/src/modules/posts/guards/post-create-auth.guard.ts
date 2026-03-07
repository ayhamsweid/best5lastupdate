import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { requireEnv } from '../../../config/env';

@Injectable()
export class PostCreateAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const apiKey = this.extractApiKey(req);
    if (apiKey) {
      const valid = await this.isValidAutomationApiKey(apiKey);
      if (!valid) {
        throw new UnauthorizedException('Invalid API key');
      }

      const actor = await this.resolveAutomationActor();
      req.user = {
        id: actor?.id || null,
        role: UserRole.ADMIN,
        auth_mode: 'api_key'
      };
      return true;
    }

    const token = req?.cookies?.access_token;
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = this.jwt.verify(token, { secret: requireEnv('JWT_ACCESS_SECRET') });
      req.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const allowedRoles = [UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR];
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ForbiddenException('Forbidden resource');
    }

    return true;
  }

  private extractApiKey(req: any): string {
    const direct = (req?.headers?.['x-api-key'] || req?.headers?.['X-API-Key']) as string | undefined;
    if (typeof direct === 'string' && direct.trim()) {
      return direct.trim();
    }

    const authHeader = req?.headers?.authorization as string | undefined;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length).trim();
    }

    return '';
  }

  private async isValidAutomationApiKey(candidate: string): Promise<boolean> {
    const settings = await this.prisma.settings.findUnique({ where: { id: 'singleton' } });
    const automation = (settings?.automation_json || {}) as any;
    const dbToken = typeof automation.token === 'string' ? automation.token.trim() : '';
    const envToken = process.env.AUTOMATION_API_TOKEN?.trim() || '';

    return this.constantTimeEquals(candidate, dbToken) || this.constantTimeEquals(candidate, envToken);
  }

  private constantTimeEquals(a: string, b: string): boolean {
    if (!a || !b) return false;
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }

  private async resolveAutomationActor() {
    const settings = await this.prisma.settings.findUnique({ where: { id: 'singleton' } });
    const automation = (settings?.automation_json || {}) as any;
    const updatedBy = typeof automation.updated_by === 'string' ? automation.updated_by : '';

    if (updatedBy) {
      const owner = await this.prisma.user.findUnique({ where: { id: updatedBy } });
      if (owner) return owner;
    }

    return this.prisma.user.findFirst({
      where: { role: UserRole.ADMIN, is_active: true },
      orderBy: { created_at: 'asc' }
    });
  }
}
