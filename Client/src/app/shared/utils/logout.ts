import type { TStateGlobal } from '@/core/stores';
import initialState from '@/modules/auth/context/state';
import { C_LINK, KEY_REFRESH_TOKEN, KEY_TOKEN, KEY_USER } from '../constants';

/**
 * Logout form system.
 */
export const logout = ({
  set,
  changePage,
}: {
  readonly set: (initialState: TStateGlobal) => void;
  readonly changePage: (url: string) => void;
}) => {
  localStorage.setItem(KEY_TOKEN, '');
  localStorage.setItem(KEY_REFRESH_TOKEN, '');
  localStorage.setItem(KEY_USER, '{}');
  set(initialState);
  changePage(C_LINK.AuthLogin);
};
