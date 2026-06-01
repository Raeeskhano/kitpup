import React, { useState } from 'react';

const mockListings = [
  { 
    id: 1, 
    name: 'Barnaby', 
    breed: 'Beagle', 
    location: 'Last seen near Maple Park, Westsi...', 
    time: '2 hours ago', 
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600&h=600',
    status: 'LOST'
  },
  { 
    id: 2, 
    name: 'Marmalade', 
    breed: 'Tabby Cat', 
    location: 'Elm Street & 4th Ave intersection', 
    time: '2 hours ago', 
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600&h=600',
    status: 'LOST'
  },
  { 
    id: 3, 
    name: 'Scout', 
    breed: 'Terrier Mix', 
    location: 'Downtown Promenade', 
    time: '1 day ago', 
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600&h=600',
    status: 'LOST'
  },
];

export default function LostFound() {
  const [activeTab, setActiveTab] = useState('lost');

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Lost & Found Center</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Help reunite pets with their loving families. Browse current alerts or issue a new one immediately.
          </p>
        </div>
        <button className="bg-[#b92b27] text-white px-6 py-3 rounded-full font-bold shadow-sm flex items-center gap-2 hover:bg-[#a02522] transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 11V5a2 2 0 012-2h12a2 2 0 012 2v6c0 1.1-.9 2-2 2h-2.586L12 16.414 8.586 13H6a2 2 0 01-2-2zM6 11h2.586L12 14.586 15.414 11H18V5H6v6z"/><path d="M11 7h2v3h-2V7zm0 4h2v2h-2v-2z"/></svg>
          Report a Lost Pet
        </button>
      </div>

      {/* Tabs & Filter */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('lost')}
            className={`pb-3 font-bold text-sm relative transition-colors ${activeTab === 'lost' ? 'text-[#9c5930]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Active Lost Alerts
            {activeTab === 'lost' && (
              <>
                <span className="absolute -top-1 -right-3 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9c5930] rounded-t-full"></span>
              </>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('found')}
            className={`pb-3 font-bold text-sm relative transition-colors ${activeTab === 'found' ? 'text-[#9c5930]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Recently Found
            {activeTab === 'found' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9c5930] rounded-t-full"></span>
            )}
          </button>
        </div>
        <button className="flex items-center gap-2 text-gray-500 font-bold text-sm pb-3 hover:text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockListings.map(pet => (
          <div key={pet.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow">
            
            {/* Image Area */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
              <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              
              {/* Lost Badge (Top Right) */}
              <div className="absolute top-3 right-3 bg-[#b92b27] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                {pet.status}
              </div>

              {/* Time Badge (Bottom Left) */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 border border-white">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {pet.time}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col px-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                <span className="bg-[#fdfaf5] text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#f4e8db]">{pet.breed}</span>
              </div>
              
              <div className="flex items-start text-xs text-gray-500 mb-5 mt-1">
                <svg className="w-4 h-4 mr-1 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="truncate">{pet.location}</span>
              </div>

              {/* Button */}
              <button className="w-full mt-auto bg-[#faeedd] text-[#9c5930] hover:bg-[#f4e8db] py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Notify Nearby
              </button>
            </div>
            
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="mt-8 flex justify-center pb-8">
        <button className="px-8 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm">
          Load More Alerts
        </button>
      </div>

    </div>
  );
}
