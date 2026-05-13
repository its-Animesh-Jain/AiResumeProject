import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, CheckCircle, XCircle, FileText, ChevronLeft, Star } from 'lucide-react';

const ApplicantsPage = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const response = await api.get(`/hr/jobs/${jobId}/applicants`);
      setApplicants(response.data);
    } catch (err) {}
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (appId: number, status: string) => {
    try {
      await api.post(`/hr/applications/${appId}/status?status=${status}`);
      fetchApplicants();
    } catch (err) {}
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/hr')}
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-blue-500 transition font-medium"
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-500">Review Applicants</h1>
          <p className="text-gray-400 mt-2">Ranked by AI match score based on job requirements.</p>
        </div>
        <div className="bg-blue-500/10 px-6 py-3 rounded-2xl border border-blue-500/20 text-blue-400 font-bold">
          {applicants.length} Total Candidates
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Fetching candidates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applicants.map((app: any) => (
            <div key={app.id} className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700 hover:border-blue-500/50 transition flex flex-col md:flex-row gap-8 items-start md:items-center">
              
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 border-2 border-blue-500/20">
                  <User size={32} />
                </div>
                {app.match_score > 80 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 p-1.5 rounded-full shadow-lg border-2 border-gray-800">
                    <Star size={16} fill="currentColor" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Candidate #{app.student_id}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        app.status === 'accepted' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        app.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-black text-blue-500">{app.match_score}%</div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AI Relevance Score</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CheckCircle size={12} className="text-green-500" /> Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {app.match_details?.matched_skills?.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-green-900/20 text-green-300 border border-green-800/50 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <XCircle size={12} className="text-red-500" /> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {app.match_details?.missing_skills?.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-red-900/20 text-red-300 border border-red-800/50 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-700/50">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl transition font-bold text-sm">
                    <FileText size={18} /> View Resume
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleStatusUpdate(app.id, 'rejected')}
                    className="px-6 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition font-bold text-sm border border-red-500/20"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(app.id, 'accepted')}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-bold text-sm shadow-lg shadow-green-900/20"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;
