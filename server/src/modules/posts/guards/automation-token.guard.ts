import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';

const secureEquals = (a: string, b: string) => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
};

@Injectable()
export class AutomationTokenGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<any>();
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
      select: { automation_json: true }
    });
    const automation = (settings?.automation_json || {}) as any;
    const dbToken = typeof automation.token === 'string' ? automation.token.trim() : '';
    const configuredToken = dbToken || process.env.AUTOMATION_API_TOKEN?.trim();
    if (!configuredToken) {
      throw new UnauthorizedException('Automation API is not configured');
    }

    const authHeader = String(req.headers?.authorization || '');
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const incomingToken = authHeader.slice(7).trim();
    if (!incomingToken || !secureEquals(incomingToken, configuredToken)) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    const allowedIps = (process.env.AUTOMATION_ALLOWED_IPS || '')
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);
    if (allowedIps.length > 0) {
      const forwardedFor = String(req.headers?.['x-forwarded-for'] || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
      const requestIp = String(req.ip || req.socket?.remoteAddress || '').trim();
      const candidates = new Set([...forwardedFor, requestIp]);
      const matched = allowedIps.some((allowed) => candidates.has(allowed));
      if (!matched) {
        throw new UnauthorizedException('IP not allowed');
      }
    }

    return true;
  }
}
