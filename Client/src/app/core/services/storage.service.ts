import { DestroyRef, Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { KEY_TOKEN } from '@/shared/constants';
import { logout } from '@/shared/utils';
import { SGlobal } from '../stores';

@Injectable()
export default class ServiceStorage {
  readonly #sGlobal = inject(SGlobal);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea === localStorage && event.key === KEY_TOKEN && event.newValue === '') {
        logout({
          set: this.#sGlobal.set,
          changePage: (link: string) => {
            this.#router.navigate([`/${this.#sGlobal.language?.()}${link}`]);
          },
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    this.#destroyRef.onDestroy(() => {
      window.removeEventListener('storage', handleStorageChange);
    });
  }
}
