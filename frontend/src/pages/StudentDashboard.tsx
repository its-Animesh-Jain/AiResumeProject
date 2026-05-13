import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Upload, Briefcase, FileText, LogOut } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuthStore();
  const [resume, setResume] = useState<any>(null);
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resResume = await api.get('/student/resume');
      setResume(resResume.data);
    } catch (err) {}

    try {
      const resApps = await api.get('/student/applications');
      setApplications(resApps.data);
    } catch (err) {}
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-blue-500">Welcome, {user?.full_name}</h1>
          <p className="text-gray-400 mt-2">Student Dashboard</p>
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
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Upload size={20} className="text-blue-400" /> Quick Actions
          </h2>
          <div className="space-y-4">
            <Link
              to="/student/upload"
              className="block w-full text-center py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Upload New Resume
            </Link>
            <Link
              to="/student/jobs"
              className="block w-full text-center py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition font-medium"
            >
              Browse Recommended Jobs
            </Link>
          </div>
        </div>

        {/* Resume Info */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText size={20} className="text-green-400" /> My Resume
          </h2>
          {resume ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Extracted Skills:</p>
              <div className="flex flex-wrap gap-2">
                {resume.extracted_data?.skills?.map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-blue-900/50 text-blue-300 border border-blue-800 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-4">Experience: <span className="text-white">{resume.extracted_data?.experience} years</span></p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No resume uploaded yet.</p>
          )}
        </div>

        {/* Application Stats */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Briefcase size={20} className="text-yellow-400" /> Applications
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
              <span>Total Applications</span>
              <span className="text-2xl font-bold text-blue-400">{applications.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
              <span>Pending</span>
              <span className="text-2xl font-bold text-yellow-400">
                {applications.filter((a: any) => a.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Applications</h2>
        <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4">Job Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Match %</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app: any) => (
                <tr key={app.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="p-4 font-medium">{app.job?.title || 'Loading...'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                      app.status === 'accepted' ? 'bg-green-900 text-green-300' :
                      app.status === 'rejected' ? 'bg-red-900 text-red-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="w-full bg-gray-700 rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${app.match_score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs mt-1 block">{app.match_score}%</span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-400 hover:underline text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
