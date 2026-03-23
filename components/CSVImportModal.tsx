import React, { useState } from 'react';
import { CSVType, generateTemplate, parseCSV, downloadCSV, HEADERS } from '../services/csvService';
import { ALL_ORGANIZATIONS, FISCAL_YEARS } from '../constants';
import { ProjectStatus, PublicationLevel, PublicationType, IPType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CSVImportModalProps {
  type: CSVType;
  onImport: (data: any[]) => Promise<void>;
  onClose: () => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ type, onImport, onClose }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    const csvContent = generateTemplate(type);
    downloadCSV(csvContent, `${type}_template.csv`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError(t('selectFileError'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await parseCSV(file);
      if (data.length === 0) {
        setError(t('emptyFileError'));
        return;
      }
      await onImport(data);
      onClose();
    } catch (err) {
      console.error("Import error:", err);
      setError(t('importErrorMsg'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderCSVGuide = () => {
    const getFieldDescriptions = (type: CSVType) => {
      const descriptions: Record<string, string> = {
        // Common
        'campus_id': t('campusIdDesc') || 'รหัสวิทยาเขต (เช่น c_chiangmai) หรือชื่อวิทยาเขต (เช่น วิทยาเขตเชียงใหม่)',
        'approval_status': t('approvalStatusDesc') || 'สถานะการอนุมัติ (Approved, Pending, Draft)',
        'fiscal_year': t('fiscalYearDesc') || 'ปีงบประมาณ (เช่น 2568)',
        
        // Project
        'project_id': t('projectIdDesc') || 'รหัสโครงการ (ต้องไม่ซ้ำกัน)',
        'funding_fiscal_year': t('fundingFiscalYearDesc') || 'ปีงบประมาณที่ได้รับทุน (เช่น 2568)',
        'reporting_period': t('reportingPeriodDesc') || 'รอบการรายงาน (6 Months หรือ 12 Months)',
        'project_name': t('projectNameDesc') || 'ชื่อโครงการ (ภาษาไทย)',
        'project_name_en': t('projectNameEnDesc') || 'ชื่อโครงการ (ภาษาอังกฤษ)',
        'head_researcher': t('headResearcherDesc') || 'ชื่อ-นามสกุล หัวหน้าโครงการ',
        'budget_amount': t('budgetAmountDesc') || 'งบประมาณที่ได้รับ (ตัวเลขเท่านั้น)',
        'funding_source': t('fundingSourceDesc') || 'แหล่งทุน (Internal หรือ External)',
        'research_category': t('researchCategoryDesc') || 'กลุ่มสาขาวิชา (ด้านศาสตร์การกีฬา, ด้านการเรียนการสอน, ด้านอื่นๆ)',
        'status': t('statusDesc') || 'สถานะโครงการ (Ongoing, Completed, Terminated)',

        // Publication
        'output_id': t('outputIdDesc') || 'รหัสผลงานตีพิมพ์ (ต้องไม่ซ้ำกัน)',
        'ref_project_id': t('refProjectIdDesc') || 'รหัสโครงการอ้างอิง (ต้องมีอยู่ในฐานข้อมูลโครงการ)',
        'output_reporting_year': t('outputReportingYearDesc') || 'ปีที่รายงานผลงาน (เช่น 2568)',
        'article_title': t('articleTitleDesc') || 'ชื่อบทความ',
        'publication_level': t('publicationLevelDesc') || 'ระดับการตีพิมพ์ (National, International)',
        'publication_type': t('publicationTypeDesc') || 'ประเภทการตีพิมพ์ (TCI Group 1, TCI Group 2, Scopus, etc.)',
        'is_published': t('isPublishedDesc') || 'สถานะการตีพิมพ์ (TRUE หรือ FALSE)',

        // Utilization
        'id': t('idDesc') || 'รหัสรายการ (ต้องไม่ซ้ำกัน)',
        'utilization_reporting_year': t('utilizationReportingYearDesc') || 'ปีที่รายงานการนำไปใช้ประโยชน์ (เช่น 2568)',
        'utilization_type': t('utilizationTypeDesc') || 'ประเภทการนำไปใช้ประโยชน์ (Academic, Policy, Commercial, Public)',
        'description': t('descriptionDesc') || 'รายละเอียดการนำไปใช้ประโยชน์',

        // Personnel
        'staff_name': t('staffNameDesc') || 'ชื่อ-นามสกุล บุคลากร',
        'faculty': t('facultyDesc') || 'คณะที่สังกัด (คณะวิทยาศาสตร์การกีฬาและสุขภาพ, คณะศึกษาศาสตร์, คณะศิลปศาสตร์)',
        'organization_name': t('organizationNameDesc') || 'หน่วยงาน/วิทยาเขต (เช่น c_chiangmai)',
        'development_type': t('developmentTypeDesc') || 'ประเภทการพัฒนา (Training, Seminar, Conference, etc.)',
        'course_name': t('courseNameDesc') || 'ชื่อหลักสูตร/โครงการ',
        'activity_date': t('activityDateDesc') || 'วันที่จัดกิจกรรม (YYYY-MM-DD)',
        'duration_hours': t('durationHoursDesc') || 'จำนวนชั่วโมง (ตัวเลขเท่านั้น)',

        // MOU
        'external_org_name': t('externalOrgNameDesc') || 'ชื่อหน่วยงานภายนอก',
        'sign_date': t('signDateDesc') || 'วันที่ลงนาม (YYYY-MM-DD)',
        'scope': t('scopeDesc') || 'ขอบเขตความร่วมมือ',

        // IP
        'work_name': t('workNameDesc') || 'ชื่อผลงาน',
        'ip_type': t('ipTypeDesc') || 'ประเภททรัพย์สินทางปัญญา (Patent, Petty Patent, Copyright, Trademark, Trade Secret)',
        'request_number': t('requestNumberDesc') || 'เลขที่คำขอ',
        'registration_date': t('registrationDateDesc') || 'วันที่จดทะเบียน (YYYY-MM-DD)',

        // User
        'username': t('usernameDesc') || 'ชื่อผู้ใช้งาน (ต้องไม่ซ้ำกัน)',
        'password': t('passwordDesc') || 'รหัสผ่าน (ถ้าเว้นว่างจะใช้ค่าเริ่มต้น)',
        'email': t('emailDesc') || 'อีเมล',
        'role': t('roleDesc') || 'สิทธิ์การใช้งาน (Admin หรือ User)',
        'fullName': t('fullNameDesc') || 'ชื่อ-นามสกุล',
        'caretaker': t('caretakerDesc') || 'ผู้ดูแล',
        'phoneNumber': t('phoneNumberDesc') || 'เบอร์โทรศัพท์'
      };
      
      return HEADERS[type].map(field => ({
        field,
        description: descriptions[field] || 'ข้อมูล'
      }));
    };

    return (
      <details className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm mb-4">
        <summary className="font-medium text-yellow-800 cursor-pointer flex items-center">
          <span className="material-icons text-base mr-1">info</span>
          {t('dataFormatGuide')}
        </summary>
        <div className="mt-2 space-y-4 text-gray-700 max-h-80 overflow-y-auto pr-2">
          
          <div>
            <p className="font-semibold text-gray-900 mb-2 border-b pb-1">คำอธิบายฟิลด์ข้อมูล (Field Descriptions)</p>
            <div className="space-y-2">
              {getFieldDescriptions(type).map(({ field, description }) => (
                <div key={field} className="bg-white p-2 rounded border text-xs">
                  <span className="font-mono font-bold text-blue-700">{field}</span>
                  <span className="mx-2 text-gray-400">-</span>
                  <span>{description}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-1">{t('validFiscalYears')}</p>
            <p className="text-xs font-mono bg-white p-2 rounded border">
              {FISCAL_YEARS.join(', ')}
            </p>
          </div>

          {(type === 'project' || type === 'personnel' || type === 'user') && (
            <div>
              <p className="font-semibold text-gray-900 mb-1">{t('validCampusIds')}</p>
              <ul className="list-disc list-inside text-xs space-y-0.5 font-mono bg-white p-2 rounded border">
                {ALL_ORGANIZATIONS.map(org => (
                  <li key={org.id}>{org.id} - {org.nameEn}</li>
                ))}
              </ul>
            </div>
          )}

          {type === 'user' && (
            <>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{t('validRoles')}</p>
                <ul className="list-disc list-inside text-xs font-mono bg-white p-2 rounded border">
                  <li>Admin - {t('roleAdminDesc')}</li>
                  <li>User - {t('roleUserDesc')}</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{t('defaultPasswordLabel')}</p>
                <p className="text-xs bg-white p-2 rounded border">
                  {t('defaultPasswordDesc')} <strong>TNSU1234</strong>
                </p>
              </div>
            </>
          )}

          {type === 'project' && (
            <div>
              <p className="font-semibold text-gray-900 mb-1">{t('validStatus')}</p>
              <ul className="list-disc list-inside text-xs font-mono bg-white p-2 rounded border">
                {Object.values(ProjectStatus).map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}

          {type === 'publication' && (
            <>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{t('validPubLevel')}</p>
                <ul className="list-disc list-inside text-xs font-mono bg-white p-2 rounded border">
                  {Object.values(PublicationLevel).map(l => <li key={l}>{l}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{t('validPubType')}</p>
                <ul className="list-disc list-inside text-xs font-mono bg-white p-2 rounded border">
                  {Object.values(PublicationType).map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </>
          )}

          {type === 'ip' && (
            <div>
              <p className="font-semibold text-gray-900 mb-1">{t('validIpType')}</p>
              <ul className="list-disc list-inside text-xs font-mono bg-white p-2 rounded border">
                {Object.values(IPType).map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>
          )}

          {(type === 'publication' || type === 'utilization') && (
            <div>
              <p className="font-semibold text-gray-900 mb-1">{t('validRefProjectId')}</p>
              <p className="text-xs bg-white p-2 rounded border">
                {t('validRefProjectIdDesc')}
              </p>
            </div>
          )}
        </div>
      </details>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t('importDataTitle').replace('{type}', type.toUpperCase())}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-icons">close</span>
          </button>
        </div>

        {renderCSVGuide()}

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800 mb-2 font-medium">{t('step1')}</p>
            <p className="text-xs text-blue-600 mb-3">{t('step1Desc')}</p>
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center text-sm text-blue-700 hover:text-blue-900 font-medium"
            >
              <span className="material-icons text-sm mr-1">download</span>
              {t('downloadTemplateBtn')}
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800 mb-2 font-medium">{t('step2')}</p>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-tnsu-green-50 file:text-tnsu-green-700
                hover:file:bg-tnsu-green-100
              "
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleImport}
              disabled={!file || isLoading}
              className={`px-4 py-2 bg-tnsu-green-600 text-white rounded-lg text-sm font-medium shadow-sm flex items-center
                ${(!file || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-tnsu-green-700'}
              `}
            >
              {isLoading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>}
              {t('importBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
