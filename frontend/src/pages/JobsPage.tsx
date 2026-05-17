import { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, MapPin, CheckCircle, AlertCircle, Search, ExternalLink, Building2 } from 'lucide-react';

const JobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(term) || 
      job.required_skills.join(' ').toLowerCase().includes(term) ||
      (job.company && job.company.toLowerCase().includes(term))
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (err) {}
    finally { setLoading(false); }
  };

  const handleApply = async (jobId: number) => {
    setApplying(jobId);
    setSuccess(null);
    try {
      await api.post(`/student/apply/${jobId}`);
      setSuccess('Applied successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Application failed');
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-500">Recommended Jobs</h1>
          <p className="text-gray-400 mt-2">Personalized job matches based on your AI-parsed resume.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search roles, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-center gap-3 text-green-300 animate-bounce">
          <CheckCircle size={20} /> {success}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Analyzing jobs with AI...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredJobs.map((job: any) => (
            <div key={job.id} className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-blue-500/50 transition flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {job.source === 'adzuna' ? (
                        <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 border border-blue-700/50 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          🌐 Live Job
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 border border-gray-600 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          🏢 Internal
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition">{job.title}</h3>
                    {job.company && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 font-medium">
                        <Building2 size={14} /> {job.company}
                      </div>
                    )}
                    {job.reasons && job.reasons.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {job.reasons.map((reason: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-green-400/80 font-medium italic">
                            <CheckCircle size={10} /> {reason}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {job.experience}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-3xl font-black text-blue-500">{job.match_percentage}%</div>
                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">AI Match</span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-6 leading-relaxed line-clamp-3">
                  {job.description}
                </p>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills?.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-gray-700/50 text-gray-300 border border-gray-600 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {job.source === 'adzuna' && job.redirect_url ? (
                  <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-blue-600 text-center rounded-xl font-bold hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    View on Adzuna <ExternalLink size={18} />
                  </a>
                ) : (
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applying === job.id}
                    className="flex-1 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95 disabled:bg-gray-700 disabled:text-gray-500"
                  >
                    {applying === job.id ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
                <button className="px-4 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
