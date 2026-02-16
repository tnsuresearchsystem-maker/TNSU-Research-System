import { FiscalYear, FundingSource, ProjectStatus, ResearchCategory, PublicationLevel, PublicationType, OrganizationType, Organization } from "./types";

export const FISCAL_YEARS = Object.values(FiscalYear);
export const FUNDING_SOURCES = Object.values(FundingSource);
export const PROJECT_STATUSES = Object.values(ProjectStatus);
export const RESEARCH_CATEGORIES = Object.values(ResearchCategory);
export const PUBLICATION_LEVELS = Object.values(PublicationLevel);
export const PUBLICATION_TYPES = Object.values(PublicationType);

// --- ORGANIZATIONS DATA ---

export const CENTRAL_OFFICE: Organization[] = [
  { id: "c_office", nameEn: "Office of the President", nameTh: "สำนักงานอธิการบดี", type: OrganizationType.OfficePresident }
];

export const CAMPUSES: Organization[] = [
  { id: "c_chiangmai", nameEn: "Chiang Mai Campus", nameTh: "วิทยาเขตเชียงใหม่", type: OrganizationType.Campus },
  { id: "c_phetchabun", nameEn: "Phetchabun Campus", nameTh: "วิทยาเขตเพชรบูรณ์", type: OrganizationType.Campus },
  { id: "c_lampang", nameEn: "Lampang Campus", nameTh: "วิทยาเขตลำปาง", type: OrganizationType.Campus },
  { id: "c_sukhothai", nameEn: "Sukhothai Campus", nameTh: "วิทยาเขตสุโขทัย", type: OrganizationType.Campus },
  { id: "c_bangkok", nameEn: "Bangkok Campus", nameTh: "วิทยาเขตกรุงเทพ", type: OrganizationType.Campus },
  { id: "c_chonburi", nameEn: "Chonburi Campus", nameTh: "วิทยาเขตชลบุรี", type: OrganizationType.Campus },
  { id: "c_samutsakhon", nameEn: "Samut Sakhon Campus", nameTh: "วิทยาเขตสมุทรสาคร", type: OrganizationType.Campus },
  { id: "c_suphanburi", nameEn: "Suphan Buri Campus", nameTh: "วิทยาเขตสุพรรณบุรี", type: OrganizationType.Campus },
  { id: "c_angthong", nameEn: "Ang Thong Campus", nameTh: "วิทยาเขตอ่างทอง", type: OrganizationType.Campus },
  { id: "c_chaiyaphum", nameEn: "Chaiyaphum Campus", nameTh: "วิทยาเขตชัยภูมิ", type: OrganizationType.Campus },
  { id: "c_mahasarakham", nameEn: "Maha Sarakham Campus", nameTh: "วิทยาเขตมหาสารคาม", type: OrganizationType.Campus },
  { id: "c_sisaket", nameEn: "Sisaket Campus", nameTh: "วิทยาเขตศรีสะเกษ", type: OrganizationType.Campus },
  { id: "c_udonthani", nameEn: "Udon Thani Campus", nameTh: "วิทยาเขตอุดรธานี", type: OrganizationType.Campus },
  { id: "c_krabi", nameEn: "Krabi Campus", nameTh: "วิทยาเขตกระบี่", type: OrganizationType.Campus },
  { id: "c_chumphon", nameEn: "Chumphon Campus", nameTh: "วิทยาเขตชุมพร", type: OrganizationType.Campus },
  { id: "c_trang", nameEn: "Trang Campus", nameTh: "วิทยาเขตตรัง", type: OrganizationType.Campus },
  { id: "c_yala", nameEn: "Yala Campus", nameTh: "วิทยาเขตยะลา", type: OrganizationType.Campus },
];

export const SPORTS_SCHOOLS: Organization[] = [
  { id: "s_chiangmai", nameEn: "Chiang Mai Sports School", nameTh: "โรงเรียนกีฬาจังหวัดเชียงใหม่", type: OrganizationType.SportsSchool },
  { id: "s_nakhonsawan", nameEn: "Nakhon Sawan Sports School", nameTh: "โรงเรียนกีฬาจังหวัดนครสวรรค์", type: OrganizationType.SportsSchool },
  { id: "s_lampang", nameEn: "Lampang Sports School", nameTh: "โรงเรียนกีฬาจังหวัดลำปาง", type: OrganizationType.SportsSchool },
  { id: "s_chonburi", nameEn: "Chonburi Sports School", nameTh: "โรงเรียนกีฬาจังหวัดชลบุรี", type: OrganizationType.SportsSchool },
  { id: "s_nakhonnayok", nameEn: "Nakhon Nayok Sports School", nameTh: "โรงเรียนกีฬาจังหวัดนครนายก", type: OrganizationType.SportsSchool },
  { id: "s_suphanburi", nameEn: "Suphan Buri Sports School", nameTh: "โรงเรียนกีฬาจังหวัดสุพรรณบุรี", type: OrganizationType.SportsSchool },
  { id: "s_angthong", nameEn: "Ang Thong Sports School", nameTh: "โรงเรียนกีฬาจังหวัดอ่างทอง", type: OrganizationType.SportsSchool },
  { id: "s_khonkaen", nameEn: "Khon Kaen Sports School", nameTh: "โรงเรียนกีฬาจังหวัดขอนแก่น", type: OrganizationType.SportsSchool },
  { id: "s_sisaket", nameEn: "Sisaket Sports School", nameTh: "โรงเรียนกีฬาจังหวัดศรีสะเกษ", type: OrganizationType.SportsSchool },
  { id: "s_ubon", nameEn: "Ubon Ratchathani Sports School", nameTh: "โรงเรียนกีฬาจังหวัดอุบลราชธานี", type: OrganizationType.SportsSchool },
  { id: "s_trang", nameEn: "Trang Sports School", nameTh: "โรงเรียนกีฬาจังหวัดตรัง", type: OrganizationType.SportsSchool },
  { id: "s_nakhonsi", nameEn: "Nakhon Si Thammarat Sports School", nameTh: "โรงเรียนกีฬาจังหวัดนครศรีธรรมราช", type: OrganizationType.SportsSchool },
  { id: "s_yala", nameEn: "Yala Sports School", nameTh: "โรงเรียนกีฬาจังหวัดยะลา", type: OrganizationType.SportsSchool },
];

