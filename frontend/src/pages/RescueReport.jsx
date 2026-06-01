import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function RescueReport() {
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [animalType, setAnimalType] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const [recentReports, setRecentReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const fileInputRef = useRef(null);

  const getToken = () => {
    const storedUser = localStorage.getItem('kitpup_user');
    if (storedUser) {
      return JSON.parse(storedUser).token || '';
    }
    return '';
  };

  const fetchRecentReports = async () => {
    try {
      setLoadingReports(true);
      const res = await axios.get('http://localhost:5000/api/v1/reports?nearby=true&limit=3', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setRecentReports(res.data.data);
    } catch (err) {
      console.error('Failed to load recent reports', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setPhotos(prev => [...prev, ...files]);
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPhotoUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      setPhotos(prev => [...prev, ...files]);
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPhotoUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocation('Locating...');
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Reverse geocoding using Nominatim
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (res.data && res.data.display_name) {
          // Simplify address slightly
          const parts = res.data.display_name.split(',');
          setLocation(parts.slice(0, 3).join(', '));
        } else {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (err) {
        console.error('Failed to reverse geocode', err);
        setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      }
    }, () => {
      setLocation('');
      alert('Unable to retrieve your location');
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrorMessage('');

    if (photos.length === 0) {
      setSubmitStatus('error');
      setErrorMessage('At least one photo is required to submit a report.');
      return;
    }
    
    if (!location) {
      setSubmitStatus('error');
      setErrorMessage('Location is required.');
      return;
    }
    
    if (!animalType || !urgencyLevel) {
      setSubmitStatus('error');
      setErrorMessage('Animal type and urgency level are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', 'rescue'); // from Report.js schema
      formData.append('animalType', animalType);
      formData.append('urgencyLevel', urgencyLevel);
      formData.append('location', location);
      formData.append('description', description);
      
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      await axios.post('http://localhost:5000/api/v1/reports', formData, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSubmitStatus('success');
      setPhotos([]);
      setPhotoUrls([]);
      setAnimalType('');
      setUrgencyLevel('');
      setLocation('');
      setDescription('');
      
      fetchRecentReports(); // Refresh sidebar

      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
      
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
      setErrorMessage(err.response?.data?.error || 'An error occurred while submitting the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'investigation_in_progress':
        return { text: 'Investigation in progress', color: 'bg-orange-100 text-brand-orange border-orange-200' };
      case 'rescued_safely':
        return { text: 'Rescued Safely', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'report_received':
      default:
        return { text: 'Report Received', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.round(diffInMs / 60000);
    
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.round(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.round(diffInHours / 24)}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-12 text-left">
      
      {/* Left Column - Main Form */}
      <div className="flex-1 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Submit a Rescue Report</h2>
        <p className="text-gray-500 mb-8">Provide details to help local rescue teams locate and assist the animal in need.</p>

        {submitStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
              <p className="font-bold text-green-800">Report submitted!</p>
              <p className="text-green-600 text-sm">Local rescue teams have been notified.</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <p className="font-bold text-red-800">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" disabled={isSubmitting}>
          
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">Photo Evidence <span className="text-red-500">*</span></label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-brand-orange bg-orange-50/30 hover:bg-orange-50/50 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]"
            >
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                disabled={isSubmitting}
              />
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-brand-orange mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"></path></svg>
              </div>
              <p className="font-bold text-gray-700 mb-1">
                <span className="text-brand-orange">Upload Photos</span>
              </p>
              <p className="text-sm text-gray-500">Drag & drop or click to browse. Clear photos help immensely.</p>
            </div>

            {/* Thumbnail Previews */}
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm group">
                    <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-800">Approximate Location <span className="text-red-500">*</span></label>
              <button 
                type="button" 
                onClick={handleUseCurrentLocation}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1.5 rounded-full text-xs font-bold hover:bg-orange-100 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                Use Current
              </button>
            </div>
            
            <div className="relative mb-3">
              <input 
                type="text" 
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter an address or landmark..."
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange pl-10"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>

            <div className="w-full h-[180px] bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200 overflow-hidden relative">
              <img src="https://api.maptiler.com/maps/basic-v2/static/-95,38,3/800x400.png?key=YtHwVl08BqQ6uIuG2LhL" alt="Map placeholder" className="w-full h-full object-cover opacity-50 grayscale" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <svg className="w-8 h-8 text-brand-orange mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                {location ? <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">{location}</span> : <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">Location Preview</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Animal Type <span className="text-red-500">*</span></label>
              <select 
                required
                value={animalType}
                onChange={e => setAnimalType(e.target.value)}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none bg-white"
              >
                <option value="" disabled>Select Type...</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Urgency Level <span className="text-red-500">*</span></label>
              <select 
                required
                value={urgencyLevel}
                onChange={e => setUrgencyLevel(e.target.value)}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none bg-white"
              >
                <option value="" disabled>Select Urgency...</option>
                <option value="High - Immediate Danger">High - Immediate Danger</option>
                <option value="Medium - Needs Attention">Medium - Needs Attention</option>
                <option value="Low - Stable">Low - Stable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">Description & Condition</label>
            <textarea 
              rows="4"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide any identifying features, apparent injuries, or behavioral notes..."
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#92400E] text-white font-bold py-4 rounded-xl shadow-md hover:bg-[#78350f] transition-colors mt-4 flex items-center justify-center gap-2 text-lg disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Submitting...
              </>
            ) : (
              <>
                ⚠ Submit Report
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Column - Recent Activity */}
      <div className="w-full lg:w-[350px] flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity in Your Area</h3>
        
        <div className="space-y-4 mb-6">
          {loadingReports ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex gap-4">
                <div className="w-[60px] h-[60px] bg-gray-200 rounded-xl shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : recentReports.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-gray-500">No recent reports in your area.</p>
            </div>
          ) : (
            recentReports.map(report => {
              const statusDisplay = getStatusDisplay(report.status);
              return (
                <div key={report._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <div className="w-[60px] h-[60px] bg-gray-100 rounded-xl shrink-0 overflow-hidden">
                    {report.photos && report.photos.length > 0 ? (
                      <img src={`http://localhost:5000${report.photos[0]}`} alt="Report" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-800 text-sm truncate pr-2">{report.animalType}</h4>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{timeAgo(report.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{report.description}</p>
                    <div className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${statusDisplay.color}`}>
                      {statusDisplay.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button className="w-full text-center text-brand-orange font-bold text-sm hover:underline py-2">
          View All Area Reports
        </button>
      </div>
      
    </div>
  );
}
