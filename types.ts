export enum FiscalYear {
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
  SportsScience = "Sports Science",
  Teaching = "Teaching",
  Others = "Others",
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

export enum PublicationType {
  Journal = "Journal",
  Conference = "Conference",
}

export enum UtilizationType {
  Academic = "Academic",
  Social = "Social",
  Policy = "Policy",
  Commercial = "Commercial",
}

export interface ProjectMaster {
  project_id: string;
  funding_fiscal_year: FiscalYear;
  campus_id: string; // Used generically for Organization Name
  project_name: string;
  head_researcher: string;
  budget_amount: number;
  funding_source: FundingSource;
  research_category: ResearchCategory;
  status: ProjectStatus;
}

export interface PersonnelDevelopment {
  id: string;
  activity_fiscal_year: FiscalYear;
  staff_name: string;
  course_name: string;
}

export interface PublicationOutput {
  output_id: string;
  ref_project_id: string; // Foreign Key to ProjectMaster
  output_reporting_year: FiscalYear;
  article_title: string;
  publication_level: PublicationLevel;
  publication_type: PublicationType;
  is_published: boolean;
}

export interface Utilization {
  id: string;
  utilization_reporting_year: FiscalYear;
  ref_project_id: string;
  utilization_type: UtilizationType;
  description: string;
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
}

export interface User {
  username: string;
  organization: Organization;
  role: 'Admin' | 'User';
}
