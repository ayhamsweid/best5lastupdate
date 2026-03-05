import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { LogsModule } from '../logs/logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AutomationTokenGuard } from './guards/automation-token.guard';

@Module({
  imports: [LogsModule, NotificationsModule],
  providers: [PostsService, AutomationTokenGuard],
  controllers: [PostsController]
})
export class PostsModule {}
