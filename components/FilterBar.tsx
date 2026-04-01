import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationType, ReportingPeriod, ResearchCategory, ProjectStatus, PublicationLevel, PublicationType, UtilizationType, DevelopmentType, IPType } from '../types';
import { FISCAL_YEARS, ALL_ORGANIZATIONS, REGIONS } from '../constants';

interface FilterBarProps {
  filterRegion?: string;
  setFilterRegion?: (val: string) => void;
  filterOrgType?: string;
  setFilterOrgType?: (val: string) => void;
  filterCampus?: string;
  setFilterCampus?: (val: string) => void;
  filterReportingPeriod?: string;
  setFilterReportingPeriod?: (val: string) => void;
  filterFiscalYear?: string;
  setFilterFiscalYear?: (val: string) => void;
  filterResearchCategory?: string;
  setFilterResearchCategory?: (val: string) => void;
  filterProjectStatus?: string;
  setFilterProjectStatus?: (val: string) => void;
  filterPublicationLevel?: string;
  setFilterPublicationLevel?: (val: string) => void;
  filterPublicationType?: string;
  setFilterPublicationType?: (val: string) => void;
  filterUtilizationType?: string;
  setFilterUtilizationType?: (val: string) => void;
  filterDevelopmentType?: string;
  setFilterDevelopmentType?: (val: string) => void;
  filterIPType?: string;
  setFilterIPType?: (val: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterRegion, setFilterRegion,
  filterOrgType, setFilterOrgType,
  filterCampus, setFilterCampus,
  filterReportingPeriod, setFilterReportingPeriod,
  filterFiscalYear, setFilterFiscalYear,
  filterResearchCategory, setFilterResearchCategory,
  filterProjectStatus, setFilterProjectStatus,
  filterPublicationLevel, setFilterPublicationLevel,
  filterPublicationType, setFilterPublicationType,
  filterUtilizationType, setFilterUtilizationType,
  filterDevelopmentType, setFilterDevelopmentType,
  filterIPType, setFilterIPType
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const selectClass = "bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500 max-w-[200px] truncate";

  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {user?.role === 'Admin' && setFilterRegion && (
        <select
          value={filterRegion}
          onChange={(e) => { setFilterRegion(e.target.value); if (setFilterCampus) setFilterCampus(''); }}
          className={selectClass}
        >
          <option value="">{t('allRegions')}</option>
          {REGIONS.map(region => (
            <option key={region} value={region}>
              {language === 'th' ? 
                (region === 'Northern Region' ? 'ภาคเหนือ' : 
                 region === 'Northeastern Region' ? 'ภาคตะวันออกเฉียงเหนือ' : 
                 region === 'Central Region' ? 'ภาคกลาง' : 
                 region === 'Southern Region' ? 'ภาคใต้' : region) 
                : region}
            </option>
          ))}
        </select>
      )}
      
      {user?.role === 'Admin' && setFilterOrgType && (
        <select
          value={filterOrgType}
          onChange={(e) => { setFilterOrgType(e.target.value); if (setFilterCampus) setFilterCampus(''); }}
          className={selectClass}
        >
          <option value="">{t('allTypes') || 'All Types'}</option>
          <option value={OrganizationType.Campus}>{t('typeCampus')}</option>
          <option value={OrganizationType.SportsSchool}>{t('typeSchool')}</option>
          <option value={OrganizationType.OfficePresident}>{t('typeOffice')}</option>
        </select>
      )}

      {user?.role === 'Admin' && setFilterCampus && (
        <select
          value={filterCampus}
          onChange={(e) => setFilterCampus(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allOrgs')}</option>
          {ALL_ORGANIZATIONS
            .filter(org => !filterRegion || org.region === filterRegion)
            .filter(org => !filterOrgType || org.type === filterOrgType)
            .map(org => (
            <option key={org.id} value={org.nameEn}>
              {language === 'th' ? org.nameTh : org.nameEn}
            </option>
          ))}
        </select>
      )}

      {setFilterReportingPeriod && (
        <select
          value={filterReportingPeriod}
          onChange={(e) => setFilterReportingPeriod(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allPeriods')}</option>
          <option value={ReportingPeriod.Round6Months}>{ReportingPeriod.Round6Months}</option>
          <option value={ReportingPeriod.Round12Months}>{ReportingPeriod.Round12Months}</option>
        </select>
      )}

      {setFilterFiscalYear && (
        <select
          value={filterFiscalYear}
          onChange={(e) => setFilterFiscalYear(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allYears')}</option>
          {FISCAL_YEARS.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      )}

      {setFilterResearchCategory && (
        <select
          value={filterResearchCategory}
          onChange={(e) => setFilterResearchCategory(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allDisciplines')}</option>
          {Object.values(ResearchCategory).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      )}

      {setFilterProjectStatus && (
        <select
          value={filterProjectStatus}
          onChange={(e) => setFilterProjectStatus(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allStatuses')}</option>
          {Object.values(ProjectStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      )}

      {setFilterPublicationLevel && (
        <select
          value={filterPublicationLevel}
          onChange={(e) => setFilterPublicationLevel(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allLevels') || 'All Levels'}</option>
          {Object.values(PublicationLevel).map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      )}

      {setFilterPublicationType && (
        <select
          value={filterPublicationType}
          onChange={(e) => setFilterPublicationType(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allTypes') || 'All Types'}</option>
          {Object.values(PublicationType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      )}

      {setFilterUtilizationType && (
        <select
          value={filterUtilizationType}
          onChange={(e) => setFilterUtilizationType(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allTypes') || 'All Types'}</option>
          {Object.values(UtilizationType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      )}

      {setFilterDevelopmentType && (
        <select
          value={filterDevelopmentType}
          onChange={(e) => setFilterDevelopmentType(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allTypes') || 'All Types'}</option>
          {Object.values(DevelopmentType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      )}

      {setFilterIPType && (
        <select
          value={filterIPType}
          onChange={(e) => setFilterIPType(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('allTypes') || 'All Types'}</option>
          {Object.values(IPType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default FilterBar;
