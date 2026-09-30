import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { EIcon } from '@/shared/enums';
import { TOption } from '@/shared/types';
import { getValueChildren, mapChildren } from '@/shared/utils';
import Icon from '../../../atoms/icon/icon.component';
import Dropdown from '../../dropdown/dropdown.component';

@Component({
  selector: 'app-entry-select',
  standalone: true,
  imports: [CommonModule, Dropdown, Icon],
  template: `
    <app-dropdown
      [options]="listOptions()"
      [translate]="translate()"
      (handleOpen)="stateEntrySelect.set({ isOpen: $event })"
      classContainer="entry-select">
      <input
        [name]="name()"
        [ngClass]="{ entry: true, disabled: disabled() }"
        [placeholder]="placeholder()"
        [attr.value]="listLabel()?.join(', ') || ''"
        readonly />
      <app-icon [name]="EIcon.Arrow" [ngClass]="{ open: stateEntrySelect().isOpen }" />
    </app-dropdown>
  `,
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EntrySelect {
  EIcon = EIcon;

  readonly name = input('select');
  readonly options = input<TOption[]>([]);
  readonly value = input<(string | number)[]>([]);
  readonly disabled = input(false);
  readonly placeholder = input<string | undefined>('');
  readonly isMultiple = input();
  readonly handleChange = output<(string | number)[]>();
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();

  readonly stateEntrySelect = signal({ isOpen: false });
  readonly listOptions = computed(() =>
    mapChildren({
      options: this.options(),
      convert: item => ({
        ...item,
        onClick: () => this.fnChange(item.value),
        isActive: this.value()?.includes(item.value),
      }),
    }),
  );
  readonly listLabel = computed(() =>
    this.value()
      ? getValueChildren({
          children: this.options(),
          keyGetValue: 'label',
          value: this.value(),
        })
      : [],
  );

  fnChange = (optionValue: string | number) => {
    if (this.isMultiple()) {
      if (this.value().includes(optionValue)) {
        this.handleChange.emit(this.value().filter(v => v !== optionValue));
      } else {
        this.handleChange.emit([...this.value(), optionValue]);
      }
    } else {
      this.handleChange.emit([optionValue]);
    }
  };
}
