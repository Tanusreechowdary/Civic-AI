export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'drainage'
  | 'water_supply'
  | 'road_damage'
  | 'other';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved';

export interface TimelineEntry {
  id: string;
  status: IssueStatus;
  timestamp: string;
  message: string;
  actorName: string;
  actorRole: 'citizen' | 'admin' | 'department_officer' | 'system_ai';
  photoUrl?: string;
}

export interface AIAnalysis {
  categorySuggestion: IssueCategory;
  prioritySuggestion: IssuePriority;
  confidence: number;
  rationale: string;
  detectedKeywords: string[];
  isDuplicate: boolean;
  duplicateOfId?: string;
  duplicateConfidence?: number;
  duplicateReason?: string;
  hazardLevel: 'safe' | 'moderate' | 'severe' | 'life_safety';
  recommendedDepartment: string;
  estimatedResolutionDays: number;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  imageUrl?: string;
  resolvedImageUrl?: string;
  department: string;
  assignedOfficer?: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  aiAnalysis: AIAnalysis;
  timeline: TimelineEntry[];
  upvotes: number;
  userUpvoted?: boolean;
  isDuplicate?: boolean;
  duplicateOfId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'admin';
  department?: string;
  ward?: string;
  badgeId?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface SmsLog {
  id: string;
  phone: string;
  formattedPhone?: string;
  message: string;
  otp: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  carrier?: string;
  sentAt: string;
}

export interface OtpRecord {
  id: string;
  phone: string;
  code: string;
  role?: string;
  expiresAt: string;
  attempts: number;
  verified: boolean;
  createdAt: string;
}

export interface StatsSummary {
  total: number;
  submitted: number;
  underReview: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  categoryBreakdown: Record<IssueCategory, number>;
  departmentBreakdown: Record<string, { total: number; resolved: number }>;
  avgResolutionDays: number;
  resolutionRatePercent: number;
}
