import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIChatbotProps {
    isPublic?: boolean;
}

export default function AIChatbot({ isPublic = false }: AIChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    
    const [_guestMessageCount, setGuestMessageCount] = useState(0);
    const _GUEST_LIMIT = 20;
    // Determine limit status from server response (HTTP 429), not localStorage
    const [isLimitReached, setIsLimitReached] = useState(false);

    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: isLimitReached 
            ? 'Welcome back! I would love to continue helping you. To ensure the highest quality of care and protect your privacy, please take a quick moment to register a free account.'
            : 'Hi! I am JanjiCare AI. Briefly describe your symptoms and I will recommend a specialist for you.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastAiMsgCountRef = useRef(1);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isOpen]);

    useEffect(() => {
        if (!isPublic && isOpen && messages.length === 1) {
            axios.get(route('ai.session.get')).then(res => {
                if (res.data.messages && res.data.messages.length > 0) {
                    setMessages(res.data.messages);
                }
            }).catch(console.error);
        }
    }, [isOpen, isPublic, messages.length]);

    const clearSession = () => {
        if (!isPublic) {
            axios.post(route('ai.session.clear')).catch(console.error);
        }
        setMessages([{ role: 'ai', text: 'Hi! I am JanjiCare AI. Briefly describe your symptoms and I will recommend a specialist for you.' }]);
    };

    useEffect(() => {
        const aiMsgCount = messages.filter((m) => m.role === 'ai').length;
        if (aiMsgCount > lastAiMsgCountRef.current) {
            if (!isOpen) {
                setHasUnread(true);
            }
        }
        lastAiMsgCountRef.current = aiMsgCount;
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (isLimitReached) {
            setMessages(prev => [...prev, { role: 'user', text: input.trim() }, { role: 'ai', text: 'I am so glad I could help you today! To continue our conversation and allow me to connect you with the right specialist, please create a free JanjiCare account. It only takes a minute!' }]);
            setInput('');
            return;
        }

        const currentHistory = [...messages];
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const endpoint = isPublic ? route('ai.guest-triage') : route('ai.triage');
            
            // Extract page context (similar to Ask Gemini)
            let pageContext = '';
            try {
                const mainContent = document.querySelector('main');
                const rawText = mainContent ? mainContent.innerText : document.body.innerText;
                pageContext = `Page Title: ${document.title}\n\nPage Content:\n${rawText.replace(/\n\s*\n/g, '\n').substring(0, 3000)}`;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_e) {
                console.warn("Could not extract page context");
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: currentHistory,
                    context: pageContext
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Network error');
            }

            // Create a placeholder message for the AI response
            setMessages(prev => [...prev, { role: 'ai', text: '' }]);
            setIsLoading(false);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let aiText = '';
            let buffer = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep the last partial line in the buffer
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const dataStr = line.substring(6).trim();
                                if (dataStr === '[DONE]') continue;
                                
                                const parsed = JSON.parse(dataStr);
                                
                                if (parsed.error) {
                                    aiText += parsed.error;
                                } else if (parsed.choices && parsed.choices[0]?.delta?.content) {
                                    aiText += parsed.choices[0].delta.content;
                                }
                                
                                // Update the last message in state with the new text
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastIndex = newMessages.length - 1;
                                    if (lastIndex >= 0) {
                                        newMessages[lastIndex] = {
                                            ...newMessages[lastIndex],
                                            text: aiText
                                        };
                                    }
                                    return newMessages;
                                });
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (_e) {
                                // Should not happen often with a proper line buffer
                            }
                        }
                    }
                }
            }
            
            if (isPublic) {
                setGuestMessageCount(prev => prev + 1);
            }
        } catch (error: any) {
            if (error.message === '429') {
                setMessages(prev => [...prev, { role: 'ai', text: 'I am so glad I could help you today! To continue our conversation and allow me to connect you with the right specialist, please create a free JanjiCare account. It only takes a minute!' }]);
                setIsLimitReached(true);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: error.message || 'Sorry, I am having trouble connecting right now.' }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
            e.currentTarget.style.height = 'auto';
        }
    };

    const _formatAiText = (text: string) => {
        const clean = text.replace(/—/g, "-");
        const parts = clean.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const gradientStyle = {
        background: "linear-gradient(135deg, #14b8a6, #3b82f6, #0ea5e9, #10b981, #14b8a6)",
        backgroundSize: "300% 300%",
        animation: "ai-gradient-pan 12s ease infinite",
    };

    return (
        <>
            <style>{`
                @keyframes ai-gradient-pan {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .ai-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .ai-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ai-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(148, 163, 184, 0.3);
                    border-radius: 20px;
                }
                .ai-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(148, 163, 184, 0.5);
                }
                .dark .ai-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(71, 85, 105, 0.5);
                }
                .dark .ai-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(71, 85, 105, 0.8);
                }
            `}</style>

            <AnimatePresence mode="wait">
                {!isOpen ? (
                    <motion.button
                        key="fab"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => setIsOpen(true)}
                        style={gradientStyle}
                        aria-label="Toggle AI Assistant"
                        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-white/20"
                    >
                        <Bot size={24} />
                        {hasUnread && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-[#0a0a0a] rounded-full animate-pulse"></span>
                        )}
                    </motion.button>
                ) : (
                    <motion.div
                        key="chat-window"
                        initial={{ opacity: 0, y: 30, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-6 right-6 z-[100] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-[width,height] duration-300 w-[calc(100vw-32px)] md:w-[380px] h-[550px] max-h-[75vh] overscroll-none"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            style={gradientStyle}
                            className="text-white p-3 flex justify-between items-center shrink-0 cursor-default"
                        >
                            <div className="flex items-center gap-2">
                                <Bot size={18} />
                                <div className="flex flex-col leading-tight">
                                    <span className="font-semibold text-sm">JanjiCare AI</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearSession();
                                    }}
                                    title="New Chat"
                                    className="p-1 hover:bg-white/20 rounded transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                    }}
                                    title="Close"
                                    className="p-1 hover:bg-white/20 rounded transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div ref={scrollRef} className="ai-scrollbar flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-slate-50 dark:bg-[#050505]">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className="max-w-[90%] flex flex-col gap-2">
                                        <div
                                            className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm prose prose-sm max-w-none ${
                                                msg.role === "user"
                                                    ? "bg-teal-600 text-white rounded-br-none prose-invert"
                                                    : "bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-bl-none dark:prose-invert"
                                            }`}
                                        >
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <Loader2 size={14} className="animate-spin text-teal-500" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/5 shrink-0">
                            {isLimitReached ? (
                                <div className="text-center p-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">
                                        You've reached the free tier limit.
                                    </p>
                                    <a 
                                        href="/register" 
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] transition-all duration-300"
                                    >
                                        Register to Continue
                                    </a>
                                </div>
                            ) : (
                                <div className="relative flex items-center">
                                    <textarea
                                        rows={1}
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder={isLoading ? "AI is typing..." : "Describe your symptoms..."}
                                        disabled={isLoading}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-4 pr-10 py-2.5 text-[14px] outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-500 disabled:opacity-50 resize-none overflow-hidden block"
                                        style={{ minHeight: '42px' }}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className={`absolute right-1 w-8 h-8 flex items-center justify-center rounded-full text-white transition-colors ${!input.trim() || isLoading ? "bg-slate-400 dark:bg-slate-600" : "bg-teal-600 hover:bg-teal-700"}`}
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
