import React, { useState } from 'react';
import axios from 'axios';

export default function Register({ onLogin, navigateTo }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (email && password && name) {
      try {
        setLoading(true);
        const res = await axios.post('/api/v1/users/register', { name, email, password });
        if (res.data.success) {
          const { token, user } = res.data;
          onLogin({ ...user, token });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50 flex flex-col justify-center items-center p-4">
      <div className="mb-6 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">
          K
        </div>
        <h1 className="text-3xl font-bold text-brand-orange">KitPup</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-brand-gray-100 p-8 text-left">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-500 mb-6">Join the KitPup community today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange" 
              placeholder="Jane Doe" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange" 
              placeholder="jane.doe@example.com" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange" 
              placeholder="Create a strong password" 
            />
          </div>

          {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg">{error}</div>}
          
          <button type="submit" disabled={loading} className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-orange-600 transition-colors mt-2 disabled:opacity-75">
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <button onClick={() => navigateTo('login')} className="font-bold text-brand-orange hover:underline">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
