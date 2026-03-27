

export enum FiscalYear {
  Y2560 = "2560",
  Y2561 = "2561",
  Y2562 = "2562",
  Y2563 = "2563",
  Y2564 = "2564",
  Y2565 = "2565",
  Y2566 = "2566",
  Y2567 = "2567",
  Y2568 = "2568",
  Y2569 = "2569",
  Y2570 = "2570",
}

export enum FundingSource {
  Internal = "Internal",
  NonBudget = "Non-Budget",
  External = "External",
}

export enum ResearchCategory {
  SportsScience = "ด้านศาสตร์การกีฬา",
  TeachingEducation = "ด้านการเรียนการสอน",
  Others = "ด้านอื่นๆ (เช่น การท่องเที่ยว การสื่อสาร ภาษา สังคม เป็นต้น)",
}

export enum ProjectStatus {
  Ongoing = "Ongoing",
  Completed = "Completed",
  Terminated = "Terminated",
}

export enum PublicationLevel {
  National = "National",
  International = "International",
}

// Updated to match requirements
export enum PublicationType {
  TCI1 = "TCI Group 1",
  TCI2 = "TCI Group 2",
  Scopus = "Scopus / ISI",
  Proceeding = "Conference Proceeding",
  Other = "Other"
}

export enum UtilizationType {
  Academic = "เชิงวิชาการ",
  Social = "เชิงสังคม/ชุมชน",
  Policy = "เชิงนโยบาย",
  Commercial = "เชิงพาณิชย์",
}

export enum DevelopmentType {
  Training = "การอบรม",
  Seminar = "การสัมมนา",
  Conference = "การประชุมวิชาการ"
}

// Module 5 Types
export enum IPType {
  Patent = "Patent",
  PettyPatent = "Petty Patent",
  Copyright = "Copyright"
}

export enum ReportingPeriod {
  Round6Months = "6 Months",
  Round12Months = "12 Months"
}

export enum ApprovalStatus {
  Draft = "Draft",
  Pending = "Pending Review",
  Approved = "Approved",
  Rejected = "Rejected",
  RequestChange = "Request Change"
}

export interface ProjectMaster {
  project_id: string;
  funding_fiscal_year: FiscalYear;
  reporting_period?: ReportingPeriod;
  campus_id: string; // Used generically for Organization Name (The campus that recorded it)
  owner_organization?: string; // Free text for owner organization
  project_name: string; // Thai Name
  project_name_en?: string; // English Name (Optional for backward compat, but we will add it)
  head_researcher: string;
  budget_amount: number;
  funding_source: FundingSource;
  research_category: ResearchCategory;
  status: ProjectStatus;
  approval_status?: ApprovalStatus;
}

export interface PersonnelDevelopment {
  id: string;
  fiscal_year: FiscalYear;
  staff_name: string;
  faculty?: string; // Faculty name
  organization_name: string; // Faculty/Campus name
  development_type: DevelopmentType;
  course_name: string;
  activity_date: string; // ISO Date String
  duration_hours: number;
  certificate_url?: string; // Simulated URL/Filename
  approval_status?: ApprovalStatus;
}

export interface FacultyLecturerCount {
  id: string;
  campus_id: string;
  fiscal_year: FiscalYear;
  faculty: string;
  total_lecturers: number;
}

export interface PublicationOutput {
  output_id: string;
  ref_project_id: string; // Foreign Key to ProjectMaster
  output_reporting_year: FiscalYear;
  article_title: string;
  publication_level: PublicationLevel;
  publication_type: PublicationType;
  is_published: boolean;
  file_url?: string; // Attachment
  approval_status?: ApprovalStatus;
}

export interface Utilization {
  id: string;
  utilization_reporting_year: FiscalYear;
  ref_project_id: string;
  utilization_type: UtilizationType;
  description: string;
  evidence_url?: string; // Attachment
  approval_status?: ApprovalStatus;
}

// Module 5 Interfaces
export interface MOU {
  id: string;
  external_org_name: string;
  sign_date: string;
  scope: string;
  fiscal_year: FiscalYear;
  campus_id?: string; // Optional for backward compatibility, but should be used
  approval_status?: ApprovalStatus;
}

export interface IntellectualProperty {
  id: string;
  work_name: string;
  ip_type: IPType;
  request_number: string; // เลขที่คำขอ หรือ เลขทะเบียน
  registration_date: string;
  fiscal_year: FiscalYear;
  campus_id?: string; // Optional for backward compatibility
  approval_status?: ApprovalStatus;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- NEW TYPES FOR AUTH & I18N ---

export type Language = 'th' | 'en';

export enum Region {
  North = "Northern Region",
  Northeast = "Northeastern Region",
  Central = "Central Region",
  South = "Southern Region",
}

export enum OrganizationType {
  OfficePresident = "Office of the President",
  Campus = "Campus",
  SportsSchool = "Sports School"
}

export interface Organization {
  id: string;
  nameEn: string;
  nameTh: string;
  type: OrganizationType;
  region?: Region;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional because we might not retrieve it to UI
  email: string;
  authEmail?: string; // Used to store the actual Firebase Auth email if 'email' is changed but Auth cannot be updated
  organization: Organization; // Stores full Org object for easier context
  role: 'Admin' | 'User';
  mustChangePassword?: boolean;
  fullName?: string;
  caretaker?: string;
  phoneNumber?: string;
}

// --- LOGGING SYSTEM ---
export interface SystemLog {
  id: string;
  timestamp: string; // ISO String
  actor_id: string;
  actor_username: string;
  action_type: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT';
  target_module: 'User' | 'Project' | 'Publication' | 'Asset' | 'System';
  details: string;
}
