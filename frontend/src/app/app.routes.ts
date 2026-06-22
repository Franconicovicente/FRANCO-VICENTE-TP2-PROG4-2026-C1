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
        path:'',
        loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent)
    },
    {
        path:'**',
        loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent)
    },
];
