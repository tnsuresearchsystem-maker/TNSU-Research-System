import React, { useMemo, useState } from 'react';
import { ProjectMaster, PublicationOutput, FiscalYear, PersonnelDevelopment, MOU, IntellectualProperty, OrganizationType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { ALL_ORGANIZATIONS, REGIONS } from '../constants';
import { 
  LayoutDashboard, FileText, BookOpen, Users, DollarSign, 
  TrendingUp, Award, Handshake, Copyright, Printer, Database, Filter
} from 'lucide-react';

interface DashboardProps {
  projects: ProjectMaster[];
  publications: PublicationOutput[];
  personnel: PersonnelDevelopment[];
  mous: MOU[];
  ips: IntellectualProperty[];
  onSeedData?: () => void;
  isSeeding?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const Dashboard: React.FC<DashboardProps> = ({ projects, publications, personnel, mous, ips, onSeedData, isSeeding }) => {
  const { t, language } = useLanguage();
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const [filterOrgType, setFilterOrgType] = useState<string>('ALL');
  const [filterOrgId, setFilterOrgId] = useState<string>('ALL');

  // --- FILTERING LOGIC ---
  const filteredData = useMemo(() => {
    let filteredProjects = projects;
    let filteredPubs = publications;
    let filteredPersonnel = personnel;
    let filteredMOUs = mous;
    let filteredIPs = ips;

    // 1. Filter by Region
    if (filterRegion !== 'ALL') {
      const validOrgNames = ALL_ORGANIZATIONS.filter(org => org.region === filterRegion).map(org => org.nameEn);
      
      filteredProjects = filteredProjects.filter(p => validOrgNames.includes(p.campus_id));
      filteredPubs = filteredPubs.filter(pub => {
        const proj = projects.find(p => p.project_id === pub.ref_project_id);
        return proj && validOrgNames.includes(proj.campus_id);
      });
      
      filteredPersonnel = filteredPersonnel.filter(p => {
         const org = ALL_ORGANIZATIONS.find(o => o.nameEn === p.organization_name || o.nameTh === p.organization_name);
         return org && validOrgNames.includes(org.nameEn);
      });

      filteredMOUs = filteredMOUs.filter(m => m.campus_id && validOrgNames.includes(m.campus_id));
      filteredIPs = filteredIPs.filter(i => i.campus_id && validOrgNames.includes(i.campus_id));
    }

    // 2. Filter by Organization Type
    if (filterOrgType !== 'ALL') {
      const validOrgNames = ALL_ORGANIZATIONS.filter(org => org.type === filterOrgType).map(org => org.nameEn);
      
      filteredProjects = filteredProjects.filter(p => validOrgNames.includes(p.campus_id));
      // Pubs are linked to projects, so we filter by project's campus
      filteredPubs = filteredPubs.filter(pub => {
        const proj = projects.find(p => p.project_id === pub.ref_project_id);
        return proj && validOrgNames.includes(proj.campus_id);
      });
      
      filteredPersonnel = filteredPersonnel.filter(p => {
         const org = ALL_ORGANIZATIONS.find(o => o.nameEn === p.organization_name || o.nameTh === p.organization_name);
         return org && org.type === filterOrgType;
      });

      filteredMOUs = filteredMOUs.filter(m => m.campus_id && validOrgNames.includes(m.campus_id));
      filteredIPs = filteredIPs.filter(i => i.campus_id && validOrgNames.includes(i.campus_id));
    }

    // 3. Filter by Specific Organization ID (which is actually nameEn)
    if (filterOrgId !== 'ALL') {
      filteredProjects = filteredProjects.filter(p => p.campus_id === filterOrgId);
      filteredPubs = filteredPubs.filter(pub => {
        const proj = projects.find(p => p.project_id === pub.ref_project_id);
        return proj && proj.campus_id === filterOrgId;
      });
      // Personnel mapping check
      const targetOrg = ALL_ORGANIZATIONS.find(o => o.nameEn === filterOrgId);
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
  }, [projects, publications, personnel, mous, ips, filterRegion, filterOrgType, filterOrgId]);

  // --- AGGREGATION FOR CHARTS ---

  // 1. Projects by Fiscal Year
  const projectsByYear = useMemo(() => {
    const map = filteredData.projects.reduce((acc, p) => {
      const year = p.funding_fiscal_year || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(map).sort().map(year => ({ name: year, count: map[year] }));
  }, [filteredData.projects]);

  // 2. Budget by Fiscal Year
  const budgetByYear = useMemo(() => {
    const map = filteredData.projects.reduce((acc, p) => {
      const year = p.funding_fiscal_year || 'Unknown';
      const budget = Number(p.budget_amount) || 0;
      acc[year] = (acc[year] || 0) + budget;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(map).sort().map(year => ({ name: year, amount: map[year] }));
  }, [filteredData.projects]);

  // 3. Publications by Type
  const publicationsByType = useMemo(() => {
    const map = filteredData.publications.reduce((acc, p) => {
      const type = p.publication_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(map).map(type => ({ name: type, value: map[type] }));
  }, [filteredData.publications]);

  // 4. Project Status Distribution
  const statusData = useMemo(() => {
    const map = filteredData.projects.reduce((acc, p) => {
      const status = p.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(map).map(key => ({ name: key, value: map[key] }));
  }, [filteredData.projects]);

  // 5. Breakdown by Campus (Top 5 or All)
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

    // Count Personnel
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

  // Total Budget Calculation
  const totalBudget = useMemo(() => {
    return filteredData.projects.reduce((sum, p) => sum + (Number(p.budget_amount) || 0), 0);
  }, [filteredData.projects]);


  // --- EMPTY STATE ---
  if (projects.length === 0 && !isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center p-6">
        <div className="bg-tnsu-green-50 p-6 rounded-full mb-6">
          <Database className="w-16 h-16 text-tnsu-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
        <p className="text-gray-500 mb-8 max-w-md">The database is currently empty. Load sample data to see the dashboard.</p>
        {onSeedData && (
          <button onClick={onSeedData} className="px-8 py-3 bg-tnsu-green-600 text-white rounded-xl hover:bg-tnsu-green-700 font-bold flex items-center">
            <Database className="w-5 h-5 mr-2" />
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
    <div className="space-y-8 font-sans pb-12">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-3 text-tnsu-green-600" />
            {t('dashboard')}
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-11">Overview of Research, Innovation, and Personnel Development</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <Filter className="w-5 h-5 text-gray-400 ml-2" />
          
          {/* Region Filter */}
          <select 
            value={filterRegion}
            onChange={(e) => { setFilterRegion(e.target.value); setFilterOrgId('ALL'); }}
            className="bg-transparent border-none text-gray-700 px-2 py-1 focus:ring-0 text-sm font-medium cursor-pointer hover:text-tnsu-green-600 transition-colors"
          >
            <option value="ALL">{t('allRegions') || 'All Regions'}</option>
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

          <div className="h-6 w-px bg-gray-200"></div>
          
          {/* Org Type Filter */}
          <select 
            value={filterOrgType}
            onChange={(e) => { setFilterOrgType(e.target.value); setFilterOrgId('ALL'); }}
            className="bg-transparent border-none text-gray-700 px-2 py-1 focus:ring-0 text-sm font-medium cursor-pointer hover:text-tnsu-green-600 transition-colors"
          >
            <option value="ALL">{t('allTypes')}</option>
            <option value={OrganizationType.Campus}>{t('typeCampus')}</option>
            <option value={OrganizationType.SportsSchool}>{t('typeSchool')}</option>
            <option value={OrganizationType.OfficePresident}>{t('typeOffice')}</option>
          </select>

          <div className="h-6 w-px bg-gray-200"></div>

          {/* Specific Org Filter */}
          <select 
            value={filterOrgId}
            onChange={(e) => setFilterOrgId(e.target.value)}
            className="bg-transparent border-none text-gray-700 px-2 py-1 focus:ring-0 text-sm font-medium cursor-pointer hover:text-tnsu-green-600 transition-colors max-w-[150px] truncate"
          >
            <option value="ALL">{t('allOrgs')}</option>
            {ALL_ORGANIZATIONS
              .filter(org => filterOrgType === 'ALL' || org.type === filterOrgType)
              .filter(org => filterRegion === 'ALL' || org.region === filterRegion)
              .map(org => (
                <option key={org.id} value={org.nameEn}>
                  {language === 'th' ? org.nameTh : org.nameEn}
                </option>
            ))}
          </select>

          <div className="h-6 w-px bg-gray-200"></div>

          <button 
            onClick={handlePrint}
            className="text-gray-500 hover:text-gray-800 p-2 rounded-lg transition-colors"
            title={t('printReport')}
          >
            <Printer className="w-5 h-5" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title={t('totalProjects')} 
          value={filteredData.projects.length} 
          icon={<FileText className="w-6 h-6 text-blue-600" />} 
          bg="bg-blue-50"
          textColor="text-blue-600"
        />
        <KpiCard 
          title={t('totalPubs')} 
          value={filteredData.publications.length} 
          icon={<BookOpen className="w-6 h-6 text-emerald-600" />} 
          bg="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <KpiCard 
          title="Total Budget (THB)" 
          value={`฿${(totalBudget / 1000000).toFixed(1)}M`} 
          icon={<DollarSign className="w-6 h-6 text-amber-600" />} 
          bg="bg-amber-50"
          textColor="text-amber-600"
          subtext={`Avg: ฿${filteredData.projects.length > 0 ? (totalBudget / filteredData.projects.length / 1000).toFixed(0) : 0}k / project`}
        />
        <KpiCard 
          title={t('personnel')} 
          value={filteredData.personnel.length} 
          icon={<Users className="w-6 h-6 text-indigo-600" />} 
          bg="bg-indigo-50"
          textColor="text-indigo-600"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <KpiCard 
          title="MOUs Signed" 
          value={filteredData.mous.length} 
          icon={<Handshake className="w-6 h-6 text-purple-600" />} 
          bg="bg-purple-50"
          textColor="text-purple-600"
        />
        <KpiCard 
          title="Intellectual Properties" 
          value={filteredData.ips.length} 
          icon={<Copyright className="w-6 h-6 text-pink-600" />} 
          bg="bg-pink-50"
          textColor="text-pink-600"
        />
      </div>

      {/* CHARTS ROW 1: Projects & Budget Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:break-inside-avoid">
        <ChartCard title="Projects by Fiscal Year">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectsByYear}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Projects" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Budget Allocation (THB)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={budgetByYear}>
              <defs>
                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} 
                axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} 
              />
              <Tooltip 
                formatter={(value: number) => [`฿${value.toLocaleString()}`, 'Budget']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#f59e0b" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* CHARTS ROW 2: Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:break-inside-avoid">
        <ChartCard title="Publications by Type">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={publicationsByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {publicationsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Project Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* CHARTS ROW 3: Campus Breakdown (Only if viewing All or Type) */}
      {(filterOrgId === 'ALL') && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300 print:break-before-page">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-tnsu-green-600" />
            Performance by Campus / School
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campusBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={100} tick={{fontSize: 12, fill: '#4b5563'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} iconType="circle" />
                <Bar dataKey="projects" name={t('projects')} fill="#3b82f6" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="pubs" name={t('publications')} fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="personnel" name={t('personnel')} fill="#8b5cf6" stackId="a" radius={[4, 4, 0, 0]} />
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

const KpiCard = ({ title, value, icon, bg, textColor, subtext }: { title: string, value: string | number, icon: React.ReactNode, bg: string, textColor: string, subtext?: string }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-all hover:-translate-y-1 duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg} ${textColor}`}>
        {icon}
      </div>
      {/* <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span> */}
    </div>
    <div>
      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h4>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300 hover:shadow-md transition-shadow duration-300">
    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
      <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
      {title}
    </h3>
    {children}
  </div>
);

export default Dashboard;