import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
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
        // Si entrás a '/' estando logueado, te manda directo al feed
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full'
      }
    ]
  },
  {
    // Cualquier ruta no reconocida (incluyendo '/' sin sesión, porque el guard rechaza
    // el bloque de arriba y cae acá) termina en login
    path: '**',
    redirectTo: 'login'
  },
];