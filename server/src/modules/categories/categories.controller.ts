import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { LogsService } from '../logs/logs.service';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private categories: CategoriesService, private logs: LogsService) {}

  @Get('public')
  listPublic() {
    return this.categories.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Get()
  list() {
    return this.categories.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Post()
  async create(
    @Body() body: { name_ar: string; name_en: string; icon?: string | null },
    @CurrentUser() user: any
  ) {
    const created = await this.categories.create(body);
    await this.logs.log(user.id, 'CREATE', 'CATEGORY', created.id, null, created);
    return created;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name_ar?: string; name_en?: string; icon?: string | null },
    @CurrentUser() user: any
  ) {
    const before = (await this.categories.list()).find((c) => c.id === id) || null;
    const updated = await this.categories.update(id, body);
    await this.logs.log(user.id, 'UPDATE', 'CATEGORY', id, before, updated);
    return updated;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_WRITER, UserRole.EDITOR, UserRole.CHIEF_EDITOR)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const before = (await this.categories.list()).find((c) => c.id === id) || null;
    const removed = await this.categories.remove(id);
    await this.logs.log(user.id, 'DELETE', 'CATEGORY', id, before, removed);
    return removed;
  }
}
