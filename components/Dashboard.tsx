import React, { useMemo } from 'react';
import { ProjectMaster, PublicationOutput, FiscalYear } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  projects: ProjectMaster[];
  publications: PublicationOutput[];
  onSeedData?: () => void;
  isSeeding?: boolean;
}

const COLORS = ['#22c55e', '#facc15', '#FFBB28', '#FF8042', '#8884d8']; // Modified to match Green/Yellow theme

const Dashboard: React.FC<DashboardProps> = ({ projects, publications, onSeedData, isSeeding }) => {
  const { t } = useLanguage();

  // 1. Success Rate by Cohort (Funding Year)
  const cohortData = useMemo(() => {
    const years = Object.values(FiscalYear);
    return years.map(year => {
      const projectsInYear = projects.filter(p => p.funding_fiscal_year === year);
      const totalProjects = projectsInYear.length;
      
      // Count how many projects from this year have at least one publication
      const projectsWithOutput = projectsInYear.filter(p => 
        publications.some(pub => pub.ref_project_id === p.project_id)
      ).length;

      const successRate = totalProjects > 0 ? ((projectsWithOutput / totalProjects) * 100).toFixed(1) : 0;

      return {
        year,
        totalProjects,
        projectsWithOutput,
        successRate: Number(successRate)
      };
    });
  }, [projects, publications]);

  // 2. Current Year Performance (Reporting Year)
  const performanceData = useMemo(() => {
    const years = Object.values(FiscalYear);
    return years.map(year => {
      const pubsInYear = publications.filter(pub => pub.output_reporting_year === year).length;
      return {
        year,
        publications: pubsInYear
      };
    });
  }, [publications]);

  // 3. Status Distribution
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    projects.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    return Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
  }, [projects]);

  // --- EMPTY STATE ---
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center p-6">
        <div className="bg-tnsu-green-50 p-6 rounded-full mb-6">
          <span className="material-icons text-6xl text-tnsu-green-600">dataset</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
        <p className="text-gray-500 mb-8 max-w-md">The database is currently empty. You can start by adding a new project manually, or load our sample dataset to see the dashboard in action.</p>
        
        {onSeedData && (
          <button 
            onClick={onSeedData}
            disabled={isSeeding}
            className="px-8 py-3 bg-tnsu-green-600 text-white rounded-xl hover:bg-tnsu-green-700 shadow-lg shadow-tnsu-green-200 transition-all transform hover:-translate-y-1 flex items-center font-bold disabled:opacity-50"
          >
            {isSeeding ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></span>
                Loading Data...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">cloud_download</span>
                Load Demo Data
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t('totalProjects')}</p>
              <h3 className="text-4xl font-bold text-tnsu-green-700 mt-2">{projects.length}</h3>
            </div>
            <div className="p-3 bg-tnsu-green-50 rounded-xl">
               <span className="material-icons text-tnsu-green-600 text-3xl">folder</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Across all fiscal years</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t('totalPubs')}</p>
              <h3 className="text-4xl font-bold text-tnsu-green-700 mt-2">{publications.length}</h3>
            </div>
             <div className="p-3 bg-tnsu-yellow-50 rounded-xl">
               <span className="material-icons text-tnsu-yellow-500 text-3xl">article</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Verified outputs</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t('successRate')}</p>
              <h3 className="text-4xl font-bold text-tnsu-green-700 mt-2">
                {cohortData.length > 0 
                  ? (cohortData.reduce((acc, curr) => acc + curr.successRate, 0) / cohortData.filter(c => c.totalProjects > 0).length || 0).toFixed(0) 
                  : 0}%
              </h3>
            </div>
             <div className="p-3 bg-blue-50 rounded-xl">
               <span className="material-icons text-blue-500 text-3xl">trending_up</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Projects with at least 1 output</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Success Rate by Cohort */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
            <span className="w-2 h-6 bg-tnsu-green-500 mr-3 rounded-full"></span>
            Success Rate by Funding Cohort
          </h3>
          <p className="text-sm text-gray-400 mb-6 pl-5">Percentage of projects funded in Fiscal Year X that have produced outputs.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis unit="%" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f0fdf4'}} />
                <Legend />
                <Bar dataKey="successRate" name={t('successRate')} fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Output Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
             <span className="w-2 h-6 bg-tnsu-yellow-400 mr-3 rounded-full"></span>
            Publication Performance
          </h3>
          <p className="text-sm text-gray-400 mb-6 pl-5">Total number of publications reported in each fiscal year.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#fefce8'}} />
                <Legend />
                <Bar dataKey="publications" name={t('totalPubs')} fill="#facc15" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Project Distribution */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-gray-800 mb-4">Project Status Overview</h3>
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
  );
};

export default Dashboard;