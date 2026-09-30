import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

import type { TOption } from '@/shared/types';
import Icon from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./menu.component.scss'],
  template: `
    <ul class="menu col">
      <ng-container *ngFor="let option of options()">
        <ng-container *ngTemplateOutlet="optionTpl; context: { $implicit: option }"></ng-container>
      </ng-container>
    </ul>
    <ng-template #optionTpl let-option>
      <li>
        <button
          [ngClass]="{ active: option.isActive, disabled: option.disabled }"
          (click)="option.onClick && option.onClick()"
          type="button">
          <app-icon *ngIf="option.icon" [name]="option.icon" />{{ translate()(option.label) }}
        </button>
        <ul *ngIf="option.children?.length">
          <ng-container *ngFor="let childOption of option.children">
            <ng-container
              *ngTemplateOutlet="optionTpl; context: { $implicit: childOption }"></ng-container>
          </ng-container>
        </ul>
      </li>
    </ng-template>
  `,
})
export default class Menu {
  readonly options = input<TOption[]>([]);
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();
}
