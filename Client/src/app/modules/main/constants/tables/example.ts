import type { ColumnDef } from '@tanstack/angular-table';

import { ETableAlign, ETableFilterType } from '@/shared/enums';
import type { IExample } from '../../interface';

export const table = (): ColumnDef<IExample>[] => [
  {
    accessorKey: 'id',
    header: 'Id',
    meta: {
      sorter: true,
      filter: ETableFilterType.Text,
      align: ETableAlign.Left,
    },
  },
  {
    accessorKey: 'albumId',
    header: 'Album Id',
    meta: {
      sorter: true,
      filter: ETableFilterType.Number,
      align: ETableAlign.Left,
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    meta: {
      sorter: true,
      filter: ETableFilterType.Text,
      align: ETableAlign.Left,
    },
  },
  {
    accessorKey: 'url',
    header: 'Url',
    meta: {
      sorter: true,
      filter: ETableFilterType.Text,
      align: ETableAlign.Right,
    },
  },
  {
    accessorKey: 'thumbnailUrl',
    header: 'Thumbnail Url',
    meta: {
      sorter: true,
      filter: ETableFilterType.Text,
      align: ETableAlign.Center,
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    meta: {
      sorter: true,
      filter: ETableFilterType.Date,
      align: ETableAlign.Right,
    },
  },
];

export default table;
