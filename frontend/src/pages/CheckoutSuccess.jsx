import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutSuccess({ setCurrentPage }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire event to ensure cart badge is updated (should be empty now)
    window.dispatchEvent(new Event('cartUpdated'));
    if (setCurrentPage) {
        setCurrentPage('dashboard');
    }
  }, [setCurrentPage]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-gray-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-500 mb-8 text-lg">
          Thank you for your purchase! Your order has been confirmed and we're getting it ready for your pawsome friend.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
