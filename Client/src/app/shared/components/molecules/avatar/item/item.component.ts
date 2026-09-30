import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

import utils from '../utils';

@Component({
  selector: 'app-avatar-item',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avatar">
      <ng-container *ngIf="!text() || src(); else letterTpl">
        <div [ngClass]="{ 'shrink-0': true, '-ml-2': index() > 0 }">
          <img
            [class]="classSize()"
            [ngClass]="{ 'object-cover': showName() }"
            [src]="src()"
            alt="Avatar" />
        </div>
      </ng-container>
      <ng-template #letterTpl>
        <p [class]="classSize()" [ngClass]="{ '-ml-2': index() > 0 }" [ngStyle]="styleLetter()">
          {{ fnGetText(text()!) }}
        </p>
      </ng-template>
      <span *ngIf="showName() && text()">{{ text() }}</span>
    </div>
  `,
})
export default class AvatarRender {
  readonly text = input<string>();
  readonly src = input<string>();
  readonly showName = input(false);
  readonly classSize = input('size-5');
  readonly index = input(0);

  readonly styleLetter = computed(() => ({
    color: utils.pickTextColorBasedOnBgColor(utils.getColorByLetter(this.text() as string)),
    backgroundColor: utils.getColorByLetter(this.text() as string),
  }));
  fnGetText = (text: string): string => utils.getFirstLetter(text);
}
