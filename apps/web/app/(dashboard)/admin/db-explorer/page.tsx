'use client';

import { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import {
  Database,
  Table as TableIcon,
  Search,
  Eye,
  RefreshCw,
  Server,
  Layers,
  ChevronLeft,
  ChevronRight,
  Code2,
  X,
  FileJson,
  CheckCircle2,
  Building2,
  Users,
  Calendar,
  ClipboardList,
  BedDouble,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  Button,
  TextInput,
  Badge,
} from '@shared/ui/components';
import {
  fetchAllTables,
  fetchTableDetail,
  TableSummary,
  TableDetailResponse,
} from '@/features/db-explorer/services';

const DOMAIN_GROUPS = [
  {
    name: 'IAM & Multi-Tenancy',
    icon: Building2,
    color: 'border-blue-500/30 bg-blue-500/5 text-blue-500',
    tables: ['hospitals', 'hospital_branches', 'user_roles'],
  },
  {
    name: 'Organization & Staffing',
    icon: Users,
    color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500',
    tables: ['departments', 'staff_profiles', 'doctor_profiles', 'doctor_departments'],
  },
  {
    name: 'OPD & Scheduling',
    icon: Calendar,
    color: 'border-purple-500/30 bg-purple-500/5 text-purple-500',
    tables: ['doctor_schedules', 'slots', 'appointments'],
  },
  {
    name: 'Clinical EHR',
    icon: ClipboardList,
    color: 'border-amber-500/30 bg-amber-500/5 text-amber-500',
    tables: [
      'patient_profiles',
      'encounters',
      'medical_notes',
      'prescriptions',
      'prescription_items',
    ],
  },
  {
    name: 'IPD Bed Management',
    icon: BedDouble,
    color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-500',
    tables: ['wards', 'beds', 'admissions'],
  },
  {
    name: 'Billing & Financials',
    icon: CreditCard,
    color: 'border-teal-500/30 bg-teal-500/5 text-teal-500',
    tables: ['invoices', 'invoice_items', 'payments', 'insurance_claims'],
  },
  {
    name: 'Governance & Audit',
    icon: ShieldCheck,
    color: 'border-rose-500/30 bg-rose-500/5 text-rose-500',
    tables: ['audit_logs'],
  },
];

function renderCellValue(val: unknown) {
  if (val === null || val === undefined) {
    return <span className="text-muted-foreground/40 italic">null</span>;
  }
  if (typeof val === 'object') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
        <FileJson className="size-3" />
        <span>JSON Object</span>
      </span>
    );
  }
  if (typeof val === 'boolean') {
    const isTrue = Boolean(val);
    return (
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isTrue ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}
      >
        {String(val)}
      </span>
    );
  }
  return <span>{String(val)}</span>;
}

