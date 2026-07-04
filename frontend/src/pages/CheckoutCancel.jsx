import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutCancel({ setCurrentPage }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (setCurrentPage) {
        setCurrentPage('petshop');
    }
  }, [setCurrentPage]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-gray-100">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
        <p className="text-gray-500 mb-8 text-lg">
          Your payment was cancelled. No charges were made. You can try again when you're ready.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1"
        >
          Return to Shop
        </button>
      </div>
    </div>
  );
}
