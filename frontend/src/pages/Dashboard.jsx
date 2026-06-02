import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [34.1495, 73.2182]; // Abbottabad, Pakistan

const getRescueIcon = () => new L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="background-color: #dc2626; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 2px solid white;">
        <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/></svg>
      </div>
      <div style="width: 8px; height: 8px; background-color: #dc2626; border-radius: 50%; margin-top: 4px;"></div>
    </div>
  `,
  iconSize: [40, 52],
  iconAnchor: [20, 52]
});

const getListingIcon = () => new L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="background-color: #92400E; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 2px solid white;">
        <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
      </div>
      <div style="width: 8px; height: 8px; background-color: #92400E; border-radius: 50%; margin-top: 4px;"></div>
    </div>
  `,
  iconSize: [40, 52],
  iconAnchor: [20, 52]
});

const getHomeIcon = () => new L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="background-color: #1f2937; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 2px solid white;">
        <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
      </div>
      <div style="width: 8px; height: 8px; background-color: #1f2937; border-radius: 50%; margin-top: 4px;"></div>
    </div>
  `,
  iconSize: [40, 52],
  iconAnchor: [20, 52]
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    activeListings: 0,
    rescuedNearby: 0,
    lostPets: 0
  });
  
  const [activityFeed, setActivityFeed] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem('kitpup_user');
        let token = '';
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token || ''; 
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [
          activePetsRes,
          rescuedRes,
          lostPetsRes,
          recentReportsRes,
          recentLostPetsRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/pets?status=active', config),
          axios.get('http://localhost:5000/api/v1/reports?nearby=true', config),
          axios.get('http://localhost:5000/api/v1/pets?status=lost', config),
          axios.get('http://localhost:5000/api/v1/reports?limit=10', config),
          axios.get('http://localhost:5000/api/v1/pets?status=lost&limit=5', config)
        ]);

        setStats({
          activeListings: activePetsRes.data.count || activePetsRes.data.data?.length || 0,
          rescuedNearby: rescuedRes.data.count || rescuedRes.data.data?.length || 0,
          lostPets: lostPetsRes.data.count || lostPetsRes.data.data?.length || 0
        });

        // Merge and sort activity feed
        const reports = (recentReportsRes.data.data || []).map(r => ({
          ...r,
          feedType: 'report',
          dateObj: new Date(r.createdAt)
        }));
        
        const lostPets = (recentLostPetsRes.data.data || []).map(p => ({
          ...p,
          feedType: 'pet',
          dateObj: new Date(p.createdAt)
        }));

        const merged = [...reports, ...lostPets]
          .sort((a, b) => b.dateObj - a.dateObj)
          .slice(0, 3); // Take top 3 for feed (4th is hardcoded calendar)

        setActivityFeed(merged);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
        setError('Could not load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (isNaN(seconds)) return "A while ago";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const getActivityDetails = (item) => {
    if (item.feedType === 'report') {
      if (item.type === 'rescue') {
        return {
          icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>,
          bgClass: 'bg-green-500',
          textClass: 'text-gray-800',
          title: <span><span className="font-bold">{item.petType || 'Pet'}</span> was rescued!</span>,
          subtitle: `${formatTimeAgo(item.dateObj)} • Rescue Report`,
          route: '/rescue-report',
          wrapperClass: 'hover:bg-gray-50 transition-colors'
        };
      } else {
        return {
          icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>,
          bgClass: 'bg-red-600',
          textClass: 'text-red-900',
          title: <span><span className="font-bold">Alert:</span> Missing {item.petType || 'pet'} reported in your area.</span>,
          subtitle: `${formatTimeAgo(item.dateObj)} • ${item.location || '0.5 miles away'}`,
          route: '/rescue-report',
          wrapperClass: 'bg-red-50 border-red-100'
        };
      }
    } else {
      // pet type
      if (item.status === 'lost') {
        return {
          icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>,
          bgClass: 'bg-red-600',
          textClass: 'text-red-900',
          title: <span><span className="font-bold">Alert:</span> {item.name || 'Pet'} is missing!</span>,
          subtitle: `${formatTimeAgo(item.dateObj)} • 0.5 miles away`,
          route: '/lost-found',
          wrapperClass: 'bg-red-50 border-red-100'
        };
      } else {
        return {
          icon: <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
          bgClass: 'bg-gray-100 border border-gray-200',
          textClass: 'text-gray-800',
          title: <span><span className="font-bold">{item.name || 'Pet supply'}</span> listed nearby.</span>,
          subtitle: `${formatTimeAgo(item.dateObj)} • Marketplace`,
          route: '/marketplace',
          wrapperClass: 'hover:bg-gray-50 transition-colors'
        };
      }
    }
  };

  return (
    <div className="space-y-8 p-2 md:p-4 text-left">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center shadow-sm" role="alert">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          <span className="block sm:inline font-medium">{error}</span>
        </div>
      )}

      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Here's what's happening in your pet community today.</p>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Active Listings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-brand-orange" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Listings</p>
            {loading ? (
              <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-800">{stats.activeListings}</p>
            )}
          </div>
        </div>

        {/* Card 2: Rescued Nearby */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              <path d="M15 9l-3 3-1.5-1.5"></path>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rescued Nearby</p>
            {loading ? (
              <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-800">{stats.rescuedNearby}</p>
            )}
          </div>
        </div>

        {/* Card 3: Lost Pet Alerts */}
        <div className="bg-red-100 rounded-2xl p-6 shadow-sm border border-red-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Lost Pet Alerts</p>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-9 w-12 bg-red-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-red-600">{stats.lostPets}</p>
              )}
              <span className="text-xs font-semibold text-red-600">↑ Action needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Community Map (Left Side, Span 2) */}
        <div className="lg:col-span-2 bg-[#f0ede6] rounded-3xl overflow-hidden relative min-h-[400px] shadow-sm flex flex-col">
          
          <MapContainer 
            center={DEFAULT_CENTER} 
            zoom={13} 
            scrollWheelZoom={true} 
            zoomControl={true}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <Marker position={[34.1561, 73.2215]} icon={getRescueIcon()}>
              <Popup>
                <div className="font-bold text-red-600">Missing Golden Retriever</div>
                <div className="text-xs">Last seen near Mansehra Road.</div>
              </Popup>
            </Marker>

            <Marker position={[34.1448, 73.2123]} icon={getListingIcon()}>
              <Popup>
                <div className="font-bold text-[#92400E]">Free Dog Bed</div>
                <div className="text-xs">Available for pickup near Supply Bazar.</div>
              </Popup>
            </Marker>

            <Marker position={DEFAULT_CENTER} icon={getHomeIcon()}>
              <Popup>
                <div className="font-bold">Your Location</div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Map Header Overlay */}
          <div className="relative z-10 p-6 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm flex items-center justify-between pointer-events-auto max-w-sm">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Community Map</h3>
                <p className="text-xs text-gray-500 font-medium">Showing active alerts and vets nearby.</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar (Right Side) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
          
          <div className="flex-1 space-y-4">
            
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : activityFeed.length > 0 ? (
              activityFeed.map((item, index) => {
                const details = getActivityDetails(item);
                return (
                  <div 
                    key={index} 
                    onClick={() => navigate(details.route)}
                    className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer ${details.wrapperClass} border ${details.wrapperClass.includes('border-') ? '' : 'border-transparent'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${details.bgClass}`}>
                      {details.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${details.textClass}`}>{details.title}</p>
                      <p className={`text-xs mt-1 ${details.wrapperClass.includes('bg-red-50') ? 'text-red-600/80' : 'text-gray-500'}`}>
                        {details.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 text-sm py-4">No recent activity found.</div>
            )}

            {/* Static upcoming vet appointment to match prompt item #4 */}
            {!loading && (
              <div 
                onClick={() => navigate('/vetlocator')}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 mt-1">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Upcoming vet appointment for Luna.</p>
                  <p className="text-xs text-gray-500 mt-1">Tomorrow at 10:00 AM</p>
                </div>
              </div>
            )}

          </div>

          <button className="w-full mt-6 py-3 px-4 rounded-xl border-2 border-brand-orange text-brand-orange font-bold hover:bg-orange-50 transition-colors">
            View All Activity
          </button>
        </div>

      </div>
    </div>
  );
}
