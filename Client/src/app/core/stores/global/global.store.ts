import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import Auth from '@/modules/auth/context';
import { KEY_USER } from '@/shared/constants';
import initialState from './global.state';
import { TStateGlobal } from './global.type';
import utils from './utils';
export * from './global.state';
export * from './global.type';

export const SGlobal = signalStore(
  { providedIn: 'root', protectedState: false },
  withState(initialState),
  withMethods(store => ({
    set(value: TStateGlobal) {
      patchState(store, value);
    },
    setLanguage(language: string) {
      if (language !== store.language?.()) {
        utils.changeLanguage(language);
      }
      patchState(store, { language, user: JSON.parse(localStorage.getItem(KEY_USER) ?? '{}') });
    },
  })),
  Auth,
);
