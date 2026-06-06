import React, { useState, useEffect } from 'react';
import axios from 'axios';

function getRelativeTime(dateStr) {
  if (!dateStr) return 'Unknown time';
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm z-[100] animate-fade-in-up flex items-center gap-2">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      {message}
    </div>
  );
};

export default function LostFound() {
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found'
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [filters, setFilters] = useState({ species: 'All', time: 'All time', distance: 'Any' });
  const [formData, setFormData] = useState({
    name: '', species: 'Dog', breed: '', location: '', lastSeenDate: '', description: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailPet, setDetailPet] = useState(null);

  const getToken = () => {
    const stored = localStorage.getItem('kitpup_user');
    return stored ? JSON.parse(stored).token : '';
  };

  const fetchPets = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    try {
      let url = `http://localhost:5000/api/v1/pets?status=${activeTab}&page=${pageNum}&limit=9`;
      if (filters.species !== 'All') url += `&species=${filters.species}`;
      
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      const newPets = res.data.data || [];
      
      if (reset) {
        setPets(newPets);
      } else {
        setPets(prev => [...prev, ...newPets]);
      }
      setHasMore(newPets.length === 9);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('status', 'lost');
      if (photoFile) data.append('photos', photoFile);

      await axios.post('http://localhost:5000/api/v1/pets', data, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsReportOpen(false);
      setFormData({ name: '', species: 'Dog', breed: '', location: '', lastSeenDate: '', description: '' });
      setPhotoFile(null);
      setToastMsg('Alert posted! Community has been notified.');
      
      if (activeTab === 'lost') {
        fetchPets(1, true);
      } else {
        setActiveTab('lost');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to report pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotifyNearby = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/v1/pets/${id}/notify`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setToastMsg('Nearby users have been notified!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkFound = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/v1/pets/${id}`, { status: 'found' }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setToastMsg('Pet marked as found! 🐾');
      setPets(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkReunited = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/v1/pets/${id}`, { status: 'reunited' }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setToastMsg('Pet marked as reunited! 🎉');
      setPets(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };


  const getCurrentUserId = () => {
    const stored = localStorage.getItem('kitpup_user');
    return stored ? JSON.parse(stored).id : null;
  };
  const currentUserId = getCurrentUserId();

  return (
    <div className="space-y-8 max-w-[1100px] mx-auto text-left relative min-h-screen pb-10">
      
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Lost & Found Center</h1>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            Help reunite pets with their loving families. Browse current alerts or issue a new one immediately.
          </p>
        </div>
        <button 
          onClick={() => setIsReportOpen(true)}
          className="bg-[#b92b27] text-white px-6 py-3 rounded-full font-bold shadow-sm flex items-center gap-2 hover:bg-[#a02522] transition-colors flex-shrink-0"
        >
          <span className="text-lg">🐾</span> Report a Lost Pet
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
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm pb-3 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col h-[350px] animate-pulse">
              <div className="w-full h-[200px] bg-gray-200 rounded-2xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-auto"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-3xl mb-4">🐾</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No active alerts</h3>
          <p className="text-gray-500 font-medium">No active alerts in your area. 🎉</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => (
              <div 
                key={pet._id} 
                onClick={() => { setDetailPet(pet); setIsDetailModalOpen(true); }}
                className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow cursor-pointer"
              >
                
                {/* Image Area */}
                <div className="relative h-[200px] w-full rounded-2xl overflow-hidden mb-4 bg-gray-100 flex-shrink-0">
                  <img 
                    src={pet.photos && pet.photos[0] ? (pet.photos[0].startsWith('/uploads/') ? `http://localhost:5000${pet.photos[0]}` : pet.photos[0]) : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400&h=500'} 
                    alt={pet.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* Status Badge (Top Right) */}
                  <div className={`absolute top-3 right-3 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 ${activeTab === 'lost' ? 'bg-[#b92b27]' : 'bg-green-600'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    {pet.status.toUpperCase()}
                  </div>

                  {/* Time Badge (Bottom Left) */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 border border-white">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {getRelativeTime(pet.lastSeenDate || pet.createdAt)}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col px-2">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                    <span className="bg-[#fdfaf5] text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#f4e8db] truncate max-w-[100px]">{pet.breed}</span>
                  </div>
                  
                  <div className="flex items-start text-xs text-gray-500 mb-5 mt-1">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="truncate">{pet.location || 'Location unknown'}</span>
                  </div>

                  {/* Action Button */}
                  {activeTab === 'lost' ? (
                    <div className="w-full mt-auto flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleNotifyNearby(pet._id); }}
                        className="flex-1 bg-white border-2 border-[#f97316] text-[#f97316] hover:bg-orange-50 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        Notify
                      </button>
                      {(pet.owner && pet.owner._id === currentUserId) ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMarkFound(pet._id); }}
                          className="flex-1 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                          Found
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedPet(pet); setIsContactModalOpen(true); }}
                          className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          Contact
                        </button>
                      )}
                    </div>
                  ) : (
                    (pet.owner && pet.owner._id === currentUserId) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkReunited(pet._id); }}
                        className="w-full mt-auto bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        Mark as Reunited
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-8 flex justify-center pb-8">
              <button 
                onClick={() => fetchPets(page + 1)}
                className="px-8 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
              >
                Load More Alerts
              </button>
            </div>
          )}
        </>
      )}

      {/* --- MODALS & SLIDE-INS --- */}

      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-xl relative my-8">
            <button 
              onClick={() => setIsReportOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-[#b92b27]">🐾</span> Report Lost Pet
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Issue an alert to the KitPup community instantly.</p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pet Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316] outline-none" placeholder="E.g. Max" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Species</label>
                  <select value={formData.species} onChange={e => setFormData({...formData, species: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316] outline-none bg-white">
                    <option>Dog</option><option>Cat</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Breed</label>
                  <input required type="text" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316] outline-none" placeholder="E.g. Golden Retriever" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Last Seen Location</label>
                <div className="relative">
                  <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316] outline-none" placeholder="Street name, neighborhood, or landmark" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Last Seen Date & Time</label>
                <input required type="datetime-local" value={formData.lastSeenDate} onChange={e => setFormData({...formData, lastSeenDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316] outline-none bg-white text-gray-700" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316] outline-none resize-none" placeholder="Distinctive markings, collar color, behavior..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Upload Photo</label>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#fffaf5] file:text-[#f97316] hover:file:bg-[#faeedd] transition-colors border border-gray-200 rounded-xl p-1" />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 bg-[#b92b27] hover:bg-[#a02522] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg shadow-sm"
              >
                {isSubmitting ? 'Posting Alert...' : 'Post Lost Pet Alert'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl relative my-8">
            <button 
              onClick={() => { setIsContactModalOpen(false); setSelectedPet(null); }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-blue-600">📞</span> Contact Owner
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Reach out directly to the person who listed {selectedPet.name}.</p>
            </div>

            <div className="space-y-4">
              {selectedPet.owner?.name && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {selectedPet.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Name</div>
                    <div className="text-gray-800 font-bold">{selectedPet.owner.name}</div>
                  </div>
                </div>
              )}
              
              {selectedPet.owner?.email && (
                <a href={`mailto:${selectedPet.owner.email}`} className="block p-4 bg-gray-50 hover:bg-blue-50 transition-colors rounded-xl border border-gray-100 flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 group-hover:border-blue-200 flex items-center justify-center text-gray-500 group-hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Email</div>
                    <div className="text-gray-800 font-bold">{selectedPet.owner.email}</div>
                  </div>
                </a>
              )}

              {selectedPet.owner?.contactNumber && (
                <a href={`tel:${selectedPet.owner.contactNumber}`} className="block p-4 bg-gray-50 hover:bg-green-50 transition-colors rounded-xl border border-gray-100 flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 group-hover:border-green-200 flex items-center justify-center text-gray-500 group-hover:text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Phone</div>
                    <div className="text-gray-800 font-bold">{selectedPet.owner.contactNumber}</div>
                  </div>
                </a>
              )}

              {selectedPet.owner?.whatsappNumber && (
                <a href={`https://wa.me/${selectedPet.owner.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="block p-4 bg-gray-50 hover:bg-green-50 transition-colors rounded-xl border border-gray-100 flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 group-hover:border-green-200 flex items-center justify-center text-gray-500 group-hover:text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">WhatsApp</div>
                    <div className="text-gray-800 font-bold">{selectedPet.owner.whatsappNumber}</div>
                  </div>
                </a>
              )}

              {(!selectedPet.owner?.email && !selectedPet.owner?.contactNumber && !selectedPet.owner?.whatsappNumber) && (
                <div className="p-4 bg-orange-50 text-orange-800 rounded-xl font-medium text-sm text-center">
                  This user hasn't provided any contact information.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pet Detail Modal */}
      {isDetailModalOpen && detailPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm overflow-y-auto" onClick={() => { setIsDetailModalOpen(false); setDetailPet(null); }}>
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-xl relative my-auto flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Close Button (Absolute on Mobile, inside content on Desktop) */}
            <button 
              onClick={() => { setIsDetailModalOpen(false); setDetailPet(null); }}
              className="absolute top-4 right-4 z-10 text-gray-800 bg-white/80 hover:bg-white p-2.5 rounded-full backdrop-blur-sm transition-colors shadow-sm md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Left: Image Area */}
            <div className="relative h-[300px] md:h-auto md:w-1/2 bg-gray-100 flex-shrink-0 md:min-h-[500px]">
              <img 
                src={detailPet.photos && detailPet.photos[0] ? (detailPet.photos[0].startsWith('/uploads/') ? `http://localhost:5000${detailPet.photos[0]}` : detailPet.photos[0]) : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400&h=500'} 
                alt={detailPet.name} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              
              <div className={`absolute top-4 left-4 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2 ${detailPet.status === 'lost' ? 'bg-[#b92b27]' : 'bg-green-600'}`}>
                <div className="w-2 h-2 rounded-full bg-white"></div>
                {detailPet.status.toUpperCase()}
              </div>
            </div>

            {/* Right: Content Area */}
            <div className="p-6 md:p-10 md:w-1/2 flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-y-auto bg-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black text-gray-800 mb-2">{detailPet.name}</h2>
                  <div className="flex items-center text-gray-500 font-bold text-sm">
                    <svg className="w-5 h-5 mr-1.5 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {detailPet.location || 'Location unknown'}
                  </div>
                </div>
                
                {/* Desktop Close Button */}
                <button 
                  onClick={() => { setIsDetailModalOpen(false); setDetailPet(null); }}
                  className="hidden md:flex text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-3 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-orange-500 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Seen</div>
                  <div className="font-bold text-gray-800">{getRelativeTime(detailPet.lastSeenDate || detailPet.createdAt)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Species</div>
                  <div className="font-bold text-gray-800 text-lg">{detailPet.species || 'Unknown'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Breed</div>
                  <div className="font-bold text-gray-800 text-lg">{detailPet.breed || 'Unknown'}</div>
                </div>
                {detailPet.gender && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Gender</div>
                    <div className="font-bold text-gray-800 text-lg">{detailPet.gender}</div>
                  </div>
                )}
                {detailPet.age && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Age</div>
                    <div className="font-bold text-gray-800 text-lg">{detailPet.age}</div>
                  </div>
                )}
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {detailPet.description || 'No additional description provided by the lister.'}
                </p>
              </div>
              
              <div className="pt-6 border-t border-gray-100 mt-auto">
                <button 
                  onClick={() => { setIsDetailModalOpen(false); setDetailPet(null); }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition-colors text-lg"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Slide-in Panel */}
      {isFilterOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40" onClick={() => setIsFilterOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform border-l border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm border border-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              {/* Species */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Species</h3>
                <div className="flex flex-col gap-2">
                  {['All', 'Dog', 'Cat'].map(sp => (
                    <label key={sp} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="radio" name="species" value={sp} checked={filters.species === sp} onChange={() => setFilters({...filters, species: sp})} className="w-5 h-5 text-[#f97316] focus:ring-[#f97316] border-gray-300" />
                      <span className="font-bold text-gray-700">{sp}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Time Posted</h3>
                <select value={filters.time} onChange={e => setFilters({...filters, time: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316] outline-none bg-white font-bold text-gray-700">
                  <option>All time</option>
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                </select>
              </div>

              {/* Distance */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Distance</h3>
                <select value={filters.distance} onChange={e => setFilters({...filters, distance: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316] outline-none bg-white font-bold text-gray-700">
                  <option>Any</option>
                  <option>Within 1 mile</option>
                  <option>Within 5 miles</option>
                  <option>Within 10 miles</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => setFilters({ species: 'All', time: 'All time', distance: 'Any' })}
                className="flex-1 py-3 font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 font-bold text-white bg-[#f97316] rounded-xl hover:bg-[#e76f51] transition-colors shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
