import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'add_pet', 'edit_pet'
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Profile Form state
  const [editName, setEditName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Product Form state
  const [productForm, setProductForm] = useState({
    name: '', category: 'Food & Treats', price: '', originalPrice: '', stock: '', description: ''
  });

  // Pet Form state
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    weight: '',
    vaccinationStatus: false,
    location: '',
    status: 'personal',
    fee: '',
    contactNumber: '',
    whatsappNumber: ''
  });
  const [petPhotos, setPetPhotos] = useState(null);

  const getToken = () => {
    const storedUser = localStorage.getItem('kitpup_user');
    return storedUser ? JSON.parse(storedUser).token : '';
  };

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      
      const [userRes, petsRes, actRes, productsRes] = await Promise.all([
        axios.get('/api/v1/users/me', config),
        axios.get('/api/v1/pets/my', config),
        axios.get('/api/v1/users/me/activity?limit=3', config),
        axios.get('/api/v1/products/my', config)
      ]);

      setUser(userRes.data.data);
      setEditName(userRes.data.data.name);
      setAvatarPreview(userRes.data.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userRes.data.data.name)}&background=f97316&color=fff`);
      
      setPets(petsRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setActivities(actRes.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Profile Actions
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSaveProfile = async () => {
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', editName);
      if (avatarFile) {
        formData.append('avatar', avatarFile); // Needs proper backend support (currently using same endpoint logic, but let's assume multer handles it, wait userController uses req.file for updateMe)
      }

      const res = await axios.patch('/api/v1/users/me', formData, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(res.data.data);
      setAvatarPreview(res.data.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.data.name)}&background=f97316&color=fff`);
      
      // Update local storage so sidebar reflects changes
      const stored = JSON.parse(localStorage.getItem('kitpup_user'));
      stored.user.name = res.data.data.name;
      stored.user.avatar = res.data.data.avatar;
      localStorage.setItem('kitpup_user', JSON.stringify(stored));
      // Dispatch an event so layout can update if necessary
      window.dispatchEvent(new Event('storage'));

      setActiveModal(null);
      showToast('Profile updated!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  // Pet Actions
  const openAddPet = () => {
    setPetForm({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', weight: '', vaccinationStatus: false, description: '', location: '', status: 'personal', fee: '', contactNumber: user?.contactNumber || '', whatsappNumber: user?.whatsappNumber || '' });
    setPetPhotos(null);
    setSelectedPet(null);
    setError('');
    setActiveModal('pet');
  };

  const openEditPet = (pet) => {
    setPetForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age || '',
      gender: pet.gender || 'Male',
      weight: pet.weight || '',
      vaccinationStatus: pet.vaccinationStatus || false,
      description: pet.description || '',
      location: pet.location || '',
      status: pet.status || 'personal',
      fee: pet.fee !== undefined && pet.fee !== null ? pet.fee : '',
      contactNumber: user?.contactNumber || '',
      whatsappNumber: user?.whatsappNumber || ''
    });
    setPetPhotos(null);
    setSelectedPet(pet);
    setError('');
    setActiveModal('pet');
  };

  const handleSavePet = async () => {
    setError('');
    
    // Quick validation
    if (!petForm.name || !petForm.breed) {
      return setError('Name and Breed are required.');
    }

    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };

      // Update user contact info
      await axios.patch('/api/v1/users/me', 
        { contactNumber: petForm.contactNumber, whatsappNumber: petForm.whatsappNumber },
        config
      );
      
      const formData = new FormData();
      const payload = { ...petForm, description: petForm.description || 'My personal pet.', location: petForm.location || 'Home' };

      Object.keys(payload).forEach(key => {
        if (key !== 'contactNumber' && key !== 'whatsappNumber' && payload[key] !== '' && payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });

      if (petPhotos) {
        for (let i = 0; i < petPhotos.length; i++) {
          formData.append('photos', petPhotos[i]);
        }
      }

      if (selectedPet) {
        // Update
        const res = await axios.patch(`/api/v1/pets/my/${selectedPet._id}`, formData, config);
        setPets(pets.map(p => p._id === selectedPet._id ? res.data.data : p));
        showToast('Pet updated!');
      } else {
        // Create
        const res = await axios.post('/api/v1/pets/my', formData, config);
        setPets([...pets, res.data.data]);
        showToast('Pet added!');
      }
      setActiveModal(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save pet');
    }
  };

  const handleRemovePet = async () => {
    if (!selectedPet) return;
    try {
      await axios.delete(`/api/v1/pets/my/${selectedPet._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPets(pets.filter(p => p._id !== selectedPet._id));
      setActiveModal(null);
      showToast('Pet removed.');
    } catch (err) {
      setError('Failed to remove pet.');
    }
  };

  // Product Actions
  const openAddProduct = () => {
    setProductForm({ name: '', category: 'Food & Treats', price: '', originalPrice: '', stock: '', description: '' });
    setSelectedProduct(null);
    setError('');
    setActiveModal('product');
  };

  const openEditProduct = (product) => {
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || '',
      stock: product.stock,
      description: product.description || ''
    });
    setSelectedProduct(product);
    setError('');
    setActiveModal('product');
  };

  const handleSaveProduct = async () => {
    setError('');
    if (!productForm.name || !productForm.price || !productForm.stock) {
      return setError('Name, Price and Stock are required.');
    }
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      if (selectedProduct) {
        const res = await axios.patch(`/api/v1/products/my/${selectedProduct._id}`, productForm, config);
        setProducts(products.map(p => p._id === selectedProduct._id ? res.data.data : p));
        showToast('Accessory updated!');
      } else {
        const res = await axios.post('/api/v1/products', productForm, config);
        setProducts([...products, res.data.data]);
        showToast('Accessory added!');
      }
      setActiveModal(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save accessory');
    }
  };

  const handleRemoveProduct = async () => {
    if (!selectedProduct) return;
    try {
      await axios.delete(`/api/v1/products/my/${selectedProduct._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      setActiveModal(null);
      showToast('Accessory removed.');
    } catch (err) {
      setError('Failed to remove accessory.');
    }
  };

  const getActivityIcon = (type) => {
    if (type === 'purchase') {
      return <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-brand-orange">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
      </div>;
    } else if (type === 'report') {
      return <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>;
    } else {
      return <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      </div>;
    }
  };


  if (loading) {
    return <div className="max-w-[550px] mx-auto p-4 animate-pulse space-y-6">
      <div className="h-32 bg-gray-200 rounded-2xl"></div>
      <div className="h-40 bg-gray-200 rounded-2xl"></div>
      <div className="h-60 bg-gray-200 rounded-2xl"></div>
    </div>;
  }

  return (
    <div className="max-w-[550px] mx-auto pb-12 relative text-left">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-8 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md z-50 animate-bounce">
          ✓ {toast}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=f97316&color=fff`} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full object-cover border-4 border-orange-50 shadow-sm"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.role === 'admin' && (
              <div className="inline-block mt-2 px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded-full shadow-sm">
                Admin
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setActiveModal('profile')}
          className="px-4 py-2 border-2 border-brand-orange text-brand-orange font-bold rounded-xl hover:bg-orange-50 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {/* MY PETS */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Pets</h2>
          <button 
            onClick={openAddPet}
            className="px-4 py-2 bg-brand-dark-brown text-black font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
          >
            <span>+</span> Add Pet
          </button>
        </div>

        {pets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-brand-orange mb-4">
               <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/></svg>
            </div>
            <p className="font-bold text-gray-800">No pets added yet.</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">Keep track of their details and health.</p>
            <button onClick={openAddPet} className="text-brand-orange font-bold text-sm">
              + Add Your First Pet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {pets.map(pet => (
              <div 
                key={pet._id} 
                onClick={() => openEditPet(pet)}
                className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 flex items-center cursor-pointer hover:border-brand-orange/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200 mr-2.5 group-hover:border-brand-orange/30 transition-colors">
                   {pet.photos && pet.photos.length > 0 ? (
                     <img src={pet.photos[0].startsWith('/') ? `${pet.photos[0]}` : pet.photos[0]} alt={pet.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xs font-bold text-gray-400 uppercase">{pet.name.charAt(0)}</span>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate leading-tight group-hover:text-brand-orange transition-colors">{pet.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{pet.breed}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MY ACCESSORIES */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Accessories</h2>
          <button 
            onClick={openAddProduct}
            className="px-4 py-2 bg-[#92400E] text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
          >
            <span>+</span> Add Item
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-brand-orange mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <p className="font-bold text-gray-800">No accessories listed yet.</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">Sell items your pet no longer needs.</p>
            <button onClick={openAddProduct} className="text-brand-orange font-bold text-sm">
              + Add Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {products.map(product => (
              <div 
                key={product._id} 
                onClick={() => openEditProduct(product)}
                className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 flex items-center cursor-pointer hover:border-brand-orange/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200 mr-2.5 group-hover:border-brand-orange/30 transition-colors">
                   {product.photos && product.photos.length > 0 ? (
                     <img src={product.photos[0].startsWith('/') ? `${product.photos[0]}` : product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xs font-bold text-gray-400 uppercase">{product.name.charAt(0)}</span>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate leading-tight group-hover:text-brand-orange transition-colors">{product.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">PKR {product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 p-6 text-sm">No recent activity.</p>
          ) : (
            activities.map((act, idx) => {
              const d = new Date(act.date);
              return (
                <div key={act._id} className={`flex items-center justify-between p-4 ${idx !== activities.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-center gap-4">
                    {getActivityIcon(act.type)}
                    <div>
                      <p className="font-bold text-gray-800 text-sm leading-tight">{act.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{act.source}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-800">{d.toLocaleString('en-us', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">{d.getFullYear()}</p>
                  </div>
                </div>
              )
            })
          )}
          
          {activities.length > 0 && (
            <div className="p-4 border-t border-gray-100 text-center">
              <button className="text-brand-orange font-bold text-sm hover:underline">
                View Full History
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Edit Profile</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6">
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-4 border-orange-50" />
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-brand-dark-brown transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">FULL NAME</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">EMAIL ADDRESS</label>
                  <input type="email" value={user?.email} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <button onClick={handleSaveProfile} className="w-full mt-4 bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-brand-dark-brown transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PET MODAL (ADD / EDIT) */}
      {activeModal === 'pet' && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-800">{selectedPet ? 'Edit Pet' : 'Add Pet'}</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">PET NAME</label>
                <input type="text" value={petForm.name} onChange={e => setPetForm({...petForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="e.g. Bella" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">SPECIES</label>
                  <select value={petForm.species} onChange={e => setPetForm({...petForm, species: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">BREED</label>
                  <input type="text" value={petForm.breed} onChange={e => setPetForm({...petForm, breed: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="e.g. Poodle" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">AGE</label>
                  <input type="text" value={petForm.age} onChange={e => setPetForm({...petForm, age: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="e.g. 3 years" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">GENDER</label>
                  <select value={petForm.gender} onChange={e => setPetForm({...petForm, gender: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">LOCATION (CITY, STATE)</label>
                <input type="text" value={petForm.location} onChange={e => setPetForm({...petForm, location: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="e.g. New York, NY" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">WEIGHT</label>
                  <input type="text" value={petForm.weight} onChange={e => setPetForm({...petForm, weight: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="e.g. 15 lbs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ADOPTION FEE / PRICE (PKR)</label>
                  <input type="number" min="0" value={petForm.fee} onChange={e => setPetForm({...petForm, fee: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="e.g. 5000 (Optional)" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-gray-800">Vaccinations up to date</p>
                  <p className="text-xs text-gray-500">Required for Marketplace listing</p>
                </div>
                <button 
                  onClick={() => setPetForm({...petForm, vaccinationStatus: !petForm.vaccinationStatus})}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${petForm.vaccinationStatus ? 'bg-brand-orange' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${petForm.vaccinationStatus ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">NOTES / DESCRIPTION</label>
                <textarea rows="3" value={petForm.description} onChange={e => setPetForm({...petForm, description: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="Any special needs or notes..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">YOUR PHONE NUMBER</label>
                  <input type="text" value={petForm.contactNumber} onChange={e => setPetForm({...petForm, contactNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="+1234567890" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">WHATSAPP (OPTIONAL)</label>
                  <input type="text" value={petForm.whatsappNumber} onChange={e => setPetForm({...petForm, whatsappNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" placeholder="+1234567890" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">UPLOAD PHOTOS</label>
                <input type="file" multiple accept="image/*" onChange={e => setPetPhotos(e.target.files)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-brand-orange hover:file:bg-orange-100" />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-orange-50/50">
                <div>
                  <p className="text-sm font-bold text-brand-orange">List in Marketplace</p>
                  <p className="text-xs text-gray-500">Allow others to see this pet for adoption/sale.</p>
                </div>
                <button 
                  onClick={() => setPetForm({...petForm, status: petForm.status === 'active' ? 'personal' : 'active'})}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${petForm.status === 'active' ? 'bg-brand-orange' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${petForm.status === 'active' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
              <button onClick={handleSavePet} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-brand-dark-brown transition-colors">
                Save Changes
              </button>
              {selectedPet && (
                <button onClick={handleRemovePet} className="w-full text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 transition-colors">
                  Remove Pet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {activeModal === 'product' && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-800">{selectedProduct ? 'Edit Accessory' : 'Add Accessory'}</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">PRODUCT NAME</label>
                <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">CATEGORY</label>
                <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50 bg-white">
                  {['Food & Treats', 'Apparel', 'Toys', 'Grooming', 'Beds & Crates'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">PRICE (PKR)</label>
                  <input type="number" min="0" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">STOCK</label>
                  <input type="number" min="0" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">DESCRIPTION</label>
                <textarea rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50"></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
              <button onClick={handleSaveProduct} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-brand-dark-brown transition-colors">
                Save Changes
              </button>
              {selectedProduct && (
                <button onClick={handleRemoveProduct} className="w-full text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 transition-colors">
                  Remove Accessory
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
