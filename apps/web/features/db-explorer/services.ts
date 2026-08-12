const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

export async function fetchAllTables(): Promise<TableSummary[]> {
  try {
    const res = await fetch(`${API_URL}/db-explorer/tables`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch table list');
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

export async function fetchTableDetail(
  tableName: string,
  page = 1,
  limit = 10,
): Promise<TableDetailResponse | null> {
  try {
    const res = await fetch(
      `${API_URL}/db-explorer/tables/${tableName}?page=${page}&limit=${limit}`,
      {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      },
    );
    if (!res.ok) throw new Error(`Failed to fetch detail for ${tableName}`);
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error(`Error fetching table detail for ${tableName}:`, error);
    return null;
  }
}
