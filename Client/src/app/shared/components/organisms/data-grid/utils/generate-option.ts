import {
  type ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  type TableState,
} from '@tanstack/angular-table';
import dayjs from 'dayjs';

import type { TTableState } from '@/shared/types';
import type DataGridProps from '../type';
import type Props from './type';

export default <TData>({
  header,
  body,
  data,
  maxSize,
  columns,
  isPagination,
  isFilter,
  filterGlobal,
  keyId,
  stateTanstack,
  setStateTanstack,
}: Pick<DataGridProps<TData>, 'columns' | 'data' | 'filterGlobal' | 'header' | 'body' | 'keyId'> &
  Pick<Props<TData>, 'stateTanstack' | 'setStateTanstack'> & {
    readonly isPagination?: boolean;
    readonly maxSize: number;
    readonly isFilter: boolean;
  }) => {
  const option: TableOptions<TData> = {
    filterFns: {
      global: (row, columnId, value, addMeta) =>
        !filterGlobal || filterGlobal(row, columnId, value, addMeta),
      blank: (row, columnId) =>
        typeof row.original[columnId] === 'number' ||
        (typeof row.original[columnId] === 'string' && row.original[columnId]?.trim().length === 0),
      notBlank: (row, columnId) =>
        typeof row.original[columnId] === 'number' ||
        (typeof row.original[columnId] === 'string' && row.original[columnId]?.trim().length > 0),
      includeText: (row, columnId, value) =>
        !value || row.original[columnId]?.trim()?.includes(value?.trim()),
      notIncludeText: (row, columnId, value) =>
        !value || !row.original[columnId]?.trim()?.includes(value?.trim()),
      startText: (row, columnId, value) =>
        !value || row.original[columnId]?.trim()?.startsWith(value?.trim()),
      endText: (row, columnId, value) =>
        !value || row.original[columnId]?.trim()?.endsWith(value?.trim()),
      sameText: (row, columnId, value) =>
        !value || row.original[columnId]?.trim() === value?.trim(),
      sameDate: (row, columnId, value) =>
        !value ||
        !row.original[columnId] ||
        dayjs(value).isSame(dayjs(row.original[columnId]), 'day'),
      beforeDate: (row, columnId, value) =>
        !value ||
        !row.original[columnId] ||
        dayjs(row.original[columnId]).isBefore(dayjs(value), 'day'),
      afterDate: (row, columnId, value) =>
        !value ||
        !row.original[columnId] ||
        dayjs(row.original[columnId]).isAfter(dayjs(value), 'day'),
      greaterNumber: (row, columnId, value) =>
        value === undefined || row.original[columnId] > parseFloat(value),
      greaterEqualNumber: (row, columnId, value) =>
        value === undefined || row.original[columnId] >= parseFloat(value),
      lessNumber: (row, columnId, value) =>
        value === undefined || row.original[columnId] < parseFloat(value),
      lessEqualNumber: (row, columnId, value) =>
        value === undefined || row.original[columnId] <= parseFloat(value),
      equalNumber: (row, columnId, value) =>
        value === undefined || row.original[columnId] === parseFloat(value),
      notEqualNumber: (row, columnId, value) =>
        value === undefined || row.original[columnId] !== parseFloat(value),
      middleNumber: (row, columnId, value) =>
        !value ||
        value.length !== 2 ||
        (row.original[columnId] >= parseFloat(value[0]) &&
          row.original[columnId] <= parseFloat(value[1])),
      notMiddleNumber: (row, columnId, value) =>
        !value ||
        value.length !== 2 ||
        row.original[columnId] < parseFloat(value[0]) ||
        row.original[columnId] > parseFloat(value[1]),
    },
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: stateTanstack as Partial<TableState> | undefined,
    initialState: {
      columnPinning: header?.pinning,
    },
    onColumnVisibilityChange: updaterOrValue =>
      setStateTanstack({
        ...stateTanstack,
        columnVisibility:
          typeof updaterOrValue === 'function'
            ? updaterOrValue(stateTanstack.columnVisibility)
            : updaterOrValue,
      }),
    globalFilterFn: 'global',
    enableColumnFilters: isFilter,
    getRowId: row => row[keyId as keyof TData] as string,
    onColumnPinningChange: updaterOrValue =>
      setStateTanstack({
        ...stateTanstack,
        columnPinning:
          typeof updaterOrValue === 'function'
            ? updaterOrValue(stateTanstack.columnPinning)
            : updaterOrValue,
      }),
  };

  if (isFilter && option.state) {
    option.onColumnFiltersChange = updaterOrValue =>
      setStateTanstack({
        ...stateTanstack,
        columnFilters:
          typeof updaterOrValue === 'function'
            ? updaterOrValue(stateTanstack.columnFilters)
            : updaterOrValue,
      });
    option.onGlobalFilterChange = updaterOrValue =>
      setStateTanstack({
        ...stateTanstack,
        globalFilter:
          typeof updaterOrValue === 'function'
            ? updaterOrValue(stateTanstack.globalFilter)
            : updaterOrValue,
      });
    option.getFilteredRowModel = getFilteredRowModel(); //client-side filtering
    option.getFacetedRowModel = getFacetedRowModel(); // client-side faceting
    option.getFacetedUniqueValues = getFacetedUniqueValues(); // generate unique values for select filter/autocomplete
    option.getFacetedMinMaxValues = getFacetedMinMaxValues(); // generate min/max values for range filter
  }

  if (!header?.isNotResizing) {
    option.columnResizeMode = 'onChange';
    option.defaultColumn = {
      minSize: header?.width,
      maxSize,
    };
  }

  if (isPagination && option.state) {
    option.onPaginationChange = updaterOrValue =>
      setStateTanstack({
        ...stateTanstack,
        pagination:
          typeof updaterOrValue === 'function'
            ? updaterOrValue(stateTanstack.pagination)
            : updaterOrValue,
      });
    option.getPaginationRowModel = getPaginationRowModel();
  }

  if (!!body?.checkbox && !!option.state) {
    option.onRowSelectionChange = updaterOrValue =>
      setStateTanstack({
        ...stateTanstack,
        rowSelection:
          typeof updaterOrValue === 'function'
            ? updaterOrValue(stateTanstack.rowSelection)
            : updaterOrValue,
      });
    option.enableRowSelection = true;
    //option.enableRowSelection = row => row.original.age > 18, // or enable row selection conditionally per row
  }

  if (body?.isExpanded && option.state) {
    option.getSubRows = row => row['children' as keyof typeof row] as TData[];
    option.onExpandedChange = updaterOrValue =>
      setStateTanstack({
        ...stateTanstack,
        expanded:
          typeof updaterOrValue === 'function'
            ? updaterOrValue(stateTanstack.expanded)
            : updaterOrValue,
      });
    option.getExpandedRowModel = getExpandedRowModel();
    if (isFilter) option.filterFromLeafRows = true;
    if (isPagination) option.paginateExpandedRows = false;
  }

  return isSort<TData>({ option, columns, stateTanstack, setStateTanstack });
};
const isSort = <TData>({
  option,
  columns,
  stateTanstack,
  setStateTanstack,
}: {
  option: TableOptions<TData>;
  columns: ColumnDef<TData>[];
  stateTanstack: TTableState;
  setStateTanstack: (val: TTableState) => void;
}) => {
  const isSorter =
    columns.length && columns.some(obj => obj.meta && Object.keys(obj.meta).includes('sorter'));
  if (isSorter && option.state) {
    option.onSortingChange = updaterOrValue =>
      setStateTanstack({
        ...stateTanstack,
        sorting:
          typeof updaterOrValue === 'function'
            ? updaterOrValue(stateTanstack.sorting)
            : updaterOrValue,
      });
    option.getSortedRowModel = getSortedRowModel();
  }
  return option;
};
