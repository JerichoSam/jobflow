import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Auth routes (public)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(m => m.RegisterComponent)
  },

  // Protected routes
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'jobs',
    loadChildren: () =>
      import('./features/jobs/job.routes').then(m => m.JOBS_ROUTES),
    canActivate: [authGuard]
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];