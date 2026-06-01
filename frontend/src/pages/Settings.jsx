import React from 'react';

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      <h2 className="text-2xl font-bold text-gray-800 px-2 mb-6">Settings</h2>

      <div className="bg-white rounded-3xl shadow-sm border border-brand-gray-100 overflow-hidden divide-y divide-gray-100">
        
        {/* Account Settings */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Account</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-bold text-gray-800">Email Address</p>
                <p className="text-sm text-gray-500">jane.doe@example.com</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
            <div className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-bold text-gray-800">Password</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive alerts for reminders and messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">Email Updates</p>
                <p className="text-sm text-gray-500">Weekly pet care tips and product updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-bold text-gray-800">Measurement System</p>
                <p className="text-sm text-gray-500">Imperial (lbs, miles)</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
            <div className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-bold text-gray-800">Location Services</p>
                <p className="text-sm text-gray-500">Used for Vet Locator and Marketplace</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>

        <div className="p-6">
          <button className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
