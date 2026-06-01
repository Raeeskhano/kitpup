import React, { useState } from 'react';

export default function ForgotPassword({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
        
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Check your email</h3>
            <p className="text-gray-500 mb-6">We've sent a password reset link to {email}</p>
            <button onClick={() => navigateTo('login')} className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-orange-600 transition-colors">
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6">Enter your email and we'll send you a link to reset your password.</p>
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

              <button type="submit" className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-orange-600 transition-colors mt-2">
                Send Reset Link
              </button>
            </form>

            <button onClick={() => navigateTo('login')} className="w-full mt-4 text-gray-500 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
