import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.tag.findMany({ orderBy: { created_at: 'desc' } });
  }

  private async ensureUniqueSlug(field: 'slug_ar' | 'slug_en', base: string) {
    let candidate = base || `${Date.now()}`;
    let counter = 2;
    while (await this.prisma.tag.findFirst({ where: { [field]: candidate } as any })) {
      candidate = `${base}-${counter}`;
      counter += 1;
    }
    return candidate;
  }

  async create(data: { name_ar: string; name_en: string }) {
    const baseAr = slugify(data.name_ar || data.name_en);
    const baseEn = slugify(data.name_en || data.name_ar);
    const slug_ar = await this.ensureUniqueSlug('slug_ar', baseAr);
    const slug_en = await this.ensureUniqueSlug('slug_en', baseEn);
    return this.prisma.tag.create({
      data: {
        ...data,
        slug_ar,
        slug_en
      }
    });
  }

  async update(id: string, data: { name_ar?: string; name_en?: string }) {
    const current = await this.prisma.tag.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Tag not found');

    const nextNameAr = (data.name_ar ?? current.name_ar).trim();
    const nextNameEn = (data.name_en ?? current.name_en).trim();
    if (!nextNameAr || !nextNameEn) {
      throw new BadRequestException('Both Arabic and English names are required');
    }

    const payload: any = {
      name_ar: nextNameAr,
      name_en: nextNameEn
    };

    if (nextNameAr !== current.name_ar) {
      payload.slug_ar = await this.ensureUniqueSlug('slug_ar', slugify(nextNameAr || nextNameEn));
    }
    if (nextNameEn !== current.name_en) {
      payload.slug_en = await this.ensureUniqueSlug('slug_en', slugify(nextNameEn || nextNameAr));
    }

    return this.prisma.tag.update({
      where: { id },
      data: payload
    });
  }

  async remove(id: string) {
    const current = await this.prisma.tag.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Tag not found');

    await this.prisma.$transaction([
      this.prisma.postTag.deleteMany({ where: { tag_id: id } }),
      this.prisma.tag.delete({ where: { id } })
    ]);

    return current;
  }
}
