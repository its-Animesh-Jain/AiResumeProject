import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, MapPin, CheckCircle, Search, Sparkles, Filter, LayoutGrid } from 'lucide-react';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
    finally { setLoading(false); }
  };

  const handleApply = async (job: any) => {
    setApplying(job.id);
    setSuccess(null);
    try {
      if (job.is_external) {
        // Internal application for an external job
        await api.post('/student/apply-external', {
          id: job.id,
          title: job.title,
          description: job.description,
          location: job.location,
          required_skills: job.required_skills,
          external_url: job.external_url,
          source: 'adzuna'
        });
      } else {
        // Normal internal job application
        await api.post(`/student/apply/${job.id}`);
      }
      setSuccess(`Application for "${job.title}" submitted successfully!`);
      
      // Redirect to dashboard after a short delay to ensure DB persistence and UX
      setTimeout(() => {
        setSuccess(null);
        navigate('/student');
      }, 2000);
      
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Application failed');
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-900 text-white font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div>
          <h1 className="text-5xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
            <Sparkles className="text-blue-500" size={40} /> Recommended Roles
          </h1>
          <p className="text-gray-400 mt-3 font-bold text-lg">AI-ranked job opportunities based on your profile.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search stack..."
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-gray-400 hover:text-white transition-all font-black text-xs uppercase tracking-widest">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-8 p-5 bg-green-900/20 border border-green-700/50 rounded-2xl flex items-center gap-4 text-green-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={24} />
          <span className="font-bold">{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20"></div>
          <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Matching Algorithm in Progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {jobs.length > 0 ? (
            jobs.map((job: any) => (
              <div key={job.id} className="bg-gray-800 rounded-[2rem] p-10 shadow-2xl border border-gray-700 hover:border-blue-500/40 transition-all flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <div className="flex flex-col items-end">
                    <div className={`text-5xl font-black ${job.match_percentage > 80 ? 'text-green-500' : job.match_percentage > 60 ? 'text-blue-500' : 'text-gray-500'}`}>
                      {job.match_percentage}%
                    </div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">AI Match</span>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="mb-8 pr-20">
                    <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight">{job.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-blue-500 font-bold text-lg">{job.company || 'Unknown Company'}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        job.is_external ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {job.is_external ? 'External / Adzuna' : 'Internal Posting'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-black uppercase tracking-widest text-gray-500">
                      <span className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700/50"><Briefcase size={14} className="text-blue-500" /> {job.experience_years}+ Years</span>
                      <span className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700/50"><MapPin size={14} className="text-red-500" /> {job.location}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-10 leading-relaxed line-clamp-3 font-medium">
                    {job.description}
                  </p>

                  <div className="mb-10">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <LayoutGrid size={12} /> Key Skills & Requirements
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills?.length > 0 ? (
                        job.required_skills.map((skill: string) => (
                          <span key={skill} className="px-4 py-2 bg-gray-900 text-gray-300 border border-gray-700 rounded-xl text-xs font-black uppercase tracking-tighter group-hover:border-blue-500/30 transition-all">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">General Profile Match</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 relative z-10 pt-8 border-t border-gray-700/50">
                  <button
                    onClick={() => handleApply(job)}
                    disabled={applying === job.id}
                    className="w-full py-5 bg-blue-600 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all active:scale-95 disabled:bg-gray-700 disabled:text-gray-500 shadow-xl shadow-blue-900/20"
                  >
                    {applying === job.id ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : 'Apply for This Job'}
                  </button>

                  {job.is_external && (
                    <div className="flex items-center gap-4">
                      <a
                        href={job.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 bg-gray-800 rounded-xl font-bold text-center text-gray-400 hover:text-white border border-gray-700 transition-all text-sm uppercase tracking-widest"
                      >
                        Apply Externally
                      </a>
                      <div className="px-4 py-4 bg-gray-900/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 border border-gray-800">
                        Source: Adzuna
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-gray-800/30 rounded-[3rem] border-2 border-dashed border-gray-700">
              <Sparkles className="mx-auto text-gray-600 mb-6" size={64} />
              <p className="text-gray-500 font-black text-2xl mb-4 italic uppercase tracking-tighter">No high-relevance matches found.</p>
              <p className="text-gray-600 font-bold">Try updating your resume to improve matching accuracy.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
