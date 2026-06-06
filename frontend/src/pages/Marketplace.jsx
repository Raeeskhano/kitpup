import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Marketplace() {
  const [species, setSpecies] = useState('Dog');
  const [search, setSearch] = useState('');
  const [breed, setBreed] = useState('Any Breed');
  const [location, setLocation] = useState('');
  const [feeRange, setFeeRange] = useState({ min: 0, max: 200000 });
  const [sort, setSort] = useState('newest');

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [favorites, setFavorites] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    name: '', species: 'Dog', breed: '', age: '', gender: 'Male', location: '', fee: 0, description: '', contactNumber: '', whatsappNumber: ''
  });
  const [postPhotos, setPostPhotos] = useState(null);
  const [postStatus, setPostStatus] = useState('');

  const [selectedPet, setSelectedPet] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('kitpup_user');
      let token = '';
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token || '';
      }

      let url = `/api/v1/pets?species=${species}&minFee=${feeRange.min}&maxFee=${feeRange.max}&sort=${sort}`;
      if (search) url += `&search=${search}`;
      if (breed !== 'Any Breed') url += `&breed=${breed}`;
      if (location) url += `&location=${location}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPets(res.data.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load companions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPets();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [species, search, breed, location, feeRange, sort]);

  const handleFavorite = async (id) => {
    try {
      const storedUser = localStorage.getItem('kitpup_user');
      let token = '';
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token || '';
      }

      const res = await axios.patch(`/api/v1/pets/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data.favorites);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostStatus('submitting');
    try {
      const storedUser = localStorage.getItem('kitpup_user');
      let token = '';
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token || '';
      }

      // Update user contact info
      await axios.patch('/api/v1/users/me', 
        { contactNumber: postForm.contactNumber, whatsappNumber: postForm.whatsappNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formData = new FormData();
      Object.keys(postForm).forEach(key => {
        if (key !== 'contactNumber' && key !== 'whatsappNumber') {
          formData.append(key, postForm[key]);
        }
      });
      
      if (postPhotos) {
        for (let i = 0; i < postPhotos.length; i++) {
          formData.append('photos', postPhotos[i]);
        }
      }

      await axios.post('/api/v1/pets', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPostStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setPostStatus('');
        setPostForm({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', location: '', fee: 0, description: '', contactNumber: '', whatsappNumber: '' });
        setPostPhotos(null);
        fetchPets();
      }, 2000);
    } catch (err) {
      console.error(err);
      setPostStatus('error');
    }
  };

  const handleOpenPostModal = async () => {
    try {
      const storedUser = localStorage.getItem('kitpup_user');
      let token = storedUser ? JSON.parse(storedUser).token : '';
      const res = await axios.get('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = res.data.data;
      setPostForm(prev => ({
        ...prev,
        contactNumber: userData.contactNumber || '',
        whatsappNumber: userData.whatsappNumber || ''
      }));
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Please login first.");
    }
  };

  const handleReset = () => {
    setSpecies('Dog');
    setSearch('');
    setBreed('Any Breed');
    setLocation('');
    setFeeRange({ min: 0, max: 200000 });
  };

  const handleFeeChange = (e) => {
    setFeeRange({ ...feeRange, max: Number(e.target.value) });
  };

  const isFav = (id) => favorites.includes(id);

  return (
    <div className="flex flex-col lg:flex-row gap-8 text-left max-w-7xl mx-auto">
      
      {/* Left Sidebar - Filters */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
          <button onClick={handleReset} className="text-brand-orange font-bold text-sm hover:underline">Reset</button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          
          {/* Search Name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Search Name</label>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="e.g. Bella" 
                className="w-full pl-9 pr-4 py-2 bg-orange-50/50 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm placeholder-gray-400" 
              />
            </div>
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Species</label>
            <div className="flex bg-orange-50/50 p-1 rounded-xl border border-orange-100">
              <button 
                onClick={() => setSpecies('Dog')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${species === 'Dog' ? 'bg-brand-orange text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/></svg>
                Dog
              </button>
              <button 
                onClick={() => setSpecies('Cat')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${species === 'Cat' ? 'bg-brand-orange text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12,8L10.6,5.2L12.8,4L14.9,8H12M5.5,12C3.6,12 2,10.4 2,8.5C2,6.6 3.6,5 5.5,5C7.4,5 9,6.6 9,8.5C9,10.4 7.4,12 5.5,12M18.5,12C16.6,12 15,10.4 15,8.5C15,6.6 16.6,5 18.5,5C20.4,5 22,6.6 22,8.5C22,10.4 20.4,12 18.5,12M5.5,10C6.3,10 7,9.3 7,8.5C7,7.7 6.3,7 5.5,7C4.7,7 4,7.7 4,8.5C4,9.3 4.7,10 5.5,10M18.5,10C19.3,10 20,9.3 20,8.5C20,7.7 19.3,7 18.5,7C17.7,7 17,7.7 17,8.5C17,9.3 17.7,10 18.5,10M12,14C9.8,14 8,15.8 8,18V20H16V18C16,15.8 14.2,14 12,14Z"/></svg>
                Cat
              </button>
            </div>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Breed</label>
            <select value={breed} onChange={e => setBreed(e.target.value)} className="w-full px-4 py-2 bg-orange-50/50 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm text-gray-700 appearance-none">
              <option>Any Breed</option>
              <option>Golden Retriever</option>
              <option>French Bulldog</option>
              <option>Beagle</option>
              <option>Siamese Cat</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Location</label>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <input 
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City or Zip" 
                className="w-full pl-9 pr-4 py-2 bg-orange-50/50 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm placeholder-gray-400" 
              />
            </div>
          </div>

          {/* Adoption Fee */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-800">Adoption Fee</label>
              <span className="text-sm font-bold text-[#92400E]">PKR {feeRange.min} - PKR {feeRange.max}</span>
            </div>
            <div className="relative h-1 bg-orange-100 rounded-full mt-4 mb-2">
              <input 
                type="range" 
                min="0" 
                max="200000" 
                value={feeRange.max} 
                onChange={handleFeeChange}
                className="w-full absolute -top-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#92400E] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm" 
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-3 font-medium">
              <span>Min</span>
              <span>Max</span>
            </div>
          </div>

        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1">
        
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <p className="font-medium text-gray-800">
            {loading ? (
              <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              <span className="font-bold text-brand-orange">{pets.length}</span>
            )} companions found near you
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Sort by:</span>
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-orange focus:border-brand-orange block w-full p-2 font-medium">
                <option value="newest">Newest Match</option>
                <option value="Lowest Fee">Lowest Fee</option>
              </select>
            </div>
            <button onClick={handleOpenPostModal} className="bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-shadow whitespace-nowrap">
              + Post Item
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4">
            {error}
          </div>
        )}

        {/* Pet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 w-full"></div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2 mt-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))
          ) : pets.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 bg-white rounded-3xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/></svg>
              <p className="font-bold text-lg">No companions found near you.</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            pets.map(pet => (
              <div key={pet._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group flex flex-col">
                
                {/* Image & Badges */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  {pet.photos && pet.photos.length > 0 ? (
                    <img src={pet.photos[0].startsWith('/') ? `${pet.photos[0]}` : pet.photos[0]} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {pet.status === 'active' ? (
                      <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm flex items-center gap-1.5 text-xs font-bold text-green-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Available
                      </div>
                    ) : <div></div>}
                    
                    <button onClick={() => handleFavorite(pet._id)} className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition-colors">
                      <svg className={`w-4 h-4 ${isFav(pet._id) ? 'text-red-500 fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-bold text-gray-800 break-words leading-tight">{pet.name}</h3>
                    <span className="text-base font-bold text-[#92400E] whitespace-nowrap shrink-0">{pet.fee === 0 ? 'Free' : `PKR ${pet.fee}`}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed break-words">{pet.breed}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <button 
                      onClick={() => { setSelectedPet(pet); setIsDetailsModalOpen(true); }}
                      className="w-full bg-orange-50 text-brand-orange py-2 rounded-xl text-xs font-bold hover:bg-brand-orange hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {pets.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 border-2 border-[#92400E] text-[#92400E] bg-white px-8 py-3 rounded-full font-bold shadow-sm hover:bg-orange-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Load More Companions
            </button>
          </div>
        )}

      </div>

      {/* Post Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Post a Companion</h2>
              
              {postStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Listing posted!
                </div>
              )}

              {postStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold">
                  Failed to post listing. Please try again.
                </div>
              )}

              <form onSubmit={handlePostSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pet Name</label>
                    <input type="text" required value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Species</label>
                    <select value={postForm.species} onChange={e => setPostForm({...postForm, species: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange bg-white">
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Breed</label>
                    <input type="text" required value={postForm.breed} onChange={e => setPostForm({...postForm, breed: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Age (e.g. 2 yrs, 4 mos)</label>
                    <input type="text" required value={postForm.age} onChange={e => setPostForm({...postForm, age: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                    <select value={postForm.gender} onChange={e => setPostForm({...postForm, gender: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange bg-white">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Adoption Fee (PKR)</label>
                    <input type="number" min="0" required value={postForm.fee} onChange={e => setPostForm({...postForm, fee: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Location (City, State)</label>
                  <input type="text" required value={postForm.location} onChange={e => setPostForm({...postForm, location: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows="3" required value={postForm.description} onChange={e => setPostForm({...postForm, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Your Phone Number</label>
                    <input type="text" required placeholder="+1234567890" value={postForm.contactNumber} onChange={e => setPostForm({...postForm, contactNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Your WhatsApp Number (Optional)</label>
                    <input type="text" placeholder="+1234567890" value={postForm.whatsappNumber} onChange={e => setPostForm({...postForm, whatsappNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Upload Photos</label>
                  <input type="file" multiple accept="image/*" onChange={e => setPostPhotos(e.target.files)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-brand-orange hover:file:bg-orange-100" />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={postStatus === 'submitting'} className="px-6 py-2 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 shadow-sm disabled:opacity-50">
                    {postStatus === 'submitting' ? 'Posting...' : 'Post Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pet Details Modal */}
      {isDetailsModalOpen && selectedPet && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative my-auto flex flex-col md:flex-row overflow-hidden">
            <button onClick={() => { setIsDetailsModalOpen(false); setSelectedPet(null); }} className="absolute top-4 right-4 z-10 text-gray-800 bg-white/80 hover:bg-white p-2.5 rounded-full backdrop-blur-sm transition-colors shadow-sm md:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            {/* Left: Image Area */}
            <div className="relative h-[300px] md:h-auto md:w-1/2 bg-gray-50 flex-shrink-0 md:min-h-[500px]">
              {selectedPet.photos && selectedPet.photos.length > 0 ? (
                <img src={selectedPet.photos[0].startsWith('/') ? `${selectedPet.photos[0]}` : selectedPet.photos[0]} alt={selectedPet.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            
            {/* Right: Content Area */}
            <div className="p-6 md:p-10 md:w-1/2 flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-y-auto bg-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-800 break-words leading-tight mb-2">{selectedPet.name}</h2>
                  <div className="text-2xl font-black text-[#92400E] shrink-0">{selectedPet.fee === 0 ? 'Free' : `PKR ${selectedPet.fee}`}</div>
                </div>
                <button 
                  onClick={() => { setIsDetailsModalOpen(false); setSelectedPet(null); }}
                  className="hidden md:flex text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-3 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="bg-orange-50 text-brand-orange px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">{selectedPet.species}</span>
                <span className="bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">{selectedPet.breed}</span>
                <span className="bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">{selectedPet.age}</span>
                <span className="bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">{selectedPet.gender}</span>
              </div>
              
              <div className="mb-8 flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  {selectedPet.description || 'No additional description provided by the lister.'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {selectedPet.location}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 mt-auto flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Contact Seller ({selectedPet.owner?.name || 'Unknown'})</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedPet.owner?.contactNumber ? (
                    <a href={`tel:${selectedPet.owner.contactNumber}`} className="flex-1 min-w-[140px] bg-gray-100 text-gray-800 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-sm flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      Call Seller
                    </a>
                  ) : (
                    <button disabled className="flex-1 min-w-[140px] bg-gray-100 text-gray-400 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      No Phone
                    </button>
                  )}

                  {selectedPet.owner?.whatsappNumber ? (
                    <a href={`https://wa.me/${selectedPet.owner.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] bg-[#25D366] text-white py-3.5 rounded-xl font-bold hover:bg-[#128C7E] transition-colors shadow-sm flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
