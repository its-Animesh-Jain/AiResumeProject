import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, MapPin, List, CheckCircle, AlertCircle, Send, Sparkles } from 'lucide-react';

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
        experience_years: parseInt(experience) || 0,
        location,
      });
      setSuccess(true);
      setTimeout(() => navigate('/hr'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Job creation failed. Please check all fields.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-4xl p-12 bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Sparkles size={200} />
        </div>
        
        <div className="flex items-center gap-6 mb-12 border-b border-gray-700 pb-10">
          <div className="p-5 bg-blue-600/10 rounded-3xl text-blue-500 shadow-inner">
            <Send size={44} />
          </div>
          <div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Draft Listing</h2>
            <p className="text-gray-400 mt-2 font-bold text-lg">Define requirements for AI candidate matching.</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-700/50 rounded-3xl flex items-center gap-4 text-red-400 animate-in zoom-in-95">
            <AlertCircle size={24} className="shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-8 p-6 bg-green-900/20 border border-green-700/50 rounded-3xl flex items-center gap-4 text-green-400 animate-in zoom-in-95">
            <CheckCircle size={24} className="shrink-0" />
            <span className="font-bold text-lg text-green-300">Listing broadcasted successfully!</span>
          </div>
        )}

        <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="col-span-full">
            <label className="block mb-3 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Official Position Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-8 py-5 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-black text-xl transition-all shadow-inner"
              placeholder="e.g. Senior Backend Architect"
              required
            />
          </div>

          <div className="col-span-full">
            <label className="block mb-3 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Comprehensive Role Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-8 py-5 bg-gray-900 border border-gray-700 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium min-h-[220px] leading-relaxed transition-all shadow-inner"
              placeholder="Describe the technical challenges, team impact, and expectations..."
              required
            ></textarea>
          </div>

          <div>
            <label className="block mb-3 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <List size={14} className="text-blue-500" /> Technical Stack (Comma Separated)
            </label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="w-full px-8 py-5 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-bold transition-all shadow-inner"
              placeholder="React, Golang, Redis, AWS..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-3 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Briefcase size={14} className="text-green-500" /> Min. Years
              </label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-8 py-5 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-bold transition-all shadow-inner"
                placeholder="3"
                required
              />
            </div>
            <div>
              <label className="block mb-3 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <MapPin size={14} className="text-red-500" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-8 py-5 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-bold transition-all shadow-inner"
                placeholder="Remote"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={posting}
            className="col-span-full py-6 bg-blue-600 rounded-[2rem] font-black text-2xl hover:bg-blue-500 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-[0.97] disabled:bg-gray-700 disabled:text-gray-500 mt-6 relative overflow-hidden"
          >
            {posting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Broadcasting...</span>
              </div>
            ) : 'Publish Job Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
