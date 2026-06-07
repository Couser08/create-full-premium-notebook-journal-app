import { motion, AnimatePresence } from "framer-motion";
import { 
  Search as SearchIcon, 
  Filter, 
  Calendar, 
  FileText, 
  Code2, 
  Image as ImageIcon,
  Clock,
  ChevronDown,
  X,
  ArrowRight
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Card, Badge, Button } from "../components/ui";

export default function SearchPage() {
  const { notes, notebooks } = useAppContext();
  const [query, setQuery] = useState("");
  const [selectedKind, setSelectedKind] = useState("all"); // all, journal, code
  const [selectedNotebook, setSelectedNotebook] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (note.deletedAt) return false;

      const matchesQuery = !query || 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.body?.toLowerCase().includes(query.toLowerCase());
      
      const matchesKind = selectedKind === "all" || note.kind === selectedKind;
      
      const matchesNotebook = selectedNotebook === "all" || note.notebook === selectedNotebook;

      return matchesQuery && matchesKind && matchesNotebook;
    });
  }, [notes, query, selectedKind, selectedNotebook]);

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur px-8 py-4">
        <div className="mx-auto max-w-[800px] flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search anything..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-lg outline-none shadow-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
              />
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button 
              variant={showFilters ? "soft" : "outline"} 
              className="h-12 rounded-2xl px-6 gap-2 font-bold"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="size-4" />
              Filters
              <ChevronDown className={cn("size-4 transition-transform", showFilters && "rotate-180")} />
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-6 pt-2 pb-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Type</span>
                    <div className="flex gap-2">
                      {["all", "journal", "code"].map(kind => (
                        <button
                          key={kind}
                          onClick={() => setSelectedKind(kind)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition",
                            selectedKind === kind 
                              ? "bg-violet-600 text-white shadow-md shadow-violet-200" 
                              : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200"
                          )}
                        >
                          {kind}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Notebook</span>
                    <select 
                      value={selectedNotebook}
                      onChange={e => setSelectedNotebook(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-100 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-violet-400"
                    >
                      <option value="all">All Notebooks</option>
                      {notebooks.map(nb => (
                        <option key={nb.id} value={nb.label}>{nb.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {query ? `Search results (${filteredNotes.length})` : "Recent notes"}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {filteredNotes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={note.route || `/journal/${note.id}`}>
                <Card className="p-4 flex items-center gap-4 group hover:border-violet-200" animate={false}>
                  <div className={cn(
                    "size-12 rounded-2xl flex items-center justify-center shrink-0",
                    note.kind === "code" ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"
                  )}>
                    {note.kind === "code" ? <Code2 className="size-6" /> : <FileText className="size-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-violet-600 transition-colors truncate">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        <Clock className="size-3" />
                        {note.date}
                      </span>
                      <span className="size-1 rounded-full bg-gray-200" />
                      <span className="text-xs font-bold text-gray-500">
                        {note.notebook}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Card>
              </Link>
            </motion.div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="py-20 text-center">
              <SearchIcon className="size-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">No matches found</h3>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
