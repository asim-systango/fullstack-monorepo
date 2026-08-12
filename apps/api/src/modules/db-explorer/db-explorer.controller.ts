import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/auth';
import { DbExplorerService } from './db-explorer.service';

@Controller('db-explorer')
export class DbExplorerController {
  constructor(private readonly dbExplorerService: DbExplorerService) {}

  @Public()
  @Get('tables')
  async getAllTables() {
    const tables = await this.dbExplorerService.getAllTables();
    return {
      success: true,
      data: tables,
    };
  }

  @Public()
  @Get('tables/:tableName')
  async getTableDetail(
    @Param('tableName') tableName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10', 10)));
    const detail = await this.dbExplorerService.getTableDetail(
      tableName,
      pageNum,
      limitNum,
    );
    return {
      success: true,
      data: detail,
    };
  }
}
