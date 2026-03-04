import React, { useMemo, useState } from 'react';
import { ProjectMaster, PublicationOutput, FiscalYear, PersonnelDevelopment, MOU, IntellectualProperty, OrganizationType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { ALL_ORGANIZATIONS } from '../constants';

interface DashboardProps {
  projects: ProjectMaster[];
  publications: PublicationOutput[];
  personnel: PersonnelDevelopment[];
  mous: MOU[];
  ips: IntellectualProperty[];
  onSeedData?: () => void;
  isSeeding?: boolean;
}

const COLORS = ['#22c55e', '#facc15', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC<DashboardProps> = ({ projects, publications, personnel, mous, ips, onSeedData, isSeeding }) => {
  const { t, language } = useLanguage();
  const [filterOrgType, setFilterOrgType] = useState<string>('ALL');
  const [filterOrgId, setFilterOrgId] = useState<string>('ALL');

  // --- FILTERING LOGIC ---
  const filteredData = useMemo(() => {
    let filteredProjects = projects;
    let filteredPubs = publications;
    let filteredPersonnel = personnel;
    let filteredMOUs = mous;
    let filteredIPs = ips;

    // 1. Filter by Organization Type
    if (filterOrgType !== 'ALL') {
      const validOrgIds = ALL_ORGANIZATIONS.filter(org => org.type === filterOrgType).map(org => org.id);
      
      filteredProjects = filteredProjects.filter(p => validOrgIds.includes(p.campus_id));
      // Pubs are linked to projects, so we filter by project's campus
      filteredPubs = filteredPubs.filter(pub => {
        const proj = projects.find(p => p.project_id === pub.ref_project_id);
        return proj && validOrgIds.includes(proj.campus_id);
      });
      
      // Personnel has organization_name, but we need to map it. 
      // Current mock data uses names like "Faculty of Education". 
      // For this implementation, we might need to rely on string matching or update mock data.
      // Ideally, Personnel should have campus_id. Assuming we filter loosely or skip if data mismatch.
      // For now, let's assume we can't perfectly filter Personnel by Type without campus_id, 
      // but we can try matching names in ALL_ORGANIZATIONS.
      filteredPersonnel = filteredPersonnel.filter(p => {
         const org = ALL_ORGANIZATIONS.find(o => o.nameEn === p.organization_name || o.nameTh === p.organization_name);
         return org && org.type === filterOrgType;
      });

      filteredMOUs = filteredMOUs.filter(m => m.campus_id && validOrgIds.includes(m.campus_id));
      filteredIPs = filteredIPs.filter(i => i.campus_id && validOrgIds.includes(i.campus_id));
    }

    // 2. Filter by Specific Organization ID
    if (filterOrgId !== 'ALL') {
      filteredProjects = filteredProjects.filter(p => p.campus_id === filterOrgId);
      filteredPubs = filteredPubs.filter(pub => {
        const proj = projects.find(p => p.project_id === pub.ref_project_id);
        return proj && proj.campus_id === filterOrgId;
      });
      // Personnel mapping check
      const targetOrg = ALL_ORGANIZATIONS.find(o => o.id === filterOrgId);
      if (targetOrg) {
        filteredPersonnel = filteredPersonnel.filter(p => p.organization_name === targetOrg.nameEn || p.organization_name === targetOrg.nameTh);
      }
      
      filteredMOUs = filteredMOUs.filter(m => m.campus_id === filterOrgId);
      filteredIPs = filteredIPs.filter(i => i.campus_id === filterOrgId);
    }

    return {
      projects: filteredProjects,
      publications: filteredPubs,
      personnel: filteredPersonnel,
      mous: filteredMOUs,
      ips: filteredIPs
    };
  }, [projects, publications, personnel, mous, ips, filterOrgType, filterOrgId]);

  // --- AGGREGATION FOR CHARTS ---

  // Breakdown by Campus (Top 5 or All)
  const campusBreakdownData = useMemo(() => {
    const stats: Record<string, { name: string, projects: number, pubs: number, personnel: number, mous: number, ips: number }> = {};

    ALL_ORGANIZATIONS.forEach(org => {
      if (filterOrgType !== 'ALL' && org.type !== filterOrgType) return;
      if (filterOrgId !== 'ALL' && org.id !== filterOrgId) return;

      stats[org.id] = {
        name: language === 'th' ? org.nameTh : org.nameEn,
        projects: 0,
        pubs: 0,
        personnel: 0,
        mous: 0,
        ips: 0
      };
    });

    // Count Projects
    filteredData.projects.forEach(p => {
      if (stats[p.campus_id]) stats[p.campus_id].projects++;
    });

    // Count Pubs
    filteredData.publications.forEach(pub => {
      const proj = projects.find(p => p.project_id === pub.ref_project_id);
      if (proj && stats[proj.campus_id]) stats[proj.campus_id].pubs++;
    });

    // Count Personnel (Approximate matching)
    filteredData.personnel.forEach(p => {
       const org = ALL_ORGANIZATIONS.find(o => o.nameEn === p.organization_name || o.nameTh === p.organization_name);
       if (org && stats[org.id]) stats[org.id].personnel++;
    });

    // Count MOUs
    filteredData.mous.forEach(m => {
      if (m.campus_id && stats[m.campus_id]) stats[m.campus_id].mous++;
    });

    // Count IPs
    filteredData.ips.forEach(i => {
      if (i.campus_id && stats[i.campus_id]) stats[i.campus_id].ips++;
    });

    return Object.values(stats).filter(s => s.projects > 0 || s.pubs > 0 || s.personnel > 0 || s.mous > 0 || s.ips > 0);
  }, [filteredData, projects, language, filterOrgType, filterOrgId]);

  // Success Rate Logic (Existing)
  const cohortData = useMemo(() => {
    const years = Object.values(FiscalYear);
    return years.map(year => {
      const projectsInYear = filteredData.projects.filter(p => p.funding_fiscal_year === year);
      const totalProjects = projectsInYear.length;
      const projectsWithOutput = projectsInYear.filter(p => 
        filteredData.publications.some(pub => pub.ref_project_id === p.project_id)
      ).length;
      const successRate = totalProjects > 0 ? ((projectsWithOutput / totalProjects) * 100).toFixed(1) : 0;
      return { year, successRate: Number(successRate) };
    });
  }, [filteredData]);

  // Status Distribution (Existing)
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    filteredData.projects.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    return Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
  }, [filteredData]);

  // --- EMPTY STATE ---
  if (projects.length === 0 && !isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center p-6">
        <div className="bg-tnsu-green-50 p-6 rounded-full mb-6">
          <span className="material-icons text-6xl text-tnsu-green-600">dataset</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
        <p className="text-gray-500 mb-8 max-w-md">The database is currently empty. Load sample data to see the dashboard.</p>
        {onSeedData && (
          <button onClick={onSeedData} className="px-8 py-3 bg-tnsu-green-600 text-white rounded-xl hover:bg-tnsu-green-700 font-bold">
            Load Demo Data
          </button>
        )}
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('dashboard')}</h1>
          <p className="text-gray-500 text-sm">Overview of Research, Innovation, and Personnel Development</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Org Type Filter */}
          <select 
            value={filterOrgType}
            onChange={(e) => { setFilterOrgType(e.target.value); setFilterOrgId('ALL'); }}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-tnsu-green-500 text-sm"
          >
            <option value="ALL">{t('allTypes')}</option>
            <option value={OrganizationType.Campus}>{t('typeCampus')}</option>
            <option value={OrganizationType.SportsSchool}>{t('typeSchool')}</option>
            <option value={OrganizationType.OfficePresident}>{t('typeOffice')}</option>
          </select>

          {/* Specific Org Filter */}
          <select 
            value={filterOrgId}
            onChange={(e) => setFilterOrgId(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-tnsu-green-500 text-sm max-w-xs"
          >
            <option value="ALL">{t('allOrgs')}</option>
            {ALL_ORGANIZATIONS
              .filter(org => filterOrgType === 'ALL' || org.type === filterOrgType)
              .map(org => (
                <option key={org.id} value={org.id}>
                  {language === 'th' ? org.nameTh : org.nameEn}
                </option>
            ))}
          </select>

          <button 
            onClick={handlePrint}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-900 flex items-center text-sm transition-colors"
          >
            <span className="material-icons mr-2 text-sm">print</span>
            {t('printReport') || 'Print Report'}
          </button>
        </div>
      </div>

      {/* PRINT HEADER (Visible only on print) */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">TNSU Research & Innovation Report</h1>
        <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-500 mt-2">
           Filter: {filterOrgType === 'ALL' ? 'All Types' : filterOrgType} - {filterOrgId === 'ALL' ? 'All Orgs' : ALL_ORGANIZATIONS.find(o => o.id === filterOrgId)?.nameEn}
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard 
          title={t('totalProjects')} 
          value={filteredData.projects.length} 
          icon="folder" 
          color="bg-tnsu-green-50 text-tnsu-green-700" 
        />
        <KpiCard 
          title={t('totalPubs')} 
          value={filteredData.publications.length} 
          icon="article" 
          color="bg-yellow-50 text-yellow-700" 
        />
        <KpiCard 
          title={t('personnel')} 
          value={filteredData.personnel.length} 
          icon="school" 
          color="bg-indigo-50 text-indigo-700" 
        />
        <KpiCard 
          title="MOUs" 
          value={filteredData.mous.length} 
          icon="handshake" 
          color="bg-purple-50 text-purple-700" 
        />
        <KpiCard 
          title="IPs" 
          value={filteredData.ips.length} 
          icon="copyright" 
          color="bg-pink-50 text-pink-700" 
        />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:break-inside-avoid">
        {/* Success Rate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('successRate')} (Projects with Outputs)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis unit="%" axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="successRate" fill="#16a34a" radius={[4, 4, 0, 0]} name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Project Status Distribution</h3>
           <div className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* CHARTS ROW 2: BREAKDOWN (Only if viewing All or Type) */}
      {(filterOrgId === 'ALL') && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300 print:break-before-page">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Performance by Campus / School</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campusBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={80} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar dataKey="projects" name={t('projects')} fill="#22c55e" stackId="a" />
                <Bar dataKey="pubs" name={t('publications')} fill="#facc15" stackId="a" />
                <Bar dataKey="personnel" name={t('personnel')} fill="#6366f1" stackId="a" />
                <Bar dataKey="mous" name="MOUs" fill="#a855f7" stackId="a" />
                <Bar dataKey="ips" name="IPs" fill="#ec4899" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SUMMARY TABLE (Visible on Print Only for Verification) */}
      <div className="hidden print:block mt-8">
        <h3 className="text-lg font-bold text-black mb-4 border-b pb-2">Data Verification Table</h3>
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2">Organization</th>
              <th className="py-2 text-right">Projects</th>
              <th className="py-2 text-right">Publications</th>
              <th className="py-2 text-right">Personnel</th>
              <th className="py-2 text-right">MOUs</th>
              <th className="py-2 text-right">IPs</th>
            </tr>
          </thead>
          <tbody>
            {campusBreakdownData.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="py-2">{row.name}</td>
                <td className="py-2 text-right">{row.projects}</td>
                <td className="py-2 text-right">{row.pubs}</td>
                <td className="py-2 text-right">{row.personnel}</td>
                <td className="py-2 text-right">{row.mous}</td>
                <td className="py-2 text-right">{row.ips}</td>
              </tr>
            ))}
            <tr className="font-bold border-t-2 border-black">
              <td className="py-2">TOTAL</td>
              <td className="py-2 text-right">{filteredData.projects.length}</td>
              <td className="py-2 text-right">{filteredData.publications.length}</td>
              <td className="py-2 text-right">{filteredData.personnel.length}</td>
              <td className="py-2 text-right">{filteredData.mous.length}</td>
              <td className="py-2 text-right">{filteredData.ips.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h4>
      <div className={`p-2 rounded-lg ${color.split(' ')[0]}`}>
        <span className={`material-icons text-xl ${color.split(' ')[1]}`}>{icon}</span>
      </div>
    </div>
    <span className="text-3xl font-bold text-gray-800">{value}</span>
  </div>
);

export default Dashboard;