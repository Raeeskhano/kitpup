import React from 'react';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      
      {/* Top Profile Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Edit Icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#e8f1f5] flex items-center justify-center overflow-hidden">
              {/* Simple avatar placeholder illustration */}
              <div className="w-12 h-16 bg-white rounded flex flex-col items-center pt-2 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-orange-100 mb-1">
                  <img src="https://ui-avatars.com/api/?name=Alex+Carter&background=f97316&color=fff" className="w-full h-full rounded-full" alt="avatar" />
                </div>
                <div className="w-8 h-1 bg-gray-200 rounded mb-1"></div>
                <div className="w-6 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#9c5930] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-[#804622] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left mt-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Alex Carter</h2>
            <p className="text-sm text-gray-500 mb-3">alex.carter@example.com</p>
            <span className="inline-block bg-[#f4e8db] text-[#9c5930] text-xs font-bold px-3 py-1.5 rounded-full">
              Premium Member
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-[#9c5930] text-[#9c5930] font-bold hover:bg-orange-50 transition-colors text-sm">
          Edit Profile
        </button>

      </div>

      {/* Middle Section: My Pets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">My Pets</h3>
          <button className="bg-[#9c5930] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#804622] transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Add Pet
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pet 1 */}
          <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shadow-inner">
                <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200&h=200" alt="Buddy" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">Buddy</h4>
                <p className="text-xs text-gray-500">Golden Retriever • 3 yrs</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#9c5930] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>

          {/* Pet 2 */}
          <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shadow-inner">
                <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200&h=200" alt="Mittens" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">Mittens</h4>
                <p className="text-xs text-gray-500">Maine Coon • 1 yr</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#9c5930] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>

        </div>
      </div>

      {/* Bottom Section: Recent Activity */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden pb-4">
        
        <div className="p-6 pb-2">
          <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
        </div>
        
        <div className="flex flex-col">
          
          {/* Activity 1 */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-[#f4a261] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Purchased Premium Dog Food</p>
                <p className="text-xs text-gray-500">Marketplace</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-gray-600">Oct 24</p>
              <p className="text-xs text-gray-400 font-medium">2023</p>
            </div>
          </div>

          {/* Activity 2 */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Reported Stray Dog</p>
                <p className="text-xs text-gray-500">Rescue Reporting</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-gray-600">Oct 15</p>
              <p className="text-xs text-gray-400 font-medium">2023</p>
            </div>
          </div>

          {/* Activity 3 */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Booked Vet Appointment</p>
                <p className="text-xs text-gray-500">City Paws Clinic</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-gray-600">Sep 28</p>
              <p className="text-xs text-gray-400 font-medium">2023</p>
            </div>
          </div>

        </div>
        
        <div className="mt-4 flex justify-center pb-2">
          <button className="text-[#9c5930] font-bold text-sm hover:underline">
            View Full History
          </button>
        </div>

      </div>

    </div>
  );
}
