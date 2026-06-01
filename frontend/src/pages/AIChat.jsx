import React, { useState } from 'react';

export default function AIChat() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi Sarah! I'm KitPup AI. How's Bella doing today? Need help with her schedule, finding a vet, or just want some training tips?", 
      isBot: true 
    },
    { 
      id: 2, 
      text: "She's a bit sluggish today and didn't finish her breakfast. Should I be worried? We just moved to Austin so I don't have a regular vet yet.", 
      isBot: false 
    },
    { 
      id: 3, 
      text: "I understand, it's always concerning when they act out of character. Sluggishness and loss of appetite can be due to the stress of moving, but it's best to consult a professional to be safe. Since you're in Austin, I found two highly-rated clinics open right now near you:", 
      isBot: true,
      widget: 'clinics'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMsg = { id: Date.now(), text: input, isBot: false };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white relative text-left">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-gray-50/0">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-orange/20 shadow-sm mb-3">
          <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150&h=150" alt="KitPup AI" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">KitPup AI</h2>
        <p className="text-sm text-gray-500 font-medium">Always here to help with your furry friend.</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex items-start gap-3 max-w-[90%] md:max-w-[80%] ${msg.isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm mt-1 ${msg.isBot ? 'bg-[#9c5930] text-white' : 'bg-gray-200'}`}>
                {msg.isBot ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/></svg>
                ) : (
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" alt="User" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.isBot ? 'bg-[#f4e8db]/60 text-gray-800 rounded-tl-sm' : 'bg-[#9c5930] text-white rounded-tr-sm'}`}>
                {msg.text}
              </div>
            </div>

            {/* Widget Area inside Chat */}
            {msg.widget === 'clinics' && (
              <div className="ml-11 mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                
                {/* Clinic Card 1 */}
                <div className="bg-[#fdfaf5] border border-[#f4e8db] rounded-2xl p-4 min-w-[260px] max-w-[280px] shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#9c5930]/10 flex items-center justify-center text-[#9c5930]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Open
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">Austin Pet Clinic</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    1.2 miles away
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 py-2 bg-[#f4e8db]/60 text-gray-700 rounded-xl text-xs font-bold hover:bg-[#f4e8db] transition-colors">Details</button>
                    <button className="flex-1 py-2 bg-[#9c5930] text-white rounded-xl text-xs font-bold hover:bg-[#804622] transition-colors">Call</button>
                  </div>
                </div>

                {/* Clinic Card 2 */}
                <div className="bg-[#fdfaf5] border border-[#f4e8db] rounded-2xl p-4 min-w-[260px] max-w-[280px] shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#9c5930]/10 flex items-center justify-center text-[#9c5930]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/></svg>
                    </div>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Open
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">Barton Creek Vet</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    2.8 miles away
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 py-2 bg-[#f4e8db]/60 text-gray-700 rounded-xl text-xs font-bold hover:bg-[#f4e8db] transition-colors">Details</button>
                    <button className="flex-1 py-2 bg-[#9c5930] text-white rounded-xl text-xs font-bold hover:bg-[#804622] transition-colors">Call</button>
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#9c5930] text-white rounded-full flex items-center justify-center overflow-hidden shadow-sm mt-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/></svg>
          </div>
          <div className="p-4 rounded-2xl bg-[#f4e8db]/60 rounded-tl-sm w-16 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#9c5930]/50 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-[#9c5930]/50 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
            <span className="w-1.5 h-1.5 bg-[#9c5930]/50 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-white flex flex-col items-center border-t border-gray-50 z-10">
        
        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fdfaf5] border border-[#f4e8db] text-gray-600 text-xs font-bold hover:bg-[#f4e8db]/50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Check symptoms
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fdfaf5] border border-[#f4e8db] text-gray-600 text-xs font-bold hover:bg-[#f4e8db]/50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Vaccination schedule
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fdfaf5] border border-[#f4e8db] text-gray-600 text-xs font-bold hover:bg-[#f4e8db]/50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Find a vet
          </button>
        </div>

        {/* Input Field */}
        <form onSubmit={handleSend} className="w-full relative px-4">
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
          </div>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to KitPup..." 
            className="w-full bg-[#fbf9f6] border border-[#f4e8db] rounded-full pl-12 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-[#9c5930]/30 text-sm placeholder-gray-400 font-medium"
          />
          
          <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#9c5930] text-white rounded-full flex items-center justify-center hover:bg-[#804622] transition-colors shadow-sm">
            <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>

        <p className="text-[10px] text-gray-400 mt-3 font-medium">
          KitPup AI can make mistakes. Consider verifying critical health information with a vet.
        </p>

      </div>
    </div>
  );
}
