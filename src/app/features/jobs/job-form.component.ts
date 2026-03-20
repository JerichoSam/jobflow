import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JobsService } from '../../core/services/job.service';
import { Job, JobStatus } from '../../core/models/job.model';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.scss'
})
export class JobFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private jobsService = inject(JobsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    company:  ['', Validators.required],
    role:     ['', Validators.required],
    status:   ['applied', Validators.required],
    location: [''],
    salary:   [''],
    notes:    ['']
  });

  isEditMode = false;
  jobId: string | null = null;
  isLoading = false;
  errorMessage = '';

  readonly statusOptions: JobStatus[] = ['applied', 'interview', 'offer', 'rejected'];

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.jobId;

    if (this.isEditMode) {
      this.jobsService.jobs$.subscribe((jobs: Job[]) => {
        const found = jobs.find(j => j.id === this.jobId);
        if (found) {
          this.form.patchValue({
            company:  found.company,
            role:     found.role,
            status:   found.status,
            location: found.location ?? '',
            salary:   found.salary ?? '',
            notes:    found.notes ?? ''
          });
        }
      });
    }
  }

  get company()  { return this.form.get('company')!;  }
  get role()     { return this.form.get('role')!;     }
  get status()   { return this.form.get('status')!;   }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.isEditMode && this.jobId) {
        await this.jobsService.updateJob(this.jobId, this.form.value);
      } else {
        await this.jobsService.addJob(this.form.value);
      }
      this.router.navigate(['/jobs']);
    } catch (error: any) {
      this.errorMessage = error.message ?? 'Something went wrong.';
    } finally {
      this.isLoading = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/jobs']);
  }
}