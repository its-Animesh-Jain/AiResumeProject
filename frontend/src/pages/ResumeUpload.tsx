import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/student/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => navigate('/student'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-3xl p-12 bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        
        <div className="flex flex-col items-center mb-12">
          <div className="p-4 bg-blue-500/10 rounded-3xl text-blue-500 mb-6">
            <Sparkles size={40} />
          </div>
          <h2 className="text-4xl font-black text-center text-white uppercase tracking-tighter">Resume Intelligence</h2>
          <p className="text-gray-400 mt-2 font-medium">Our NLP engine will extract your stack and experience.</p>
        </div>
        
        {error && (
          <div className="mb-8 p-5 bg-red-900/20 border border-red-700/50 rounded-2xl flex items-center gap-4 text-red-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={24} className="shrink-0" />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-8 p-5 bg-green-900/20 border border-green-700/50 rounded-2xl flex items-center gap-4 text-green-400 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={24} className="shrink-0" />
            <span className="font-bold text-sm">Deep analysis complete! Redirecting to matches...</span>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="relative mb-10 p-16 border-2 border-dashed border-gray-700 rounded-[2rem] hover:border-blue-500 transition-all group bg-gray-900/50 cursor-pointer">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center gap-6 text-gray-500 group-hover:text-blue-400 transition-all">
              <div className="p-6 bg-gray-800 rounded-full shadow-lg group-hover:bg-blue-500/10 transition-colors">
                <Upload size={56} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white">{file ? file.name : 'Select PDF or DOCX'}</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mt-2 opacity-40">Drag & Drop Resume</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className={`w-full py-5 rounded-2xl font-black text-2xl transition-all shadow-2xl relative group ${
              !file || uploading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98]'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Parsing Data...</span>
              </div>
            ) : (
              'Initiate Analysis'
            )}
          </button>
        </form>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-700/50">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-black text-blue-300 text-xs uppercase tracking-widest mb-1">Entity Recognition</h4>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Automatically identifies languages, frameworks, and libraries from your experience.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-black text-purple-300 text-xs uppercase tracking-widest mb-1">Semantic Matching</h4>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Goes beyond keywords to understand the context of your previous roles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
