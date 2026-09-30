import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

import type { EIcon } from '@/shared/enums';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg [class]="className()">
    <svg:use [attr.href]="'/assets/images/sprite.svg#icon_' + name()" />
  </svg>`,
  styleUrls: ['./icon.component.scss'],
})
/**
 * @param name - The name of the icon.
 */
export default class Icon {
  readonly name = input<EIcon>();
  readonly className = input<string>('');
}
