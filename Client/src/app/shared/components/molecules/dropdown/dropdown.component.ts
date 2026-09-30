import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { TOption } from '@/shared/types';
import { mapChildren } from '@/shared/utils';
import Tooltip from '../../atoms/tooltip/tooltip.component';
import Menu from '../menu/menu.component';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [Tooltip, Menu],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-tooltip
      #refTooltip
      [isArrow]="false"
      [isClick]="true"
      [isRightClick]="isRightClick()"
      [isWidthFull]="isWidthFull()"
      [classContainer]="classContainer()"
      [className]="'dropdown' + (className() ? '' + className() : '')"
      (handleClick)="handleClick.emit($event)"
      (handleOpen)="handleOpen.emit($event)"
      placement="bottom">
      <ng-content></ng-content>
      <ng-template #content>
        <app-menu [options]="listItems()" [translate]="translate()"></app-menu>
      </ng-template>
    </app-tooltip>
  `,
})
export default class Dropdown {
  readonly options = input<TOption[]>([]);
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();
  readonly className = input('');
  readonly classContainer = input('');
  readonly isRightClick = input(false);
  readonly isWidthFull = input(true);
  readonly handleOpen = output<boolean>();
  readonly handleClick = output<Event>();

  refTooltip = viewChild<Tooltip>('refTooltip');

  readonly listItems = computed(() =>
    mapChildren({
      options: this.options(),
      convert: item => ({
        ...item,
        onClick: () => {
          this.refTooltip()!.fnHide();
          this.handleOpen?.emit(false);
          item.onClick?.();
        },
      }),
    }),
  );
}
