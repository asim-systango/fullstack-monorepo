import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import type { UserRole } from '../../common/auth';

export type Employee = { id: string; name: string; email: string; role: UserRole };

// people who can apply for leave and hold balances
export const APPLICANT_ROLES: readonly UserRole[] = ['user', 'staff'];

const EMPLOYEE_COLUMNS = 'SELECT id, name, email, role FROM users';

// read only! the users table belongs to the gateway, we never write to it from here
@Injectable()
export class EmployeesService {
  constructor(private readonly dataSource: DataSource) {}

  list(): Promise<Employee[]> {
    return this.dataSource.query(
      `${EMPLOYEE_COLUMNS} WHERE role = ANY($1) ORDER BY name`,
      [APPLICANT_ROLES],
    );
  }

  // pass the manager when calling inside a transaction
  async findById(id: string, manager?: EntityManager): Promise<Employee | null> {
    const runner = manager ?? this.dataSource;
    const rows: Employee[] = await runner.query(`${EMPLOYEE_COLUMNS} WHERE id = $1`, [
      id,
    ]);
    return rows[0] ?? null;
  }

  async findApplicant(id: string): Promise<Employee | null> {
    const employee = await this.findById(id);
    return employee && APPLICANT_ROLES.includes(employee.role) ? employee : null;
  }

  async byIds(ids: readonly string[]): Promise<Map<string, Employee>> {
    const unique = Array.from(new Set(ids));
    if (unique.length === 0) return new Map();
    const rows: Employee[] = await this.dataSource.query(
      `${EMPLOYEE_COLUMNS} WHERE id = ANY($1::uuid[])`,
      [unique],
    );
    return new Map(rows.map((row) => [row.id, row]));
  }
}
