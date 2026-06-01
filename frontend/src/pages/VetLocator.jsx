import React, { useState } from 'react';

const mockVets = [
  { 
    id: 1, 
    name: 'Paws & Claws Vet', 
    rating: '4.9', 
    distance: '1.2 miles away', 
    address: '123 Bark Avenue', 
    openNow: true 
  },
  { 
    id: 2, 
    name: 'City Pet Hospital', 
    rating: '4.7', 
    distance: '2.5 miles away', 
    address: '456 Meow Lane', 
    openNow: true 
  },
];

export default function VetLocator() {
  const [filter, setFilter] = useState('Open Now');

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-80px)] lg:-mx-8 lg:-mb-8 overflow-hidden text-left bg-white rounded-3xl lg:rounded-none">
      
      {/* Left Sidebar */}
      <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col h-[50vh] lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-gray-100 z-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] order-2 lg:order-1">
        
        {/* Sidebar Header */}
        <div className="p-4 md:p-6 pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Nearby Clinics</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('Open Now')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === 'Open Now' ? 'bg-[#f4a261] text-white shadow-sm' : 'bg-[#fdfaf5] text-gray-600 border border-[#f4e8db] hover:bg-[#f4e8db]'}`}
            >
              Open Now
            </button>
            <button 
              onClick={() => setFilter('Emergency')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === 'Emergency' ? 'bg-[#f4a261] text-white shadow-sm' : 'bg-[#fdfaf5] text-gray-600 border border-[#f4e8db] hover:bg-[#f4e8db]'}`}
            >
              Emergency
            </button>
            <button 
              onClick={() => setFilter('Top Rated')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === 'Top Rated' ? 'bg-[#f4a261] text-white shadow-sm' : 'bg-[#fdfaf5] text-gray-600 border border-[#f4e8db] hover:bg-[#f4e8db]'}`}
            >
              Top Rated
            </button>
          </div>
        </div>
        
        {/* Clinic List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 space-y-4 scrollbar-hide">
          {mockVets.map(vet => (
            <div key={vet.id} className="p-4 md:p-5 border border-[#f4e8db] bg-[#fdfaf5]/30 rounded-xl hover:shadow-md transition-shadow cursor-pointer group">
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-base md:text-lg text-[#9c5930] group-hover:text-[#804622] transition-colors">{vet.name}</h3>
                <div className="flex items-center text-[#9c5930] text-sm font-bold">
                  ★ {vet.rating}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mb-4 font-medium">
                {vet.distance} • {vet.address}
              </p>
              
              <div className="flex items-center justify-between">
                {vet.openNow ? (
                  <span className="text-[10px] font-bold text-gray-700 bg-gray-200/60 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-[#f4a261] rounded-full"></span> 
                    Open Now
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Closed
                  </span>
                )}
                
                <button className="text-[#9c5930] text-xs font-bold flex items-center gap-1.5 hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                  Directions
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Right Map Area */}
      <div className="w-full lg:flex-1 bg-[#c8d6c4] relative h-[50vh] lg:h-full overflow-hidden flex items-center justify-center lg:p-8 order-1 lg:order-2 rounded-t-3xl lg:rounded-none">
        
        {/* Responsive Map Container: Full width on mobile, iPhone Frame on Desktop */}
        <div className="relative w-full h-full lg:w-auto lg:h-[90%] lg:max-h-[650px] lg:aspect-[320/650] bg-[#e8eedd] lg:rounded-[48px] lg:border-[10px] lg:border-gray-600 lg:shadow-2xl overflow-hidden flex-shrink-0">
          
          {/* iPhone Notch - Desktop Only */}
          <div className="hidden lg:flex absolute top-0 inset-x-0 h-7 bg-gray-600 rounded-b-3xl w-40 mx-auto z-50 items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
            <div className="w-10 h-1.5 rounded-full bg-gray-800"></div>
          </div>
          
          {/* iPhone Home Indicator - Desktop Only */}
          <div className="hidden lg:block absolute bottom-2 inset-x-0 h-1.5 bg-gray-400 w-32 mx-auto rounded-full z-50"></div>

          {/* Map Content inside container */}
          <div className="absolute inset-0 w-full h-full">
            {/* Faux Map Pattern (Streets) */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L100 90V100H90L0 10V0H10zM50 0L100 50V60H90L40 10V0H50zM90 0L100 10V20H90L80 10V0H90zM0 50L50 100H40L0 60V50zM0 90L10 100H0V90z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundSize: '150px 150px'
            }}></div>

            {/* Faux Map Blocks */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[20%] left-[30%] w-24 h-16 bg-[#a3c2b8] opacity-40 rounded-sm transform rotate-45"></div>
              <div className="absolute bottom-[30%] right-[20%] w-32 h-24 bg-[#a3c2b8] opacity-40 rounded-sm transform -rotate-12"></div>
              <div className="absolute top-[40%] right-[40%] w-16 h-24 bg-[#a3c2b8] opacity-40 rounded-sm transform rotate-6"></div>
              <div className="absolute bottom-[10%] left-[10%] w-48 h-12 bg-[#a3c2b8] opacity-40 rounded-sm transform rotate-45"></div>
            </div>

            {/* Map Pins */}
            <div className="absolute inset-0 pointer-events-none">
              
              <div className="absolute top-[35%] left-[35%] flex flex-col items-center transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform cursor-pointer pointer-events-auto">
                <div className="w-10 h-10 bg-[#f4a261] rounded-full rounded-br-none transform rotate-45 flex items-center justify-center shadow-md">
                  <div className="w-3.5 h-3.5 bg-white rounded-full transform -rotate-45"></div>
                </div>
              </div>

              <div className="absolute top-[60%] left-[45%] flex flex-col items-center transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform cursor-pointer pointer-events-auto">
                <div className="w-10 h-10 bg-[#f4a261] rounded-full rounded-br-none transform rotate-45 flex items-center justify-center shadow-md">
                  <div className="w-3.5 h-3.5 bg-white rounded-full transform -rotate-45"></div>
                </div>
              </div>

              <div className="absolute top-[42%] left-[65%] flex flex-col items-center transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform cursor-pointer pointer-events-auto">
                <div className="w-10 h-10 bg-[#f4a261] rounded-full rounded-br-none transform rotate-45 flex items-center justify-center shadow-md">
                  <div className="w-3.5 h-3.5 bg-white rounded-full transform -rotate-45"></div>
                </div>
              </div>

              <div className="absolute top-[52%] left-[25%] flex flex-col items-center transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform cursor-pointer pointer-events-auto">
                <div className="w-10 h-10 bg-[#f4a261] rounded-full rounded-br-none transform rotate-45 flex items-center justify-center shadow-md">
                  <div className="w-3.5 h-3.5 bg-white rounded-full transform -rotate-45"></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 flex flex-col gap-2 z-20">
          <button className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-gray-900 transition-colors font-bold text-lg lg:text-xl">
            +
          </button>
          <button className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-gray-900 transition-colors font-bold text-lg lg:text-xl leading-none">
            -
          </button>
          <button className="w-8 h-8 lg:w-10 lg:h-10 bg-[#9c5930] rounded-full flex items-center justify-center shadow-md text-white hover:bg-[#804622] transition-colors mt-2">
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </button>
        </div>

      </div>
    </div>
  );
}
