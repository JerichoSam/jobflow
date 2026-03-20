export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: JobStatus;
  location: string | null;
  salary: string | null;
  notes: string | null;
  applied_at: string;
  updated_at: string;
}

export type CreateJobDto = Pick<Job, 'company' | 'role' | 'status'> & {
  location?: string;
  salary?: string;
  notes?: string;
};

export type UpdateJobDto = Partial<Pick<Job, 'company' | 'role' | 'status' | 'location' | 'salary' | 'notes'>>;