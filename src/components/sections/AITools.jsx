import React, { useEffect, useRef, useState } from 'react';
import { Bot, Calendar, PenTool, MessageCircle, Loader, Send } from 'lucide-react';
import Button from '../ui/Button';
import { API_ENDPOINTS } from '../../config/api';

const AITools = () => {
  const [activeAiTab, setActiveAiTab] = useState('estimator');
  const [quoteInput, setQuoteInput] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyTopic, setCopyTopic] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hi there! I'm Super. I can help you choose a template, explain our pricing, or suggest the best tech stack. How can I help?" }
  ]);

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Only scroll if we're on the chat tab
    if (activeAiTab !== 'chat') return;
    
    // Use setTimeout to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      if (chatContainerRef.current && chatEndRef.current) {
        // Scroll the chat container, not the entire page
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [chatHistory, activeAiTab]);

  const handleEstimator = async () => {
    if (!quoteInput.trim()) return;
    setIsProcessing(true);
    setAiResult(null);

    try {
      console.log('Sending request to:', API_ENDPOINTS.AI_ESTIMATE);
      console.log('Request body:', { prompt: quoteInput });
      
      const response = await fetch(API_ENDPOINTS.AI_ESTIMATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: quoteInput })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        
        if (response.status === 404) {
          throw new Error('Server endpoint not found. Make sure the server is running: npm run server');
        }
        
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Success result:', result);
      
      if (result.success && result.data) {
        setAiResult(result.data);
      } else {
        throw new Error(result.error || 'Failed to get estimate');
      }
    } catch (error) {
      console.error("AI Estimate Error:", error);
      let errorMessage = error.message || 'Failed to connect to AI service.';
      
      // Better error detection for network issues
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
        errorMessage = 'Cannot connect to server. Make sure the server is running: npm run server';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'CORS error. Server configuration issue.';
      }
      
      setAiResult({ 
        error: true, 
        message: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyGen = async () => {
    if (!copyTopic.trim()) return;
    setIsProcessing(true);
    setGeneratedCopy('');

    try {
      console.log('Sending copy request to:', API_ENDPOINTS.AI_COPY);
      console.log('Request body:', { prompt: copyTopic });
      
      const response = await fetch(API_ENDPOINTS.AI_COPY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: copyTopic })
      });

      console.log('Copy response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Copy error response:', errorData);
        
        if (response.status === 404) {
          throw new Error('Server endpoint not found. Make sure the server is running: npm run server');
        }
        
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Copy success result:', result);
      
      if (result.success && result.data) {
        setGeneratedCopy(result.data);
      } else {
        throw new Error(result.error || 'Failed to generate copy');
      }
    } catch (error) {
      console.error("AI Copy Error:", error);
      let errorMessage = error.message || 'Failed to connect to AI service.';
      
      // Better error detection for network issues
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
        errorMessage = 'Cannot connect to server. Make sure the server is running: npm run server';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'CORS error. Server configuration issue.';
      }
      
      setGeneratedCopy(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e?.preventDefault?.();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    // Create updated chat history with the new user message
    const updatedHistory = [...chatHistory, { role: 'user', text: userMsg }];
    
    // Update UI immediately
    setChatHistory(updatedHistory);
    setChatInput('');
    setIsProcessing(true);

    try {
      const response = await fetch(API_ENDPOINTS.AI_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          userMessage: userMsg
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setChatHistory(prev => [...prev, { role: 'ai', text: String(result.data) }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', text: result.message || "I'm having trouble connecting right now. Please try again in a moment." }]);
      }
    } catch (error) {
      console.error("Chat API Error:", error);
      // Show error message while keeping the user's message
      let errorMessage = "I'm sorry, I encountered an error. Please try again.";
      
      // Better error detection for network issues
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
        errorMessage = "Cannot connect to server. Make sure the server is running: npm run server";
      } else if (error.message?.includes('CORS')) {
        errorMessage = "Server configuration error. Please contact support.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: errorMessage
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="ai-tools" className="py-32 relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] -z-10"></div>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 text-violet-400 font-bold tracking-widest uppercase text-sm">
            <Bot size={16} /> Exclusive Technology
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">AI Agency Tools</h2>
          <p className="text-slate-400 mt-4">Experience the power of Gemini AI before you even hire us.</p>
        </div>

        <div className="glass-panel max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row border-b border-white/10">
            <button onClick={() => setActiveAiTab('estimator')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 ${activeAiTab === 'estimator' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}><Calendar size={18} /> Project Estimator</button>
            <button onClick={() => setActiveAiTab('copy')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 ${activeAiTab === 'copy' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}><PenTool size={18} /> AI Copy Generator</button>
            <button onClick={() => setActiveAiTab('chat')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 ${activeAiTab === 'chat' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}><MessageCircle size={18} /> Smart Support</button>
          </div>

          <div className="p-8 min-h-[400px] flex flex-col">
            {activeAiTab === 'estimator' && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Get an Instant Quote</h3>
                <p className="text-slate-400 mb-6">Describe your project and our AI will recommend the stack, price, and timeline.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleEstimator(); }} className="flex gap-2 mb-6">
                  <input type="text" value={quoteInput} onChange={(e) => setQuoteInput(e.target.value)} placeholder="Describe your project..." className="flex-1 rounded-xl px-4 py-3 outline-none input-field" />
                  <Button type="submit" variant="neon" disabled={isProcessing}>{isProcessing ? <Loader className="animate-spin" /> : "Analyze"}</Button>
                </form>

                {aiResult && typeof aiResult === 'object' && (
                  <div className={`rounded-xl p-6 border-l-4 ${aiResult.error ? 'bg-red-500/10 border-red-500' : 'bg-white/5 border-violet-500'}`}>
                    {aiResult.error ? (
                      <div className="text-red-400">
                        <p className="font-bold mb-2">Error:</p>
                        <p>{aiResult.message}</p>
                        <p className="text-sm mt-2 text-slate-400">Make sure the server is running: <code className="px-2 py-1 rounded input-field inline-block">npm run server</code></p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-sm text-slate-400 uppercase font-bold">Recommended Plan</div>
                            <div className="text-2xl font-bold text-violet-400">{aiResult.package || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-400 uppercase font-bold">Est. Price</div>
                            <div className="text-2xl font-bold text-white">{aiResult.price || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 mb-4">
                          <div className="surface-muted p-2 rounded">⏳ {aiResult.time || 'N/A'}</div>
                          <div className="surface-muted p-2 rounded">💻 {aiResult.stack || 'N/A'}</div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm text-slate-400 uppercase font-bold mb-2">Key Features</div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                            {Array.isArray(aiResult.features)
                              ? aiResult.features.map((f, i) => <li key={i}>{String(f)}</li>)
                              : <li>{String(aiResult.features)}</li>}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeAiTab === 'copy' && (
              <div>
                <h3 className="text-2xl font-bold mb-4">AI Headline Generator</h3>
                <p className="text-slate-400 mb-6">Stuck on content? Let our AI write your website's hero section instantly.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleCopyGen(); }} className="flex gap-2 mb-6">
                  <input type="text" value={copyTopic} onChange={(e) => setCopyTopic(e.target.value)} placeholder="What is your business about?" className="flex-1 rounded-xl px-4 py-3 outline-none input-field" />
                  <Button type="submit" variant="neon" disabled={isProcessing}>{isProcessing ? <Loader className="animate-spin" /> : "Generate"}</Button>
                </form>
                {generatedCopy && typeof generatedCopy === 'string' && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 relative group">
                    {generatedCopy.split('|').map((part, index) => (
                      <p key={index} className={`font-medium ${index === 0 ? 'text-xl text-white mb-2' : 'text-lg italic text-slate-300'}`}>
                        {String(part).trim()}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeAiTab === 'chat' && (
              <div className="flex flex-col h-full">
                <h3 className="text-2xl font-bold mb-2">Chat with Super</h3>
                <div ref={chatContainerRef} className="flex-1 rounded-xl p-4 mb-4 overflow-y-auto max-h-[300px] scrollbar-hide surface-muted">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none'}`}>
                        {String(msg.text)}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                        <Loader size={20} className="animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask a question..." className="flex-1 rounded-xl px-4 py-3 outline-none input-field" />
                  <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50" disabled={isProcessing}><Send size={20} /></button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AITools;
