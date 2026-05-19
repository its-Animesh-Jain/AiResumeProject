import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  User, ChevronLeft, Search, Target, Briefcase
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const getStatusClasses = (status: string) => {
  if (status === 'accepted') return 'bg-green-500/10 text-green-500 border border-green-500/20';
  if (status === 'rejected') return 'bg-red-500/10 text-red-500 border border-red-500/20';
  if (status === 'shortlisted') return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
  if (status === 'interview_scheduled') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
  return 'bg-gray-900/50 text-gray-400 border border-gray-700';
};

const GlobalApplicantsPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const response = await api.get('/hr/applicants/all');
      setApplicants(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplicants = applicants.filter((app: any) => {
    const matchesSearch = app.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'all' || app.ai_analysis?.detected_domain === domainFilter;
    const matchesScore = app.match_score >= scoreFilter;
    return matchesSearch && matchesDomain && matchesScore;
  }).sort((a: any, b: any) => b.match_score - a.match_score);

  const domains = Array.from(new Set(applicants.map((a: any) => a.ai_analysis?.detected_domain).filter(Boolean)));

  const updateStatus = async (applicationId: string, status: string) => {
    setUpdatingId(applicationId);
    setApplicants((prev: any) =>
      prev.map((a: any) => (a.id === applicationId ? { ...a, status } : a))
    );
    try {
      await api.post(`/hr/applications/${applicationId}/status`, { status });
    } catch (err) {
      console.error(err);
      await fetchApplicants();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <button
            onClick={() => navigate('/hr')}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-blue-500 transition font-medium group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-extrabold text-white">Talent Pool</h1>
          <p className="text-gray-400 mt-2">Search and filter across all applicants in your organization.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl mb-8 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Search Candidates</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Name or skills..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Industry Domain</label>
          <select 
            className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition text-sm capitalize"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="all">All Domains</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Min Match Score: {scoreFilter}%</label>
          <input 
            type="range" 
            min="0" max="100" 
            className="w-48 h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
            value={scoreFilter}
            onChange={(e) => setScoreFilter(parseInt(e.target.value))}
          />
        </div>

        <div className="bg-blue-500/10 px-4 py-2.5 rounded-xl border border-blue-500/20 text-blue-400 font-bold text-sm">
          {filteredApplicants.length} Results
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplicants.map((app: any) => (
            <div 
              key={app.id} 
              className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                    <User size={32} />
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${app.match_score > 70 ? 'text-green-500' : 'text-blue-500'}`}>
                      {app.match_score}%
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Match Score</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{app.student_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 capitalize">
                  <Target size={14} className="text-blue-400" /> {app.ai_analysis?.detected_domain}
                  {app.is_external_job && (
                    <span className="ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {app.source}
                    </span>
                  )}
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl mb-6 border border-gray-700/50">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Briefcase size={12} /> {app.is_external_job ? 'Applied For (External)' : 'Applied For'}
                  </h4>
                  <p className="text-sm font-bold text-gray-300 line-clamp-1">
                    {app.is_external_job ? app.job_metadata?.title : (app.job?.title || 'Unknown Job')}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusClasses(app.status)}`}>
                    {String(app.status || 'pending').replace('_', ' ')}
                  </span>
                  <div className="flex-1" />
                  <select
                    value={app.status || 'pending'}
                    disabled={updatingId === app.id}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition text-[11px] font-black uppercase tracking-widest text-gray-300 disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {app.ai_analysis?.top_skills?.slice(0, 3).map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-gray-900 text-gray-400 rounded-lg text-[10px] font-bold border border-gray-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => navigate(`/hr/jobs/${app.job_id}/applicants`)}
                className="w-full py-3 bg-gray-700 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-bold border border-blue-500/20 flex items-center justify-center gap-2"
              >
                View Pipeline <ChevronLeft size={16} className="rotate-180" />
              </button>
            </div>
          ))}
          {filteredApplicants.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold">No candidates found</p>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalApplicantsPage;
