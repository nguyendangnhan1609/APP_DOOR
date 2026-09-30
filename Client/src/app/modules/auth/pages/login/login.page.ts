import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  EffectRef,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { ServiceTranslate } from '@/core/services';
import { serviceMessage } from '@/core/services/message.service';
import { SGlobal } from '@/core/stores';
import { Button } from '@/shared/components/atoms';
import { Form } from '@/shared/components/organisms';
import { C_LINK } from '@/shared/constants';
import { EFormRuleType, EFormType, ESize, EStatusState } from '@/shared/enums';
import { TFieldForm } from '@/shared/types';
import { IRequestLogin } from '../../interface';

@Component({
  selector: 'app-page-login',
  standalone: true,
  imports: [CommonModule, Button, Form],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Modules/Auth' },
  ],
})
export class PageLogin {
  ESize = ESize;
  readonly serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.serviceTranslate.t()(key, params);

  readonly #router = inject(Router);
  readonly #fnEffect: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    this.#fnEffect = effect(() => {
      if (this.sGlobal.status?.() === EStatusState.IsFulfilled) {
        this.sGlobal.set({ status: EStatusState.Idle });
        this.#router.navigateByUrl(`/${this.sGlobal.language?.() + C_LINK.Example}`, {
          replaceUrl: true,
        });
      }
    });
    this.#destroyRef.onDestroy(() => {
      this.#fnEffect.destroy();
    });
  }

  readonly sGlobal = inject(SGlobal);
  readonly fields = computed<TFieldForm<IRequestLogin>[]>(() => [
    {
      name: 'username',
      title: 'Username',
      type: EFormType.Text,
      rules: [{ type: EFormRuleType.Required }, { type: EFormRuleType.Email }],
    },
    {
      name: 'password',
      title: 'Password',
      type: EFormType.Password,
      notDefaultValid: true,
      rules: [{ type: EFormRuleType.Required }],
    },
  ]);
  temp = () => serviceMessage.success({ content: 'Temp' });
}