// Faculty data is kept for historical record/display but removed from login as per new requirement
export const FACULTIES: Organization[] = [
  { id: "f_sci", nameEn: "Faculty of Sports Science and Health", nameTh: "คณะวิทยาศาสตร์การกีฬาและสุขภาพ", type: OrganizationType.Campus }, // Fallback type
  { id: "f_arts", nameEn: "Faculty of Liberal Arts", nameTh: "คณะศิลปศาสตร์", type: OrganizationType.Campus },
  { id: "f_edu", nameEn: "Faculty of Education", nameTh: "คณะศึกษาศาสตร์", type: OrganizationType.Campus },
];

export const ALL_ORGANIZATIONS = [...CENTRAL_OFFICE, ...CAMPUSES, ...SPORTS_SCHOOLS, ...FACULTIES];

// --- TRANSLATIONS ---

export const TRANSLATIONS = {
  en: {
    appTitle: "TNSU Research Data System",
    appSubtitle: "Thailand National Sports University",
    loginTitle: "Login to System",
    loginSubtitle: "Please select your affiliation",
    selectType: "Select Organization Type",
    selectOrg: "Select Organization",
    enterName: "Enter Username",
    loginButton: "Login",
    logout: "Logout",
    dashboard: "Dashboard",
    projects: "Projects Master",
    publications: "Publications",
    totalProjects: "Total Projects",
    totalPubs: "Total Publications",
    successRate: "Avg. Success Rate",
    addProject: "New Project",
    addPub: "Add Publication",
    fiscalYear: "Fiscal Year",
    status: "Status",
    project: "Project",
    researcher: "Researcher",
    budget: "Budget",
    cancel: "Cancel",
    save: "Save",
    reportYear: "Output Reporting Year (KPI)",
    linkProject: "Link to Original Project (Source)",
    histMode: "Historical Data Entry Mode",
    welcome: "Welcome",
    role: "Role",
    typeOffice: "Office of the President",
    typeCampus: "Campus",
    typeSchool: "Sports School",
    fundingYear: "Funding Fiscal Year",
    campusOrg: "Campus / Organization",
    projectName: "Project Name",
    fundingSource: "Funding Source",
    category: "Category",
    title: "Article Title",
    type: "Type",
    level: "Level",
    searchPlaceholder: "Search Project Name, ID, or Researcher...",
    chatTitle: "TNSU AI Analyst",
    chatSubtitle: "Powered by Gemini 3 Pro",
    chatPlaceholder: "Ask about data trends...",
  },
  th: {
    appTitle: "ระบบฐานข้อมูลวิจัยและนวัตกรรม TNSU",
    appSubtitle: "มหาวิทยาลัยการกีฬาแห่งชาติ",
    loginTitle: "เข้าสู่ระบบ",
    loginSubtitle: "กรุณาเลือกสังกัดของคุณ",
    selectType: "เลือกประเภทหน่วยงาน",
    selectOrg: "เลือกหน่วยงาน",
    enterName: "กรอกชื่อผู้ใช้งาน",
    loginButton: "เข้าสู่ระบบ",
    logout: "ออกจากระบบ",
    dashboard: "แดชบอร์ด",
    projects: "ข้อมูลโครงการวิจัย",
    publications: "ผลงานตีพิมพ์",
    totalProjects: "โครงการทั้งหมด",
    totalPubs: "ผลงานตีพิมพ์ทั้งหมด",
    successRate: "อัตราความสำเร็จเฉลี่ย",
    addProject: "เพิ่มโครงการใหม่",
    addPub: "เพิ่มผลงานตีพิมพ์",
    fiscalYear: "ปีงบประมาณ",
    status: "สถานะ",
    project: "โครงการ",
    researcher: "นักวิจัย",
    budget: "งบประมาณ",
    cancel: "ยกเลิก",
    save: "บันทึก",
    reportYear: "ปีงบประมาณที่รายงานผล (KPI)",
    linkProject: "เชื่อมโยงกับโครงการต้นทาง (แหล่งทุน)",
    histMode: "โหมดบันทึกข้อมูลย้อนหลัง",
    welcome: "ยินดีต้อนรับ",
    role: "บทบาท",
    typeOffice: "สำนักงานอธิการบดี",
    typeCampus: "วิทยาเขต",
    typeSchool: "โรงเรียนกีฬา",
    fundingYear: "ปีงบประมาณที่ได้รับทุน",
    campusOrg: "วิทยาเขต / หน่วยงาน",
    projectName: "ชื่อโครงการวิจัย",
    fundingSource: "แหล่งทุน",
    category: "หมวดหมู่",
    title: "ชื่อบทความ",
    type: "ประเภท",
    level: "ระดับ",
    searchPlaceholder: "ค้นหาชื่อโครงการ, รหัส, หรือนักวิจัย...",
    chatTitle: "ผู้ช่วยวิเคราะห์ AI TNSU",
    chatSubtitle: "ขับเคลื่อนโดย Gemini 3 Pro",
    chatPlaceholder: "สอบถามเกี่ยวกับแนวโน้มข้อมูล...",
  }
};
