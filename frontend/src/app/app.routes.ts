import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'resources',
    canActivate: [authGuard],
    loadComponent: () => import('./components/resources/resources.component')
      .then(m => m.ResourcesComponent)
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./components/projects/projects.component')
      .then(m => m.ProjectsComponent)
  },
  {
    path: 'bids',
    canActivate: [authGuard],
    loadComponent: () => import('./components/bids/bids.component')
      .then(m => m.BidsComponent)
  },
  {
    path: 'timeline',
    canActivate: [authGuard],
    loadComponent: () => import('./components/timeline/timeline.component')
      .then(m => m.TimelineComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
