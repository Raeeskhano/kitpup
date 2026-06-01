import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PetShop() {
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const categories = ['All', 'Food & Treats', 'Apparel', 'Toys', 'Grooming', 'Beds & Crates'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/v1/products?category=${category}`);
        setProducts(res.data.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
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

      await axios.post('http://localhost:5000/api/v1/products/cart', {
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Accessories Shop</h1>
        <p className="text-gray-500 mt-2">Curated essentials for your best friend.</p>
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
            <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col">
              
              <div className="relative h-40 bg-gray-50 overflow-hidden">
                {product.photos && product.photos.length > 0 ? (
                  <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  
                  <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition-colors">
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
                  <span className="text-lg font-bold text-[#92400E]">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
                  )}
                </div>

                <div className="mt-auto pt-2 border-t border-gray-50">
                  {product.stock > 0 ? (
                    <button 
                      onClick={() => handleAddToCart(product._id)}
                      disabled={addingToCartId === product._id}
                      className="w-full py-2.5 bg-[#92400E] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#78350f] transition-colors disabled:opacity-75"
                    >
                      {addingToCartId === product._id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  ) : (
                    <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl text-sm font-bold">
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
    </div>
  );
}
