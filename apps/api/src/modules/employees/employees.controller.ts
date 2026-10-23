import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get()
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Employees and managers who can hold leave balances' })
  list() {
    return this.employees.list();
  }
}
