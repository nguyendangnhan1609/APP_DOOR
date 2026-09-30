import { DestroyRef, Inject, Injectable, computed, effect, inject, signal } from '@angular/core';

import { SGlobal } from '../stores';
const translate: Record<string, Record<string, Record<string, string>>> = {};

@Injectable({ providedIn: 'root' })
export class ServiceTranslate {
  readonly #destroyRef = inject(DestroyRef);
  // eslint-disable-next-line
  constructor(@Inject('url') private readonly url: string) {
    this.#destroyRef.onDestroy(() => {
      this.#fnListen.destroy();
    });
  }

  readonly #sGlobal = inject(SGlobal);
  readonly #fnListen = effect(() => {
    if (this.#sGlobal.language?.() && this.#sGlobal.language?.() !== this.#currentLang()) {
      this.#setLanguage(this.#sGlobal.language()!);
    }
  });

  readonly #currentLang = signal('');
  readonly #translations = signal<Record<string, string>>({});
  readonly #setLanguage = (lang: string) => {
    if (lang !== this.#currentLang()) {
      this.#currentLang.set(lang);
      this.#loadTranslations(lang);
    }
  };
  readonly #loadTranslations = async (lang: string) => {
    if (translate[lang]?.[this.url]) {
      setTimeout(() => {
        this.#translations.set(translate[lang][this.url]);
      }, 60);
      return;
    } else if (translate[lang]) {
      translate[lang][this.url] = {};
    } else {
      translate[lang] = { [this.url]: {} };
    }
    try {
      const data = await (await fetch(`/locales/${lang}/${this.url}.json`)).json();
      translate[lang][this.url] = data;
      this.#translations.set(translate[lang][this.url]);
    } catch {
      console.warn(`Failed to load translations for ${lang}/${this.url}`);
    }
  };

  t = computed<(key: string, params?: Record<string, string>) => string>(
    () => (key: string, params?: Record<string, string>) => {
      const trans = this.#translations();
      let message = key;
      if (trans[key]) {
        message = trans[key];
        if (params) {
          Object.keys(params).forEach(param => {
            message = message.replace(`{{${param}}}`, params[param]);
          });
        }
      }
      return message;
    },
  );
}
