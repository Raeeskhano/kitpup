import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function Settings({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'email', 'password', 'measurement'
  
  // Form states
  const [emailInput, setEmailInput] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [measureSystem, setMeasureSystem] = useState('Imperial');
  const [contactInputs, setContactInputs] = useState({ contactNumber: '', whatsappNumber: '' });
  
  // Toast/Error state
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const stored = localStorage.getItem('kitpup_user');
      const token = stored ? JSON.parse(stored).token : '';
      const res = await axios.get('http://localhost:5000/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.data);
      setMeasureSystem(res.data.data.preferences?.measurementSystem || 'Imperial');
      setEmailInput(res.data.data.email);
      setContactInputs({
        contactNumber: res.data.data.contactNumber || '',
        whatsappNumber: res.data.data.whatsappNumber || ''
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const getToken = () => {
    const stored = localStorage.getItem('kitpup_user');
    return stored ? JSON.parse(stored).token : '';
  };

  // Toggle handlers
  const handleToggle = async (type) => {
    if (!user) return;
    
    // Optimistic UI update
    const currentVal = user.notifications?.[type] ?? (type === 'push');
    const newNotifications = { ...user.notifications, [type]: !currentVal };
    
    setUser({ ...user, notifications: newNotifications });

    try {
      await axios.patch('http://localhost:5000/api/v1/users/me', 
        { notifications: newNotifications },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
    } catch (err) {
      // Revert on error
      setUser({ ...user, notifications: { ...user.notifications, [type]: currentVal } });
      showToast('Failed to update settings');
    }
  };

  // Email Submit
  const handleEmailSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const res = await axios.patch('http://localhost:5000/api/v1/users/me', 
        { email: emailInput },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setUser(res.data.data);
      setActiveModal(null);
      showToast('Settings saved!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update email');
    }
    setIsSaving(false);
  };

  // Password Submit
  const handlePasswordSave = async () => {
    setError('');
    if (passwords.new !== passwords.confirm) {
      return setError('New passwords do not match');
    }
    if (passwords.new.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    setIsSaving(true);
    try {
      await axios.patch('http://localhost:5000/api/v1/users/me/password', 
        { currentPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setActiveModal(null);
      setPasswords({ current: '', new: '', confirm: '' });
      showToast('Settings saved!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
    setIsSaving(false);
  };

  // Measurement Submit
  const handleMeasurementSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const res = await axios.patch('http://localhost:5000/api/v1/users/me', 
        { preferences: { measurementSystem: measureSystem } },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setUser(res.data.data);
      setActiveModal(null);
      showToast('Settings saved!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update preferences');
    }
    setIsSaving(false);
  };

  // Contact Submit
  const handleContactSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const res = await axios.patch('http://localhost:5000/api/v1/users/me', 
        { contactNumber: contactInputs.contactNumber, whatsappNumber: contactInputs.whatsappNumber },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setUser(res.data.data);
      setActiveModal(null);
      showToast('Contact info saved!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update contact info');
    }
    setIsSaving(false);
  };

  const handleLocationServices = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => showToast('Location permission granted!'),
        () => alert('Please enable location permissions in your browser settings.')
      );
    }
  };

  if (loading) return <div className="text-center mt-20 animate-pulse text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-[500px] mx-auto text-left pb-10 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm z-50 animate-fade-in-up">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 px-2">
        <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 font-medium">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        
        {/* Account Section */}
        <div className="p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setActiveModal('email')}>
              <div>
                <p className="font-bold text-gray-800 text-sm">Email Address</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f4a261] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
            
            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setActiveModal('password')}>
              <div>
                <p className="font-bold text-gray-800 text-sm">Password</p>
                <p className="text-sm text-gray-500 tracking-widest">••••••••</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f4a261] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Information</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setActiveModal('contact')}>
              <div>
                <p className="font-bold text-gray-800 text-sm">Phone & WhatsApp</p>
                <p className="text-sm text-gray-500">
                  {user?.contactNumber || user?.whatsappNumber 
                    ? [user?.contactNumber, user?.whatsappNumber].filter(Boolean).join(', ') 
                    : 'Not set (Required to post a listing)'}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f4a261] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Notifications</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <p className="font-bold text-gray-800 text-sm">Push Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Receive alerts for reminders and messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={user?.notifications?.push ?? true}
                  onChange={() => handleToggle('push')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f4a261]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <p className="font-bold text-gray-800 text-sm">Email Updates</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Weekly pet care tips and product updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={user?.notifications?.email ?? false}
                  onChange={() => handleToggle('email')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f4a261]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Preferences</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setActiveModal('measurement')}>
              <div className="pr-4">
                <p className="font-bold text-gray-800 text-sm">Measurement System</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.preferences?.measurementSystem || 'Imperial'} {user?.preferences?.measurementSystem === 'Metric' ? '(kg, km)' : '(lbs, miles)'}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f4a261] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
            
            <div className="flex items-center justify-between cursor-pointer group" onClick={handleLocationServices}>
              <div className="pr-4">
                <p className="font-bold text-gray-800 text-sm">Location Services</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Used for Vet Locator and Marketplace</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f4a261] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>

        {/* Log Out Button */}
        <div>
          <button 
            onClick={onLogout}
            className="w-full py-4 text-center text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* --- MODALS --- */}

      <Modal isOpen={activeModal === 'email'} onClose={() => {setActiveModal(null); setError('');}} title="Edit Email">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={emailInput} 
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f4a261] focus:border-transparent"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button 
            onClick={handleEmailSave}
            disabled={isSaving}
            className="w-full bg-[#f4a261] hover:bg-[#e76f51] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'password'} onClose={() => {setActiveModal(null); setError(''); setPasswords({current:'', new:'', confirm:''});}} title="Change Password">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
            <input 
              type="password" 
              value={passwords.current} 
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f4a261] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              value={passwords.new} 
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f4a261] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={passwords.confirm} 
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f4a261] focus:border-transparent"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button 
            onClick={handlePasswordSave}
            disabled={isSaving || !passwords.current || !passwords.new || !passwords.confirm}
            className="w-full bg-[#f4a261] hover:bg-[#e76f51] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-2"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'measurement'} onClose={() => {setActiveModal(null); setError('');}} title="Measurement System">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">Choose the unit system used across the app.</p>
          
          <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${measureSystem === 'Imperial' ? 'border-[#f4a261] bg-[#fdfaf5]' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800">Imperial</span>
              <span className="text-xs text-gray-500">Pounds (lbs) and Miles</span>
            </div>
            <input 
              type="radio" 
              name="measurement" 
              value="Imperial" 
              checked={measureSystem === 'Imperial'}
              onChange={() => setMeasureSystem('Imperial')}
              className="w-5 h-5 text-[#f4a261] focus:ring-[#f4a261] border-gray-300"
            />
          </label>
          
          <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${measureSystem === 'Metric' ? 'border-[#f4a261] bg-[#fdfaf5]' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800">Metric</span>
              <span className="text-xs text-gray-500">Kilograms (kg) and Kilometers</span>
            </div>
            <input 
              type="radio" 
              name="measurement" 
              value="Metric" 
              checked={measureSystem === 'Metric'}
              onChange={() => setMeasureSystem('Metric')}
              className="w-5 h-5 text-[#f4a261] focus:ring-[#f4a261] border-gray-300"
            />
          </label>

          {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
          
          <button 
            onClick={handleMeasurementSave}
            disabled={isSaving}
            className="w-full bg-[#f4a261] hover:bg-[#e76f51] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'contact'} onClose={() => {setActiveModal(null); setError('');}} title="Contact Information">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number (Required for posting)</label>
            <input 
              type="text" 
              placeholder="+1234567890"
              value={contactInputs.contactNumber} 
              onChange={(e) => setContactInputs({...contactInputs, contactNumber: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f4a261] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Number (Optional)</label>
            <input 
              type="text" 
              placeholder="+1234567890"
              value={contactInputs.whatsappNumber} 
              onChange={(e) => setContactInputs({...contactInputs, whatsappNumber: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f4a261] focus:border-transparent"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button 
            onClick={handleContactSave}
            disabled={isSaving}
            className="w-full bg-[#f4a261] hover:bg-[#e76f51] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-2"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
