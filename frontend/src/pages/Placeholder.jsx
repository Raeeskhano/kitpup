import React from 'react';

export default function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-brand-orange">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md mx-auto">
        This section is currently under construction. Check back soon for exciting new features!
      </p>
    </div>
  );
}
