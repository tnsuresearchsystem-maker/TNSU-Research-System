
import { ProjectMaster, PublicationOutput, Utilization, PersonnelDevelopment, MOU, IntellectualProperty, User, FiscalYear, FundingSource, ResearchCategory, ProjectStatus, PublicationLevel, PublicationType, UtilizationType, DevelopmentType, IPType, OrganizationType } from "../types";
import { CENTRAL_OFFICE, CAMPUSES } from "../constants";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Seed Data
export const initialProjects: ProjectMaster[] = [
  {
    project_id: "p_001",
    funding_fiscal_year: FiscalYear.Y2566,
    campus_id: "Chiang Mai",
    project_name: "Biomechanics of Sepak Takraw Serve",
    head_researcher: "Dr. Somchai Jai-dee",
    budget_amount: 500000,
    funding_source: FundingSource.Internal,
    research_category: ResearchCategory.SportsScience,
    status: ProjectStatus.Completed
  },
  {
    project_id: "p_002",
    funding_fiscal_year: FiscalYear.Y2566,
    campus_id: "Bangkok",
    project_name: "AI in Sports Performance Analysis",
    head_researcher: "Prof. Wilai Srisuk",
    budget_amount: 1200000,
    funding_source: FundingSource.External,
    research_category: ResearchCategory.SportsScience,
    status: ProjectStatus.Ongoing
  },
  {
    project_id: "p_003",
    funding_fiscal_year: FiscalYear.Y2567,
    campus_id: "Chonburi",
    project_name: "Nutrition Strategies for Youth Swimmers",
    head_researcher: "Dr. Arthit Sun",
    budget_amount: 300000,
    funding_source: FundingSource.Internal,
    research_category: ResearchCategory.Others,
    status: ProjectStatus.Completed
  },
  {
    project_id: "p_004",
    funding_fiscal_year: FiscalYear.Y2568,
    campus_id: "Yala",
    project_name: "Community Exercise Programs for Elderly",
    head_researcher: "Ms. Ratana Ploy",
    budget_amount: 150000,
    funding_source: FundingSource.NonBudget,
    research_category: ResearchCategory.Teaching,
    status: ProjectStatus.Ongoing
  }
];

export const initialPublications: PublicationOutput[] = [
  {
    output_id: "o_001",
    ref_project_id: "p_001", // Project from 2566
    output_reporting_year: FiscalYear.Y2567, // Reported in 2567
    article_title: "Kinematic Analysis of Sepak Takraw",
    publication_level: PublicationLevel.International,
    publication_type: PublicationType.Scopus,
    is_published: true,
    file_url: "article_001.pdf"
  },
  {
    output_id: "o_002",
    ref_project_id: "p_001", // Project from 2566
    output_reporting_year: FiscalYear.Y2568, // Reported in 2568 (Longitudinal!)
    article_title: "Long-term impact of Serve Techniques",
    publication_level: PublicationLevel.National,
    publication_type: PublicationType.Proceeding,
    is_published: true
  },
  {
    output_id: "o_003",
    ref_project_id: "p_003", // Project from 2567
    output_reporting_year: FiscalYear.Y2567, // Same year
    article_title: "Youth Nutrition Guidelines",
    publication_level: PublicationLevel.National,
    publication_type: PublicationType.TCI1,
    is_published: true
  }
];

export const initialUtilizations: Utilization[] = [
  {
    id: "u_001",
    ref_project_id: "p_001",
    utilization_reporting_year: FiscalYear.Y2568,
    utilization_type: UtilizationType.Academic,
    description: "Cited in 5 graduate theses at TNSU Chiang Mai."
  },
  {
    id: "u_002",
    ref_project_id: "p_003",
    utilization_reporting_year: FiscalYear.Y2567,
    utilization_type: UtilizationType.Policy,
    description: "Adopted as standard guideline for Chonburi Youth Swimming Association."
  }
];

export const initialPersonnel: PersonnelDevelopment[] = [
  {
    id: "pd_001",
    fiscal_year: FiscalYear.Y2567,
    staff_name: "Dr. Somchai Jai-dee",
    organization_name: "Chiang Mai Campus",
    development_type: DevelopmentType.Conference,
    course_name: "International Conference on Sports Biomechanics 2024",
    activity_date: "2024-03-15",
    duration_hours: 16,
    certificate_url: "cert_somchai_2024.pdf"
  },
  {
    id: "pd_002",
    fiscal_year: FiscalYear.Y2568,
    staff_name: "Ms. Mana Jaidee",
    organization_name: "Faculty of Education",
    development_type: DevelopmentType.Training,
    course_name: "Advanced Research Methodology Workshop",
    activity_date: "2024-11-20",
    duration_hours: 6,
    certificate_url: "cert_mana_2024.pdf"
  }
];

export const initialMOUs: MOU[] = [
  {
    id: "mou_001",
    external_org_name: "Sports Authority of Thailand (SAT)",
    sign_date: "2024-01-15",
    scope: "Collaboration on elite athlete training programs.",
    fiscal_year: FiscalYear.Y2567
  }
];

export const initialIPs: IntellectualProperty[] = [
  {
    id: "ip_001",
    work_name: "Smart Sepak Takraw Ball",
    ip_type: IPType.PettyPatent,
    request_number: "2401000123",
    registration_date: "2025-02-10",
    fiscal_year: FiscalYear.Y2568
  }
];

// Initial Users
export const initialUsers: User[] = [
  {
    id: "admin_001",
    username: "admin",
    password: "password123", // In production, use hashed passwords or Auth Provider
    email: "admin@tnsu.ac.th",
    role: "Admin",
    organization: CENTRAL_OFFICE[0]
  },
  {
    id: "user_chiangmai",
    username: "cm_staff",
    password: "password123",
    email: "staff@cm.tnsu.ac.th",
    role: "User",
    organization: CAMPUSES[0] // Chiang Mai
  }
];
