import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin, navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (email && password) {
      try {
        setLoading(true);
        const res = await axios.post('/api/v1/users/login', { email, password });
        if (res.data.success) {
          const { token, user } = res.data;
          onLogin({ ...user, token });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">
          K
        </div>
        <h1 className="text-3xl font-bold text-brand-orange">KitPup</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-brand-gray-100 p-8 text-left">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back! 🐾</h2>
        <p className="text-gray-500 mb-6">Log in to manage your pet's life</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <button 
                type="button" 
                onClick={() => navigateTo('forgotPassword')}
                className="text-sm font-bold text-brand-orange hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange" 
              placeholder="••••••••" 
            />
          </div>

          {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg">{error}</div>}
          
          <button type="submit" disabled={loading} className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-orange-600 transition-colors mt-2 disabled:opacity-75">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <button onClick={() => navigateTo('register')} className="font-bold text-brand-orange hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
