import type { Route } from '@angular/router';

const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('../../core/layouts/auth/auth.layout').then(m => m.LayoutAuth),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.page').then(m => m.PageLogin),
      },
    ],
  },
];

export default routes;
