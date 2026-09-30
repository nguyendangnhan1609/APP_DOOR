import { provideRouter, withHashLocation } from '@angular/router';

import PageError404 from './shared/components/pages/error-404/error-404.component';
import { C_LINK, KEY_TOKEN, LANGUAGE } from './shared/constants';

export const routes = provideRouter(
  [
    {
      path: ':lang',
      children: [
        {
          path: 'auth',
          loadChildren: () => import('./modules/auth/auth.routes'),
        },
        {
          path: '',
          loadChildren: () => import('./modules/main/main.routes'),
        },
        {
          path: '**',
          component: PageError404,
        },
      ],
    },
    // {
    //   path: '**',
    //   redirectTo: `/${LANGUAGE}${!localStorage.getItem(KEY_TOKEN) ? C_LINK.AuthLogin : C_LINK.Example}`,
    //   pathMatch: 'full',
    // },
  ],
  withHashLocation(),
);
