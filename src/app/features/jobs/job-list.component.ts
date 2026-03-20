import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { JobsService } from '../../core/services/job.service';
import { Job, JobStatus } from '../../core/models/job.model';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {

  private jobsService = inject(JobsService);
  private router = inject(Router);

  jobs$: Observable<Job[]> = this.jobsService.jobs$;
  loading$: Observable<boolean> = this.jobsService.loading$;

  filterStatus: JobStatus | 'all' = 'all';

  readonly statuses: { value: JobStatus | 'all'; label: string }[] = [
    { value: 'all',       label: 'All'       },
    { value: 'applied',   label: 'Applied'   },
    { value: 'interview', label: 'Interview' },
    { value: 'offer',     label: 'Offer'     },
    { value: 'rejected',  label: 'Rejected'  },
  ];

  ngOnInit(): void {
    this.jobsService.fetchJobs();
  }

  filterJobs(jobs: Job[]): Job[] {
    if (this.filterStatus === 'all') return jobs;
    return jobs.filter(j => j.status === this.filterStatus);
  }

  async onStatusChange(id: string, event: Event): Promise<void> {
    const status = (event.target as HTMLSelectElement).value as JobStatus;
    try {
      await this.jobsService.updateStatus(id, status);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  async onDelete(id: string): Promise<void> {
    if (!confirm('Delete this application?')) return;
    try {
      await this.jobsService.deleteJob(id);
    } catch (err) {
      console.error('Failed to delete job', err);
    }
  }

  goToAdd(): void {
    this.router.navigate(['/jobs/new']);
  }

  trackById(_: number, job: Job): string {
    return job.id;
  }

  statusClass(status: JobStatus): string {
    return `badge badge--${status}`;
  }
}