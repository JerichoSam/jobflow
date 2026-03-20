import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { supabase } from '../../supabase/supabase.client';
import { Job, JobStatus, CreateJobDto, UpdateJobDto } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobsService {

  private jobsSubject = new BehaviorSubject<Job[]>([]);
  jobs$: Observable<Job[]> = this.jobsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {
    this.initRealtimeListener();
  }

  // ─── Realtime ────────────────────────────────────────────────
  private initRealtimeListener(): void {
    supabase
      .channel('job_applications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_applications' },
        () => this.fetchJobs()
      )
      .subscribe();
  }

  // ─── READ ────────────────────────────────────────────────────
  async fetchJobs(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('applied_at', { ascending: false });

      if (error) throw error;
      this.jobsSubject.next(data ?? []);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // ─── CREATE ──────────────────────────────────────────────────
  async addJob(job: CreateJobDto): Promise<Job> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('job_applications')
    .insert({ ...job, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

  // ─── UPDATE ──────────────────────────────────────────────────
  async updateJob(id: string, changes: UpdateJobDto): Promise<Job> {
    const { data, error } = await supabase
      .from('job_applications')
      .update(changes)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStatus(id: string, status: JobStatus): Promise<void> {
    const { error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  // ─── DELETE ──────────────────────────────────────────────────
  async deleteJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ─── HELPERS ─────────────────────────────────────────────────
  getJobsByStatus(status: JobStatus): Observable<Job[]> {
    return new Observable(observer => {
      this.jobs$.subscribe(jobs => {
        observer.next(jobs.filter(j => j.status === status));
      });
    });
  }

  getStats() {
    const jobs = this.jobsSubject.value;
    return {
      total:     jobs.length,
      applied:   jobs.filter(j => j.status === 'applied').length,
      interview: jobs.filter(j => j.status === 'interview').length,
      offer:     jobs.filter(j => j.status === 'offer').length,
      rejected:  jobs.filter(j => j.status === 'rejected').length,
    };
  }
}