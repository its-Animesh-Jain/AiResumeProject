import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Plus, Users, Briefcase, LogOut } from 'lucide-react';

const HRDashboard = () => {
  const { user, logout } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchApplicants();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/hr/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchApplicants = async () => {
    try {
      const response = await api.get('/hr/applicants/all');
      setTotalApplicants(response.data.length);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-900 text-white font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-blue-500 uppercase tracking-tighter">Recruiter, {user?.full_name}</h1>
          <p className="text-gray-400 mt-2 font-medium">Manage your job listings and rank applicants instantly.</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl flex flex-col justify-between group hover:border-blue-500/50 transition-all">
          <div>
            <div className="p-3 bg-blue-500/10 rounded-2xl w-fit text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <h2 className="text-2xl font-black mb-2">Publish Role</h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">Create a new job listing and let our AI start matching candidates.</p>
          </div>
          <Link
            to="/hr/post-job"
            className="block w-full text-center py-4 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all font-black text-lg shadow-xl shadow-blue-900/20"
          >
            Post a New Job
          </Link>
        </div>

        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl">
          <div className="p-3 bg-green-500/10 rounded-2xl w-fit text-green-500 mb-6">
            <Users size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">Total Applicants</h2>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-6xl font-black text-white">{totalApplicants}</span>
            <span className="text-gray-500 font-bold text-lg">Candidates</span>
          </div>
        </div>

        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl flex flex-col justify-between group hover:border-yellow-500/50 transition-all">
          <div>
            <div className="p-3 bg-yellow-500/10 rounded-2xl w-fit text-yellow-500 mb-6 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-black mb-2 text-white">Talent Pool</h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">Browse all applicants across your organization, ranked by AI relevance.</p>
          </div>
          <Link
            to="/hr/applicants/all"
            className="block w-full text-center py-4 bg-gray-700 rounded-2xl hover:bg-gray-600 transition-all font-black text-lg border border-gray-600"
          >
            Global Talent View
          </Link>
        </div>
      </div>

      <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
        <Briefcase className="text-blue-500" size={32} /> Active Postings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.length > 0 ? (
          jobs.map((job: any) => (
            <div key={job.id} className="bg-gray-800 p-8 rounded-3xl border border-gray-700 hover:border-blue-500/30 transition-all shadow-2xl flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Briefcase size={80} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors">{job.title}</h3>
                <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">{job.description}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {job.required_skills?.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-gray-900 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-700">
                      {skill}
                    </span>
                  ))}
                  {job.required_skills?.length > 3 && (
                    <span className="text-[10px] text-gray-600 font-bold self-center">+{job.required_skills.length - 3} more</span>
                  )}
                </div>
              </div>
              <Link
                to={`/hr/jobs/${job.id}/applicants`}
                className="w-full text-center py-3 bg-gray-700 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-black border border-blue-500/10 shadow-lg relative z-10"
              >
                View Candidates
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-700">
            <p className="text-gray-500 font-bold text-xl mb-4 italic">No job listings yet.</p>
            <Link to="/hr/post-job" className="text-blue-500 font-black hover:underline">Start your first campaign →</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;
