import Papa from 'papaparse';

export type CSVType = 'project' | 'publication' | 'utilization' | 'personnel' | 'mou' | 'ip' | 'user';

export const HEADERS: Record<CSVType, string[]> = {
  project: [
    'project_id', 'funding_fiscal_year', 'reporting_period', 'campus_id', 'project_name', 'project_name_en',
    'head_researcher', 'budget_amount', 'funding_source', 'research_category', 'status', 'approval_status'
  ],
  publication: [
    'output_id', 'ref_project_id', 'campus_id', 'project_name', 'output_reporting_year', 'article_title', 
    'publication_level', 'publication_type', 'is_published', 'approval_status'
  ],
  utilization: [
    'id', 'ref_project_id', 'campus_id', 'project_name', 'utilization_reporting_year', 'utilization_type', 'description', 'approval_status'
  ],
  personnel: [
    'id', 'fiscal_year', 'staff_name', 'faculty', 'organization_name', 'development_type', 
    'course_name', 'activity_date', 'duration_hours', 'approval_status'
  ],
  mou: [
    'id', 'fiscal_year', 'external_org_name', 'sign_date', 'scope', 'campus_id', 'approval_status'
  ],
  ip: [
    'id', 'fiscal_year', 'work_name', 'ip_type', 'request_number', 'registration_date', 'campus_id', 'approval_status'
  ],
  user: [
    'id', 'username', 'password', 'email', 'role', 'campus_id', 'fullName', 'caretaker', 'phoneNumber'
  ]
};

const EXAMPLES: Record<CSVType, any[]> = {
  project: [{
    project_id: 'p_12345', funding_fiscal_year: '2568', reporting_period: '12 Months', campus_id: 'c_chiangmai', 
    project_name: 'Example Project', project_name_en: 'Example Project EN', head_researcher: 'Dr. Somchai', 
    budget_amount: 50000, funding_source: 'Internal', research_category: 'ด้านศาสตร์การกีฬา', status: 'Ongoing', approval_status: 'Approved'
  }],
  publication: [{
    output_id: 'o_12345', ref_project_id: 'p_12345', campus_id: 'c_chiangmai', project_name: 'Example Project', output_reporting_year: '2568', article_title: 'Example Article',
    publication_level: 'National', publication_type: 'TCI Group 1', is_published: 'TRUE', approval_status: 'Approved'
  }],
  utilization: [{
    id: 'u_12345', ref_project_id: 'p_12345', campus_id: 'c_chiangmai', project_name: 'Example Project', utilization_reporting_year: '2568', utilization_type: 'Academic', description: 'Used in curriculum', approval_status: 'Approved'
  }],
  personnel: [{
    id: 'pe_12345', fiscal_year: '2568', staff_name: 'Somying', faculty: 'คณะวิทยาศาสตร์การกีฬาและสุขภาพ', organization_name: 'c_bangkok', development_type: 'Training',
    course_name: 'Advanced Research', activity_date: '2025-01-15', duration_hours: 6, approval_status: 'Approved'
  }],
  mou: [{
    id: 'm_12345', fiscal_year: '2568', external_org_name: 'SAT', sign_date: '2025-02-01', scope: 'Academic Exchange', campus_id: 'c_chiangmai', approval_status: 'Approved'
  }],
  ip: [{
    id: 'i_12345', fiscal_year: '2568', work_name: 'New Device', ip_type: 'Patent', request_number: '123456', registration_date: '2025-03-01', campus_id: 'c_chiangmai', approval_status: 'Approved'
  }],
  user: [{
    id: 'user_12345', username: 'user1', password: 'password123', email: 'user1@tnsu.ac.th', role: 'User', campus_id: 'c_chiangmai', fullName: 'Somchai Jaidee', caretaker: 'Dr. Somsri', phoneNumber: '0812345678'
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
