import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

import Tooltip from '../../atoms/tooltip/tooltip.component';
import Item from './item/item.component';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [Tooltip, Item, CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./avatar.component.scss'],
  template: `
    <app-avatar-item
      *ngIf="!isArray()"
      [text]="fnGetText()"
      [src]="src()"
      [showName]="showName()"
      [classSize]="classSize()"
      [index]="index()"></app-avatar-item>
    <div class="avatar" *ngIf="isArray()">
      <app-avatar-item
        *ngFor="let item of visibleAvatars(); let idx = index"
        [showName]="false"
        [text]="item[keyName()]"
        [src]="item[keySrc()]"
        [classSize]="classSize()"
        [index]="idx"></app-avatar-item>
      <app-tooltip *ngIf="hiddenAvatars().length">
        <ng-template #content>
          <app-avatar-item
            *ngFor="let item of hiddenAvatars(); let idx = index"
            [showName]="false"
            [text]="item[keyName()]"
            [src]="item[keySrc()]"
            [classSize]="classSize()"
            [index]="idx"></app-avatar-item>
        </ng-template>
        <small [class]="classSize()">+{{ hiddenAvatars().length }}</small>
      </app-tooltip>
    </div>
  `,
})
export default class Avatar {
  readonly text = input<string | Record<string, string>[]>();
  readonly src = input<string | undefined>();
  readonly classSize = input('size-5');
  readonly showName = input(true);
  readonly keySrc = input('avatarPath');
  readonly keyName = input('fullName');
  readonly maxCount = input(4);
  readonly index = input(0);

  fnGetText = (): string | undefined => {
    const text = this.text();
    if (typeof text === 'string' || typeof text === 'undefined') {
      return text;
    }
    return undefined;
  };

  readonly isArray = computed<boolean>(
    () => typeof this.text() === 'object' && Array.isArray(this.text()),
  );
  readonly visibleAvatars = computed<Record<string, string>[]>(() =>
    this.isArray() ? (this.text() as Record<string, string>[]).slice(0, this.maxCount()) : [],
  );
  readonly hiddenAvatars = computed<Record<string, string>[]>(() =>
    this.isArray() ? (this.text() as Record<string, string>[]).slice(this.maxCount()) : [],
  );
}
