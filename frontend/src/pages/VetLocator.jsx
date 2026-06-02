import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MOCK_VETS = [
  { _id: "1", name: "Abbottabad Pet Clinic", address: "Mansehra Road, Abbottabad", distance: "1.2 km away", rating: 4.9, isOpen: true, isEmergency: false, lat: 34.1561, lng: 73.2215 },
  { _id: "2", name: "Hazara Animal Hospital", address: "Jinnahabad, Abbottabad", distance: "2.5 km away", rating: 4.7, isOpen: true, isEmergency: true, lat: 34.1683, lng: 73.2247 },
  { _id: "3", name: "City Vet Center", address: "Supply Bazar, Abbottabad", distance: "3.8 km away", rating: 4.5, isOpen: false, isEmergency: false, lat: 34.1448, lng: 73.2123 },
];

const DEFAULT_CENTER = [34.1495, 73.2182]; // Abbottabad, Pakistan

const getCustomIcon = (isSelected) => new L.divIcon({
  className: 'custom-vet-marker',
  html: `
    <div style="
      width: 40px; 
      height: 40px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg) ${isSelected ? 'scale(1.2)' : 'scale(1)'}; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
      background-color: ${isSelected ? '#e76f51' : '#f4a261'}; 
      transition: all 0.3s ease; 
      transform-origin: bottom left;
    ">
      <div style="width: 14px; height: 14px; background-color: white; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Component to handle map center changes
function MapUpdater({ selectedVet }) {
  const map = useMap();
  useEffect(() => {
    if (selectedVet && selectedVet.lat && selectedVet.lng) {
      map.flyTo([selectedVet.lat, selectedVet.lng], 14, { duration: 1.5 });
    }
  }, [selectedVet, map]);
  return null;
}

export default function VetLocator() {
  const [filter, setFilter] = useState('Open Now');
  const [vets, setVets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVetId, setSelectedVetId] = useState(null);

  useEffect(() => {
    const fetchVets = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('kitpup_user') ? JSON.parse(localStorage.getItem('kitpup_user')).token : null;
        let query = 'open';
        if (filter === 'Emergency') query = 'emergency';
        if (filter === 'Top Rated') query = 'top_rated';
        
        const res = await axios.get(`http://localhost:5000/api/v1/vets?filter=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data && res.data.data) {
          setVets(res.data.data);
        } else {
          throw new Error('Fallback to mock');
        }
      } catch (err) {
        let filteredMocks = [...MOCK_VETS];
        if (filter === 'Open Now') {
          filteredMocks = filteredMocks.filter(v => v.isOpen);
        } else if (filter === 'Emergency') {
          filteredMocks = filteredMocks.filter(v => v.isEmergency);
        } else if (filter === 'Top Rated') {
          filteredMocks = filteredMocks.sort((a, b) => b.rating - a.rating);
        }
        
        setTimeout(() => {
          setVets(filteredMocks);
          setIsLoading(false);
        }, 500);
        return;
      }
      setIsLoading(false);
    };

    fetchVets();
  }, [filter]);

  const selectedVetObj = vets.find(v => v._id === selectedVetId);

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-80px)] lg:-mx-8 lg:-mb-8 overflow-hidden text-left bg-white rounded-3xl lg:rounded-none">
      
      {/* Left Sidebar */}
      <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col h-[50vh] lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-gray-100 z-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] order-2 lg:order-1 relative">
        
        {/* Sidebar Header */}
        <div className="p-4 md:p-6 pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Nearby Clinics</h2>
          <div className="flex flex-wrap gap-2">
            {['Open Now', 'Emergency', 'Top Rated'].map(f => (
              <button 
                key={f}
                onClick={() => { setFilter(f); setSelectedVetId(null); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === f ? 'bg-[#f4a261] text-white shadow-sm' : 'bg-[#fdfaf5] text-gray-600 border border-[#f4e8db] hover:bg-[#f4e8db]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        {/* Clinic List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 space-y-4 scrollbar-hide">
          {isLoading ? (
            // Skeleton Loading
            [1, 2, 3].map(i => (
              <div key={i} className="p-4 md:p-5 border border-gray-100 bg-gray-50/50 rounded-xl animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))
          ) : vets.length === 0 ? (
            // Empty State
            <div className="text-center py-10">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <p className="text-gray-500 font-medium">No clinics found nearby.</p>
              <p className="text-sm text-gray-400 mt-1">Try a different filter.</p>
            </div>
          ) : (
            // Vets List
            vets.map(vet => (
              <div 
                key={vet._id} 
                onClick={() => setSelectedVetId(vet._id)}
                className={`p-4 md:p-5 border rounded-xl transition-all cursor-pointer group ${selectedVetId === vet._id ? 'border-[#f4a261] bg-[#fffaf5] shadow-md ring-1 ring-[#f4a261]' : 'border-[#f4e8db] bg-[#fdfaf5]/30 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-base md:text-lg transition-colors ${selectedVetId === vet._id ? 'text-[#e76f51]' : 'text-[#9c5930] group-hover:text-[#804622]'}`}>
                    {vet.name}
                  </h3>
                  <div className="flex items-center text-[#9c5930] text-sm font-bold">
                    ★ {vet.rating}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mb-4 font-medium">
                  {vet.distance} • {vet.address}
                </p>
                
                <div className="flex items-center justify-between">
                  {vet.isOpen ? (
                    <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> 
                      Open Now
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span> 
                      Closed
                    </span>
                  )}
                  
                  <a 
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(vet.address)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()} 
                    className="text-[#9c5930] text-xs font-bold flex items-center gap-1.5 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    Directions
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Map Area */}
      <div className="w-full lg:flex-1 relative h-[50vh] lg:h-full overflow-hidden order-1 lg:order-2 bg-[#f0ede6]">
        
        <MapContainer 
          center={DEFAULT_CENTER} 
          zoom={12} 
          scrollWheelZoom={true} 
          zoomControl={false} // We will use custom zoom controls if needed, but default is okay. Let's hide default to keep the UI clean.
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MapUpdater selectedVet={selectedVetObj} />

          {vets.map(vet => (
            <Marker 
              key={vet._id} 
              position={[vet.lat, vet.lng]}
              icon={getCustomIcon(selectedVetId === vet._id)}
              eventHandlers={{
                click: () => setSelectedVetId(vet._id),
              }}
            >
              <Popup className="custom-popup">
                <div className="font-sans">
                  <h3 className="font-bold text-[#9c5930]">{vet.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{vet.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

      </div>
    </div>
  );
}
