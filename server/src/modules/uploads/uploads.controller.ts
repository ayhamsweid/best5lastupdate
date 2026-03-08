import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
export class UploadsController {
  constructor(private prisma: PrismaService) {}

  private async usageCountMap(urls: string[]) {
    const posts = await this.prisma.post.findMany({
      select: {
        cover_image_url: true,
        og_image_url: true,
        content_blocks_json: true
      }
    });
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
      select: { pages_meta_json: true }
    });
    const textBlobs = posts.map((post) => JSON.stringify(post));
    const settingsBlob = settings?.pages_meta_json ? JSON.stringify(settings.pages_meta_json) : '';
    const allText = [...textBlobs, settingsBlob].join('\n');
    const map: Record<string, number> = {};
    urls.forEach((url) => {
      const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'g');
      map[url] = (allText.match(re) || []).length;
    });
    return map;
  }

  @Get('images')
  async list() {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) return [];
    const files = fs
      .readdirSync(uploadDir)
      .filter((file) => !file.startsWith('.'))
      .map((file) => ({ name: file, url: `/uploads/${file}` }))
      .reverse();

    const existing = await this.prisma.mediaAsset.findMany({
      where: { name: { in: files.map((f) => f.name) } }
    });
    const existingMap = new Map(existing.map((item) => [item.name, item]));
    const toCreate = files.filter((f) => !existingMap.has(f.name));
    if (toCreate.length) {
      await this.prisma.mediaAsset.createMany({
        data: toCreate.map((file) => {
          const full = path.join(uploadDir, file.name);
          const size = fs.existsSync(full) ? fs.statSync(full).size : null;
          return {
            name: file.name,
            url: file.url,
            size,
            mime: null
          };
        })
      });
    }

    const assets = await this.prisma.mediaAsset.findMany({
      where: { name: { in: files.map((f) => f.name) } },
      orderBy: { created_at: 'desc' }
    });
    const usageMap = await this.usageCountMap(assets.map((a) => a.url));
    return assets.map((asset) => ({
      name: asset.name,
      url: asset.url,
      tags: asset.tags || [],
      size: asset.size,
      mime: asset.mime,
      created_at: asset.created_at,
      usage_count: usageMap[asset.url] || 0
    }));
  }

  @Patch('images/:name')
  async updateTags(@Param('name') name: string, @Body() body: { tags?: string[] }) {
    const safeName = path.basename(name);
    const tags = Array.isArray(body?.tags) ? body.tags.map((t) => t.trim()).filter(Boolean) : [];
    return this.prisma.mediaAsset.update({
      where: { name: safeName },
      data: { tags }
    });
  }

  @Delete('images/:name')
  async remove(@Param('name') name: string, @Query('force') force?: string) {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const safeName = path.basename(name);
    const normalizedUrl = `/uploads/${safeName}`;
    const normalizedUrlWithSlash = `${normalizedUrl}/`;
    const asset =
      (await this.prisma.mediaAsset.findUnique({ where: { name: safeName } })) ||
      (await this.prisma.mediaAsset.findFirst({
        where: {
          OR: [
            { url: normalizedUrl },
            { url: normalizedUrlWithSlash },
            { url: { endsWith: `/${safeName}` } },
            { url: { endsWith: `/${safeName}/` } }
          ]
        }
      }));

    if (asset && force !== '1') {
      const usage = await this.usageCountMap([asset.url]);
      if ((usage[asset.url] || 0) > 0) {
        return { ok: false, reason: 'in_use' };
      }
    }

    const candidateNames = Array.from(
      new Set(
        [
          safeName,
          asset?.name,
          path.basename((asset?.url || '').replace(/\/+$/, ''))
        ].filter((value): value is string => Boolean(value && value.trim()))
      )
    );

    let deletedFile = false;
    for (const candidate of candidateNames) {
      const fullPath = path.join(uploadDir, candidate);
      if (!fs.existsSync(fullPath)) continue;
      try {
        fs.unlinkSync(fullPath);
        deletedFile = true;
        break;
      } catch {
        return { ok: false, reason: 'unlink_failed' };
      }
    }

    const deletedAsset = await this.prisma.mediaAsset.deleteMany({
      where: {
        OR: [
          { name: safeName },
          ...(asset?.id ? [{ id: asset.id }] : []),
          { url: normalizedUrl },
          { url: normalizedUrlWithSlash }
        ]
      }
    });

    if (deletedFile || deletedAsset.count > 0) {
      return { ok: true };
    }
    return { ok: false, reason: 'not_found' };
  }

  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * Number(process.env.MAX_UPLOAD_MB || 5)
      },
      fileFilter: (_req, file, cb) => {
        const allowed = (process.env.ALLOWED_UPLOAD_MIME || 'image/png,image/jpeg,image/webp,image/gif')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
        const allowedExt = (process.env.ALLOWED_UPLOAD_EXT || '.png,.jpg,.jpeg,.webp,.gif')
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean);
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(file.mimetype)) {
          if (allowedExt.length === 0 || allowedExt.includes(ext)) {
            cb(null, true);
            return;
          }
          cb(new BadRequestException('Unsupported file extension'), false);
          return;
        }
        cb(new BadRequestException('Unsupported file type'), false);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = process.env.UPLOAD_DIR || 'uploads';
          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${Date.now()}${ext}`);
        }
      })
    })
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    await this.prisma.mediaAsset.create({
      data: {
        name: file.filename,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mime: file.mimetype
      }
    });
    return { url: `/uploads/${file.filename}` };
  }
}
