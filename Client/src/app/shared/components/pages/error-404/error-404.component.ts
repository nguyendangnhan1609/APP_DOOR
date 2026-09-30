import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { ServiceTranslate } from '@/core/services';
import { LANGUAGE } from '@/shared/constants';
import { EIcon } from '@/shared/enums';
import Button from '../../atoms/button/button.component';
import Icon from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-page-error-404',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Icon, Button],
  template: `
    <section class="page-error-404" [attr.aria-label]="t('PageNotFound')">
      <div class="box">
        <app-icon class="h-10" [name]="EIcon.Logo" />
        <div class="content">
          <h2>404</h2>
          <h2>404</h2>
        </div>
        <h3>{{ t('PageNotFound') }}</h3>
        <div>
          <h5>{{ t('SomeThingMissing') }}</h5>
          <h5>{{ t('ThisPageIsNotAvailable') }}</h5>
        </div>
        <div class="text-base-300">
          <p>{{ t('SorryWeCantFindThePageYoureLookingFor') }}</p>
          <p>{{ t('WeSuggestYouToGoHomepage') }}</p>
        </div>
        <div>
          <app-button [text]="t('BackToHome')" [icon]="EIcon.Warning" (handleClick)="fnGoHome()" />
        </div>
      </div>
    </section>
  `,
  styleUrl: './error-404.component.scss',
  providers: [
    ServiceTranslate,
    { provide: 'url', useClass: ServiceTranslate, useValue: 'Components' },
  ],
})
export default class PageError404 {
  readonly EIcon = EIcon;
  private readonly serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string => {
    return this.serviceTranslate.t()(key, params);
  };

  readonly #router = inject(Router);
  fnGoHome = () => {
    this.#router.navigateByUrl(`/` + LANGUAGE);
  };
}
