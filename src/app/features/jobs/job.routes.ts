import { Routes } from '@angular/router';

export const JOBS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./job-list.component').then(m => m.JobListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./job-form.component').then(m => m.JobFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./job-form.component').then(m => m.JobFormComponent)
  }
];