export default function DbExplorerPage() {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('hospitals');
  const [tableDetail, setTableDetail] = useState<TableDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(
    null,
  );

  const loadTables = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllTables();
    setTables(data);
    if (data.length > 0 && !data.some((t) => t.tableName === selectedTable)) {
      setSelectedTable(data[0]!.tableName);
    }
    setLoading(false);
  }, [selectedTable]);

  const loadDetail = useCallback(async (table: string, pageNum: number) => {
    setDetailLoading(true);
    const data = await fetchTableDetail(table, pageNum, 10);
    setTableDetail(data);
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    void loadTables();
  }, [loadTables]);

  useEffect(() => {
    if (selectedTable) {
      setPage(1);
      void loadDetail(selectedTable, 1);
    }
  }, [selectedTable, loadDetail]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void loadDetail(selectedTable, newPage);
  };

  const totalSystemRows = useMemo(
    () => tables.reduce((acc, curr) => acc + (curr.rowCount || 0), 0),
    [tables],
  );

  const filteredRows = useMemo(() => {
    if (!tableDetail?.data) return [];
    if (!searchTerm.trim()) return tableDetail.data;
    const term = searchTerm.toLowerCase();
    return tableDetail.data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [tableDetail, searchTerm]);

  const renderTableBody = () => {
    if (detailLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="size-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading table records...</p>
          </div>
        </div>
      );
    }

    if (filteredRows.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-center">
          <div>
            <Code2 className="size-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No matching rows found
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {searchTerm
                ? 'Try clearing your search query.'
                : 'This database table is currently empty.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-muted/40 border-b border-border/50 font-mono text-[11px] text-muted-foreground">
            <th className="p-3 font-semibold text-center w-12">Inspect</th>
            {tableDetail?.columns?.map((col) => (
              <th key={col.columnName} className="p-3 font-semibold whitespace-nowrap">
                {col.columnName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30 font-mono">
          {filteredRows.map((row, idx) => {
            const rowKey = String(row.id || idx);
            return (
              <tr key={rowKey} className="hover:bg-muted/30 transition-colors">
                <td className="p-2 text-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 rounded-lg text-muted-foreground hover:text-primary"
                    onClick={() => setSelectedRecord(row)}
                    title="Inspect JSON Record"
                  >
                    <Eye className="size-3.5" />
                  </Button>
                </td>
                {tableDetail?.columns?.map((col) => (
                  <td
                    key={col.columnName}
                    className="p-3 whitespace-nowrap max-w-xs truncate text-[11px]"
                  >
                    {renderCellValue(row[col.columnName])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-primary/80 p-6 text-primary-foreground shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Database className="size-3.5" />
              <span>Multi-Tenant Architecture Observability</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
              Enterprise Database Explorer
            </h1>
            <p className="mt-1 text-xs text-primary-foreground/80 md:text-sm">
              Real-time schema introspection & row visualizer for all 19 normalized
              hospital entities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void loadTables()}
              disabled={loading}
              className="gap-2 shadow-xs backdrop-blur-md"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Schema</span>
            </Button>
          </div>
        </div>

        {/* System Stats Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
              <TableIcon className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                Entities
              </p>
              <p className="text-lg font-bold">{tables.length || 19}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                Total Rows
              </p>
              <p className="text-lg font-bold">{totalSystemRows.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
              <Server className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                Database
              </p>
              <p className="text-lg font-bold">PostgreSQL 16</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
              <CheckCircle2 className="size-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                Status
              </p>
              <p className="text-lg font-bold text-emerald-200">HEALTHY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Navigation Sidebar & Right Data Viewer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Navigation: Entity Domain Navigator */}
        <Card className="lg:col-span-4 xl:col-span-3 border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>Domain Tables</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Select table to inspect structure and rows
            </CardDescription>
          </CardHeader>
          <CardBody className="p-3 space-y-4 max-h-[700px] overflow-y-auto">
            {DOMAIN_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.name} className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Icon className="size-3.5 text-primary" />
                    <span>{group.name}</span>
                  </div>
                  <div className="space-y-1">
                    {group.tables.map((tName) => {
                      const summary = tables.find((t) => t.tableName === tName);
                      const isSelected = selectedTable === tName;
                      return (
                        <button
                          key={tName}
                          onClick={() => setSelectedTable(tName)}
                          className={`
                            w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all duration-150 text-left
                            ${
                              isSelected
                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                : 'hover:bg-muted/70 text-foreground/80'
                            }
                          `}
                        >
                          <span className="font-mono text-[11px] truncate">{tName}</span>
                          <span
                            className={`
                              px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold
                              ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }
                            `}
                          >
                            {summary?.rowCount ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Right Data Viewer */}
        <Card className="lg:col-span-8 xl:col-span-9 border-border/60 shadow-xs flex flex-col">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="accent" className="font-mono text-xs">
                    {tableDetail?.columns?.length ?? 0} columns
                  </Badge>
                  <Badge tone="neutral" className="font-mono text-xs">
                    {tableDetail?.totalRows ?? 0} total records
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold font-mono mt-1 text-foreground">
                  {selectedTable}
                </CardTitle>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground z-10" />
                <TextInput
                  placeholder="Filter visible rows..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Column Schema Badges */}
            {tableDetail?.columns && (
              <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                {tableDetail.columns.map((col) => (
                  <span
                    key={col.columnName}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-muted/60 text-muted-foreground font-mono border border-border/40"
                  >
                    <span className="font-semibold text-foreground">
                      {col.columnName}
                    </span>
                    <span className="text-[9px] text-primary">:{col.dataType}</span>
                  </span>
                ))}
              </div>
            )}
          </CardHeader>

          {/* Table Content Area */}
          <CardBody className="p-0 flex-1 overflow-x-auto">{renderTableBody()}</CardBody>

          {/* Footer Pagination */}
          {tableDetail && tableDetail.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Showing Page{' '}
                <span className="font-semibold text-foreground">{tableDetail.page}</span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">
                  {tableDetail.totalPages}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="h-8 gap-1 text-xs rounded-xl"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= tableDetail.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="h-8 gap-1 text-xs rounded-xl"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* JSON Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-border/80 shadow-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <FileJson className="size-5 text-primary" />
                <CardTitle className="text-base font-bold font-mono">
                  Record Details &bull; {selectedTable}
                </CardTitle>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 rounded-lg"
                onClick={() => setSelectedRecord(null)}
              >
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardBody className="p-4 max-h-[500px] overflow-y-auto font-mono text-xs">
              <pre className="p-4 rounded-xl bg-muted/60 border border-border/50 text-foreground overflow-x-auto">
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
