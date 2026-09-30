import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';

import { EIcon, ESize } from '@/shared/enums';
import Icon from '../icon/icon.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [title]="title() ?? text()"
      [ngClass]="['btn', size() ?? '', className()]"
      [class.line]="isOutline()"
      (click)="handleClick.emit($event)"
      (paste)="handlePaste.emit($event)">
      <app-icon *ngIf="icon()" [name]="icon()" [className]="size() ? 'size-3' : 'size-5'" />{{
        text()
      }}
    </button>
  `,
  styleUrl: './button.component.scss',
})
export default class Button {
  ESize = ESize;

  readonly text = input();
  readonly size = input<ESize.Large | ESize.Small | ESize.ExtraSmall>();
  readonly icon = input<EIcon>();
  readonly title = input<string>();
  readonly className = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly isOutline = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly handleClick = output<MouseEvent>();
  readonly handlePaste = output<ClipboardEvent>();
}
