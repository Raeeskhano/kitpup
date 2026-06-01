import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileFooter from './MobileFooter';

export default function Layout({ children, currentPage, setCurrentPage, user, onLogout }) {
  return (
    <div className="min-h-screen bg-brand-gray-50 flex">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />
      
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <Header currentPage={currentPage} user={user} onLogout={onLogout} setCurrentPage={setCurrentPage} />
        
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 w-full max-w-6xl mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
      
      <MobileFooter currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}
