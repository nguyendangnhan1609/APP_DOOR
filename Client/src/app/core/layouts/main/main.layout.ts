import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { ServiceTranslate } from '@/core/services';
import { SGlobal } from '@/core/stores';
import { Icon } from '@/shared/components/atoms';
import { Avatar, Dropdown } from '@/shared/components/molecules';
import { EIcon } from '@/shared/enums';
import { TOption } from '@/shared/types';
import { logout } from '@/shared/utils';

@Component({
  selector: 'app-layout-main',
  standalone: true,
  imports: [RouterOutlet, Icon, Dropdown, Avatar],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main.layout.html',
  styleUrl: './main.layout.scss',
  providers: [
    ServiceTranslate,
    { provide: 'url', useClass: ServiceTranslate, useValue: 'Modules/Main' },
  ],
})
export class LayoutMain {
  EIcon = EIcon;
  serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.serviceTranslate.t()(key, params);

  currentYear = new Date().getFullYear().toString();

  sGlobal = inject(SGlobal);
  listLanguage = computed<TOption[]>(() => {
    const list = [
      {
        value: 'en',
        label: 'English',
        icon: EIcon.En,
        onClick: () => this.sGlobal.setLanguage('en'),
      },
      {
        value: 'vi',
        label: 'Tiếng Việt',
        icon: EIcon.Vi,
        onClick: () => this.sGlobal.setLanguage('vi'),
      },
    ];
    return list.filter(item => item.value !== this.sGlobal.language?.());
  });
  language = computed<EIcon>(() => (this.sGlobal.language?.() || 'en') as EIcon);

  changeTheme = () => {
    const html = document.querySelector('html');
    const dataTheme = html?.getAttribute('data-theme');
    const theme = dataTheme === 'light' ? 'dark' : 'light';
    html?.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  readonly #router = inject(Router);
  changePage = (link: string) => {
    this.#router.navigate([`/${this.sGlobal.language?.()}${link}`]);
  };
  listMyProfile: TOption[] = [
    {
      value: 'SignOut',
      label: 'SignOut',
      icon: EIcon.Out,
      onClick: () => {
        logout({ set: this.sGlobal.set, changePage: this.changePage });
      },
    },
  ];
}
