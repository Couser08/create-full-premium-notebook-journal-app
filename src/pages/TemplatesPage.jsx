import { motion } from "framer-motion";
import { Plus, Search, SunMedium, Bell, LayoutGrid, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { templates } from "../data/templates";
import { cn } from "../lib/utils";
import { Card, Badge, Button } from "../components/ui";
import { useToast } from "../components/Toast";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { addNote, user } = useAppContext();
  const { addToast } = useToast();
  const [query, setQuery] = useState("");

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const initial = firstName.charAt(0).toUpperCase();

  function handleUseTemplate(template) {
    const id = `note-${Date.now()}`;
    const isCode = template.id === "code-documentation";
    const route = isCode ? `/code/${id}` : `/journal/${id}`;
    
    // 1. CRITICAL: Save template data to localStorage FIRST
    window.localStorage.setItem(`note-title-${id}`, template.title);
    window.localStorage.setItem(`note-sections-${id}`, JSON.stringify(template.sections));
    window.localStorage.setItem(`note-date-${id}`, new Date().toLocaleString());
    
    // 2. Add to context state
    addNote({
      id,
      title: template.title,
      body: `Created from ${template.title} template`,
      kind: isCode ? "code" : "journal",
      createdAt: new Date().toISOString(),
      notebook: "Personal",
      color: template.color,
      route
    });

    addToast(`Created "${template.title}"`);
    
    // 3. Navigate after state update
    setTimeout(() => navigate(route), 50);
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur px-8 max-md:pl-16">
        <label className="flex h-9 w-full max-w-[360px] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-sm">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search templates..."
            className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
          />
        </label>
        <div className="flex items-center gap-3">
          <button className="grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition">
            <SunMedium className="size-4" />
          </button>
          <button className="relative grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-violet-500 ring-2 ring-white" />
          </button>
          <div className="grid size-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm">
            {initial}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="mt-1 text-gray-500">Choose a template to jumpstart your next note.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full flex flex-col p-6 group cursor-pointer" onClick={() => handleUseTemplate(template)}>
                <div className={cn(
                  "size-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110",
                  template.color === "blue" ? "bg-blue-100 text-blue-600" :
                  template.color === "green" ? "bg-emerald-100 text-emerald-600" :
                  template.color === "pink" ? "bg-pink-100 text-pink-600" :
                  template.color === "violet" ? "bg-violet-100 text-violet-600" :
                  template.color === "indigo" ? "bg-indigo-100 text-indigo-600" :
                  "bg-amber-100 text-amber-600"
                )}>
                  <template.icon className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{template.desc}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Use template <ArrowRight className="size-3" />
                  </span>
                  <Badge className="bg-gray-50 text-gray-400 border-none group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                    {template.sections.length} sections
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="py-20 text-center">
            <LayoutGrid className="size-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No templates found</h3>
            <p className="text-gray-500">Try searching for something else or browse all categories.</p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-xl"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
