import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'manage/resources',
    canActivate: [authGuard],
    loadComponent: () => import('./components/resources/resources.component')
      .then(m => m.ResourcesComponent)
  },
  {
    path: 'manage/projects',
    canActivate: [authGuard],
    loadComponent: () => import('./components/projects/projects.component')
      .then(m => m.ProjectsComponent)
  },
  {
    path: 'manage/bids',
    canActivate: [authGuard],
    loadComponent: () => import('./components/bids/bids.component')
      .then(m => m.BidsComponent)
  },
  {
    path: 'manage/leaves',
    canActivate: [authGuard],
    loadComponent: () => import('./components/leaves/leaves.component')
      .then(m => m.LeavesComponent)
  },
  { path: '**', redirectTo: '' }
];
