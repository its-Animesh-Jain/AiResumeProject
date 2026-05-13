import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, MapPin, List, CheckCircle, AlertCircle, Send } from 'lucide-react';

const PostJob = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setError('');
    setSuccess(false);

    try {
      const skillsArray = requiredSkills.split(',').map((s) => s.trim()).filter((s) => s !== '');
      await api.post('/hr/jobs', {
        title,
        description,
        required_skills: skillsArray,
        experience,
        location,
      });
      setSuccess(true);
      setTimeout(() => navigate('/hr'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Job posting failed');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gray-900">
      <div className="w-full max-w-4xl p-10 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700">
        <div className="flex items-center gap-4 mb-10 border-b border-gray-700 pb-6">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
            <Send size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white">Post a New Job</h2>
            <p className="text-gray-400 mt-1">Our AI will match applicants based on these details.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl flex items-center gap-3 text-red-300">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-xl flex items-center gap-3 text-green-300">
            <CheckCircle size={20} /> Job posted successfully!
          </div>
        )}

        <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-full">
            <label className="block mb-2 text-sm font-bold text-gray-500 uppercase tracking-widest">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium"
              placeholder="e.g. Senior Full Stack Engineer"
              required
            />
          </div>

          <div className="col-span-full">
            <label className="block mb-2 text-sm font-bold text-gray-500 uppercase tracking-widest">Job Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium min-h-[150px]"
              placeholder="Provide a detailed job description..."
              required
            ></textarea>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <List size={14} /> Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="w-full px-5 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium"
              placeholder="React, Node.js, TypeScript..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={14} /> Experience
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-5 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium"
                placeholder="e.g. 3+ years"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-5 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium"
                placeholder="e.g. Remote / New York"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={posting}
            className="col-span-full py-4 bg-blue-600 rounded-2xl font-black text-xl hover:bg-blue-700 transition shadow-lg active:scale-95 disabled:bg-gray-700 disabled:text-gray-500 mt-6"
          >
            {posting ? 'Creating Posting...' : 'Publish Job Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
