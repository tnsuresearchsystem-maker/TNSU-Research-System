import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface UserManualProps {
  section: string;
  onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ section, onClose }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'module' | 'role'>('module');

  const getModuleContent = () => {
    if (language === 'th') {
      switch (section) {
        case 'dashboard': return 'แสดงภาพรวมสถิติงานวิจัยและตัวชี้วัดความสำเร็จ (KPI) ของหน่วยงาน สามารถกรองข้อมูลตามปีงบประมาณ ภูมิภาค และวิทยาเขตได้';
        case 'projects': return 'บริหารจัดการข้อมูลโครงการวิจัย แหล่งทุน และงบประมาณ สามารถเพิ่ม แก้ไข ลบ และนำเข้า/ส่งออกข้อมูลผ่านไฟล์ CSV ได้';
        case 'publications': return 'บันทึกและติดตามผลงานตีพิมพ์ บทความวิจัย และการเผยแพร่ผลงาน ทั้งที่เชื่อมโยงกับโครงการและผลงานอิสระ';
        case 'personnel': return 'ติดตามประวัติการพัฒนาบุคลากร การอบรม และการประชุมวิชาการ เพื่อเก็บสถิติการพัฒนาศักยภาพ';
        case 'utilization': return 'บันทึกการนำผลงานวิจัยไปใช้ประโยชน์ในด้านต่างๆ เช่น เชิงนโยบาย เชิงพาณิชย์ หรือเชิงวิชาการ';
        case 'ip_mou': return 'จัดการข้อมูลทรัพย์สินทางปัญญา (IP) และบันทึกความร่วมมือ (MOU) กับหน่วยงานภายนอก';
        case 'users': return 'บริหารจัดการผู้ใช้งาน กำหนดสิทธิ์ และตรวจสอบการเข้าใช้งาน (เฉพาะ Admin เท่านั้น)';
        default: return 'เลือกเมนูเพื่อดูรายละเอียด';
      }
    } else {
      switch (section) {
        case 'dashboard': return 'Overview of research statistics and key performance indicators. Can be filtered by fiscal year, region, and campus.';
        case 'projects': return 'Manage research projects, funding sources, and budget allocation. Supports CRUD operations and CSV import/export.';
        case 'publications': return 'Record and track research publications and academic outputs, both project-linked and independent.';
        case 'personnel': return 'Track personnel development activities and training records.';
        case 'utilization': return 'Record how research outputs are utilized for impact (policy, commercial, academic).';
        case 'ip_mou': return 'Manage Intellectual Property (IP) and Memorandums of Understanding (MOU).';
        case 'users': return 'Manage system users, roles, and permissions (Admin only).';
        default: return 'Select a section to view details.';
      }
    }
  };

  const renderRoleManual = () => {
    const isAdmin = user?.role === 'Admin';
    
    if (language === 'th') {
      return (
        <div className="space-y-4 text-sm text-gray-700">
          {isAdmin ? (
            <>
              <h4 className="font-bold text-tnsu-green-800 text-base">คู่มือสำหรับผู้ดูแลระบบ (Admin)</h4>
              <p>ในฐานะ Admin คุณมีสิทธิ์เข้าถึงข้อมูลทั้งหมดในระบบของทุกวิทยาเขตและโรงเรียนกีฬา</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>การจัดการผู้ใช้:</strong> ไปที่เมนู "จัดการผู้ใช้งาน" เพื่อเพิ่ม แก้ไข ลบ หรือรีเซ็ตรหัสผ่านให้ผู้ใช้ในแต่ละวิทยาเขต</li>
                <li><strong>การจัดการข้อมูล:</strong> คุณสามารถดู เพิ่ม แก้ไข และลบข้อมูล (โครงการ, ผลงานตีพิมพ์ ฯลฯ) ของทุกหน่วยงานได้</li>
                <li><strong>การดูภาพรวม (Dashboard):</strong> คุณสามารถใช้ตัวกรอง "ภูมิภาค" และ "วิทยาเขต" เพื่อดูสถิติเปรียบเทียบระหว่างหน่วยงานได้</li>
                <li><strong>การตรวจสอบ (Audit):</strong> ระบบจะบันทึกการกระทำของคุณและผู้ใช้ทุกคนไว้ใน "System Logs" (ตรวจสอบได้ในฐานข้อมูล)</li>
              </ul>
            </>
          ) : (
            <>
              <h4 className="font-bold text-tnsu-green-800 text-base">คู่มือสำหรับผู้ใช้งาน (User)</h4>
              <p>ในฐานะ User คุณมีสิทธิ์จัดการข้อมูลเฉพาะในหน่วยงาน/วิทยาเขตของคุณเท่านั้น ({user?.organization.nameTh})</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>การจัดการข้อมูล:</strong> คุณสามารถเพิ่ม แก้ไข และลบข้อมูลโครงการ ผลงานตีพิมพ์ และอื่นๆ ที่เป็นของหน่วยงานคุณเท่านั้น</li>
                <li><strong>การดูภาพรวม (Dashboard):</strong> สถิติที่แสดงในหน้า Dashboard จะถูกกรองให้แสดงเฉพาะข้อมูลของหน่วยงานคุณโดยอัตโนมัติ</li>
                <li><strong>การจัดการโปรไฟล์:</strong> คุณสามารถเปลี่ยนรหัสผ่านของตนเองได้โดยคลิกที่ชื่อผู้ใช้มุมขวาบน แล้วเลือก "เปลี่ยนรหัสผ่าน"</li>
                <li><strong>ข้อจำกัด:</strong> คุณจะไม่สามารถเข้าถึงเมนู "จัดการผู้ใช้งาน" หรือดูข้อมูลของวิทยาเขตอื่นได้</li>
              </ul>
            </>
          )}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h5 className="font-semibold text-blue-800 mb-1">💡 โฟลว์การทำงานแนะนำ:</h5>
            <ol className="list-decimal pl-5 space-y-1">
              <li>เพิ่ม <strong>โครงการวิจัย</strong> ก่อนเป็นอันดับแรก</li>
              <li>เมื่อโครงการเสร็จสิ้น ให้นำรหัสโครงการไปผูกกับ <strong>ผลงานตีพิมพ์</strong> หรือ <strong>การนำไปใช้ประโยชน์</strong></li>
              <li>ใช้ปุ่ม <strong>นำเข้า CSV</strong> หากมีข้อมูลจำนวนมากที่เตรียมไว้ใน Excel</li>
            </ol>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4 text-sm text-gray-700">
          {isAdmin ? (
            <>
              <h4 className="font-bold text-tnsu-green-800 text-base">Admin Guide</h4>
              <p>As an Admin, you have full access to all data across all campuses and sports schools.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>User Management:</strong> Go to the "Users" menu to create, edit, delete, or reset passwords for users.</li>
                <li><strong>Data Management:</strong> You can view, add, edit, and delete records (Projects, Publications, etc.) for any organization.</li>
                <li><strong>Dashboard:</strong> Use the "Region" and "Campus" filters to compare statistics across different organizations.</li>
              </ul>
            </>
          ) : (
            <>
              <h4 className="font-bold text-tnsu-green-800 text-base">User Guide</h4>
              <p>As a User, you can only manage data for your specific organization ({user?.organization.nameEn}).</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Data Management:</strong> You can add, edit, and delete records that belong to your organization.</li>
                <li><strong>Dashboard:</strong> The statistics shown are automatically filtered to your organization's data.</li>
                <li><strong>Profile:</strong> Change your password by clicking your username in the top right and selecting "Change Password".</li>
                <li><strong>Restrictions:</strong> You cannot access the "Users" menu or view data from other campuses.</li>
              </ul>
            </>
          )}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h5 className="font-semibold text-blue-800 mb-1">💡 Recommended Workflow:</h5>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Add <strong>Research Projects</strong> first.</li>
              <li>Link the project ID when adding <strong>Publications</strong> or <strong>Utilizations</strong>.</li>
              <li>Use the <strong>Import CSV</strong> button for bulk data entry.</li>
            </ol>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-tnsu-green-800 flex items-center">
            <span className="material-icons mr-2 text-tnsu-green-600">menu_book</span>
            {language === 'th' ? 'คู่มือการใช้งานระบบ' : 'System User Manual'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b px-6 pt-2">
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'module' ? 'border-tnsu-green-600 text-tnsu-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('module')}
          >
            {language === 'th' ? 'คู่มือเมนูปัจจุบัน' : 'Current Module'}
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'role' ? 'border-tnsu-green-600 text-tnsu-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('role')}
          >
            {language === 'th' ? 'บทบาทและโฟลว์การทำงาน' : 'Roles & Workflow'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {activeTab === 'module' ? (
            <>
              <div className="bg-tnsu-green-50 p-5 rounded-lg border border-tnsu-green-100 mb-6">
                <h3 className="font-semibold text-tnsu-green-900 mb-2 capitalize text-lg">
                  {section.replace('_', ' ')} {language === 'th' ? 'เมนู' : 'Module'}
                </h3>
                <p className="text-gray-700 leading-relaxed">{getModuleContent()}</p>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="font-semibold mb-2 text-gray-800 flex items-center">
                  <span className="material-icons text-yellow-500 mr-1 text-sm">lightbulb</span>
                  {t('tips')}
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-1">
                  <li>{t('tipCSV')}</li>
                  <li>{t('tipEdit')}</li>
                  <li>{t('tipSearch')}</li>
                  <li>{t('tipCSVCodes')}</li>
                </ul>
              </div>
            </>
          ) : (
            renderRoleManual()
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors shadow-sm"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
