import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ServiceTranslate } from '@/core/services';
import { Icon } from '@/shared/components/atoms';
import { EIcon } from '@/shared/enums';
@Component({
  selector: 'app-layout-auth',
  standalone: true,
  imports: [RouterOutlet, Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth.layout.html',
  styleUrl: './auth.layout.scss',
  providers: [
    ServiceTranslate,
    { provide: 'url', useClass: ServiceTranslate, useValue: 'Modules/Auth' },
  ],
})
export class LayoutAuth {
  readonly #serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.#serviceTranslate.t()(key, params);

  EIcon = EIcon;
}
