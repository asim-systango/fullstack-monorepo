import { Module } from '@nestjs/common';
import { DbExplorerController } from './db-explorer.controller';
import { DbExplorerService } from './db-explorer.service';

@Module({
  controllers: [DbExplorerController],
  providers: [DbExplorerService],
  exports: [DbExplorerService],
})
export class DbExplorerModule {}
