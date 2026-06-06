import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PetShop() {
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    name: '', category: 'Food & Treats', price: '', originalPrice: '', stock: '', description: ''
  });
  const [postPhotos, setPostPhotos] = useState(null);
  const [postStatus, setPostStatus] = useState('');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);

  const categories = ['All', 'Food & Treats', 'Apparel', 'Toys', 'Grooming', 'Beds & Crates'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/v1/products?category=${category}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleAddToCart = async (productId) => {
    try {
      setAddingToCartId(productId);
      const storedUser = localStorage.getItem('kitpup_user');
      let token = '';
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token || '';
      }

      await axios.post('/api/v1/products/cart', {
        productId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Dispatch event to update global header cart
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleOpenPostModal = async () => {
    try {
      const storedUser = localStorage.getItem('kitpup_user');
      if (!storedUser) {
        alert("Please login first.");
        return;
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Please login first.");
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
        if (postForm[key] !== '') {
          formData.append(key, postForm[key]);
        }
      });
      
      if (postPhotos) {
        for (let i = 0; i < postPhotos.length; i++) {
          formData.append('photos', postPhotos[i]);
        }
      }

      await axios.post('/api/v1/products', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPostStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setPostStatus('');
        setPostForm({ name: '', category: 'Food & Treats', price: '', originalPrice: '', stock: '', description: '' });
        setPostPhotos(null);
        fetchProducts();
      }, 2000);
    } catch (err) {
      console.error(err);
      setPostStatus('error');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400 text-xs">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto text-left">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Accessories Shop</h1>
          <p className="text-gray-500 mt-2">Curated essentials for your best friend.</p>
        </div>
        <button onClick={handleOpenPostModal} className="bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-shadow whitespace-nowrap self-start md:self-auto">
          + Add Item
        </button>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
              category === cat 
                ? 'bg-brand-orange text-white border-2 border-brand-orange' 
                : 'bg-white text-gray-600 border-2 border-white hover:border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
              <div className="h-40 bg-gray-200 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="pt-2">
                  <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 bg-white rounded-3xl border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <p className="font-bold text-lg">No {category !== 'All' ? category : ''} products available yet.</p>
            <p className="text-sm mt-1">Check back soon for new arrivals!</p>
          </div>
        ) : (
          products.map(product => (
            <div 
              key={product._id} 
              onClick={() => { setDetailProduct(product); setIsDetailModalOpen(true); }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
            >
              
              <div className="relative h-40 bg-gray-50 overflow-hidden">
                {product.photos && product.photos.length > 0 ? (
                  <img 
                    src={product.photos[0].startsWith('/') ? `${product.photos[0]}` : product.photos[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  {product.badge ? (
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white shadow-sm ${
                      product.badge.toLowerCase() === 'sale' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {product.badge}
                    </span>
                  ) : <div></div>}
                  
                  <button onClick={e => e.stopPropagation()} className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-2">
                  {renderStars(product.rating || 0)}
                  <span className="text-xs text-gray-400 font-medium">({product.reviewCount || 0})</span>
                </div>
                
                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 min-h-[40px] leading-tight" title={product.name}>
                  {product.name}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-bold text-[#92400E]">PKR {product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">PKR {product.originalPrice}</span>
                  )}
                </div>

                <div className="mt-auto pt-2 border-t border-gray-50">
                  {product.stock > 0 ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                      disabled={addingToCartId === product._id}
                      className="w-full py-2.5 bg-[#92400E] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#78350f] transition-colors disabled:opacity-75"
                    >
                      {addingToCartId === product._id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  ) : (
                    <button onClick={e => e.stopPropagation()} disabled className="w-full py-2.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl text-sm font-bold">
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
              
            </div>
          ))
        )}
      </div>

      {!loading && products.length > 0 && (
        <div className="mt-12 flex justify-center">
          <button className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-full font-bold shadow-sm hover:border-gray-300 transition-colors">
            Load More Accessories
          </button>
        </div>
      )}

      {/* Post Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Accessory</h2>
              
              {postStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Item added successfully!
                </div>
              )}

              {postStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold">
                  Failed to add item. Please try again.
                </div>
              )}

              <form onSubmit={handlePostSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                    <input type="text" required value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange bg-white">
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (PKR)</label>
                    <input type="number" min="0" required value={postForm.price} onChange={e => setPostForm({...postForm, price: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Original Price (Optional)</label>
                    <input type="number" min="0" value={postForm.originalPrice} onChange={e => setPostForm({...postForm, originalPrice: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
                    <input type="number" min="0" required value={postForm.stock} onChange={e => setPostForm({...postForm, stock: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-orange focus:border-brand-orange" />
                  </div>
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
                    {postStatus === 'submitting' ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {isDetailModalOpen && detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm overflow-y-auto" onClick={() => { setIsDetailModalOpen(false); setDetailProduct(null); }}>
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-xl relative my-auto flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <button 
              onClick={() => { setIsDetailModalOpen(false); setDetailProduct(null); }}
              className="absolute top-4 right-4 z-10 text-gray-800 bg-white/80 hover:bg-white p-2.5 rounded-full backdrop-blur-sm transition-colors shadow-sm md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Left: Image Area */}
            <div className="relative h-[300px] md:h-auto md:w-1/2 bg-gray-50 flex-shrink-0 md:min-h-[500px]">
              <img 
                src={detailProduct.photos && detailProduct.photos.length > 0 ? (detailProduct.photos[0].startsWith('/') ? `${detailProduct.photos[0]}` : detailProduct.photos[0]) : ''} 
                alt={detailProduct.name} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              {detailProduct.badge && (
                <div className={`absolute top-4 left-4 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-md ${detailProduct.badge.toLowerCase() === 'sale' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                  {detailProduct.badge}
                </div>
              )}
            </div>

            {/* Right: Content Area */}
            <div className="p-6 md:p-10 md:w-1/2 flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-y-auto bg-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[#92400E] font-bold text-sm tracking-widest uppercase mb-2">{detailProduct.category}</div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 leading-tight">{detailProduct.name}</h2>
                  
                  <div className="flex items-center gap-2 mb-6">
                    {renderStars(detailProduct.rating || 0)}
                    <span className="text-sm text-gray-500 font-medium">{detailProduct.reviewCount || 0} Reviews</span>
                  </div>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-black text-gray-800">PKR {detailProduct.price}</span>
                    {detailProduct.originalPrice && (
                      <span className="text-lg text-gray-400 line-through font-medium">PKR {detailProduct.originalPrice}</span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => { setIsDetailModalOpen(false); setDetailProduct(null); }}
                  className="hidden md:flex text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-3 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                  Product Details
                </h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  {detailProduct.description || 'No detailed description available.'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  {detailProduct.stock > 0 ? `${detailProduct.stock} in stock` : <span className="text-red-500">Out of Stock</span>}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 mt-auto flex gap-4">
                {detailProduct.stock > 0 ? (
                  <button 
                    onClick={() => handleAddToCart(detailProduct._id)}
                    disabled={addingToCartId === detailProduct._id}
                    className="flex-1 py-4 bg-[#92400E] text-white rounded-xl font-bold shadow-sm hover:bg-[#78350f] transition-colors disabled:opacity-75 flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    {addingToCartId === detailProduct._id ? 'Adding to Cart...' : 'Add to Cart'}
                  </button>
                ) : (
                  <button disabled className="flex-1 py-4 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl font-bold">
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
