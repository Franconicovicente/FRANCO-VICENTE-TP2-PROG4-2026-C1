import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'register',
        loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent)
    },
    {
        path:'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent)
    },
    {
    // Layout compartido (navbar + sidebar) para todas las pantallas logueadas
        path: '',
        loadComponent: () => import('./shared/components/modal/app-layout/app-layout').then((m) => m.AppLayoutComponent),
        // canActivate: [authGuard],
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
            path: '',
            redirectTo: 'register',
            pathMatch: 'full'
        }
        ]
    },
    {
        path:'**',
        loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent)
    },
];
