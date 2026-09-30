import type { Route } from '@angular/router';

import { authGuard } from '@/core/guards';

const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('../../core/layouts/main/main.layout').then(m => m.LayoutMain),
    // canActivateChild: [authGuard],
    // canActivate: [authGuard],
    children: [
      {
        path: 'example',
        loadComponent: () => import('./pages/example/example.page').then(m => m.PageExample),
      },
    ],
  },
];

export default routes;
