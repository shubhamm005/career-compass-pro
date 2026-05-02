export type Role = "student" | "placement_officer" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at?: string;
};

export type Segment = "fresher" | "skilled" | "placement_ready";

export type StudentProfile = {
  id: number;
  user_id: number;
  name?: string;
  email?: string;
  phone?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  cgpa?: number;
  bio?: string;
  skills?: string[];
  career_interests?: string[];
  resume_url?: string;
  segment?: Segment;
};

export type Job = {
  id: number;
  title: string;
  company: string;
  description?: string;
  location?: string;
  job_type: "fulltime" | "internship" | "parttime";
  required_skills?: string[];
  industry?: string;
  openings?: number;
  deadline?: string;
  posted_by?: number;
  created_at?: string;
  applied?: boolean;
  match_count?: number;
};

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "interviewed"
  | "placed"
  | "rejected";

export type Application = {
  id: number;
  student_id: number;
  job_id: number;
  status: ApplicationStatus;
  applied_at: string;
  updated_at?: string;
  job?: Job;
  student?: { id: number; name: string; email: string };
};

export type Notification = {
  id: number;
  user_id: number;
  message: string;
  type: "job_alert" | "interview" | "deadline" | "general";
  is_read: boolean;
  created_at: string;
};

export type AdminDashboard = {
  total_students: number;
  placed_students: number;
  active_jobs: number;
  pending_applications: number;
  segments: { fresher: number; skilled: number; placement_ready: number };
  recent_applications: Application[];
};

export type StudentDashboard = {
  applied: number;
  shortlisted: number;
  interviewed: number;
  placed: number;
  recommended_jobs: Job[];
  recent_applications: Application[];
  profile: StudentProfile;
};
