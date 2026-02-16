import { ProjectMaster, PublicationOutput, FiscalYear, FundingSource, ResearchCategory, ProjectStatus, PublicationLevel, PublicationType } from "../types";

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
    publication_type: PublicationType.Journal,
    is_published: true
  },
  {
    output_id: "o_002",
    ref_project_id: "p_001", // Project from 2566
    output_reporting_year: FiscalYear.Y2568, // Reported in 2568 (Longitudinal!)
    article_title: "Long-term impact of Serve Techniques",
    publication_level: PublicationLevel.National,
    publication_type: PublicationType.Conference,
    is_published: true
  },
  {
    output_id: "o_003",
    ref_project_id: "p_003", // Project from 2567
    output_reporting_year: FiscalYear.Y2567, // Same year
    article_title: "Youth Nutrition Guidelines",
    publication_level: PublicationLevel.National,
    publication_type: PublicationType.Journal,
    is_published: true
  }
];
