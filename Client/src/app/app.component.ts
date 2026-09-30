import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterOutlet } from '@angular/router';

import setupLoadStyle from './core/config/load-style';
import setupTheme from './core/config/theme';
import { ServiceTranslate } from './core/services';
import ServiceStorage from './core/services/storage.service';
import { SGlobal } from './core/stores';
import { Dialog } from './shared/components/molecules';
import PageLoading from './shared/components/pages/loading/loading.component';
import { LANGUAGE } from './shared/constants';

export let translate: (key: string, params?: Record<string, string>) => string;
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Dialog, PageLoading, CommonModule],
  template: `
    <app-dialog />
    <app-page-loading *ngIf="isLoading(); else elseBlock" />
    <ng-template #elseBlock>
      <router-outlet />
    </ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./shared/components/organisms/form/form.component.scss', '../styles.scss'],
  providers: [
    ServiceTranslate,
    { provide: 'url', useClass: ServiceTranslate, useValue: 'Messages' },
    ServiceStorage,
  ],
})
export class AppComponent {
  readonly #sGlobal = inject(SGlobal);
  readonly #serviceTranslate = inject(ServiceTranslate);
  readonly #router = inject(Router);
  serviceStorage = inject(ServiceStorage);
  isLoading = signal(false);

  constructor() {
    translate = (key: string, params?: Record<string, string>) =>
      this.#serviceTranslate.t()(key, params);
    setupTheme();
    setupLoadStyle();
    this.#sGlobal.setLanguage(LANGUAGE);

    this.#router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
        this.isLoading.set(true);
      } else if (event instanceof RouteConfigLoadEnd) {
        this.isLoading.set(false);
      }
    });
  }
}
