import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { inject } from '@angular/core';
import { JobsService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { Job, JobStatus } from '../../core/models/job.model';

interface Stats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private jobsService = inject(JobsService);
  private authService = inject(AuthService);

  stats$: Observable<Stats> = this.jobsService.jobs$.pipe(
    map((jobs: Job[]) => ({
      total:     jobs.length,
      applied:   jobs.filter(j => j.status === 'applied').length,
      interview: jobs.filter(j => j.status === 'interview').length,
      offer:     jobs.filter(j => j.status === 'offer').length,
      rejected:  jobs.filter(j => j.status === 'rejected').length,
    }))
  );

  recentJobs$: Observable<Job[]> = this.jobsService.jobs$.pipe(
    map((jobs: Job[]) => jobs.slice(0, 5))
  );

  loading$: Observable<boolean> = this.jobsService.loading$;

  userName$ = this.authService.currentUser$.pipe(
    map(user => user?.email?.split('@')[0] ?? 'there')
  );

  readonly statCards = [
    { key: 'applied'   as const, label: 'Applied',  color: 'blue'  },
    { key: 'interview' as const, label: 'Interview', color: 'amber' },
    { key: 'offer'     as const, label: 'Offer',     color: 'green' },
    { key: 'rejected'  as const, label: 'Rejected',  color: 'red'   },
  ];

  ngOnInit(): void {
    this.jobsService.fetchJobs();
  }

  getResponseRate(stats: Stats): number {
    if (stats.total === 0) return 0;
    return Math.round(((stats.interview + stats.offer) / stats.total) * 100);
  }

  getBarWidth(count: number, total: number): string {
    if (total === 0) return '0%';
    return Math.round((count / total) * 100) + '%';
  }

  statusClass(status: JobStatus): string {
    return `badge badge--${status}`;
  }

  async onSignOut(): Promise<void> {
    await this.authService.signOut();
  }
}