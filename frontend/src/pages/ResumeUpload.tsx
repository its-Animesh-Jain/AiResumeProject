import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

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
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gray-900">
      <div className="w-full max-w-2xl p-10 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <h2 className="mb-8 text-3xl font-bold text-center text-blue-500">Upload Your Resume</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-3 text-red-300">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-center gap-3 text-green-300">
            <CheckCircle size={20} /> Resume uploaded and parsed successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="relative mb-8 p-10 border-2 border-dashed border-gray-600 rounded-xl hover:border-blue-500 transition-colors group">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-4 text-gray-400 group-hover:text-blue-400">
              <Upload size={48} />
              <p className="text-lg font-medium">{file ? file.name : 'Click or drag to upload (PDF, DOCX)'}</p>
              <p className="text-xs text-gray-500 italic">Max file size: 5MB</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
              !file || uploading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            {uploading ? 'Processing AI Magic...' : 'Start Analysis'}
          </button>
        </form>

        <div className="mt-8 flex items-start gap-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
          <FileText className="text-blue-400 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-semibold text-blue-300 text-sm">AI-Powered Extraction</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Our system uses Natural Language Processing (NLP) to extract your skills, experience, and key information directly from your file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
