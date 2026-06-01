import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Marketplace() {
  const [species, setSpecies] = useState('Dog');
  const [search, setSearch] = useState('');
  const [breed, setBreed] = useState('Any Breed');
  const [location, setLocation] = useState('');
  const [feeRange, setFeeRange] = useState({ min: 0, max: 500 });
  const [sort, setSort] = useState('newest');

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [favorites, setFavorites] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    name: '', species: 'Dog', breed: '', age: '', gender: 'Male', location: '', fee: 0, description: ''
  });
  const [postPhotos, setPostPhotos] = useState(null);
  const [postStatus, setPostStatus] = useState('');

  const fetchPets = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('kitpup_user');
      let token = '';
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token || '';
      }

      let url = `http://localhost:5000/api/v1/pets?species=${species}&minFee=${feeRange.min}&maxFee=${feeRange.max}&sort=${sort}`;
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

      const res = await axios.patch(`http://localhost:5000/api/v1/pets/${id}/favorite`, {}, {
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

      const formData = new FormData();
      Object.keys(postForm).forEach(key => {
        formData.append(key, postForm[key]);
      });
      
      if (postPhotos) {
        for (let i = 0; i < postPhotos.length; i++) {
          formData.append('photos', postPhotos[i]);
        }
      }

      await axios.post('http://localhost:5000/api/v1/pets', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPostStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setPostStatus('');
        setPostForm({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', location: '', fee: 0, description: '' });
        setPostPhotos(null);
        fetchPets();
      }, 2000);
    } catch (err) {
      console.error(err);
      setPostStatus('error');
    }
  };

  const handleReset = () => {
    setSpecies('Dog');
    setSearch('');
    setBreed('Any Breed');
    setLocation('');
    setFeeRange({ min: 0, max: 500 });
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
              <span className="text-sm font-bold text-[#92400E]">${feeRange.min} - ${feeRange.max}</span>
            </div>
            <div className="relative h-1 bg-orange-100 rounded-full mt-4 mb-2">
              <input 
                type="range" 
                min="0" 
                max="500" 
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
            <button onClick={() => setIsModalOpen(true)} className="bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-shadow whitespace-nowrap">
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
                    <img src={pet.photos[0].startsWith('/') ? `http://localhost:5000${pet.photos[0]}` : pet.photos[0]} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  <div className="flex justify-between items-end mb-1">
                    <h3 className="text-2xl font-bold text-gray-800 truncate" title={pet.name}>{pet.name}</h3>
                    <span className="text-xl font-bold text-[#92400E] ml-2 whitespace-nowrap">{pet.fee === 0 ? 'Free' : `$${pet.fee}`}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{pet.breed}</p>
                  
                  {/* Chips */}
                  <div className="flex gap-2 mb-4">
                    <div className="bg-orange-50 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {pet.age}
                    </div>
                    <div className="bg-orange-50 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      {pet.gender === 'Female' ? (
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a5 5 0 100 10 5 5 0 000-10zm0 10v9m-3-4h6"/></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14a5 5 0 100-10 5 5 0 000 10zm0 0l6 6m-4 0h4v-4"/></svg>
                      )}
                      {pet.gender}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {pet.location}
                    </p>
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
                    <label className="block text-sm font-bold text-gray-700 mb-1">Adoption Fee ($)</label>
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

    </div>
  );
}
