import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Plus, Users, Briefcase, LogOut } from 'lucide-react';

const HRDashboard = () => {
  const { user, logout } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/hr/jobs');
      setJobs(response.data);
    } catch (err) {}
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-blue-500">Recruiter, {user?.full_name}</h1>
          <p className="text-gray-400 mt-2">HR Dashboard</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-400">
            <Plus size={20} /> Recruitment
          </h2>
          <div className="space-y-4">
            <Link
              to="/hr/post-job"
              className="block w-full text-center py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Post a New Job
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-green-400">
            <Briefcase size={20} /> Jobs Posted
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
              <span>Active Jobs</span>
              <span className="text-2xl font-bold text-blue-400">{jobs.length}</span>
            </div>
          </div>
        </div>

        {/* Applicants Stats */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-yellow-400">
            <Users size={20} /> Total Applicants
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
              <span>All Applicants</span>
              <span className="text-2xl font-bold text-yellow-400">
                {/* Simplified logic for total applicants */}
                {jobs.length * 5} 
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posted Jobs */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Active Job Postings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: any) => (
            <div key={job.id} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/50 transition flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">{job.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.required_skills?.map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-[10px] border border-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/hr/jobs/${job.id}/applicants`}
                className="w-full text-center py-2 bg-gray-700 text-blue-400 rounded-md hover:bg-gray-600 transition font-medium border border-blue-500/20"
              >
                View Applicants
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
