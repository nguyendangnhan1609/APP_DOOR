import { ServiceTranslate } from '@/core/services';
import { EIcon } from '@/shared/enums';
import { TOption } from '@/shared/types';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import Icon from '../../atoms/icon/icon.component';
import EntrySelect from '../entry/select/select.component';

export type TPagination = { disabled: boolean; type: string; index: number };

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, Icon, EntrySelect],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pagination" *ngIf="total() > 0">
      <div class="left">
        <app-entry-select
          [value]="[perPage()]"
          [options]="pageSizeOptions()"
          [translate]="serviceTranslate.t()"
          (handleChange)="fnPerPageChange($event)" />
        <div class="whitespace-nowrap">
          {{ description()(ranges()[0], ranges()[1], total()) }}
        </div>
      </div>
      <div class="right">
        <button
          *ngFor="let item of paginationItems()"
          [disabled]="item.disabled"
          [ngClass]="{ active: page() === item.index, disabled: item.disabled }"
          [attr.aria-label]="item.type"
          (click)="fnPageChange(item)"
          type="button">
          <ng-container *ngIf="!item.type.endsWith('5')">
            <app-icon
              *ngIf="item.type.startsWith('prev')"
              [name]="item.type === 'prev' ? EIcon.Arrow : EIcon.DoubleArrow"
              className="rotate-180" />
            <app-icon
              *ngIf="item.type.startsWith('next')"
              [name]="item.type === 'next' ? EIcon.Arrow : EIcon.DoubleArrow" />
          </ng-container>

          <span *ngIf="item.type === 'prev_5' || item.type === 'next_5'">...</span>
          <span *ngIf="item.type.startsWith('page')">{{ item.index }}</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./pagination.component.scss'],
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Components' },
  ],
})
export default class PaginationComponent {
  EIcon = EIcon;
  readonly serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.serviceTranslate.t()(key, params);

  readonly total = input(4);
  readonly page = input(1);
  readonly perPage = input(10);
  readonly description = input<(from: number, to: number, total: number) => string>(
    (from: number, to: number, total: number) => `${from}-${to} of ${total} items`,
  );
  readonly handleChange = output<{ perPage: number; page: number }>();

  constructor() {
    effect(() => {
      if (this.pageSizeOptions()?.length === 0) {
        this.pageSizeOptions.set(
          [this.perPage(), Math.trunc(this.perPage() * 1.5), Math.trunc(this.perPage() * 2.5)].map(
            item => ({
              value: item,
              label: item + ' / ' + this.t('Page').toLowerCase(),
            }),
          ),
        );
      }
    });
  }

  readonly pageSizeOptions = signal<TOption[]>([]);
  readonly ranges = computed(() => [
    (this.page() - 1) * this.perPage() + 1,
    Math.min(this.page() * this.perPage(), this.total()),
  ]);
  readonly lastIndex = computed(() => Math.ceil(this.total() / this.perPage()));

  fnMergeWithPrevNextButtons(listOfPage: TPagination[]) {
    const page = this.page();
    const lastIndex = this.lastIndex();
    return [
      { type: 'prev_10', index: -1, disabled: page - 10 < 1 },
      { type: 'prev', index: -1, disabled: page === 1 },
      ...listOfPage,
      { type: 'next', index: -1, disabled: page === lastIndex },
      { type: 'next_10', index: -1, disabled: page + 10 > lastIndex },
    ];
  }
  fnBuildPageList(start: number, end: number): TPagination[] {
    const list: TPagination[] = [];
    for (let i = start; i <= end; i++) {
      list.push({ index: i, type: 'page_' + i, disabled: false });
    }
    return list;
  }
  fnBuildButtons(selected: number, last: number): TPagination[] {
    let listOfRange: TPagination[];
    const prevFiveItem = { type: 'prev_5', index: -1, disabled: false };
    const nextFiveItem = { type: 'next_5', index: -1, disabled: false };
    const firstPageItem = this.fnBuildPageList(1, 1);
    const lastPageItem = this.fnBuildPageList(this.lastIndex(), this.lastIndex());
    if (selected < 4) {
      listOfRange = [...this.fnBuildPageList(2, 4), nextFiveItem];
    } else if (selected < last - 2) {
      listOfRange = [
        prevFiveItem,
        ...this.fnBuildPageList(selected - 1, selected + 1),
        nextFiveItem,
      ];
    } else {
      listOfRange = [prevFiveItem, ...this.fnBuildPageList(last - 3, last - 1)];
    }
    return [...firstPageItem, ...listOfRange, ...lastPageItem];
  }

  fnGeneratePaginationItems(page: number, lastIndex: number): TPagination[] {
    if (lastIndex <= 9) {
      return this.fnMergeWithPrevNextButtons(this.fnBuildPageList(1, lastIndex));
    } else {
      return this.fnMergeWithPrevNextButtons(this.fnBuildButtons(page, lastIndex));
    }
  }

  readonly paginationItems = computed(() =>
    this.fnGeneratePaginationItems(this.page(), this.lastIndex()),
  );

  fnPerPageChange = (value: (string | number)[]) =>
    this.handleChange.emit({
      perPage: (value?.length ? value[0] : 0) as number,
      page: this.page(),
    });

  fnPageChange(item: TPagination) {
    let index = item.index;
    switch (item.type) {
      case 'prev':
        index = this.page() - 1;
        break;
      case 'prev_10':
        index = this.page() - 10;
        break;
      case 'next':
        index = this.page() + 1;
        break;
      case 'next_10':
        index = this.page() + 10;
        break;
      default:
    }
    if (index > 0 && index <= this.lastIndex()) {
      this.handleChange.emit({ perPage: this.perPage(), page: index });
    }
  }
}
