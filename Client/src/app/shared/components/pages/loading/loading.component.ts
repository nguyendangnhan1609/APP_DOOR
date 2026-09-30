import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ServiceTranslate } from '@/core/services';
import Spin from '../../molecules/spin/spin.component';

@Component({
  selector: 'app-page-loading',
  standalone: true,
  imports: [CommonModule, Spin],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-loading" [attr.aria-label]="t('LoadingPage')">
      <app-spin></app-spin>
      <p [ngStyle]="{ '--waviy-length': waviyLength() }">
        <span
          *ngFor="let char of chars(); let index = index"
          [attr.key]="index + char"
          [ngStyle]="{ '--waviy-i': index + 1 }"
          [innerHTML]="char !== ' ' ? char : '&nbsp;'">
        </span>
      </p>
    </section>
  `,
  styleUrl: './loading.component.scss',
  providers: [
    ServiceTranslate,
    { provide: 'url', useClass: ServiceTranslate, useValue: 'Components' },
  ],
})
export default class PageLoading {
  private readonly serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string => {
    return this.serviceTranslate.t()(key, params);
  };

  readonly waviyLength = computed<string>(() => this.t('LoadingPage').length / 10 + 0.3 + 's');
  readonly chars = computed<string[]>(() => this.t('LoadingPage').split(''));
}
