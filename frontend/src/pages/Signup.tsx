import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'hr'>('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        full_name: fullName,
        role
      });
      setToken(response.data.access_token);
      setUser(response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSignup} className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <h2 className="mb-6 text-3xl font-bold text-center text-blue-500 font-sans">Sign Up</h2>
        {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-300">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-300">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'student' | 'hr')}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="student">Student (Job Seeker)</option>
            <option value="hr">HR (Recruiter)</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 shadow-lg"
        >
          Sign Up
        </button>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline font-bold">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
