import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SYSTEM_PROMPT = `You are KitPup AI, a veterinary assistant. CRITICAL RULE: Your ENTIRE response MUST be clear, concise, and to the point. You must NEVER exceed 2 to 3 sentences in length. When a user describes pet symptoms, you must immediately provide a short, concise response outlining: 1) the likely causes, 2) the recommended treatment, and 3) specific medicine/remedies. Do not use long introductions. When location is available and the user needs a vet, include a JSON block at the end of your response: {"clinics":[{"name":"Clinic Name","distance":"1.2 miles away","open":true}]}`;

export default function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm KitPup AI. How can I help you and your furry friend today?", 
      isBot: true 
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please upload an image file');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        data: reader.result.split(',')[1],
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (userText) => {
    if ((!userText.trim() && !attachment) || isLoading) return;
    
    const newMsg = { id: Date.now(), text: userText, isBot: false, attachment };
    const updatedMessages = [...messages, newMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages
        .filter(m => m.id !== 1)
        .slice(-10)
        .map(m => ({
          role: m.isBot ? 'assistant' : 'user',
          content: m.text,
          attachment: m.attachment
        }));

      const token = localStorage.getItem('kitpup_user') ? JSON.parse(localStorage.getItem('kitpup_user')).token : null;
      
      const res = await axios.post('http://localhost:5000/api/v1/ai/chat', { 
        messages: apiMessages, 
        systemPrompt: SYSTEM_PROMPT 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        const aiText = res.data.data;
        setMessages([...updatedMessages, { id: Date.now(), text: aiText, isBot: true }]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error('Gemini API Error:', err);
      setMessages([...updatedMessages, { 
        id: Date.now(), 
        text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderMessageContent = (text) => {
    // Regex to match the exact {"clinics": [...]} JSON block
    const jsonRegex = /({[\s\S]*"clinics"\s*:[\s\S]*})/;
    const match = text.match(jsonRegex);
    
    let displayText = text;
    let clinicsData = null;

    if (match) {
      try {
        clinicsData = JSON.parse(match[0]);
        displayText = text.replace(match[0], '').trim();
      } catch (e) {
        // Invalid JSON, leave as text
      }
    }

    return (
      <div className="space-y-4 w-full">
        <div className="whitespace-pre-wrap">{displayText}</div>
        
        {/* Render Inline Clinic Cards if JSON is present */}
        {clinicsData && clinicsData.clinics && clinicsData.clinics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-2 border-t border-brand-orange/10">
            {clinicsData.clinics.map((clinic, idx) => (
              <div key={idx} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <div className="flex items-start gap-1.5">
                      <svg className="w-4 h-4 text-[#f4a261] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      <h4 className="font-bold text-gray-800 text-sm leading-tight">{clinic.name}</h4>
                    </div>
                    {clinic.open && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Open
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 pl-5">{clinic.distance}</p>
                </div>
                
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => navigate('/vet-locator')} className="flex-1 py-1.5 text-[11px] font-bold text-[#92400E] border border-[#92400E] rounded-lg hover:bg-[#fffaf5] transition-colors">
                    Details
                  </button>
                  <button className="flex-1 py-1.5 text-[11px] font-bold text-white bg-[#92400E] rounded-lg hover:bg-[#804622] transition-colors">
                    Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] max-w-[600px] mx-auto bg-white relative text-left rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-gray-50 bg-white z-10 shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-orange/20 shadow-sm mb-3 bg-[#92400E] flex items-center justify-center text-3xl">
          🐶
        </div>
        <h2 className="text-xl font-bold text-gray-800">KitPup AI</h2>
        <p className="text-sm text-gray-500 font-medium px-4 text-center">Always here to help with your furry friend.</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-[#F9F9F9]/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex items-end gap-2.5 max-w-[90%] md:max-w-[85%] ${msg.isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.isBot ? 'bg-[#92400E] text-white border-2 border-white' : 'bg-gray-200 border-2 border-white overflow-hidden'}`}>
                {msg.isBot ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                ) : (
                  <img src="https://ui-avatars.com/api/?name=User&background=f97316&color=fff" alt="User" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm flex flex-col ${msg.isBot ? 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm' : 'bg-[#92400E] text-white rounded-br-sm'}`}>
                {msg.attachment && msg.attachment.previewUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                    <img src={msg.attachment.previewUrl} alt="Attached" className="max-w-full max-h-48 object-contain" />
                  </div>
                )}
                {msg.isBot ? renderMessageContent(msg.text) : <div className="whitespace-pre-wrap">{msg.text}</div>}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5 max-w-[90%] md:max-w-[85%] mr-auto">
            <div className="w-8 h-8 bg-[#92400E] text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-bl-sm w-16 flex items-center justify-center gap-1 shadow-sm h-[52px]">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white px-4 pt-3 pb-4 border-t border-gray-100 shrink-0">
        
        {/* Suggestion Chips */}
        <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 mb-3 pb-1 -mx-2 px-2">
          <button 
            onClick={() => sendMessage("My pet is showing some symptoms. Can you help me figure out what might be wrong?")}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            🔍 Check symptoms
          </button>
        </div>

        {/* Input Field */}
        <div className="w-full relative flex flex-col gap-2">
          
          {attachment && (
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200 self-start ml-12 relative group">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200">
                <img src={attachment.previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => setAttachment(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="w-full relative flex items-center gap-2">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </button>
            
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message to KitPup..." 
              className="flex-1 bg-[#F9F9F9] border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f4a261] focus:border-transparent text-sm placeholder-gray-400 font-medium transition-all"
            />
            
            <button type="submit" disabled={(!input.trim() && !attachment) || isLoading} className="w-10 h-10 flex-shrink-0 bg-[#f4a261] text-white rounded-full flex items-center justify-center hover:bg-[#e76f51] transition-colors shadow-sm disabled:opacity-50">
              <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>

        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
          KitPup AI can make mistakes. Always confirm critical health information with a vet.
        </p>

      </div>
    </div>
  );
}
