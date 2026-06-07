import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, HelpCircle, List, Plus, Search,
  Bell, ChevronRight, SunMedium, PenLine, Sparkles, LayoutGrid, MoreHorizontal, Clock, Calendar
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import CreateNoteModal from "../components/CreateNoteModal";
import CreateNotebookModal from "../components/CreateNotebookModal";
import { useToast } from "../components/Toast";

/* ─── Sidebar color dots ─── */
const DOT = {
  violet: "bg-violet-500",
  blue:   "bg-blue-500",
  amber:  "bg-amber-500",
  green:  "bg-emerald-500",
  pink:   "bg-pink-500",
  indigo: "bg-indigo-500",
  slate:  "bg-slate-400",
};

/* ─── Idea cards ─── */
const IDEAS = [
  {
    id: "blog",
    icon: PenLine,
    iconBg: "bg-violet-100 text-violet-600",
    title: "Write a blog post",
    desc: "Let AI help you outline your ideas.",
  },
  {
    id: "todo",
    icon: List,
    iconBg: "bg-blue-100 text-blue-600",
    title: "Create a to-do list",
    desc: "Organize tasks and stay productive.",
  },
  {
    id: "summarize",
    icon: BookOpen,
    iconBg: "bg-emerald-100 text-emerald-600",
    title: "Summarize a topic",
    desc: "Get key points in seconds.",
  },
  {
    id: "ask",
    icon: HelpCircle,
    iconBg: "bg-amber-100 text-amber-600",
    title: "Ask anything",
    desc: "Get answers and new perspectives.",
  },
];

