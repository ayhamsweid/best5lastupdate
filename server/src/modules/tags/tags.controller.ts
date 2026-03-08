import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { TagsService } from './tags.service';
import { LogsService } from '../logs/logs.service';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('tags')
export class TagsController {
  constructor(private tags: TagsService, private logs: LogsService) {}

  @Get('public')
  listPublic() {
    return this.tags.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Get()
  list() {
    return this.tags.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Post()
  async create(@Body() body: { name_ar: string; name_en: string }, @CurrentUser() user: any) {
    const created = await this.tags.create(body);
    await this.logs.log(user.id, 'CREATE', 'TAG', created.id, null, created);
    return created;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { name_ar?: string; name_en?: string }, @CurrentUser() user: any) {
    const before = (await this.tags.list()).find((t) => t.id === id) || null;
    const updated = await this.tags.update(id, body);
    await this.logs.log(user.id, 'UPDATE', 'TAG', id, before, updated);
    return updated;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const before = (await this.tags.list()).find((t) => t.id === id) || null;
    const removed = await this.tags.remove(id);
    await this.logs.log(user.id, 'DELETE', 'TAG', id, before, removed);
    return removed;
  }
}
