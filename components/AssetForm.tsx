
import React, { useState } from 'react';
import { MOU, IntellectualProperty, FiscalYear, IPType, ApprovalStatus } from '../types';
import { FISCAL_YEARS, IP_TYPES, ALL_ORGANIZATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface AssetFormProps {
  type: 'mou' | 'ip';
  onSaveMOU?: (mou: MOU) => void;
  onSaveIP?: (ip: IntellectualProperty) => void;
  onCancel: () => void;
  initialMOU?: MOU | null;
  initialIP?: IntellectualProperty | null;
}

const AssetForm: React.FC<AssetFormProps> = ({ type, onSaveMOU, onSaveIP, onCancel, initialMOU, initialIP }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // MOU State
  const [mouData, setMouData] = useState<Partial<MOU>>(initialMOU || {
    fiscal_year: FiscalYear.Y2568,
    sign_date: new Date().toISOString().split('T')[0],
    campus_id: user?.organization.id || ALL_ORGANIZATIONS[0].id, // Default to user's org
    approval_status: ApprovalStatus.Draft
  });

  // IP State
  const [ipData, setIpData] = useState<Partial<IntellectualProperty>>(initialIP || {
    fiscal_year: FiscalYear.Y2568,
    ip_type: IPType.Patent,
    registration_date: new Date().toISOString().split('T')[0],
    campus_id: user?.organization.id || ALL_ORGANIZATIONS[0].id, // Default to user's org
    approval_status: ApprovalStatus.Draft
  });

  React.useEffect(() => {
    if (initialMOU) setMouData(initialMOU);
    if (initialIP) setIpData(initialIP);
  }, [initialMOU, initialIP]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'mou' && onSaveMOU) {
      const newMOU: MOU = {
        ...mouData as MOU,
        id: initialMOU?.id || `mou_${Math.random().toString(36).substr(2, 6)}`,
        approval_status: mouData.approval_status || ApprovalStatus.Draft
      };
      onSaveMOU(newMOU);
    } else if (type === 'ip' && onSaveIP) {
       const newIP: IntellectualProperty = {
         ...ipData as IntellectualProperty,
         id: initialIP?.id || `ip_${Math.random().toString(36).substr(2, 6)}`,
         approval_status: ipData.approval_status || ApprovalStatus.Draft
       };
       onSaveIP(newIP);
    }
  };

  const isAdmin = user?.role === 'Admin';
  const currentStatus = type === 'mou' ? mouData.approval_status : ipData.approval_status;
  const setStatus = (status: ApprovalStatus) => {
    if (type === 'mou') {
      setMouData({ ...mouData, approval_status: status });
    } else {
      setIpData({ ...ipData, approval_status: status });
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="material-icons mr-2">add_circle</span>
        {type === 'mou' ? t('addMOU') : t('addIP')}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Approval Status */}
        <div className="col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-800 mb-2">Workflow Status</label>
          <div className="flex items-center space-x-4">
            <select
              value={currentStatus || ApprovalStatus.Draft}
              onChange={(e) => setStatus(e.target.value as ApprovalStatus)}
              className="flex-1 border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5"
            >
              <option value={ApprovalStatus.Draft}>{ApprovalStatus.Draft}</option>
              <option value={ApprovalStatus.Pending}>{ApprovalStatus.Pending}</option>
              {isAdmin && (
                <>
                  <option value={ApprovalStatus.Approved}>{ApprovalStatus.Approved}</option>
                  <option value={ApprovalStatus.Rejected}>{ApprovalStatus.Rejected}</option>
                  <option value={ApprovalStatus.RequestChange}>{ApprovalStatus.RequestChange}</option>
                </>
              )}
               {!isAdmin && currentStatus === ApprovalStatus.Approved && (
                <option value={ApprovalStatus.Approved} disabled>{ApprovalStatus.Approved}</option>
              )}
               {!isAdmin && currentStatus === ApprovalStatus.Rejected && (
                <option value={ApprovalStatus.Rejected} disabled>{ApprovalStatus.Rejected}</option>
              )}
               {!isAdmin && currentStatus === ApprovalStatus.RequestChange && (
                <option value={ApprovalStatus.RequestChange} disabled>{ApprovalStatus.RequestChange}</option>
              )}
            </select>
            <div className="text-xs text-blue-600">
              {isAdmin ? 'Admin: You can change status to any value.' : 'User: Submit for review when ready.'}
            </div>
          </div>
        </div>

        {/* Fiscal Year (Common) */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fiscalYear')}</label>
          <select 
            value={type === 'mou' ? mouData.fiscal_year : ipData.fiscal_year} 
            onChange={(e) => type === 'mou' ? setMouData({...mouData, fiscal_year: e.target.value as FiscalYear}) : setIpData({...ipData, fiscal_year: e.target.value as FiscalYear})}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-purple-500 focus:border-purple-500"
            required
          >
            {FISCAL_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>

        {/* Organization (Common) */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('campusOrg')}</label>
          <select 
            value={type === 'mou' ? mouData.campus_id : ipData.campus_id} 
            onChange={(e) => type === 'mou' ? setMouData({...mouData, campus_id: e.target.value}) : setIpData({...ipData, campus_id: e.target.value})}
            className={`w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-purple-500 focus:border-purple-500 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!isAdmin}
          >
            {ALL_ORGANIZATIONS.map(org => (
              <option key={org.id} value={org.id}>
                {language === 'th' ? org.nameTh : org.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* --- MOU FIELDS --- */}
        {type === 'mou' && (
          <>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('externalOrg')}</label>
              <input 
                type="text" 
                value={mouData.external_org_name || ''} 
                onChange={(e) => setMouData({...mouData, external_org_name: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
             <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('signDate')}</label>
              <input 
                type="date" 
                value={mouData.sign_date || ''} 
                onChange={(e) => setMouData({...mouData, sign_date: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('scope')}</label>
              <textarea 
                value={mouData.scope || ''} 
                onChange={(e) => setMouData({...mouData, scope: e.target.value})}
                rows={3}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </>
        )}

        {/* --- IP FIELDS --- */}
        {type === 'ip' && (
          <>
             <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('workName')}</label>
              <input 
                type="text" 
                value={ipData.work_name || ''} 
                onChange={(e) => setIpData({...ipData, work_name: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('ipType')}</label>
              <select 
                value={ipData.ip_type} 
                onChange={(e) => setIpData({...ipData, ip_type: e.target.value as IPType})}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-pink-500 focus:border-pink-500"
              >
                {IP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('regNo')}</label>
              <input 
                type="text" 
                value={ipData.request_number || ''} 
                onChange={(e) => setIpData({...ipData, request_number: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
             <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('regDate')}</label>
              <input 
                type="date" 
                value={ipData.registration_date || ''} 
                onChange={(e) => setIpData({...ipData, registration_date: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
          </>
        )}

        <div className="col-span-2 flex justify-end space-x-3 mt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            className={`px-8 py-2.5 text-white rounded-lg shadow-md font-medium transition-all ${type === 'mou' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-pink-600 hover:bg-pink-700'}`}
          >
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