export default function HomePage({ filter = "default" }) {
  const navigate = useNavigate();
  const { notes, notebooks, addNote, favorites, user } = useAppContext();
  const { addToast } = useToast();
  const [noteModalOpen, setNoteModalOpen]         = useState(false);
  const [notebookModalOpen, setNotebookModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState(() => window.localStorage.getItem("app-view-mode") || "list");
  const [activityMode, setActivityMode] = useState(false);

  const [quickTitle, setQuickTitle] = useState("");

  const handleQuickCapture = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    
    const id = `note-${Date.now()}`;
    const route = `/journal/${id}`;
    const timestamp = new Date().toISOString();

    // Initialize content
    window.localStorage.setItem(`note-title-${id}`, quickTitle);
    window.localStorage.setItem(`note-sections-${id}`, JSON.stringify([]));
    window.localStorage.setItem(`note-date-${id}`, new Date().toLocaleString());

    addNote({
      id,
      title: quickTitle,
      body: "Start writing...",
      createdAt: timestamp,
      kind: "journal",
      notebook: "Personal",
      color: "violet",
      route,
    });
    setQuickTitle("");
    addToast(`Created "${quickTitle}"`);
    navigate(route);
  };

  const setAndSaveViewMode = (mode) => {
    setViewMode(mode);
    window.localStorage.setItem("app-view-mode", mode);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const initial = firstName.charAt(0).toUpperCase();

  let filteredNotes = notes.filter(note => 
    !note.deletedAt && !note.isArchived && notebooks.some(nb => nb.label === note.notebook)
  );

  if (filter === "favorites") {
    filteredNotes = filteredNotes.filter(n => favorites.includes(n.id));
  }
  
  if (query) {
    filteredNotes = filteredNotes.filter(n =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.body?.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  if (filter === "default" && !query) {
    filteredNotes = filteredNotes.slice(0, 10);
  }

  const listTitle = filter === "favorites" ? "Favorites" : filter === "all" ? "All Notes" : (activityMode ? "Recent Activity" : "Recent notes");

  function handleNoteCreated({ id, title, kind, notebook, route }) {
    const timestamp = new Date().toISOString();
    
    addNote({
      id, title,
      body: kind === "code" ? "Code note..." : "Fresh note...",
      createdAt: timestamp,
      kind,
      notebook,
      color: "violet",
      route,
    });
    navigate(route);
  }

  function handleNotebookCreated(notebook) {
    navigate(`/notebook/${notebook.id}`);
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur px-8 max-md:pl-16">
        <label className="flex h-9 w-full max-w-[360px] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-sm">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes or notebooks..."
            className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
          />
          <span className="hidden shrink-0 items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-400 sm:flex">
            ⌘ K
          </span>
        </label>
        <div className="flex items-center gap-3">
          <button className="grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition">
            <SunMedium className="size-4" />
          </button>
          <button className="relative grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-violet-500 ring-2 ring-white" />
          </button>
          <button className="grid size-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm">{initial}</button>
        </div>
      </header>

      <main className="mx-auto max-w-[780px] px-6 py-10">
        {/* ── Greeting ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="mb-1 text-3xl font-bold text-gray-900">
            {greeting}, {firstName}{" "}
            <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="mb-8 text-base text-gray-500">What would you like to capture today?</p>
        </motion.div>

        {/* ── Quick Capture ── */}
        <motion.form 
          onSubmit={handleQuickCapture}
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="mb-10 group"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <PenLine className="size-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <input 
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              placeholder="Quick capture: Type a title and press Enter..."
              className="w-full h-14 rounded-2xl border border-gray-200 bg-white pl-12 pr-28 text-lg font-medium outline-none shadow-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
            />
            <div className="absolute inset-y-2 right-2">
              <button 
                type="submit"
                disabled={!quickTitle.trim()}
                className="h-full px-4 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-sm hover:bg-violet-700 disabled:opacity-50 disabled:bg-gray-200 transition-all flex items-center gap-2"
              >
                Save <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </motion.form>

        {/* ── Hero card ── */}
        {!activityMode && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-8 relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-8 shadow-sm"
          >
            {/* Decorative dots */}
            <span className="absolute left-6 top-6 text-violet-300 text-2xl select-none">✦</span>
            <span className="absolute right-24 bottom-10 text-indigo-200 text-lg select-none">·</span>
            <span className="absolute right-16 top-8 text-violet-200 text-4xl select-none opacity-60">✦</span>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 relative">
                <img
                  src="/hero-writing.png"
                  alt="Start writing"
                  className="h-40 w-auto object-contain drop-shadow-md mx-auto"
                  onError={e => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                {/* Fallback SVG illustration */}
                <div className="hidden h-40 w-40 items-center justify-center rounded-3xl bg-violet-100 mx-auto">
                  <PenLine className="size-16 text-violet-400" />
                </div>
              </div>
              <p className="mb-5 text-lg font-semibold text-gray-700">Start writing your next idea...</p>
              <button
                onClick={() => setNoteModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-violet-700 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Plus className="size-4" /> New Note
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Ideas ── */}
        {!activityMode && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-10"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                Ideas to get you started
                <Sparkles className="size-4 text-amber-400" />
              </h2>
              <button className="flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-800 transition">
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {IDEAS.map((idea, i) => (
                <motion.button
                  key={idea.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  onClick={() => setNoteModalOpen(true)}
                  className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:border-violet-200 hover:shadow-md transition-all"
                >
                  <span className={cn("grid size-10 place-items-center rounded-xl", idea.iconBg)}>
                    <idea.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{idea.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{idea.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Notes list or empty state ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {filteredNotes.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-5 relative">
                <img
                  src="/empty-notes.png"
                  alt="No notes yet"
                  className="h-44 w-auto object-contain mx-auto"
                  onError={e => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="hidden h-44 w-44 items-center justify-center rounded-3xl bg-violet-50 mx-auto">
                  <BookOpen className="size-20 text-violet-300" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">Your notes will appear here</h3>
              <p className="mb-7 max-w-[320px] text-sm text-gray-500 leading-relaxed">
                Create your first note or ask AI to generate content for you.
              </p>
              <button
                onClick={() => setNoteModalOpen(true)}
                className="mb-3 flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-violet-700 transition-all"
              >
                Create your first note
              </button>
            </div>
          ) : (
            /* Notes list */
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{listTitle}</h2>
                    <p className="text-sm text-gray-500 mt-1">{filteredNotes.length} notes</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                  <button 
                    onClick={() => setActivityMode(!activityMode)}
                    className={cn(
                      "text-sm font-bold transition-colors hidden sm:block",
                      activityMode ? "text-violet-600" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {activityMode ? "Show standard list" : "View activity timeline"}
                  </button>
                </div>
                {!activityMode && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">Sort by: Recently updated </span>
                    <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => setAndSaveViewMode("list")}
                        className={cn("grid size-7 place-items-center rounded-md transition", viewMode === "list" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-700")}
                      >
                        <List className="size-4" />
                      </button>
                      <button
                        onClick={() => setAndSaveViewMode("grid")}
                        className={cn("grid size-7 place-items-center rounded-md transition", viewMode === "grid" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-700")}
                      >
                        <LayoutGrid className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {activityMode ? (
                /* ACTIVITY TIMELINE VIEW */
                <div className="relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                   {filteredNotes.map((note, index) => (
                    <div key={note.id} className="relative mb-8 last:mb-0">
                      <div className="absolute -left-8 top-1.5 size-6 rounded-full bg-white border-2 border-violet-500 flex items-center justify-center shadow-sm z-10">
                        <Clock className="size-3 text-violet-600" />
                      </div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        {note.date} • Edited note
                      </div>
                      <Link to={note.route || `/journal/${note.id}`}>
                        <Card className="p-4 group hover:border-violet-200" animate={false}>
                          <div className="flex items-center gap-4">
                            <div className={cn("size-10 rounded-xl flex items-center justify-center bg-violet-50 text-violet-600 shrink-0")}>
                               <FileText className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h3 className="text-sm font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{note.title}</h3>
                               <p className="text-xs text-gray-400 mt-0.5 truncate">{note.body}</p>
                            </div>
                            <ArrowRight className="size-4 text-gray-300 group-hover:translate-x-1 group-hover:text-violet-400 transition-all" />
                          </div>
                        </Card>
                      </Link>
                    </div>
                   ))}
                </div>
              ) : (
                /* REGULAR LIST/GRID VIEW */
                <div className={cn(
                  viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
                    : "flex flex-col gap-2"
                )}>
                  {filteredNotes.map((note, index) => {
                    const nb = notebooks.find(n => n.label === note.notebook);
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link to={note.route || `/journal/${note.id}`}>
                          {viewMode === "list" ? (
                            /* LIST VIEW */
                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm hover:border-violet-100 hover:shadow-md transition-all group">
                              <span className={cn(
                                "grid size-10 shrink-0 place-items-center rounded-xl text-lg",
                                note.color === "violet" ? "bg-violet-100" :
                                note.color === "blue"   ? "bg-blue-100" :
                                note.color === "green"  ? "bg-emerald-100" :
                                note.color === "amber"  ? "bg-amber-100" :
                                note.color === "pink"   ? "bg-pink-100" : "bg-slate-100"
                              )}>
                                {typeof note.icon === "function"
                                  ? <note.icon className={cn("size-5", `text-${note.color}-600`)} />
                                  : <span>📝</span>}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-gray-900">{note.title}</p>
                                <p className="truncate text-xs font-medium text-gray-500 mt-0.5">{note.body}</p>
                              </div>
                              <div className="hidden shrink-0 items-center gap-6 sm:flex">
                                {nb && (
                                  <span className="flex w-24 items-center gap-2 text-xs font-semibold text-gray-600">
                                    <span className={cn("size-2 rounded-full", DOT[nb.color] || "bg-gray-300")} />
                                    {nb.label}
                                  </span>
                                )}
                                <span className="w-24 text-right text-xs font-medium text-gray-400">{note.date}</span>
                                <button className="grid size-8 place-items-center rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-900 transition">
                                  <MoreHorizontal className="size-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* GRID VIEW */
                            <div className="flex h-48 flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-violet-100 hover:shadow-md transition-all group">
                              <div>
                                <div className="flex items-start justify-between mb-4">
                                  <span className={cn(
                                    "grid size-10 shrink-0 place-items-center rounded-xl text-lg",
                                    note.color === "violet" ? "bg-violet-100" :
                                    note.color === "blue"   ? "bg-blue-100" :
                                    note.color === "green"  ? "bg-emerald-100" :
                                    note.color === "amber"  ? "bg-amber-100" :
                                    note.color === "pink"   ? "bg-pink-100" : "bg-slate-100"
                                  )}>
                                    {typeof note.icon === "function"
                                      ? <note.icon className={cn("size-5", `text-${note.color}-600`)} />
                                      : <span>📝</span>}
                                  </span>
                                  <button className="text-amber-400 hover:text-amber-500">
                                    <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </button>
                                </div>
                                <p className="truncate text-base font-bold text-gray-900">{note.title}</p>
                                <p className="line-clamp-2 mt-1.5 text-xs leading-relaxed text-gray-500">{note.body}</p>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                {nb && (
                                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                    <span className={cn("size-2 rounded-full", DOT[nb.color] || "bg-gray-300")} />
                                    {nb.label}
                                  </span>
                                )}
                                <span className="text-[11px] font-medium text-gray-400">{note.date}</span>
                              </div>
                            </div>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* Floating + */}
      <button
        onClick={() => setNoteModalOpen(true)}
        aria-label="New note"
        className="fixed bottom-8 right-8 grid size-14 place-items-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 hover:shadow-xl transition-all hover:-translate-y-0.5 max-sm:bottom-5 max-sm:right-5"
      >
        <Plus className="size-6" />
      </button>

      <CreateNoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onCreated={handleNoteCreated}
      />
      <CreateNotebookModal
        open={notebookModalOpen}
        onClose={() => setNotebookModalOpen(false)}
        onCreated={handleNotebookCreated}
      />
    </div>
  );
}
