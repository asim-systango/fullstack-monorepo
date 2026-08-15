import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ArticlesService } from './articles.service';

const TICK_MS = 30_000;

/**
 * In-process stand-in for a cron worker. Every 30s, due schedules go through
 * the same publishRevision transaction as Publish Now. No Redis/queue.
 */
@Injectable()
export class ArticleScheduleTicker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ArticleScheduleTicker.name);
  private timer: ReturnType<typeof setInterval> | undefined;
  private running = false;

  constructor(private readonly articlesService: ArticlesService) {}

  onModuleInit(): void {
    void this.tick();
    this.timer = setInterval(() => {
      void this.tick();
    }, TICK_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.articlesService.runDueSchedules();
      if (result.published.length > 0) {
        this.logger.log(`Published ${result.published.length} scheduled article(s)`);
      }
    } catch (err) {
      this.logger.warn(
        `Scheduled publish tick failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    } finally {
      this.running = false;
    }
  }
}
