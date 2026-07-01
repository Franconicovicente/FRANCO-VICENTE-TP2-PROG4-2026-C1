import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  {
    // Pantalla de carga inicial: valida el token contra el back antes de decidir a dónde ir
    path: '',
    loadComponent: () => import('./pages/splash/splash').then((m) => m.SplashComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent)
  },
  {
    // Layout compartido (navbar + sidebar) para todas las pantallas logueadas
    path: '',
    loadComponent: () => import('./shared/components/modal/app-layout/app-layout').then((m) => m.AppLayoutComponent),
    canActivate: [authGuard], // protege feed y profile: sin sesión, no se puede entrar
    children: [
      {
        path: 'feed',
        loadComponent: () => import('./pages/feed/feed').then((m) => m.FeedComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent)
      },
      {
        path: 'posts/:id',
        loadComponent: () => import('./pages/post-detail/post-detail').then((m) => m.PostDetailComponent)
      },
      {
        path: 'admin',
        canActivate: [adminGuard], // Bloquea acceso por URL a no-admins
        children: [
          {
            path: 'users',
            loadComponent: () => import('./pages/admin/admin-users/admin-users').then(m => m.AdminUsersComponent)
          },
          {
            path: 'stats',
            loadComponent: () => import('./pages/admin/admin-stats/admin-stats').then(m => m.AdminStatsComponent)
          }
        ]
      },
    ]
  },
  {
    // Cualquier ruta no reconocida termina en login
    path: '**',
    redirectTo: 'login'
  },
];