import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import config from "../config";

const AIChatBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        {
            role: "assistant",
            content: "Hello! I'm your Medical Camp Assistant. How can I help you regarding our upcoming camps?",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMessage = { role: "user", content: message };
        setChatHistory((prev) => [...prev, userMessage]);
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/chat/camp-chat`, {
                message: userMessage.content,
            });

            const assistantMessage = { role: "assistant", content: response.data.reply };
            setChatHistory((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            setChatHistory((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[380px] h-[550px] bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-scale-in origin-bottom-right">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-none">Medical Assistant</h3>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">AI Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <button
                                onClick={() => setChatHistory([{
                                    role: "assistant",
                                    content: "Chat cleared! How can I help you regarding our medical camps?",
                                }])}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors group relative"
                                title="Clear Chat"
                            >
                                <Trash2 size={18} />
                                <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Clear History</span>
                            </button> */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar scroll-smooth">
                        {chatHistory.map((chat, index) => (
                            <div
                                key={index}
                                className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${chat.role === "user"
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 rounded-tr-none"
                                        : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none"
                                        }`}
                                >
                                    {chat.role === "assistant" && (
                                        <div className="flex items-center gap-2 mb-2 text-indigo-500">
                                            <Sparkles size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Insight</span>
                                        </div>
                                    )}
                                    {chat.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask about medical camps..."
                                className="w-full pl-4 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-sm font-medium placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || loading}
                                className="absolute right-2 top-1.5 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-[9px] text-center mt-3 text-gray-400 font-bold uppercase tracking-widest leading-loose">
                            Medical assistance powered by AI Platform
                        </p>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${isOpen ? "bg-red-500 rotate-90" : "bg-indigo-600"
                    }`}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.9) translate(20px, 20px); }
          100% { opacity: 1; transform: scale(1) translate(0, 0); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}} />
        </div>
    );
};

export default AIChatBox;
