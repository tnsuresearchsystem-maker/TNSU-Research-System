import Papa from 'papaparse';

export type CSVType = 'project' | 'publication' | 'utilization' | 'personnel' | 'mou' | 'ip' | 'user';

export const HEADERS: Record<CSVType, string[]> = {
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
    'username', 'password', 'email', 'role', 'campus_id', 'fullName', 'caretaker', 'phoneNumber'
  ]
};

const EXAMPLES: Record<CSVType, any[]> = {
  project: [{
    project_id: 'p_12345', funding_fiscal_year: '2568', campus_id: 'c_chiangmai', 
    project_name: 'Example Project', head_researcher: 'Dr. Somchai', 
    budget_amount: 50000, funding_source: 'Internal', research_category: 'Sports Science', status: 'Ongoing'
  }],
  publication: [{
    ref_project_id: 'p_12345', output_reporting_year: '2568', article_title: 'Example Article',
    publication_level: 'National', publication_type: 'TCI 1', is_published: 'TRUE'
  }],
  utilization: [{
    ref_project_id: 'p_12345', utilization_reporting_year: '2568', utilization_type: 'Academic', description: 'Used in curriculum'
  }],
  personnel: [{
    fiscal_year: '2568', staff_name: 'Somying', organization_name: 'c_bangkok', development_type: 'Training',
    course_name: 'Advanced Research', activity_date: '2025-01-15', duration_hours: 6
  }],
  mou: [{
    fiscal_year: '2568', external_org_name: 'SAT', sign_date: '2025-02-01', scope: 'Academic Exchange'
  }],
  ip: [{
    fiscal_year: '2568', work_name: 'New Device', ip_type: 'Patent', request_number: '123456', registration_date: '2025-03-01'
  }],
  user: [{
    username: 'user1', password: 'password123', email: 'user1@tnsu.ac.th', role: 'User', campus_id: 'c_chiangmai', fullName: 'Somchai Jaidee', caretaker: 'Dr. Somsri', phoneNumber: '0812345678'
  }]
};

export const generateTemplate = (type: CSVType): string => {
  const headers = HEADERS[type];
  const example = EXAMPLES[type];
  return Papa.unparse({
    fields: headers,
    data: example
  });
};

export const exportToCSV = <T>(data: T[], type: CSVType, filename: string) => {
  const headers = HEADERS[type];
  
  // Filter data to only include fields in headers
  const filteredData = data.map(item => {
    const row: any = {};
    headers.forEach(header => {
      // @ts-ignore
      row[header] = item[header] !== undefined ? item[header] : '';
    });
    return row;
  });

  const csv = Papa.unparse({
    fields: headers,
    data: filteredData
  });

  downloadCSV(csv, filename);
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
