import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Minimize2, Mic, StopCircle, Trash2 } from "lucide-react";
import aiAvatar from "../assets/ai-chat.jpg";

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi there! I'm your Ai Assistant. How can I assist you with your health or camp details today?",
            sender: "ai",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Initialize Speech Recognition on Mount
    useEffect(() => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = "en-US";
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(null, transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);

                let errorMessage = `Voice Error: ${event.error}`;
                if (event.error === 'network') {
                    errorMessage = "Network error: Voice recognition requires an active internet connection (Google Chrome servers). Please check your connection.";
                } else if (event.error === 'not-allowed') {
                    errorMessage = "Microphone blocked: Please allow microphone access in your browser settings.";
                } else if (event.error === 'no-speech') {
                    errorMessage = "No speech detected. Please try again.";
                    return; // Ignore no-speech errors to avoid annoying alerts
                }

                alert(errorMessage);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // --- VOICE LOGIC ---
    const speak = (text) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech Recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("Error starting speech recognition:", error);
            }
        }
    };
    // -------------------

    // Suggested Questions Rows
    const generalQuestions = [
        "Hi",
        "How can I check my reports?",
        "Can I get my reports?",
        "How to create a camp?",
        "Tell me about volunteers",
        "Login Issues"
    ];

    const bmiQuestions = [
        "My result is Underweight",
        "My result is Healthy",
        "My result is Overweight",
        "My result is Obese",
        "Is it a free camp?"
    ];

    // Simulate AI Response
    const generateResponse = async (userText) => {
        setIsTyping(true);

        // Simulate network delay
        setTimeout(() => {
            let responseText = "I'm not sure about that. Could you try asking about 'camps', 'patients', or 'volunteers'?";
            const lowerText = userText.toLowerCase().trim();

            if (lowerText === "hi" || lowerText === "hello" || lowerText.includes("hello") || lowerText.includes("hi")) {
                responseText = "Hi there! Ready to help you.";
            } else if (lowerText.includes("underweight")) {
                responseText = "Your test results show underweight. I strongly suggest you get a doctor consultation.";
            } else if (lowerText.includes("healthy")) {
                responseText = "Your BMI is in the healthy range. Keep up your healthy eating habits and regular physical activity.";
            } else if (lowerText.includes("overweight")) {
                responseText = "Your test results show overweight. I strongly suggest you get a doctor consultation for better health.";
            } else if (lowerText.includes("obese")) {
                responseText = "Your test results show obese. We recommend consulting a doctor or healthcare professional for proper evaluation and guidance.";
            } else if (lowerText.includes("check") && lowerText.includes("report")) {
                responseText = "User will not able to see report directly on the dashboard.";
            } else if (lowerText.includes("get") && lowerText.includes("report")) {
                responseText = "Sure! You will get your reports to your what's app number.";
            } else if (lowerText.includes("free") && lowerText.includes("camp")) {
                responseText = "Yes, it's a 100% free camp.";
            } else if ((lowerText.includes("how") && lowerText.includes("create") && lowerText.includes("camp")) ||
                (lowerText.includes("yes") && messages[messages.length - 1]?.text.includes("Need help creating one"))) {
                responseText = "To create a camp, go to the 'Camps' option in the menu and select 'Create Camp'. There you can create a new camp easily.";
            } else if (lowerText.includes("camp")) {
                responseText = "You can view all active camps in the 'Camps' section. Need help creating one?";
            } else if (lowerText.includes("patient")) {
                responseText = "You can access patient records from the Dashboard. Do you need to add a new patient?";
            } else if (lowerText.includes("volunteer")) {
                responseText = "Our volunteers are the backbone of our camps! Check 'Our Volunteers' page for more info.";
            } else if (lowerText.includes("login") || lowerText.includes("sign in")) {
                responseText = "If you're facing login issues, please contact the admin or check your credentials.";
            } else if (lowerText.includes("time") || lowerText.includes("date")) {
                responseText = "Camps are usually scheduled on weekends. Check specific camp cards for exact timings.";
            }

            const aiMessage = {
                id: Date.now(),
                text: responseText,
                sender: "ai",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
            speak(responseText); // 🗣️ Speak the response
        }, 1500);
    };

    const handleSend = (e, overrideInput = null) => {
        if (e) e.preventDefault();
        const textToSend = overrideInput || input;

        if (!textToSend.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: textToSend,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        generateResponse(textToSend);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
                    {/* Welcome Bubble */}
                    {showWelcome && (
                        <div className="relative mb-2 mr-2 animate-fade-in group">
                            <div className="bg-white text-gray-800 px-5 py-3 rounded-2xl shadow-2xl border border-gray-100 flex flex-col gap-1 min-w-[200px]">
                                <button
                                    onClick={() => setShowWelcome(false)}
                                    className="absolute -top-1 -left-1 bg-gray-100 text-gray-500 rounded-full p-0.5 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <span className="text-base">👋</span> Hi! I'm your AI Assistant.
                                </p>
                                <p className="text-xs text-gray-500">Ask me anything.</p>
                            </div>
                            {/* Triangle / Tail */}
                            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45 shadow-sm"></div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setIsOpen(true);
                            setShowWelcome(false);
                        }}
                        className="p-2 bg-white border-2 border-indigo-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce flex items-center justify-center group h-16 w-16 overflow-hidden relative"
                    >
                        <img src={aiAvatar} alt="Aura Assistant" className="w-full h-full object-cover rounded-full group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-ping">
                            1
                        </span>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            1
                        </span>
                    </button>
                </div>
            )}

            {/* Chat Window */}
            <div
                className={`fixed bottom-6 right-6 z-50 w-full max-w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 transform origin-bottom-right
        ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10 pointer-events-none"}`}
                style={{ height: "600px", maxHeight: "85vh" }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-1 bg-white/20 rounded-full h-10 w-10 overflow-hidden flex items-center justify-center border border-white/30">
                            <img src={aiAvatar} alt="Aura" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Aura Assistant</h3>
                            <p className="text-indigo-100 text-xs flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setMessages([{
                                id: 1,
                                text: "Hi there! I'm your Aura Assistant. How can I assist you today?",
                                sender: "ai",
                                timestamp: new Date(),
                            }])}
                            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Clear Chat"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Minimize2 size={18} />
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-hide scroll-smooth">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex items-end gap-2 animate-fade-in ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border
                ${msg.sender === "user" ? "bg-indigo-100 text-indigo-600 border-indigo-200" : "bg-white border-gray-200"}`}
                            >
                                {msg.sender === "user" ? <User size={14} /> : <img src={aiAvatar} alt="AI" className="w-full h-full object-cover animate-pulse-subtle" />}
                            </div>
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm transition-all duration-300
                ${msg.sender === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-white border border-gray-100 text-gray-700 rounded-bl-none"
                                    }`}
                            >
                                {msg.text}
                                <p
                                    className={`text-[10px] mt-1 opacity-70 text-right
                  ${msg.sender === "user" ? "text-indigo-100" : "text-gray-400"}`}
                                >
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-center gap-2 animate-pulse">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border bg-white border-gray-200">
                                <img src={aiAvatar} alt="AI" className="w-full h-full object-cover" />
                            </div>
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                <div className="px-4 pb-2 bg-gray-50/50 space-y-2">
                    <div>
                        <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">General help</p>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {generalQuestions.map((q, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSend(null, q)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 text-xs rounded-full shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex-shrink-0"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">BMI Results</p>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {bmiQuestions.map((q, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSend(null, q)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 text-xs rounded-full shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex-shrink-0"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-100">
                    <form
                        onSubmit={handleSend}
                        className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
                    >

                        {/* Voice Input Button */}
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`p-2 rounded-lg transition-colors shadow-sm flex items-center justify-center
                            ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                            title="Speak"
                        >
                            {isListening ? <StopCircle size={18} /> : <Mic size={18} />}
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Type or speak..."}
                            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-gray-700 placeholder-gray-400"
                            disabled={isListening}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-400">Powered by Timely AI</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChat;
