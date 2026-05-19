import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, FileText, ChevronLeft } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const getStatusClasses = (status: string) => {
  if (status === 'accepted') return 'bg-green-500/20 text-green-400 border border-green-500/30';
  if (status === 'rejected') return 'bg-red-500/20 text-red-400 border border-red-500/30';
  if (status === 'shortlisted') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
  if (status === 'interview_scheduled') return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
  return 'bg-yellow-500/20 text-yellow-400';
};

const ApplicantsPage = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      // Fetch applications for this specific job directly from the optimized endpoint
      const response = await api.get(`/hr/jobs/${jobId}/applicants`);
      setApplicants(response.data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      await api.post(`/hr/applications/${appId}/status`, { status });
      setApplicants((prev: any) => 
        prev.map((a: any) => a.id === appId ? { ...a, status } : a)
      );
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-900 text-white font-sans">
      <button
        onClick={() => navigate('/hr')}
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-blue-500 transition font-bold uppercase tracking-widest text-xs"
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Job Applicants</h1>
          <p className="text-gray-400 mt-2 font-medium">Ranked by AI match score based on job requirements.</p>
        </div>
        <div className="bg-blue-500/10 px-6 py-3 rounded-2xl border border-blue-500/20 text-blue-400 font-bold">
          {applicants.length} Total Candidates
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applicants.length > 0 ? (
            applicants.map((app: any) => (
              <div key={app.id} className="bg-gray-800 rounded-[2rem] p-8 shadow-xl border border-gray-700 hover:border-blue-500/40 transition-all flex flex-col md:flex-row gap-8 items-start md:items-center group">
                
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 border-2 border-blue-500/20 group-hover:scale-110 transition-transform">
                    <User size={32} />
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{app.student_name}</h3>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${getStatusClasses(app.status)}`}>
                          {app.status}
                        </span>
                        {app.is_external_job && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Source: {app.source}
                          </span>
                        )}
                        <select
                          value={app.status}
                          disabled={updatingId === app.id}
                          onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition text-[10px] font-black uppercase tracking-widest text-gray-300 disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-black ${app.match_score > 70 ? 'text-green-500' : 'text-blue-500'}`}>
                        {app.match_score}%
                      </div>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Match Score</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-gray-700/50">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition font-black text-xs uppercase tracking-widest text-gray-300">
                      <FileText size={16} /> View Resume
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => handleStatusUpdate(app.id, 'rejected')}
                      className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition font-black text-xs uppercase tracking-widest border border-red-500/20"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app.id, 'accepted')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-gray-800/50 rounded-[3rem] border-2 border-dashed border-gray-700">
              <p className="text-gray-500 font-bold text-xl italic">No applicants for this role yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;
