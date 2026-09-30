import { CanActivateFn } from '@angular/router';

import { C_LINK, KEY_TOKEN, LANGUAGE } from '@/shared/constants';

export const authGuard: CanActivateFn = () => {
  console.debug(localStorage.getItem(KEY_TOKEN));
  if (localStorage.getItem(KEY_TOKEN)) {
    return true; // Allow access
  } else {
    location.hash = '#/' + LANGUAGE + C_LINK.AuthLogin;
    return false; // Prevent access
  }
};
