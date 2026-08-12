import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface TableSummary {
  tableName: string;
  rowCount: number;
  columnCount: number;
}

export interface ColumnMeta {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
}

export interface TableDetailResponse {
  tableName: string;
  columns: ColumnMeta[];
  totalRows: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Record<string, unknown>[];
}

@Injectable()
export class DbExplorerService {
  constructor(private readonly dataSource: DataSource) {}

  private readonly allowedTables = [
    'hospitals',
    'hospital_branches',
    'user_roles',
    'patient_profiles',
    'departments',
    'staff_profiles',
    'doctor_profiles',
    'doctor_departments',
    'doctor_schedules',
    'slots',
    'appointments',
    'encounters',
    'medical_notes',
    'prescriptions',
    'prescription_items',
    'wards',
    'beds',
    'admissions',
    'invoices',
    'invoice_items',
    'payments',
    'insurance_claims',
    'audit_logs',
    'notifications',
  ];

  async getAllTables(): Promise<TableSummary[]> {
    const summaries: TableSummary[] = [];

    for (const table of this.allowedTables) {
      try {
        const countRes = await this.dataSource.query(
          `SELECT COUNT(*)::int AS count FROM "${table}"`,
        );
        const colRes = await this.dataSource.query(
          `SELECT COUNT(*)::int AS col_count FROM information_schema.columns WHERE table_name = $1`,
          [table],
        );
        summaries.push({
          tableName: table,
          rowCount: countRes[0]?.count || 0,
          columnCount: colRes[0]?.col_count || 0,
        });
      } catch {
        // Table may not exist yet
      }
    }

    return summaries;
  }

  async getTableDetail(
    tableName: string,
    page = 1,
    limit = 10,
  ): Promise<TableDetailResponse> {
    if (!this.allowedTables.includes(tableName.toLowerCase())) {
      throw new NotFoundException(`Table '${tableName}' is not accessible or valid.`);
    }

    const safeTable = tableName.toLowerCase();
    const offset = (page - 1) * limit;

    const columnsRaw = await this.dataSource.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = $1 
       ORDER BY ordinal_position`,
      [safeTable],
    );

    const columns: ColumnMeta[] = columnsRaw.map(
      (c: {
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
      }) => ({
        columnName: c.column_name,
        dataType: c.data_type,
        isNullable: c.is_nullable === 'YES',
        columnDefault: c.column_default,
      }),
    );

    const countRes = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM "${safeTable}"`,
    );
    const totalRows = countRes[0]?.count || 0;
    const totalPages = Math.ceil(totalRows / limit) || 1;

    const data = await this.dataSource.query(
      `SELECT * FROM "${safeTable}" LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return {
      tableName: safeTable,
      columns,
      totalRows,
      page,
      limit,
      totalPages,
      data: data as Record<string, unknown>[],
    };
  }
}
