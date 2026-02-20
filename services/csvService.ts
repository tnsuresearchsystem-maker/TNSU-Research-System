import Papa from 'papaparse';

export type CSVType = 'project' | 'publication' | 'utilization' | 'personnel' | 'mou' | 'ip' | 'user';

const HEADERS: Record<CSVType, string[]> = {
  project: [
    'project_id', 'funding_fiscal_year', 'campus_id', 'project_name', 
    'head_researcher', 'budget_amount', 'funding_source', 'research_category', 'status'
  ],
  publication: [
    'ref_project_id', 'output_reporting_year', 'article_title', 
    'publication_level', 'publication_type', 'is_published'
  ],
  utilization: [
    'ref_project_id', 'utilization_reporting_year', 'utilization_type', 'description'
  ],
  personnel: [
    'fiscal_year', 'staff_name', 'organization_name', 'development_type', 
    'course_name', 'activity_date', 'duration_hours'
  ],
  mou: [
    'fiscal_year', 'external_org_name', 'sign_date', 'scope'
  ],
  ip: [
    'fiscal_year', 'work_name', 'ip_type', 'request_number', 'registration_date'
  ],
  user: [
    'username', 'email', 'role', 'organization_name_th', 'organization_name_en', 'organization_type'
  ]
};

export const generateTemplate = (type: CSVType): string => {
  const headers = HEADERS[type];
  return Papa.unparse([headers]); // Creates a CSV with just the header row
};

export const parseCSV = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error("CSV Parse Errors:", results.errors);
          reject(results.errors);
        } else {
          resolve(results.data as T[]);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
