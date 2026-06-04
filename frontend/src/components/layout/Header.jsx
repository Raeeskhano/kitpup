import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Header({ currentPage, user, onLogout, setCurrentPage }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState(null);

  const getToken = () => {
    const storedUser = localStorage.getItem('kitpup_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed.token || '';
    }
    return '';
  };

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/products/cart', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCart(res.data.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    
    const handleCartUpdate = () => fetchCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }
    
    try {
      // Optimistic update locally
      const updatedCart = cart.map(item => 
        item.productId._id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);

      await axios.put(`http://localhost:5000/api/v1/products/cart/${productId}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      // Fire event to update badges elsewhere if needed
      window.dispatchEvent(new Event('cartUpdatedBadgeOnly'));
    } catch (err) {
      console.error('Failed to update quantity', err);
      fetchCart(); // Revert on fail
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Optimistic update
      setCart(cart.filter(item => item.productId._id !== productId));

      await axios.delete(`http://localhost:5000/api/v1/products/cart/${productId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      window.dispatchEvent(new Event('cartUpdatedBadgeOnly'));
    } catch (err) {
      console.error('Failed to remove from cart', err);
      fetchCart();
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutStatus('loading');
      await axios.post(`http://localhost:5000/api/v1/products/cart/checkout`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCart([]);
      setCheckoutStatus('success');
      window.dispatchEvent(new Event('cartUpdatedBadgeOnly'));
      
      // Auto close after success
      setTimeout(() => {
        setCheckoutStatus(null);
        setShowCart(false);
      }, 2500);
    } catch (err) {
      console.error('Checkout failed', err);
      setCheckoutStatus(null);
      alert('Checkout failed. Please try again.');
    }
  };

  // Add a listener for badge updates to avoid fetching if we are optimistic
  useEffect(() => {
    const handleBadgeUpdate = () => fetchCart();
    // Only fetch if we are NOT the one who initiated it, to avoid stuttering
    // Actually simpler just to re-fetch on the standard 'cartUpdated'
  }, []);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0);

  const titles = {
    dashboard: 'Overview',
    marketplace: 'Marketplace',
    petshop: 'Pet Shop',
    rescuereport: 'Rescue Report',
    lostfound: 'Lost & Found',
    aichat: 'PupChat AI',
    vetlocator: 'Find a Vet',
    profile: 'My Profile',
    settings: 'Settings'
  };

  return (
    <>
      <header className="h-16 md:h-20 backdrop-blur-md bg-white/80 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold">
            K
          </div>
          <h1 className="text-xl font-bold text-brand-orange">KitPup</h1>
        </div>
        
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold text-gray-800">{titles[currentPage] || 'KitPup'}</h2>
          <p className="text-sm text-gray-500">Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}!</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <button 
            onClick={() => setShowCart(true)}
            className="p-2 rounded-full bg-white/50 md:shadow-sm text-gray-600 hover:text-brand-orange transition-colors relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] text-white flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Bell Icon */}
          <button className="p-2 rounded-full bg-white/50 md:shadow-sm text-gray-600 hover:text-brand-orange transition-colors relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shadow-sm border-2 border-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <img src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=f97316&color=fff"} alt="Avatar" className="w-full h-full object-cover" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || "user@example.com"}</p>
                </div>
                <button onClick={() => { setShowMenu(false); setCurrentPage('profile'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors">My Profile</button>
                <button onClick={() => { setShowMenu(false); setCurrentPage('settings'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors">Settings</button>
                <button onClick={() => { setShowMenu(false); onLogout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Log Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col transform transition-transform">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {checkoutStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h3>
                  <p className="text-gray-500">Your pawsome items are on their way.</p>
                </div>
              ) : cartLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <p className="font-bold text-lg">Your cart is empty</p>
                  <p className="text-sm mt-1">Looks like you haven't added anything yet.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId?._id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.productId?.photos?.length > 0 ? (
                         <img src={item.productId.photos[0]} alt={item.productId.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800 line-clamp-2">{item.productId?.name}</h4>
                        <p className="text-[#92400E] font-bold mt-1">PKR {item.productId?.price}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => updateQuantity(item.productId._id, item.quantity, -1)} className="px-2 py-1 text-gray-500 hover:bg-gray-50 rounded-l-lg">-</button>
                          <span className="px-2 text-sm font-bold text-gray-700">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId._id, item.quantity, 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-50 rounded-r-lg">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.productId._id)} className="text-xs font-bold text-gray-400 hover:text-red-500 hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && checkoutStatus !== 'success' && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-gray-800">PKR {cartSubtotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={checkoutStatus === 'loading'}
                  className="w-full py-4 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 shadow-sm transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {checkoutStatus === 'loading' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Processing...
                    </>
                  ) : (
                    'Checkout'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
