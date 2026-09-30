import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

import { EIcon, ESize } from '@/shared/enums';
import Icon from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-spin',
  standalone: true,
  imports: [CommonModule, Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="['spin-container', size() ?? '', className()]">
      <div class="overlay" *ngIf="isLoading()">
        <div class="spin-loading"></div>
        <app-icon *ngIf="size() !== ESize.Small" [name]="EIcon.Logo" className="size-6" />
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './spin.component.scss',
})
/**
 * @param name - The name of the icon.
 */
export default class Spin {
  EIcon = EIcon;
  ESize = ESize;

  readonly isLoading = input<boolean>(true);
  readonly size = input<ESize>();
  readonly className = input<string>('');
}
