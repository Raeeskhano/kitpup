import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';

const TopBar = ({ title, subtitle }) => {
  const userStr = localStorage.getItem('kitpup_user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const [hasNotifications, setHasNotifications] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null);

  useEffect(() => {
    const fetchLatestAlert = async () => {
      try {
        const storedUser = localStorage.getItem('kitpup_user');
        const token = storedUser ? JSON.parse(storedUser).token : '';
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [reportRes, petRes] = await Promise.all([
          axios.get('/api/v1/reports?limit=1', config),
          axios.get('/api/v1/pets?status=lost&limit=1', config)
        ]);

        const latestReport = reportRes.data.data?.[0];
        const latestPet = petRes.data.data?.[0];
        
        let latest = null;
        if (latestReport && latestPet) {
          latest = new Date(latestReport.createdAt) > new Date(latestPet.createdAt) ? latestReport : latestPet;
        } else {
          latest = latestReport || latestPet;
        }
        
        if (latest) {
          const lastViewed = localStorage.getItem('last_viewed_notification');
          if (!lastViewed || new Date(latest.createdAt) > new Date(lastViewed)) {
            setHasNotifications(true);
            setLatestAlert(latest);
          }
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    
    fetchLatestAlert();
    const interval = setInterval(fetchLatestAlert, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    if (latestAlert) {
      localStorage.setItem('last_viewed_notification', new Date().toISOString());
      setHasNotifications(false);
      const isReport = !!latestAlert.animalType;
      const typeStr = isReport ? 'Rescue Report' : 'Lost Pet Alert';
      const animalStr = latestAlert.animalType || latestAlert.species || 'Animal';
      alert(`New ${typeStr}: ${animalStr} near ${latestAlert.location || 'Unknown'}\n\nDescription: ${latestAlert.description}`);
    } else {
      alert("No new notifications.");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBellClick}
          className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
        >
          <Bell size={20} />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
        
        {user && (
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-orange-600 transition-colors shadow-sm">
            {user.initials || user.name?.substring(0, 2).toUpperCase() || 'KP'}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
