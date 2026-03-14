import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateAutomationDraftDto } from './dto/create-automation-draft.dto';
import { AutomationTokenGuard } from './guards/automation-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';

@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService, private logs: LogsService, private notifications: NotificationsService) {}

  @Get('public')
  publicList(@Query('lang') lang?: string, @Query('category') category?: string) {
    const safeLang = lang === 'en' ? 'en' : 'ar';
    return this.posts.publicList(safeLang, category);
  }

  @Get('public/:slug')
  publicDetail(@Param('slug') slug: string, @Query('lang') lang?: string) {
    const safeLang = lang === 'en' ? 'en' : 'ar';
    return this.posts.publicBySlug(safeLang, slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Get()
  list() {
    return this.posts.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Get('preview/:id')
  preview(@Param('id') id: string) {
    return this.posts.previewById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.posts.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Post()
  async create(@Body() dto: CreatePostDto, @CurrentUser() user: any) {
    if ((dto.status === PostStatus.PUBLISHED || dto.status === PostStatus.SCHEDULED) && ![UserRole.ADMIN, UserRole.CHIEF_EDITOR].includes(user.role)) {
      throw new ForbiddenException('Only admin or chief editor can publish');
    }
    if (dto.status === PostStatus.SCHEDULED && !dto.scheduled_at) {
      throw new BadRequestException('scheduled_at is required for scheduled posts');
    }
    const created = await this.posts.create(user.id, dto);
    await this.posts.createRevision(created, user.id);
    if (dto.status === PostStatus.REVIEW) {
      await this.notifications.notifyRoles([UserRole.ADMIN, UserRole.CHIEF_EDITOR], {
        title: 'Post awaiting review',
        body: created.title_en || created.title_ar,
        href: `/admin/posts/edit/${created.id}`
      });
    }
    if (dto.status === PostStatus.SCHEDULED) {
      await this.notifications.notifyRoles([UserRole.ADMIN, UserRole.CHIEF_EDITOR], {
        title: 'Post scheduled',
        body: created.title_en || created.title_ar,
        href: `/admin/posts/edit/${created.id}`
      });
    }
    await this.logs.log(user.id, 'CREATE', 'POST', created.id, null, created);
    return created;
  }

  @UseGuards(AutomationTokenGuard)
  @Post('automation/draft')
  async createAutomationDraft(@Body() dto: CreateAutomationDraftDto) {
    const author = await this.posts.resolveAutomationAuthor();
    const titleAr = dto.title_ar.trim();
    const titleEn = dto.title_en?.trim() || titleAr;
    const excerptAr = dto.excerpt_ar?.trim() || titleAr;
    const excerptEn = dto.excerpt_en?.trim() || titleEn;
    const created = await this.posts.create(author.id, {
      title_ar: titleAr,
      title_en: titleEn,
      excerpt_ar: excerptAr,
      excerpt_en: excerptEn,
      content_ar: dto.content_ar || '',
      content_en: dto.content_en || '',
      category_id: dto.category_id,
      seo_title_ar: dto.seo_title_ar,
      seo_title_en: dto.seo_title_en,
      seo_desc_ar: dto.seo_desc_ar,
      seo_desc_en: dto.seo_desc_en,
      canonical_url: dto.canonical_url,
      og_image_url: dto.og_image_url,
      cover_image_url: dto.cover_image_url,
      content_blocks_json: dto.content_blocks_json,
      status: PostStatus.DRAFT
    });
    await this.posts.createRevision(created, author.id);
    await this.logs.log(author.id, 'CREATE', 'POST', created.id, null, {
      ...created,
      automation_source: dto.source || 'opal'
    });
    return created;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @CurrentUser() user: any) {
    if ((dto.status === PostStatus.PUBLISHED || dto.status === PostStatus.SCHEDULED) && ![UserRole.ADMIN, UserRole.CHIEF_EDITOR].includes(user.role)) {
      throw new ForbiddenException('Only admin or chief editor can publish');
    }
    if (dto.status === PostStatus.SCHEDULED && !dto.scheduled_at) {
      throw new BadRequestException('scheduled_at is required for scheduled posts');
    }
    const before = await this.posts.findOne(id);
    if (before) {
      await this.posts.createRevision(before, user.id);
    }
    const updated = await this.posts.update(id, dto);
    if (dto.status === PostStatus.REVIEW) {
      await this.notifications.notifyRoles([UserRole.ADMIN, UserRole.CHIEF_EDITOR], {
        title: 'Post awaiting review',
        body: updated.title_en || updated.title_ar,
        href: `/admin/posts/edit/${updated.id}`
      });
    }
    if (dto.status === PostStatus.SCHEDULED) {
      await this.notifications.notifyRoles([UserRole.ADMIN, UserRole.CHIEF_EDITOR], {
        title: 'Post scheduled',
        body: updated.title_en || updated.title_ar,
        href: `/admin/posts/edit/${updated.id}`
      });
    }
    await this.logs.log(user.id, 'UPDATE', 'POST', id, before, updated);
    return updated;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER)
  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = process.env.UPLOAD_DIR || 'uploads';
          const fs = require('fs');
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
  async uploadCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    const before = await this.posts.findOne(id);
    const updated = await this.posts.update(id, { cover_image_url: `/uploads/${file.filename}` });
    await this.logs.log(user.id, 'UPDATE', 'POST', id, before, updated);
    return updated;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Get(':id/revisions')
  listRevisions(@Param('id') id: string) {
    return this.posts.listRevisions(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHIEF_EDITOR)
  @Post(':id/revisions/:revisionId/restore')
  async restoreRevision(@Param('id') id: string, @Param('revisionId') revisionId: string, @CurrentUser() user: any) {
    const before = await this.posts.findOne(id);
    const updated = await this.posts.restoreRevision(id, revisionId);
    await this.logs.log(user.id, 'UPDATE', 'POST', id, before, updated);
    return updated;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const before = await this.posts.findOne(id);
    if (!before) {
      throw new NotFoundException('Post not found');
    }
    if (![PostStatus.DRAFT, PostStatus.PUBLISHED].includes(before.status)) {
      throw new BadRequestException('Only draft or published posts can be deleted');
    }
    if (before.status === PostStatus.PUBLISHED && ![UserRole.ADMIN, UserRole.CHIEF_EDITOR].includes(user.role)) {
      throw new ForbiddenException('Only admin or chief editor can delete published posts');
    }
    const result = await this.posts.remove(id);
    await this.logs.log(user.id, 'DELETE', 'POST', id, before, result);
    return result;
  }
}
