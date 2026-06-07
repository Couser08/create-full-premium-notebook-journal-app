import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  PenLine, 
  BookOpen, 
  Code2, 
  MessageSquare,
  Zap
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Card, Button } from "../components/ui";

const SUGGESTIONS = [
  { id: 1, title: "Generate Study Notes", desc: "Create a summary for React Hooks", icon: BookOpen },
  { id: 2, title: "Explain Code", desc: "How does this debounce function work?", icon: Code2 },
  { id: 3, title: "Create To-Do List", desc: "Plan a marketing campaign launch", icon: PenLine },
  { id: 4, title: "Summarize Text", desc: "Get key points from my meeting notes", icon: MessageSquare },
];

export default function AIAssistantPage() {
  const { user } = useAppContext();
  const [messages, setMessages] = useState([
    { id: 0, role: "assistant", text: `Hello ${user?.user_metadata?.full_name?.split(" ")[0] || "there"}! I'm your AI writing assistant. How can I help you today?` }
  ]);
  const [input, setQuickTitle] = useState(""); // Reuse name for simplicity
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { id: Date.now(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setQuickTitle("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        role: "assistant", 
        text: `I've analyzed your request: "${input}". \n\nSince this is a preview version, I've simulated a high-quality response for you. In the full version, I'll be able to generate complex notes, explain snippets, and organize your entire notebook using advanced LLMs.` 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9f9ff]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur px-8 max-md:pl-16">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="size-5 text-violet-600" />
          AI Assistant
        </h1>
        <Badge className="bg-violet-50 text-violet-600 border-violet-100">Pro Preview</Badge>
      </header>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden max-w-[900px] mx-auto w-full px-6 py-8">
        
        {messages.length === 1 && !isTyping && (
          <div className="flex-1 flex flex-col items-center justify-center text-center mb-10">
            <div className="size-20 rounded-3xl bg-violet-100 text-violet-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-100">
              <Sparkles className="size-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Power up your writing</h2>
            <p className="text-gray-500 max-w-sm mb-10">Ask me to generate notes, summarize long texts, or explain complex code snippets.</p>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              {SUGGESTIONS.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => { setQuickTitle(s.title); }}
                  className="p-4 rounded-2xl border border-gray-100 bg-white text-left hover:border-violet-200 hover:shadow-md transition-all group"
                >
                  <s.icon className="size-5 text-violet-500 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-bold text-gray-800 mb-1">{s.title}</p>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-6 mb-6 scroll-smooth pr-2">
          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === "user" ? "self-end flex-row-reverse" : "self-start"
              )}
            >
              <div className={cn(
                "size-8 rounded-xl shrink-0 flex items-center justify-center",
                m.role === "user" ? "bg-violet-600 text-white" : "bg-white border border-gray-100 text-violet-600 shadow-sm"
              )}>
                {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                m.role === "user" ? "bg-violet-600 text-white shadow-lg shadow-violet-100" : "bg-white border border-gray-100 text-gray-800 shadow-sm"
              )}>
                {m.text.split('\n').map((line, j) => <p key={j} className={j > 0 ? "mt-2" : ""}>{line}</p>)}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-4 self-start">
               <div className="size-8 rounded-xl shrink-0 bg-white border border-gray-100 text-violet-600 shadow-sm flex items-center justify-center">
                <Bot className="size-4" />
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <Loader2 className="size-4 animate-spin text-violet-400" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="relative mt-auto">
          <input 
            value={input}
            onChange={e => setQuickTitle(e.target.value)}
            placeholder="Ask AI anything..."
            className="w-full h-14 rounded-2xl border border-gray-200 bg-white pl-6 pr-14 text-sm font-medium outline-none shadow-lg focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 size-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md hover:bg-violet-700 disabled:opacity-50 transition-all"
          >
            <Send className="size-4" />
          </button>
        </form>
      </main>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", className)}>
      {children}
    </span>
  );
}
