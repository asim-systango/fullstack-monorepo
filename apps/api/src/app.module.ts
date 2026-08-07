import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';

/**
 * Internal domain API — DatabaseModule manages the TypeORM connection & entity repositories.
 */
@Module({
  imports: [DatabaseModule],
})
export class AppModule {}
