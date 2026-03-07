import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { LogsModule } from '../logs/logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostCreateAuthGuard } from './guards/post-create-auth.guard';

@Module({
  imports: [JwtModule.register({}), LogsModule, NotificationsModule],
  providers: [PostsService, PostCreateAuthGuard],
  controllers: [PostsController]
})
export class PostsModule {}
