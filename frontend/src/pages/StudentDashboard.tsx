import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Upload, Briefcase, FileText, LogOut } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/student/applications');
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-900 text-white font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-blue-500">Welcome, {user?.full_name}</h1>
          <p className="text-gray-400 mt-2">Track your AI-matched job applications.</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Upload size={20} className="text-blue-400" /> Resume Analysis
            </h2>
            <p className="text-sm text-gray-400 mb-6">Upload or update your resume to improve job matches.</p>
          </div>
          <Link
            to="/student/upload"
            className="block w-full text-center py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-900/20"
          >
            Update Resume
          </Link>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-green-400" /> Job Matching
            </h2>
            <p className="text-sm text-gray-400 mb-6">See real-time recommendations tailored to your skills.</p>
          </div>
          <Link
            to="/student/jobs"
            className="block w-full text-center py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition font-bold border border-gray-600"
          >
            Browse Recommendations
          </Link>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText size={20} className="text-yellow-400" /> Application Stats
          </h2>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white">{applications.length}</span>
            <span className="text-gray-500 font-bold mb-1 uppercase tracking-widest text-xs">Total Sent</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Briefcase size={24} className="text-blue-500" /> Recent Applications
      </h2>
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Role</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Match Score</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app: any) => (
                <tr key={app.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-all">
                  <td className="p-4">
                    <div className="font-bold text-white">{app.job?.title || 'Unknown Role'}</div>
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{app.job?.location || 'Remote'}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xl font-black ${app.match_score > 70 ? 'text-green-500' : 'text-blue-500'}`}>{app.match_score}%</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      app.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-12 text-center text-gray-500 italic">No applications found. Start matching!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboard;
